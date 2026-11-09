# Feature Specification: Architecture Resilience, Concurrency and Resource Lifecycle

**Feature Name**: `architecture-resilience-and-lifecycle`
**Approved**: 2026-11-09 - user: "ok aplique as tasks mas deixe pendente os outros pontos na spec"

## Problem Statement

A análise estrita da arquitetura do Veu MD revelou cinco gaps estruturais de confiabilidade, concorrência e ciclo de vida de recursos que impactam a estabilidade do sistema sem envolver adição de funcionalidades cosméticas:
1. **Concorrência e Perda de Dados no Auto-Save Multi-Abas**: O timer global de auto-save em `App.svelte` opera sobre o ponteiro reativo da aba ativa, gerando race condition quando o usuário alterna de aba antes de 1000ms. Além disso, o fechamento de aba (`closeTab`) descarta alterações pendentes sem flush.
2. **Descarte de Histórico e Descontinuidade no Terminal Dual-Engine**: A alternância entre o Terminal Veu e o xterm.js desmonta o componente `TerminalVeuPanel` via `{#if}`, violando o invariante de persistência do harness e deixando PTYs órfãos caso o projeto seja fechado com o xterm selecionado.
3. **Ausência de Ciclo de Vida de Encerramento Natural do PTY**: Quando um shell é finalizado pelo usuário (`exit`) ou comando em lote, a thread Rust encerra o loop de leitura sem emitir evento de saída e sem remover a sessão de `state.terminals`.
4. **Quebra de Renderização de Assets Locais no ProseMirror**: Imagens locais com caminhos relativos em documentos Markdown existentes (`./assets/`) não são mapeadas para o protocolo nativo de assets do Tauri v2 (`convertFileSrc`), resultando em erros 404 na WebView2.
5. **Vulnerabilidade em Exclusão de Caminhos no Backend**: O comando `delete_entry` no Rust executa remoção recursiva sem verificação de contenção contra diretórios raiz ou pastas críticas do sistema operacional.

## Out of Scope

- Adição de novos botões, visões, temas ou funcionalidades de produto na interface.
- Reformulação visual do editor ProseMirror ou da tipografia editorial do Terminal Veu.
- Substituição do motor ProseMirror por bibliotecas de terceiros ou wrappers externos.
- Modificações no protocolo de IPC que alterem contratos de comunicação sem necessidade arquitetural.

## Assumptions & Open Questions

| Assumption / Question | Chosen default | Rationale |
| :--- | :--- | :--- |
| Como isolar o timer de auto-save por aba? | Mapa de timers indexado por `tabId` com flush síncrono no blur/switch | Previne que a troca rápida de abas execute persistência contra o documento errado. |
| Como manter a convivência dual-engine de terminal sem destruição DOM? | Contêineres simultâneos no DOM alternados via classe CSS `.hidden` | Preserva instâncias, timelines e listeners em memória sem recriar sessões PTY. |
| Como resolver caminhos relativos de imagem no ProseMirror? | Node view customizado de imagem com `convertFileSrc` do Tauri | Mapeia caminhos relativos do disco para URLs seguras autorizadas pela CSP (`http://asset.localhost`). |
| Qual a política de proteção para `delete_entry` no Rust? | Rejeição de caminhos raiz (`/`, `C:\`), vazios ou que resolvam para diretórios do sistema | Impede deleção acidental ou maliciosa de diretórios críticos do sistema operacional. |
| Como garantir consistência de abas inativas modificadas externamente? | Verificação e recarga ao selecionar a aba caso `!tab.isDirty` | Garante que alterações externas (ex: Git ou CLIs) sejam refletidas ao focar a aba. |

**Open questions**: none

## User Stories

### US01: Isolamento de Concorrência e Ciclo de Vida do Auto-Save
1. **ARC-01**: When a user modifies a document in an open tab, the system shall isolate the auto-save debounce timer per tab so that switching tabs preserves pending modifications without race conditions.
2. **ARC-02**: When a user switches between open tabs, the system shall flush pending writes of any dirty tab before updating the active document pointer.
3. **ARC-03**: When a tab with unsaved modifications is closed, the system shall persist its pending content to disk before removing the tab from active memory.

### US02: Continuidade do Terminal Dual-Engine e Ciclo de Vida do PTY
4. **ARC-04**: While switching between terminal engines (Veu vs xterm), the system shall preserve active terminal DOM containers and timeline history via CSS display toggles without unmounting components.
5. **ARC-05**: When a terminal shell process terminates or reaches EOF, the system shall emit an exit notification to the frontend and remove the session handle from backend memory.

### US03: Resolução de Assets Locais e Consistência de Leitura
6. **ARC-06**: Where a markdown document references relative image asset paths, the system shall resolve image sources through the native Tauri asset protocol so that local images render without HTTP 404 errors.
7. **ARC-07**: When switching focus to an inactive tab, the system shall verify if the backing file was modified externally and reload its content if the tab has no unsaved local changes.

### US04: Segurança e Contenção de I/O no Backend Rust
8. **ARC-08**: When a file or directory deletion command is invoked, the system shall validate that the target path does not resolve to a filesystem root or system directory before performing deletion.

## Requirement Traceability

| ID | Requirement | Priority | Status |
| :--- | :--- | :--- | :--- |
| ARC-01 | Isolamento de debounce de auto-save por aba sem race conditions | High | passed |
| ARC-02 | Flush atômico de alterações pendentes na comutação de abas | High | passed |
| ARC-03 | Persistência imediata antes do fechamento de abas modificadas | High | passed |
| ARC-04 | Preservação de contêineres DOM na alternância dual-engine do terminal | High | passed |
| ARC-05 | Emissão de evento de saída e limpeza de sessão PTY ao atingir EOF | Medium | passed |
| ARC-06 | Resolução de caminhos relativos de imagem via Tauri asset protocol | High | passed |
| ARC-07 | Sincronização externa de abas em segundo plano ao receber foco | Medium | passed |
| ARC-08 | Validação de segurança e proteção de raízes em `delete_entry` | High | passed |

