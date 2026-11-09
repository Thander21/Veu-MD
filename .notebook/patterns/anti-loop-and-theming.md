# Anti-Loop, Theming & Performance Patterns
> Invariants in Svelte 5 reactivity, GPU-accelerated styling and terminal timeline retention

## 1. Anti-Loop Reactive Invariant (Svelte 5)
- Rule: Never modify DOM node properties captured via `bind:this` inside reactive `$:` or `$effect` blocks
- Reason: Causes recursive `mutate()` in Svelte 5 microtasks, freezing UI thread at 100% CPU
- Fix: Use transition sentinels (`let prevVisible = false; $: if (visible && !prevVisible) ...`) with decoupled `setTimeout(..., 60)` and CSS base dimensions (`min-height`)
- Top-level markup rule: `<svelte:window>` tags must remain top-level, never nested within `{#if}`

## 2. GPU-Accelerated Theming
- Location: `src/lib/theme/themeStore.ts:applyThemeToDOM()`
- Mechanism: Writes CSS Custom Properties to `document.documentElement` (`:root`)
- Benefit: Zero JS DOM re-renders; color & layout updates processed in < 0.1ms by GPU compositor
- Canonical theme: `veumd` (Catppuccin Mocha palette with Roboto font) defined in `src/lib/theme/defaultThemes.ts`
- Manual user tweaks automatically flip theme identifier to `'custom'`

## 3. Terminal Ring-Buffer FIFO
- Location: `src/lib/stores/terminalStore.ts:appendBlockWithRingBuffer()`
- Limit: 500 blocks maximum (`DEFAULT_MAX_TERMINAL_BLOCKS`)
- Policy: FIFO eviction of completed blocks while safeguarding currently active blocks (`status === 'running'`)
- Benefit: Prevents memory leaks and DOM node bloat in WebView2 during long-running builds/watchers

Updated: 2026-11-09

