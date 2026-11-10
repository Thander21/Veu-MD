# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Plan/Checks)

Corroborated across multiple features. Safe to apply as guidance.

_none_

## Candidates (under observation - do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 - In Windows, tauri-winres panics if rc.exe is absent in PATH; auto-detecting Windows Kits rc.exe in build.rs avoids build failure
- signal: `gate_fail` · recurrence: 1 feature(s) · scope: `src-tauri` · harmful: 0
- features: veu-md-core
- evidence: src-tauri/build.rs:1 (src-tauri)
- last seen: 2026-11-06T16:45:22Z

### L-002 - Never enter Phase 4 Execute without clarifying gray areas in context.md and receiving formal user approval in spec.md and tasks.md.
- signal: `gate_fail` · recurrence: 1 feature(s) · scope: `sdd/orchestration` · harmful: 0
- features: veu-md-advanced
- evidence: validate_tasks.py:--execute (sdd/orchestration)
- last seen: 2026-11-07T13:32:02Z

### L-003 - Sempre compilar o executavel de producao com 'npm run tauri build' (com Path do cargo carregado) para embutir assets dist, nunca via cargo build direto
- signal: `gate_fail` · recurrence: 1 feature(s) · scope: `desktop-build` · harmful: 0
- features: architecture-ipc-contracts-and-ringbuffer
- evidence: Docs/c.md:110 (desktop-build)
- last seen: 2026-11-09T01:33:38Z

### L-004 - AiAssistantPanel deve ser flex-child acoplado em .workspace com position relative e 100% de altura, nunca fixed, evitando sobrepor texto do editor
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `ui-layout` · harmful: 0
- features: ai-assistant-wizard-and-multi-cli
- evidence: src/lib/components/AiAssistantPanel.svelte:620 (ui-layout)
- last seen: 2026-11-09T01:33:43Z

### L-005 - Auto-save multi-aba exige timers isolados por tabId com flush atomico no blur ou switch para prevenir race condition e perda de dados
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `editor-state` · harmful: 0
- features: architecture-resilience-and-lifecycle
- evidence: src/App.svelte:687 (editor-state)
- last seen: 2026-11-09T08:37:06Z

### L-006 - Imagens locais em Markdown no Tauri WebView2 requerem resolucao via convertFileSrc no nodeView para evitar 404s e bloat de base64 no disco
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `editor-assets` · harmful: 0
- features: architecture-resilience-and-lifecycle
- evidence: src/lib/editor/proseMirrorSetup.ts:135 (editor-assets)
- last seen: 2026-11-09T08:37:11Z

### L-007 - Motores dual-engine de terminal devem coexistir no DOM via CSS display para evitar vazamento de PTYs zumbis no Windows
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `terminal-lifecycle` · harmful: 0
- features: architecture-resilience-and-lifecycle
- evidence: src/lib/components/TerminalPanel.svelte:472 (terminal-lifecycle)
- last seen: 2026-11-09T08:37:54Z

### L-008 - Scripts e novos utilitarios exigem terminacao de linha normalizada com newline final commitados antes de check_proofs.py para evitar arvore dirty durante o build.
- signal: `gate_fail` · recurrence: 1 feature(s) · scope: `sdd/verification` · harmful: 0
- features: zero-server-cloud-sync
- evidence: scripts/test_cloud_sync.mjs:1 (sdd/verification)
- last seen: 2026-11-10T19:32:42Z

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
