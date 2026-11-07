# sidebar-layout-and-splash proofs

**HEAD**: 242e2a6
**Tree**: clean
**Shell**: C:/Program Files/Git\bin\bash.exe
**Result**: 7 pass, 0 fail

| Check | Proof | Result |
| --- | --- | --- |
| C01 | `run splashcheck / SUCCESS: Todos os contratos de layout, splash screen e barra lateral passaram!` | pass |
| C02 | `run rustcheck / Finished` | pass |
| C03 | `run typecheck / svelte-check found 0 errors` | pass |
| C04 | `run typecheck / svelte-check found 0 errors` | pass |
| C05 | `run typecheck / svelte-check found 0 errors` | pass |
| C06 | `run typecheck / svelte-check found 0 errors` | pass |
| Build | `npm run build` | pass |

## Output

`Run splashcheck` - exit 0

```
SUCCESS: Todos os contratos de layout, splash screen e barra lateral passaram!
```

`Run rustcheck` - exit 0

```
> veu-md@0.1.0 check:rust
> %USERPROFILE%\.cargo\bin\cargo.exe check --manifest-path src-tauri/Cargo.toml

    Finished `dev` profile [unoptimized + debuginfo] target(s) in 1.34s
```

`Run typecheck` - exit 0

```
> veu-md@0.1.0 check
> svelte-check --tsconfig ./tsconfig.json

Loading svelte-check in workspace: w:\_Projetos\Veu MD
Getting Svelte diagnostics...

svelte-check found 0 errors and 0 warnings
```
