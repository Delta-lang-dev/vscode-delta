// src/extension.ts
// ─── Delta VSCode Extension ───────────────────────────────────────────────
// Activates when a .delta file is opened.
// Starts the Delta LSP server for diagnostics, hover docs, and completions.

import * as vscode from "vscode";
import * as path   from "path";
import * as fs     from "fs";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient | undefined;

export function activate(context: vscode.ExtensionContext): void {
  const config  = vscode.workspace.getConfiguration("delta");
  const enabled = config.get<boolean>("lsp.enabled", true);

  if (!enabled) return;

  // ── Locate the delta binary ──────────────────────────────────────────────

  const deltaPath = resolveDeltaBinary(config.get<string>("lsp.path", ""));

  if (!deltaPath) {
    vscode.window.showWarningMessage(
      "Delta: Cannot find the delta CLI binary. " +
      "Install with: npm install -g @delta-lang/cli " +
      "or set delta.lsp.path in settings."
    );
    return;
  }

  // ── Server options ────────────────────────────────────────────────────────
  // delta lsp --stdio — uses the built-in LSP server from src/lsp.ts

  const serverOptions: ServerOptions = {
    run:   { command: deltaPath, args: ["lsp", "--stdio"], transport: TransportKind.stdio },
    debug: { command: deltaPath, args: ["lsp", "--stdio", "--verbose"], transport: TransportKind.stdio },
  };

  // ── Client options ────────────────────────────────────────────────────────

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "delta" }],
    synchronize: {
      fileEvents: vscode.workspace.createFileSystemWatcher("**/*.delta"),
    },
  };

  // ── Start client ──────────────────────────────────────────────────────────

  client = new LanguageClient(
    "delta-lsp",
    "Delta Language Server",
    serverOptions,
    clientOptions
  );

  client.start();

  // ── Status bar item ───────────────────────────────────────────────────────

  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBar.text = "$(symbol-namespace) Delta";
  statusBar.tooltip = "Delta Language Server is running";
  statusBar.show();
  context.subscriptions.push(statusBar);

  // ── Commands ──────────────────────────────────────────────────────────────

  context.subscriptions.push(
    vscode.commands.registerCommand("delta.runFile", runCurrentFile),
    vscode.commands.registerCommand("delta.checkFile", checkCurrentFile),
    vscode.commands.registerCommand("delta.previewFile", previewCurrentFile),
  );

  vscode.window.showInformationMessage("Delta LSP started ✓");
}

export function deactivate(): Thenable<void> | undefined {
  return client?.stop();
}

// ── Command implementations ───────────────────────────────────────────────

async function runCurrentFile(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const file = editor.document.fileName;
  if (!file.endsWith(".delta")) {
    vscode.window.showErrorMessage("Delta: Active file is not a .delta file");
    return;
  }

  const terminal = vscode.window.createTerminal("Delta Run");
  terminal.show();
  terminal.sendText(`delta run "${file}"`);
}

async function checkCurrentFile(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const file = editor.document.fileName;
  const terminal = vscode.window.createTerminal("Delta Check");
  terminal.show();
  terminal.sendText(`delta check "${file}"`);
}

async function previewCurrentFile(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const file = editor.document.fileName;
  const terminal = vscode.window.createTerminal("Delta Preview");
  terminal.show();
  terminal.sendText(`delta run "${file}" --preview`);
}

// ── Helpers ───────────────────────────────────────────────────────────────

function resolveDeltaBinary(configured: string): string | null {
  // 1. Use configured path if set
  if (configured && fs.existsSync(configured)) return configured;

  // 2. Try common locations
  const candidates = [
    "delta",
    path.join(process.env["HOME"] ?? "", ".npm-global", "bin", "delta"),
    "/usr/local/bin/delta",
    "/usr/bin/delta",
  ];

  for (const c of candidates) {
    try {
      // Quick existence check via PATH resolution
      require("child_process").execSync(
        `which ${c}`, { stdio: "ignore" }
      );
      return c;
    } catch {
      continue;
    }
  }

  return null;
}
