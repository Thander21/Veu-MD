# Harness Eval: Usefulness Agreement (Track C)

> Run dir: `W:\_Projetos\Veu MD\.harness-eval\runs\2026-11-09-full`
> Trap gate: PASS (misses=0)
> Fan-in gate: PASS (slim-fanin-blocked=0)
> Judges: J1 model=`gemini-3.8-flash` · J2 model=`gemini-3.8-flash`
> Bands: Slim = dual SLIM/ROUTING + trap PASS + fan-in PASS; Keep-core = dual KEEP-CORE; Mixed = dual MIXED; Hold = disagree / unclear / missing / slim-fanin-blocked
> **Model-sensitive:** re-judge on a second model before large Slim deletes.
> **Fan-in:** another harness surface hard-loads this path as SoT → Hold, not Slim.
> **Mixed apply:** use `11-mixed-apply.md` only — do not re-judge from this table alone.

## What these words mean

| Word | Meaning | You should |
|------|---------|------------|
| **Keep-core** | Most of the file changes agent behavior | Do **not** slim |
| **Mixed** | Real rules + large theory/examples/overlap | Keep rules; cut bulk — follow `11-mixed-apply.md` |
| **Slim** | Mostly theory / repo-demo / overlap, **and** no other harness surface hard-loads it | Compress or delete body |
| **Hold** | Judges disagreed, unclear, or Slim blocked by fan-in | Do nothing yet (or update consumers first) |
| **Trap PASS** | Planted traps scored correctly | Necessary but not sufficient for Slim |
| **Fan-in blocked** | Another harness file mandates loading this path / treats it as SoT | Do **not** stub/delete until consumers are updated |

This track answers: *does deleting this change agent behavior?* Not the same as redundancy (`07-agreement.md`).

## Executive summary

- Real surfaces scored: 33
- Slim: **5**
- Keep-core: **24**
- Mixed: **4** → apply plan: `11-mixed-apply.md`
- Hold: **0** (fan-in blocked: 0)
- Trap misses: none

## Discrimination (plants)

| ID | Expected family | J2 family |
|----|-----------------|-----------|
| S901 | SLIM | SLIM |
| S902 | SLIM | SLIM |
| S903 | KEEP-CORE | KEEP-CORE |

Slim by tier: {'T2': 5}
Keep-core by tier: {'T0': 1, 'T1': 5, 'T2': 18}
Mixed by tier: {'T1': 2, 'T2': 2}
Hold by tier: {}

## Slim (compress / delete body candidates)

| ID | Tier | Name | Path | J1 | J2 |
|----|------|------|------|----|----|
| S011 | T2 | GLOSSARY.md | `.agent/skills/harness-eval/references/GLOSSARY.md` | ROUTING-ONLY | ROUTING-ONLY |
| S016 | T2 | memory.md | `.agent/skills/tlc-implement/references/memory.md` | ROUTING-ONLY | ROUTING-ONLY |
| S025 | T2 | memory.md | `.agent/skills/tlc-spec-driven/references/memory.md` | ROUTING-ONLY | ROUTING-ONLY |
| S032 | T2 | INDEX.md | `.notebook/INDEX.md` | ROUTING-ONLY | ROUTING-ONLY |
| S033 | T2 | STATE.md | `.specs/STATE.md` | ROUTING-ONLY | ROUTING-ONLY |

## Slim fan-in blocked (do not stub/delete)

Dual SLIM/ROUTING-ONLY, but another harness surface hard-loads the path (load/SoT/extract mandate). Update or drop those consumers before Slim apply.

| ID | Path | Citers |
|----|------|--------|
| — | — | none |

## Keep-core

| ID | Tier | Name | Path | J1 | J2 |
|----|------|------|------|----|----|
| S001 | T0 | AGENTS.md | `AGENTS.md` | KEEP-CORE | KEEP-CORE |
| S003 | T1 | codenavi | `.agent/skills/codenavi/SKILL.md` | KEEP-CORE | KEEP-CORE |
| S004 | T1 | harness-eval | `.agent/skills/harness-eval/SKILL.md` | KEEP-CORE | KEEP-CORE |
| S005 | T1 | tlc-implement | `.agent/skills/tlc-implement/SKILL.md` | KEEP-CORE | KEEP-CORE |
| S006 | T1 | tlc-plan | `.agent/skills/tlc-plan/SKILL.md` | KEEP-CORE | KEEP-CORE |
| S007 | T1 | tlc-spec-driven | `.agent/skills/tlc-spec-driven/SKILL.md` | KEEP-CORE | KEEP-CORE |
| S010 | T2 | notebook-spec.md | `.agent/skills/codenavi/references/notebook-spec.md` | KEEP-CORE | KEEP-CORE |
| S012 | T2 | PROTOCOL.md | `.agent/skills/harness-eval/references/PROTOCOL.md` | KEEP-CORE | KEEP-CORE |
| S013 | T2 | judge-prompts.md | `.agent/skills/harness-eval/references/judge-prompts.md` | KEEP-CORE | KEEP-CORE |
| S014 | T2 | build.md | `.agent/skills/tlc-implement/references/build.md` | KEEP-CORE | KEEP-CORE |
| S015 | T2 | checks.md | `.agent/skills/tlc-implement/references/checks.md` | KEEP-CORE | KEEP-CORE |
| S017 | T2 | verify-screens.md | `.agent/skills/tlc-implement/references/verify-screens.md` | KEEP-CORE | KEEP-CORE |
| S018 | T2 | verify.md | `.agent/skills/tlc-implement/references/verify.md` | KEEP-CORE | KEEP-CORE |
| S019 | T2 | plan.md | `.agent/skills/tlc-plan/references/plan.md` | KEEP-CORE | KEEP-CORE |
| S021 | T2 | design.md | `.agent/skills/tlc-spec-driven/references/design.md` | KEEP-CORE | KEEP-CORE |
| S022 | T2 | discuss.md | `.agent/skills/tlc-spec-driven/references/discuss.md` | KEEP-CORE | KEEP-CORE |
| S023 | T2 | implement.md | `.agent/skills/tlc-spec-driven/references/implement.md` | KEEP-CORE | KEEP-CORE |
| S024 | T2 | lessons.md | `.agent/skills/tlc-spec-driven/references/lessons.md` | KEEP-CORE | KEEP-CORE |
| S026 | T2 | specify.md | `.agent/skills/tlc-spec-driven/references/specify.md` | KEEP-CORE | KEEP-CORE |
| S027 | T2 | sub-agents.md | `.agent/skills/tlc-spec-driven/references/sub-agents.md` | KEEP-CORE | KEEP-CORE |
| S028 | T2 | tasks.md | `.agent/skills/tlc-spec-driven/references/tasks.md` | KEEP-CORE | KEEP-CORE |
| S029 | T2 | validate.md | `.agent/skills/tlc-spec-driven/references/validate.md` | KEEP-CORE | KEEP-CORE |
| S030 | T2 | verify-screens.md | `.agent/skills/tlc-spec-driven/references/verify-screens.md` | KEEP-CORE | KEEP-CORE |
| S031 | T2 | guideline.md | `.agent/skills/web-design-guidelines/references/guideline.md` | KEEP-CORE | KEEP-CORE |

## Mixed (keep core, slim examples/theory)

Path list only. **Apply instructions:** `11-mixed-apply.md` (KEEP/CUT per ID).

| ID | Tier | Name | Path | J1 | J2 |
|----|------|------|------|----|----|
| S002 | T1 | best-practices | `.agent/skills/best-practices/SKILL.md` | MIXED | MIXED |
| S008 | T1 | web-design-guidelines | `.agent/skills/web-design-guidelines/SKILL.md` | MIXED | MIXED |
| S009 | T2 | coding-principles.md | `.agent/skills/codenavi/references/coding-principles.md` | MIXED | MIXED |
| S020 | T2 | coding-principles.md | `.agent/skills/tlc-spec-driven/references/coding-principles.md` | MIXED | MIXED |

## Hold

| ID | Tier | Reason | J1 | J2 | Path |
|----|------|--------|----|----|------|

## Action guidance

- **Slim:** compress only after trap PASS **and** fan-in PASS; still human-approve; prefer re-judge on a second model if deleting >30% of a skill.
- **Slim fan-in blocked:** do **not** stub/delete; either keep the checklist body or update every citing harness surface in the same change, then re-merge.
- **Mixed:** open `11-mixed-apply.md` and execute KEEP/CUT per ID only. Do **not** re-judge. Do **not** replace KEEP snippets with `See app/...` or defer KEEP contracts to AGENTS.md. Empty Keep-core/Slim cells → skip that path.
- **Keep-core:** do not slim for usefulness reasons.
- **Hold:** no usefulness trim.
- See `08-usefulness-j1.md` / `09-usefulness-j2.md` for raw score rows.
- Fan-in detail JSON: `slim-fanin.json`.

