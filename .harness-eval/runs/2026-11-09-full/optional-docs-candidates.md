# Optional docs (not in eval unless approved)

Non-agent documents cited by T0/T1. **ADRs / RFCs are always excluded.**
Agent skill-tree files (`.agents/skills`, `.cursor/skills`, `.claude/skills`) are always in scope.

## Ask the user

Present the doc **types** below and ask which (if any) to include in this run.
Then re-run inventory with `--include-doc-type <type>` and/or `--include-doc <path>`.

## Always excluded (decision records)

_None discovered in one-hop cites._

## Optional types (default: omitted)

| Type | Count | Example paths |
|------|------:|---------------|
| `.notebook` | 1 | `.notebook/INDEX.md` |
| `.specs` | 1 | `.specs/STATE.md` |

### Re-run examples

```bash
python3 "$SKILL_DIR/scripts/inventory_extract.py" --root . --run-id "$RUN_ID" \
  --include-doc-type docs
python3 "$SKILL_DIR/scripts/inventory_extract.py" --root . --run-id "$RUN_ID" \
  --include-doc docs/context.md --include-doc docs/infrastructure.md
```

## Included optional docs this run

- `.notebook/INDEX.md`
- `.specs/STATE.md`

