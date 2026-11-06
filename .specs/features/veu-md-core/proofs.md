# veu-md-core proofs

**HEAD**: 8a41db7
**Tree**: clean
**Shell**: C:/Program Files/Git\bin\bash.exe
**Result**: 22 pass, 0 fail

| Check | Proof | Result |
| --- | --- | --- |
| C01 | `run typecheck / svelte-check found 0 errors` | pass |
| C02 | `run typecheck / svelte-check found 0 errors` | pass |
| C03 | `run typecheck / svelte-check found 0 errors` | pass |
| C04 | `run typecheck / svelte-check found 0 errors` | pass |
| C05 | `run typecheck / svelte-check found 0 errors` | pass |
| C06 | `run typecheck / svelte-check found 0 errors` | pass |
| C07 | `run typecheck / svelte-check found 0 errors` | pass |
| C08 | `run typecheck / svelte-check found 0 errors` | pass |
| C09 | `run typecheck / svelte-check found 0 errors` | pass |
| C10 | `run typecheck / svelte-check found 0 errors` | pass |
| C11 | `run typecheck / svelte-check found 0 errors` | pass |
| C12 | `run typecheck / svelte-check found 0 errors` | pass |
| C13 | `run typecheck / svelte-check found 0 errors` | pass |
| C14 | `run rustcheck / Finished` | pass |
| C15 | `run rustcheck / Finished` | pass |
| C16 | `run typecheck / svelte-check found 0 errors` | pass |
| C17 | `run typecheck / svelte-check found 0 errors` | pass |
| C18 | `run typecheck / svelte-check found 0 errors` | pass |
| C19 | `run typecheck / svelte-check found 0 errors` | pass |
| C20 | `run typecheck / svelte-check found 0 errors` | pass |
| C21 | `run rustcheck / Finished` | pass |
| Build | `npm run build` | pass |

## Output

`Run typecheck` - exit 0

```
> veu-md@0.1.0 check
> svelte-check --tsconfig ./tsconfig.json

Loading svelte-check in workspace: w:\_Projetos\Veu MD
Getting Svelte diagnostics...

svelte-check found 0 errors and 0 warnings
```

`Run rustcheck` - exit 0

```
> veu-md@0.1.0 check:rust
> %USERPROFILE%\.cargo\bin\cargo.exe check --manifest-path src-tauri/Cargo.toml

    Finished `dev` profile [unoptimized + debuginfo] target(s) in 1.82s
```
