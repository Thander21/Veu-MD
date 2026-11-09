# Harness Eval: Judge Agreement (Track B)

> Run dir: `.harness-eval\runs\2026-11-09-full`
> Trap gate: PASS (misses=0)
> Bands: Ship = dual REDUNDANT + J2 cost≤1; Review = dual KEEP; Hold = disagree / missing

## What these words mean

| Word | Meaning | You should |
|------|---------|------------|
| **Ship** | Both judges: text is redundant and cheap to rediscover | Delete / trim |
| **Review** | Both judges: keep (not redundant) | Leave alone |
| **Hold** | Judges disagreed or score missing | Do nothing yet |
| **Trap PASS** | Planted traps scored correctly | Trust Ship |

This track answers: *would an agent rediscover this without the harness?* Not the same as usefulness (`10-usefulness-agreement.md`).

## Executive summary

- Real claims scored: 517
- Ship: **91**
- Review: **426**
- Hold: **0**
- Trap misses: none

## Discrimination (plants)

| ID | Expected family | J2 family |
|----|-----------------|-----------|
| P001 | REDUNDANT | REDUNDANT |
| P002 | REDUNDANT | REDUNDANT |
| P003 | REDUNDANT | REDUNDANT |
| P004 | REDUNDANT | REDUNDANT |
| P005 | KEEP | KEEP |
| P006 | KEEP | KEEP |

Ship by tier: {'T0': 10, 'T1': 81}
Hold by tier: {}

## Ship

| ID | Tier | Source | J1 | J2 cost/class | Quote |
|----|------|--------|----|---------------|-------|
| C003 | T0 | `AGENTS.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | **Edição 100% WYSIWYG Estilo Word:** |
| C032 | T0 | `AGENTS.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | **Anti-Bloat & Filtro Inegociável de Leveza:** |
| C039 | T0 | `AGENTS.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | **Abertura e Foco de Arquivos:** |
| C043 | T0 | `AGENTS.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | **Visualização de Imagens e Vetores SVG (Dual-Mode):** |
| C055 | T0 | `AGENTS.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | **Performance de Temas via GPU:** |
| C096 | T0 | `AGENTS.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | **Auto-Sizing de Complexidade**: |
| C103 | T0 | `AGENTS.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | **Testes Derivados dos Critérios de Aceite**: |
| C110 | T0 | `AGENTS.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | **Árvore Limpa para Validação Final**: |
| C112 | T0 | `AGENTS.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | **Raio de Explosão Delimitado (Blast Radius)**: |
| C129 | T0 | `AGENTS.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | **Web Dev:** `npm run dev` |
| C136 | T1 | `.agent/skills/best-practices/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | **CSP Header (recommended):** |
| C137 | T1 | `.agent/skills/best-practices/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | **Using nonces for inline scripts:** |
| C138 | T1 | `.agent/skills/best-practices/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | **Keep dependencies updated:** |
| C139 | T1 | `.agent/skills/best-practices/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | **Known vulnerable patterns to avoid:** |
| C140 | T1 | `.agent/skills/best-practices/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | [ ] HTTPS enabled, no mixed content |
| C141 | T1 | `.agent/skills/best-practices/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | [ ] No vulnerable dependencies (`npm audit`) |
| C142 | T1 | `.agent/skills/best-practices/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | [ ] CSP headers configured |
| C143 | T1 | `.agent/skills/best-practices/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | [ ] Security headers present |
| C144 | T1 | `.agent/skills/best-practices/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | [ ] No exposed source maps |
| C145 | T1 | `.agent/skills/best-practices/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | [ ] Valid HTML5 doctype |
| C146 | T1 | `.agent/skills/best-practices/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | [ ] Charset declared first in head |
| C147 | T1 | `.agent/skills/best-practices/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | [ ] Viewport meta tag present |
| C148 | T1 | `.agent/skills/best-practices/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | [ ] No deprecated APIs used |
| C149 | T1 | `.agent/skills/best-practices/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | [ ] Passive event listeners for scroll/touch |
| C150 | T1 | `.agent/skills/best-practices/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | [ ] No console errors |
| C151 | T1 | `.agent/skills/best-practices/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | [ ] Valid HTML (no duplicate IDs) |
| C152 | T1 | `.agent/skills/best-practices/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | [ ] Semantic HTML elements used |
| C153 | T1 | `.agent/skills/best-practices/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | [ ] Proper error handling |
| C154 | T1 | `.agent/skills/best-practices/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | [ ] Memory cleanup in components |
| C155 | T1 | `.agent/skills/best-practices/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | [ ] No intrusive interstitials |
| C156 | T1 | `.agent/skills/best-practices/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | [ ] Permission requests in context |
| C157 | T1 | `.agent/skills/best-practices/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | [ ] Clear error messages |
| C168 | T1 | `.agent/skills/codenavi/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Understand the mission before moving. |
| C170 | T1 | `.agent/skills/codenavi/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Listen to the developer's request. Identify: |
| C171 | T1 | `.agent/skills/codenavi/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | What is the objective? |
| C172 | T1 | `.agent/skills/codenavi/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | What does success look like? |
| C173 | T1 | `.agent/skills/codenavi/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | What constraints exist? |
| C182 | T1 | `.agent/skills/codenavi/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Token discipline during Recon: |
| C194 | T1 | `.agent/skills/codenavi/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Implement the approved plan. Follow these principles: |
| C195 | T1 | `.agent/skills/codenavi/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | **Simplicity first** |
| C197 | T1 | `.agent/skills/codenavi/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | No features beyond what was asked. |
| C198 | T1 | `.agent/skills/codenavi/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | No abstractions for single-use code. |
| C199 | T1 | `.agent/skills/codenavi/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | No premature flexibility or configurability. |
| C201 | T1 | `.agent/skills/codenavi/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | **Surgical changes** |
| C202 | T1 | `.agent/skills/codenavi/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Only touch what the plan requires. |
| C207 | T1 | `.agent/skills/codenavi/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | **Verify knowledge before applying it** |
| C209 | T1 | `.agent/skills/codenavi/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Follow the Knowledge Verification Chain (see below). |
| C215 | T1 | `.agent/skills/codenavi/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Check each verification criterion from the Plan. |
| C248 | T1 | `.agent/skills/codenavi/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | **Trivial** (typo fix, rename, simple change): |
| C250 | T1 | `.agent/skills/codenavi/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Total: ~30 seconds of overhead |
| C251 | T1 | `.agent/skills/codenavi/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | **Standard** (bug fix, small feature, refactoring): |
| C253 | T1 | `.agent/skills/codenavi/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | **Complex** (cross-module feature, architectural change, deep investigation): |
| C277 | T1 | `.agent/skills/harness-eval/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | **`B`:** Track A, then Steps 4–6. |
| C279 | T1 | `.agent/skills/harness-eval/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | **`B+C`:** Track A, then Steps 4–11. |
| C286 | T1 | `.agent/skills/harness-eval/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Run scripts as `python3 "$SKILL_DIR/scripts/<name>.py" ...`. |
| C288 | T1 | `.agent/skills/harness-eval/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | **Report-only by default.** Judgment ≠ remediation. |
| C304 | T1 | `.agent/skills/harness-eval/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | `$SKILL_DIR/scripts/inventory_extract.py` |
| C305 | T1 | `.agent/skills/harness-eval/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | `$SKILL_DIR/scripts/track_a_correctness.py` |
| C306 | T1 | `.agent/skills/harness-eval/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | `$SKILL_DIR/scripts/merge_agreement.py` |
| C307 | T1 | `.agent/skills/harness-eval/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | `$SKILL_DIR/scripts/surfaces_extract.py` |
| C308 | T1 | `.agent/skills/harness-eval/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | `$SKILL_DIR/scripts/merge_usefulness.py` |
| C309 | T1 | `.agent/skills/harness-eval/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | `$SKILL_DIR/scripts/slim_fanin.py` |
| C310 | T1 | `.agent/skills/harness-eval/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | `$SKILL_DIR/scripts/doc_scope.py` |
| C312 | T1 | `.agent/skills/harness-eval/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | From the **target repo root**: |
| C322 | T1 | `.agent/skills/harness-eval/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Prefer Steps 4 and 5 in parallel. |
| C329 | T1 | `.agent/skills/harness-eval/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Prefer Steps 8 and 9 in parallel. |
| C346 | T1 | `.agent/skills/tlc-implement/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | model. How you build is yours. |
| C408 | T1 | `.agent/skills/tlc-plan/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | question and the option chosen. |
| C410 | T1 | `.agent/skills/tlc-plan/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | for the area before asking anything: |
| C416 | T1 | `.agent/skills/tlc-plan/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | correct. Section headings stay in English. |
| C445 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Load only what the current step needs: |
| C456 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | **Feature-level (auto-sized):** |
| C466 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Output findings in the terse `file:line` format |
| C468 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | The guidelines cover: |
| C469 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Accessibility (ARIA, semantic HTML, keyboard navigation) |
| C470 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Focus states and keyboard interaction |
| C471 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Forms (autocomplete, validation, labels) |
| C472 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Animation (reduced motion, performance) |
| C473 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Typography (proper characters, number formatting) |
| C474 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Content handling (overflow, empty states) |
| C475 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Images (dimensions, lazy loading) |
| C476 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Performance (virtualization, DOM reads) |
| C477 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Navigation & state (URL sync, deep linking) |
| C478 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Touch & interaction (tap delays, safe areas) |
| C479 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Common anti-patterns to flag |
| C486 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Follow the format in the guidelines: |
| C487 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Group findings by file |
| C488 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Use `file:line` format (VS Code clickable) |
| C489 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Terse, high signal-to-noise |
| C490 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | State issue + location |
| C491 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | REDUNDANT-GENERAL | 1/REDUNDANT-GENERAL | Skip explanation unless fix is non-obvious |

## Hold

| ID | Tier | Reason | J1 | J2 | Quote |
|----|------|--------|----|----|-------|

## Review (KEEP family)

426 claims. See J1/J2 score tables for detail.

## Action guidance

- **T0 Ship:** edit always-on rules now.
- **T1 Ship:** skill cleanup backlog.
- **T2 Ship:** routing/pointer hygiene.
- **Hold:** do not trim.

