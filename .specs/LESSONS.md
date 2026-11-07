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

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
