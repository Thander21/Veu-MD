# Windows ConPTY & Desktop Build Gotchas
> Traps and operational rules for Windows environment and packaging

## 1. ConPTY Zombie Process Prevention
- Trap: Dropping or killing PTY master in Windows ConPTY can leave child console processes orphaned in task manager consuming memory & CPU
- Fix: `src-tauri/src/state.rs:TerminalSession` stores `child: Arc<Mutex<Box<dyn portable_pty::Child + Send + Sync>>>`
- Handler: `src-tauri/src/commands/pty_cmd.rs:kill_terminal()` explicitly invokes `child.kill()`

## 2. Windows Resource Compiler (`rc.exe`) Fallback
- Trap: `tauri-winres` / MSVC build fails if `rc.exe` is absent from active PATH in non-developer PowerShell
- Fix: `src-tauri/build.rs` auto-locates `rc.exe` in `C:\Program Files (x86)\Windows Kits\10\bin\*\x64\rc.exe`
- Icon tracking: `build.rs` must include `println!("cargo:rerun-if-changed=icons/icon.ico");` to prevent stale icon caches

## 3. Desktop Build vs Cargo Build
- Trap: Running `cargo build --release` in `src-tauri` directly does NOT compile or embed the `dist/` web assets, resulting in a blank or broken binary
- Invariant: Always build desktop via `npm run tauri build` (or `scripts/build_desktop_external.ps1`), ensuring frontend Vite assets are compiled first

Updated: 2026-11-09

