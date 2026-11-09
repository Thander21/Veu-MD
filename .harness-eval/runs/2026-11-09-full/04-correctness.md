# Harness Eval: Correctness (Track A)

> Generated: 2026-11-09T09:37:39.857371+00:00
> Method: deterministic path/command checks (no README)

## What these words mean

| Word | Meaning | You should |
|------|---------|------------|
| **BROKEN** | A cited path or command does not exist (high-precision check) | Fix the cite or restore the file |
| **OK path-cites** | Concrete path cites that resolved | No action |
| **T0 / T1 / T2** | Always-on rules / skills / cited harness refs | Fix T0 cites first (always loaded) |

This track answers: *is the harness factually wrong about paths/commands?* Not redundancy (`07`) or usefulness (`10`).

## Executive summary

- T0: 1 · T1: 7 · T2: 26
- Manifests: package.json
- Findings: **0 broken** · 61 path-cites ok

## Inventory

### T0

Always-on rules (always loaded).

- `AGENTS.md`

### T1

Skills.

- `.agent/skills/best-practices/SKILL.md`
- `.agent/skills/codenavi/SKILL.md`
- `.agent/skills/harness-eval/SKILL.md`
- `.agent/skills/tlc-implement/SKILL.md`
- `.agent/skills/tlc-plan/SKILL.md`
- `.agent/skills/tlc-spec-driven/SKILL.md`
- `.agent/skills/web-design-guidelines/SKILL.md`

### T2

Cited harness refs.

- `.agent/skills/codenavi/references/coding-principles.md`
- `.agent/skills/codenavi/references/notebook-spec.md`
- `.agent/skills/harness-eval/references/GLOSSARY.md`
- `.agent/skills/harness-eval/references/PROTOCOL.md`
- `.agent/skills/harness-eval/references/claims.schema.json`
- `.agent/skills/harness-eval/references/judge-prompts.md`
- `.agent/skills/tlc-implement/references/build.md`
- `.agent/skills/tlc-implement/references/checks.md`
- `.agent/skills/tlc-implement/references/memory.md`
- `.agent/skills/tlc-implement/references/verify-screens.md`
- `.agent/skills/tlc-implement/references/verify.md`
- `.agent/skills/tlc-plan/references/plan.md`
- `.agent/skills/tlc-spec-driven/references/coding-principles.md`
- `.agent/skills/tlc-spec-driven/references/design.md`
- `.agent/skills/tlc-spec-driven/references/discuss.md`
- `.agent/skills/tlc-spec-driven/references/implement.md`
- `.agent/skills/tlc-spec-driven/references/lessons.md`
- `.agent/skills/tlc-spec-driven/references/memory.md`
- `.agent/skills/tlc-spec-driven/references/specify.md`
- `.agent/skills/tlc-spec-driven/references/sub-agents.md`
- `.agent/skills/tlc-spec-driven/references/tasks.md`
- `.agent/skills/tlc-spec-driven/references/validate.md`
- `.agent/skills/tlc-spec-driven/references/verify-screens.md`
- `.agent/skills/web-design-guidelines/references/guideline.md`
- `.notebook/INDEX.md`
- `.specs/STATE.md`

## Findings

_No BROKEN path/command findings._
## Notes

- Path normalization preserves `.agents` (never `str.lstrip('./')`).
- Placeholders and bare example filenames are skipped.
- Fenced code blocks are not scanned for path cites.
- `references/` may resolve under a skill named in the same surface (e.g. load `dev`).
- Missing `app/`/`lib/`/`test/` cites are BROKEN only when mandate language is nearby.
