# Feature Specification: Architecture Remediation and Security Hardening

**Feature Name**: `architecture-remediation-and-hardening`
**Approved**: 2026-11-08 - user: "sim crie a spec de todos os itens levantados ... apos issso incie"

## Problem Statement

Durante a auditoria arquitetural independente conduzida por dois juízes especialistas sobre as recentes refatorações do Veu MD, foram identificadas 7 falhas técnicas críticas e desvios de diretrizes do `AGENTS.md`:
1. **Regressão de CSP**: A Content Security Policy bloqueia fontes externas do Google Fonts (`index.html`) e imagens remotas em Markdown (`img-src` sem `https:` e `blob:`).
2. **Race Condition de Abas**: Em `switchToProject`, a microtask assíncrona de leitura de arquivos permite que o bloco reativo sobrescreva o projeto de destino com as abas do projeto anterior no `localStorage`.
3. **I/O Síncrono Excessivo**: A digitação de cada tecla no editor dispara serialização JSON síncrona completa de todos os projetos em `localStorage.setItem`.
4. **Violação de Layout da Gaveta de IA**: `AiAssistantPanel` foi estilizado como elemento flex relativo, violando o posicionamento fixo exigido em `AGENTS.md` e causando reflow no palco central.
5. **Processos PTY Zumbis**: `kill_terminal` apenas remove a sessão do mapa em Rust sem chamar `.kill()` no processo filho, gerando processos órfãos no Windows ConPTY.
6. **Contenção de Lock Global em PTY**: `write_terminal` executa operações de I/O bloqueante mantendo o lock global de todos os terminais do workspace.
7. **Vulnerabilidade de Path Traversal**: `save_image_asset` e `save_custom_theme` aceitam nomes de arquivo sem validação estrita de escape de diretório.
8. **Vazamento de Listeners IPC**: O listener `file-changed-externally` em `App.svelte` não é liberado no ciclo `onDestroy`.

## Out of Scope

- Substituição do motor xterm legado por completo (a convivência dual-engine permanece ativa conforme decisão explícita prévia do usuário).
- Mudanças no layout visual do editor ProseMirror ou nos componentes de temas além das correções arquiteturais apontadas.
- Reescrita do parser ANSI nativo (`ansiParser.ts`), que já se encontra estável.

## Assumptions & Open Questions

| Assumption / Question | Chosen default | Rationale |
| :--- | :--- | :--- |
| Fontes do Google Fonts devem ser mantidas remotas ou embutidas localmente? | Manter Google Fonts remoto na CSP | Preserva a integridade do binário leve sem embutir 10 MB de arquivos WOFF2 no instalador. |
| Debounce ideal para persistência de workspace no LocalStorage durante digitação? | 500ms com autoSaveTimeout | Elimina engasgos na thread da UI mantendo sincronismo quase imperceptível para o usuário. |
| Mecanismo de persistência visual do TerminalVeuPanel ao recolher? | Classe CSS `.hidden` com `display: none;` | Mantém os streams de PTY e buffer sequencial intactos em background sem recriação. |
| Sanitização de nomes de temas customizados? | Regex alfanumérica estrita `^[a-zA-Z0-9_-]+$` | Impede quebras de SO e escalonamento de diretório no salvamento de arquivos JSON. |

**Open questions**: none

## User Stories

### US01: Correção de CSP para Tipografia e Imagens
1. **CSP-01**: When the webview loads external fonts from Google Fonts, the system shall allow stylesheets from `https://fonts.googleapis.com` and font binaries from `https://fonts.gstatic.com` without CSP console violations.
2. **CSP-02**: When a Markdown document references remote images or pasted canvas data, the system shall allow `https:`, `blob:`, `http://asset.localhost` and `https://asset.localhost` within `img-src`.

### US02: Sincronização Atômica de Workspace e Debounce
3. **SYNC-01**: When the user switches between open projects in `switchToProject`, the system shall enforce an atomic loading guard preventing reactive statements from overwriting destination tabs with stale project tabs.
4. **SYNC-02**: While the user is typing in the editor, the system shall debounce workspace storage serialization by 500ms to eliminate synchronous `localStorage` stalls on keystrokes.

### US03: Conformidade de Layout da Gaveta de IA
5. **DRAWER-01**: When the AI Assistant drawer is opened, the system shall position `AiAssistantPanel` as a fixed drawer (`position: fixed; right: 0; top: 44px; bottom: 24px; z-index: 40;`) preventing reflow of `.center-stage`.

### US04: Ciclo de Vida do PTY e Eliminação de Zumbis
6. **PTY-01**: When a terminal session is closed via `kill_terminal`, the backend system shall retain the child process handle and explicitly kill the child process tree to prevent zombie processes.
7. **PTY-02**: When the terminal panel visibility is toggled off, the frontend system shall conceal the panel via CSS `.hidden` preserving PTY background execution and command history.

### US05: Desacoplamento de Locks e Segurança de FS
8. **LOCK-01**: When input data is dispatched to a terminal via `write_terminal`, the backend system shall execute I/O write operations without holding the global terminals mutex lock.
9. **SEC-01**: When saving image assets or theme files, the backend system shall sanitize incoming filenames using base filename extraction and strict character validation to prevent directory traversal.
10. **LEAK-01**: When `App.svelte` is unmounted or destroyed, the system shall invoke the stored `unlisten` handler for `file-changed-externally` preventing listener memory leaks.

## Requirement Traceability

| ID | Requirement | Priority | Status |
| :--- | :--- | :--- | :--- |
| CSP-01 | Permissão de Google Fonts na Content Security Policy | High | complete |
| CSP-02 | Permissão de imagens remotas https e blob na CSP | High | complete |
| SYNC-01 | Proteção atômica de troca de projeto contra race conditions | High | complete |
| SYNC-02 | Debounce de 500ms na persistência de workspace no LocalStorage | Medium | complete |
| DRAWER-01 | Posicionamento fixo de AiAssistantPanel conforme AGENTS.md | High | complete |
| PTY-01 | Encerramento explícito de processos filhos PTY no Rust | High | complete |
| PTY-02 | Persistência contínua do TerminalVeuPanel via classe CSS hidden | High | complete |
| LOCK-01 | Granularidade individual de lock em write_terminal | Medium | complete |
| SEC-01 | Sanitização contra Path Traversal em fs_cmd e theme_cmd | High | complete |
| LEAK-01 | Desinscrição explícita de listeners IPC no onDestroy | Medium | complete |
