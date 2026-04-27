# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ZMK Studio is a Tauri v2 desktop application for configuring ZMK keyboard firmware without reflashing. It communicates with keyboards over USB Serial or Bluetooth LE (BLE).

## Common Commands

```bash
# Development
npm run dev          # Start Vite dev server + generate release data (frontend only)
npm run tauri dev    # Full Tauri app (Rust + frontend, required for device connectivity)

# Build
npm run build        # TypeScript check + Vite build + generate release data
npm run tauri build  # Full production build (creates platform installer)

# Code quality
npm run lint         # ESLint (max-warnings=0, must be clean)
npx prettier --write .  # Format (pre-commit hook runs this automatically)

# Component development
npm run storybook    # Launch Storybook on port 6006
npm run build-storybook  # Build static Storybook

# Type generation (run when .proto files or ZMK RPC interface changes)
npx buf generate
```

TypeScript compilation errors block builds — `tsc --noEmit` is run as part of `npm run build`.

## Architecture

### Frontend → Backend Transport

The app communicates with keyboards through a transport abstraction:

- [src/rpc/](src/rpc/) — RPC contexts, state, and types shared across the app
- [src/tauri/](src/tauri/) — Tauri-specific transport implementations that wrap BLE and serial streams through Tauri IPC
- [src-tauri/src/transport/](src-tauri/src/transport/) — Rust side: `gatt.rs` (Bluetooth via bluest), `serial.rs` (USB via tokio-serial), `commands.rs` (Tauri IPC command handlers)

In `tauri dev` mode, communication goes: React → Tauri IPC commands → Rust transport → keyboard hardware. In browser/Storybook, the Web Serial API and Web Bluetooth API are used directly via navigator.serial / navigator.bluetooth.

### State Management

No Redux/Zustand — state flows through React Context:
- `ConnectionContext` — active device connection and transport lifecycle
- `LockStateContext` — keyboard lock state (whether Studio can modify the keymap)
- Loose coupling via [Emittery](https://github.com/sindresorhus/emittery) events

### Key Feature Areas

| Directory | Responsibility |
|---|---|
| [src/keyboard/](src/keyboard/) | Keyboard layout rendering, layer picker, keymap editing |
| [src/behaviors/](src/behaviors/) | Behavior binding UI — key action pickers and parameter editors |
| [src/rpc/](src/rpc/) | RPC protocol contexts, connection management |
| [src/tauri/](src/tauri/) | Tauri transport adapters (BLE + serial) |
| [src/misc/](src/misc/) | Shared hooks, modals, and utility components |

### Undo/Redo

Custom hook pattern in the keyboard area — operations are expressed as callback pairs (do/undo) rather than stored state diffs. Check [src/keyboard/](src/keyboard/) for the pattern before implementing new undoable operations.

### Styling

Tailwind CSS with a custom theme using oklch color space. Light/dark mode is supported via CSS variables. React Aria Components handles accessibility for interactive elements.

### TypeScript Config

Strict mode with `noUnusedLocals` and `noUnusedParameters` enabled. All variables and parameters must be used — prefix with `_` if intentionally unused. Target: ES2020.

## Rust / Tauri Backend

- Tauri v2 with allowlist-style CSP and capability-based security in `src-tauri/tauri.conf.json`
- `src-tauri/src/main.rs` wires up Tauri commands and plugin setup
- Transport commands are exposed via `#[tauri::command]` and invoked from the frontend using Tauri's `invoke()`
- Use `cargo check` in `src-tauri/` to validate Rust changes before running `tauri build`

## Protobuf / RPC Interface

The ZMK RPC interface is defined via Protocol Buffers. Generated TypeScript types live in `src/` — do not edit generated files directly. Run `npx buf generate` after changing `.proto` files.
