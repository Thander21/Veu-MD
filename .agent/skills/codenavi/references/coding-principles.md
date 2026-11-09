# Coding Principles

Read this file during the Execute phase when implementing changes.

## 1. Simplicity First

Write the minimum code that solves the problem.

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- No speculative optimization.
- If you wrote 200 lines and it could be 50, rewrite it.

## 2. Surgical Changes

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated issues, mention them — don't fix them.

When your changes create orphans:

- Remove imports, variables, and functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line traces directly to the mission objective.

## 3. Goal-Driven Execution

Transform vague tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan with verification checkpoints.
Strong success criteria enable autonomous execution. Weak criteria
("make it work") require constant clarification — ask for better
criteria rather than guessing.

## 4. Respect the Codebase

You are a guest in this codebase. Act like it.

- Use the same naming conventions already in the project.
- Use the same file organization patterns.
- Use the same error handling approach.
- Use the same import style (named vs default, relative vs absolute).
- If the project uses semicolons, use semicolons. If it doesn't, don't.

If existing conventions conflict with language best practices, flag it
to the developer. Don't silently introduce a different convention.

## 5. Language Best Practices

Always follow the official best practices for the language and
frameworks in use. This means:

- Use idiomatic patterns for the language (e.g., list comprehensions
  in Python, Optional chaining in TypeScript).
- Follow the official style guide when the project doesn't have its own.
- Use current, non-deprecated APIs and methods.
- Handle errors according to the language's conventions (try/catch,
  Result types, error returns — whatever the ecosystem prefers).

Critical: Never rely on training memory for API signatures, method
parameters, or framework behavior. Always verify against current
documentation using the Knowledge Verification Chain:

```
.notebook/ → project docs → MCP Context7 → web search → flag as uncertain
```

## 6. Dependencies and Imports

When adding new dependencies or imports:

- Check if the project already has a dependency that solves the
  problem before adding a new one.
- Check the project's package manager and lockfile for existing
  versions.
- If adding a new dependency, mention it to the developer with
  rationale — never silently add packages.
- Match the project's import style and ordering conventions.

## 7. Error Handling

- Handle errors that can realistically occur.
- Don't add catch blocks for theoretically impossible scenarios.
- Use the project's existing error handling patterns.
- Error messages should be actionable — tell what happened and
  what to do about it, not just "Something went wrong."
- Never swallow errors silently (empty catch blocks) unless
  there's an explicit reason documented in a comment.

## 8. Testing

When tests are part of the mission:

- Write tests that verify behavior, not implementation details.
- Test the contract (input → output), not internal state.
- Name tests descriptively: "should reject expired coupon"
  not "test1" or "coupon test."
- If modifying existing code, run existing tests first to
  establish a baseline.
- If adding a bug fix, write a test that reproduces the bug
  first, then fix it.

When tests are NOT part of the mission:

- Don't add tests unless asked.
- But DO mention if the change is risky and untested:
  "This change affects the payment flow but there are no tests
  covering this path. Consider adding tests for [specific cases]."

## 9. Comments

- Don't add comments that restate the code.
- Don't remove existing comments unless they're provably wrong.
- Add comments only for non-obvious business logic or workarounds.
- If you add a workaround, explain WHY it's necessary and link
  to the relevant issue/ticket if available.
- Match the project's commenting style and language (human language).
