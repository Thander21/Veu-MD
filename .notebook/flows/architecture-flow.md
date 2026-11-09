# Architecture Flow
> Tauri v2 + Rust backend with Svelte 5 + ProseMirror WYSIWYG frontend

Entry Frontend: `src/main.ts` → `src/App.svelte`
Entry Backend: `src-tauri/src/main.rs:main()` → `src-tauri/src/lib.rs:run()`

## 1. Core Editing Pipeline
- View layer: `src/lib/components/Editor.svelte` hosting `EditorView` (ProseMirror)
- Schema & Parser/Serializer: `src/lib/editor/proseMirrorSetup.ts:veuSchema`
  - Parser: `veuMarkdownParser` (markdown-it tokenizer with GFM tables + strikethrough)
  - Serializer: `veuMarkdownSerializer` (writes standard GFM Markdown to disk)
- Persistence: `src/lib/services/fsService.ts` calling Rust `src-tauri/src/commands/fs_cmd.rs` via `invoke()`

## 2. Terminal Engine (Dual-Engine: Veu vs xterm)
- Frontend: `src/lib/components/TerminalPanel.svelte` toggles between:
  - Terminal Veu (default): `src/lib/components/TerminalVeuPanel.svelte` (sequential block timeline with native ANSI parsing in `src/lib/utils/ansiParser.ts:parseAnsiToSpans`)
  - xterm.js (fallback): `@xterm/xterm` canvas/WebGL engine
- State & Ring-Buffer: `src/lib/stores/terminalStore.ts:appendBlockWithRingBuffer()` (max 500 blocks FIFO)
- IPC backend: `src-tauri/src/commands/pty_cmd.rs:spawn_terminal()`, `write_terminal()`, `kill_terminal()` via crate `portable-pty`
- Streaming: async thread emitting `term-output-{termId}` events to frontend listeners

## 3. Multi-Project & Workspace Flow
- Store: `src/lib/stores/projectStore.ts` (localStorage debounce 500ms in `src/App.svelte:debouncedSaveProjects`)
- Isolated sessions: Terminal PTY sessions retain child handle in Rust `src-tauri/src/state.rs:TerminalSession` per `termId` (keyed by project)

## 4. AI Assistant Panel
- Right-coupled sidebar: `src/lib/components/AiAssistantPanel.svelte` (relative flex-child in `.workspace`, width resizable)
- Providers: `src/lib/ai/aiProviders.ts` supporting `agy`, `claude`, `gemini`, `muse`, etc.
- Backend runner: `src-tauri/src/commands/ai_cmd.rs:run_ai_prompt()` streaming stdout/stderr events

Updated: 2026-11-09

