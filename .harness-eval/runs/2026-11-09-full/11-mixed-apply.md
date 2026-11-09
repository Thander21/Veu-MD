# Mixed apply plan (Track C)

> Run dir: `W:\_Projetos\Veu MD\.harness-eval\runs\2026-11-09-full`
> Judges: J1 model=`gemini-3.8-flash` · J2 model=`gemini-3.8-flash`
> **This file is the only Mixed apply input.** Do not re-judge usefulness.

## What these words mean

| Word | Meaning | Apply must |
|------|---------|------------|
| **KEEP** | Text from judge Keep-core columns | Remain in the harness surface as rule/snippet |
| **CUT** | Text from judge Slim columns | Delete or compress only this bulk |
| **Apply** | Mechanical edit | Not a new design pass |

## Hard rules for apply agents

1. For each Mixed ID below, edit **only** that path.
2. **KEEP** items must survive (same contract — concern/module/section/checklist).
   Do not replace a KEEP teaching snippet with a weaker pattern.
3. **CUT** only what both judges' Slim columns describe (or the union when both
   clearly name the same bulk). If KEEP and CUT conflict, **skip that path** (Hold).
4. Never replace a fenced teaching snippet with `See app/...` / `lib/...` / `test/...`.
5. Never defer KEEP content to AGENTS.md or another surface unless CUT explicitly
   names OVERLAP with that path **and** KEEP still retains the behavior contract.
6. Do not open the repo to invent a different convention than KEEP states.
7. After edits: every KEEP bullet must still be satisfied by the file text.

## Paths (4)

### S002 — `.agent/skills/best-practices/SKILL.md`

- Tier: `T1` · Name: `best-practices`
- Overall: J1 `MIXED` · J2 `MIXED`

#### KEEP (do not remove or degrade)

- **J1:** BEHAVIOR-CHANGING: security headers, CSP and sanitization rules
- **J2:** BEHAVIOR-CHANGING: security headers, CSP and sanitization rules

#### CUT (only this bulk)

- **J1:** THEORY: general web development guidelines
- **J2:** THEORY: general web development guidelines

#### Overlap cites (context only; cut OVERLAP here only if listed under CUT)

- **J1:** none
- **J2:** none

---

### S008 — `.agent/skills/web-design-guidelines/SKILL.md`

- Tier: `T1` · Name: `web-design-guidelines`
- Overall: J1 `MIXED` · J2 `MIXED`

#### KEEP (do not remove or degrade)

- **J1:** BEHAVIOR-CHANGING: UI guidelines, typography and layout spacing tokens
- **J2:** BEHAVIOR-CHANGING: UI guidelines, typography and layout spacing tokens

#### CUT (only this bulk)

- **J1:** THEORY: general visual design axioms
- **J2:** THEORY: general visual design axioms

#### Overlap cites (context only; cut OVERLAP here only if listed under CUT)

- **J1:** none
- **J2:** none

---

### S009 — `.agent/skills/codenavi/references/coding-principles.md`

- Tier: `T2` · Name: `coding-principles.md`
- Overall: J1 `MIXED` · J2 `MIXED`

#### KEEP (do not remove or degrade)

- **J1:** BEHAVIOR-CHANGING: TypeScript and Rust surgical implementation rules
- **J2:** BEHAVIOR-CHANGING: TypeScript and Rust surgical implementation rules

#### CUT (only this bulk)

- **J1:** THEORY: clean code axioms
- **J2:** THEORY: clean code axioms

#### Overlap cites (context only; cut OVERLAP here only if listed under CUT)

- **J1:** none
- **J2:** none

---

### S020 — `.agent/skills/tlc-spec-driven/references/coding-principles.md`

- Tier: `T2` · Name: `coding-principles.md`
- Overall: J1 `MIXED` · J2 `MIXED`

#### KEEP (do not remove or degrade)

- **J1:** BEHAVIOR-CHANGING: SDD coding principles and deterministic gates
- **J2:** BEHAVIOR-CHANGING: SDD coding principles and deterministic gates

#### CUT (only this bulk)

- **J1:** THEORY: general design patterns
- **J2:** THEORY: general design patterns

#### Overlap cites (context only; cut OVERLAP here only if listed under CUT)

- **J1:** none
- **J2:** none

---

