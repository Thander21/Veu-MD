# Architecture Refactoring, Cleanup, and Modularization — Context

**Gathered:** 2026-11-08  
**Spec:** `.specs/features/architecture-refactor-and-cleanup/spec.md`  
**Status:** Clarified & Ready for execution  

---

## Feature Boundary

Este épico abrange a refatoração e limpeza arquitetural do Veu MD, compreendendo:
- Higienização de ativos pesados redundantes (`public/veu-app-icon.png` de 1.2 MB e rascunhos de teste).
- Criação do runner de testes unificado `scripts/run_all_tests.mjs` associado ao `npm test`.
- Modularização do backend Rust (`src-tauri/src/lib.rs`) em submódulos especializados (`commands/fs_cmd.rs`, `commands/pty_cmd.rs`, etc.).
- Extração de estado de múltiplos workspaces de `App.svelte` para `src/lib/stores/projectStore.ts` e serviços de FS em `fsService.ts`.
- Decomposição do painel do assistente de IA com extração de `AiSettingsView.svelte`.
- Configuração de Content Security Policy (CSP) estrita em `src-tauri/tauri.conf.json`.

---

## Implementation Decisions

### 1. Convivência de Motores de Terminal (xterm + Terminal Veu)
- **Decisão do Usuário:** *"manter um xterm e o terminal veu (veulab) ate termos ele funcioando bem, mas um xterm matner o mais atual"*
- **Ação:** NÃO desinstalar o xterm nesta fase. Manter as bibliotecas `@xterm/xterm` (v5.5.0), `@xterm/addon-fit` e `@xterm/addon-webgl` atualizadas, preservando o botão de alternância entre o motor editorial Terminal Veu (VeuLab) e o xterm clássico até que a transição completa seja homologada pelo usuário.

### 2. Padrão de Store para Workspaces e Abas (`projectStore.ts`)
- **Decisão:** Store reativa clássica (`writable` encapsulado com métodos tipados em TypeScript puro).
- **Justificativa de Leveza:** É a abordagem mais rápida e com menor footprint de memória (< 1KB, zero runtime adicional, integração nativa via sintaxe `$projectStore`), mantendo total compatibilidade e sem riscos de ciclo reativo.

### 3. Política de Content Security Policy (CSP)
- **Decisão do Usuário:** *(Recommended) CSP estrita local*
- **Ação:** Configurar `tauri.conf.json` com `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: asset: http://asset.localhost; font-src 'self' data:; connect-src 'self' ipc: ws:;`, bloqueando CDNs e scripts externos.

### 4. Estratégia de Execução da Suíte de Testes
- **Decisão do Usuário:** *(Recommended) Fail-Fast*
- **Ação:** O script `scripts/run_all_tests.mjs` interrompe imediatamente na primeira falha de suíte, fornecendo feedback imediato do erro no terminal.

