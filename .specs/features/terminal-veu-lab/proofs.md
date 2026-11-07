# terminal-veu-lab proofs

**HEAD**: 74068b1
**Tree**: clean
**Shell**: C:/Program Files/Git\bin\bash.exe
**Result**: 7 pass, 0 fail

| Check | Proof | Result |
| --- | --- | --- |
| C01 | `run labcheck / SUCCESS: Todos os contratos do Terminal Veu Lab passaram!` | pass |
| C02 | `run typecheck / svelte-check found 0 errors` | pass |
| C03 | `run labcheck / SUCCESS: Todos os contratos do Terminal Veu Lab passaram!` | pass |
| C04 | `run labcheck / SUCCESS: Todos os contratos do Terminal Veu Lab passaram!` | pass |
| C05 | `run typecheck / svelte-check found 0 errors` | pass |
| C06 | `run rustcheck / Finished` | pass |
| Build | `npm run build` | pass |

## Output

`Run labcheck` - exit 0

```
--- TESTANDO CONTRATOS DO TERMINAL VEU LAB ---
SUCCESS: Todos os contratos do Terminal Veu Lab passaram!
```

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

    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.84s
```
