# ZMK Studio

A desktop application for configuring [ZMK firmware](https://zmk.dev/) keyboards without reflashing. Connect over USB Serial or Bluetooth LE and edit your keymap live.

## Features

- **Live keymap editing** — change key bindings on a connected keyboard without building or flashing firmware.
- **Visual QWERTY keyboard picker** — when assigning a Key Press binding, an interactive 104-key keyboard image appears. Click any key to select it instantly. Symbol and number keys display their shifted character (e.g. `!` on `1`, `{` on `[`) as a smaller label; clicking the shifted label selects the key with Left Shift automatically applied.
- **Modifier combos** — layer implicit modifiers (Ctrl, Shift, Alt, GUI — left and right) on top of any key binding using the modifier button row.
- **Multiple layouts** — supports any physical keyboard layout reported by the firmware, with zoom controls.
- **Layer management** — add, remove, reorder, and rename layers.
- **Undo / redo** — full undo history for all binding changes.

## Connections

| Transport | Platform |
|-----------|----------|
| USB Serial | Windows, macOS, Linux |
| Bluetooth LE | Windows, macOS, Linux |

## Development

```bash
npm run dev          # Vite dev server (frontend only)
npm run tauri dev    # Full app with Rust backend (required for device connectivity)
npm run build        # Production build
npm run lint         # ESLint (zero warnings)
npm run storybook    # Component development
```

See [CLAUDE.md](CLAUDE.md) for a full architecture overview.
