# Delta (Δ) for VS Code

[![Version](https://img.shields.io/visual-studio-marketplace/v/delta-lang.vscode-delta)](https://marketplace.visualstudio.com/items?itemName=delta-lang.vscode-delta)

Official VS Code extension for the [Delta language](https://delta-lang.dev) — universal code transformation.

## Features

- **Syntax highlighting** for `.delta` files — all six constructs highlighted with embedded language support inside code blocks
- **IntelliSense snippets** — tab-complete `patch`, `fix`, `intent`, `migrate`, `guard`, `trace`
- **Language Server** — real-time diagnostics, error squiggles, and hover documentation powered by the Delta compiler
- **Run commands** — `Delta: Run File`, `Delta: Check File`, `Delta: Preview File` from the Command Palette

## Requirements

Install the Delta CLI:
```bash
npm install -g @delta-lang/cli
```

## Usage

1. Create a `.delta` file
2. Type `patch`, `fix`, `intent`, `migrate`, `guard`, or `trace` and press Tab for a snippet
3. Run `Delta: Preview File` from the Command Palette to see what would change
4. Run `Delta: Run File` to apply transformations

## Example

```delta
// Modernise all null equality checks
fix strictNull {
  pattern: { == null }
  replace: { === null }
  scope:   "**/*.ts"
  severity: bug
  note:    "use strict equality"
}
apply fix strictNull to project preview
```

## Extension Settings

| Setting | Default | Description |
|---|---|---|
| `delta.lsp.enabled` | `true` | Enable the Delta Language Server |
| `delta.lsp.path` | `""` | Path to the delta binary (leave empty to use PATH) |

## Links

- [Delta language spec](https://delta-lang.dev/docs)
- [GitHub](https://github.com/Delta-Lang-Dev/vscode-delta)
- [Report an issue](https://github.com/Delta-Lang-Dev/vscode-delta/issues)
