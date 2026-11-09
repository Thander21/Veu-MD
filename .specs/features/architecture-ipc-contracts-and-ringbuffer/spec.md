# Feature Specification: Architecture IPC Contracts, Terminal Ring-Buffer and Svelte 5 Runes

**Feature Name**: `architecture-ipc-contracts-and-ringbuffer`
**Approved**: 2026-11-09 - user: "pronto"

## Problem Statement

Após a consolidação da modularização do backend Rust e a validação do conjunto de testes, a arquitetura do Veu MD apresenta três oportunidades críticas de evolução para manter escalabilidade, estabilidade de memória e alinhamento tecnológico:
1. **Ausência de Tipagem Estrita nos Comandos IPC**: As chamadas `invoke()` no frontend enviam objetos genéricos e recebem dados sem tipagem estrita espelhada do Rust, criando risco de drift de schema em tempo de execução.
2. **Crescimento Desenfreado de Blocos no Terminal Veu**: Sessões longas de terminal (compilações contínuas, testes de regressão e scripts com milhares de linhas) acumulam blocos DOM indefinidamente na timeline, degradando o consumo de memória do WebView2.
3. **Coexistência de Paradigmas de Reatividade no Svelte 5**: Stores clássicos baseados em `writable`/`derived` coexistem com a API de Runes do Svelte 5, exigindo convenções claras para migração progressiva sem quebras.

## Out of Scope

- Adoção de geradores automáticos de binding externos pesados ou WebViews adicionais.
- Remoção imediata e disruptiva de stores consolidados legados que estejam estáveis e cobertos por testes de regressão.
- Alteração na identidade visual ou na estética editorial do Terminal Veu.

## Assumptions & Open Questions

| Assumption / Question | Chosen default | Rationale |
| :--- | :--- | :--- |
| Qual o limite padrão de retenção de blocos no Terminal Veu? | 500 blocos históricos | Garante histórico suficiente para consulta de compilações sem saturar nós DOM no WebView2. |
| Onde os tipos e contratos de IPC devem residir? | `src/types/ipc.ts` | Centraliza todos os tipos de entrada e saída dos comandos Rust consumidos pelo frontend. |
| Estratégia de migração para Runes do Svelte 5? | Progressiva e não-destrutiva | Novos módulos e stores refatorados adotam runes nativas (`$state`, `$derived`), preservando contratos existentes. |

**Open questions**: none

## User Stories

### US01: Contratos e Tipos Estritos de IPC
1. **IPC-01**: When invoking Rust backend commands from the frontend, the system shall type all command payloads and response signatures via centralized TypeScript interfaces matching Rust command definitions.
2. **IPC-02**: Where IPC errors occur in command invocation, the system shall return typed, human-readable error messages without leaking unhandled raw panic traces to the UI.

### US02: Ring-Buffer de Retenção de Blocos do Terminal
3. **RING-01**: While the terminal session is actively receiving output streams, the system shall enforce a rolling block retention limit (default: 500 blocks) discarding oldest completed blocks via FIFO eviction.
4. **RING-02**: When blocks are evicted by the ring-buffer, the system shall preserve active streaming block state and prompt input without breaking terminal scroll or focus.

### US03: Padronização de Reatividade via Runes do Svelte 5
5. **RUNE-01**: When authoring new reactive modules or refactoring existing stores, the system shall implement state and derived values using Svelte 5 runes (`$state`, `$derived`) rather than legacy writable stores.
6. **RUNE-02**: Where existing components consume legacy stores, the system shall preserve backward-compatible store subscriptions during the progressive migration.

## Requirement Traceability

| ID | Requirement | Priority | Status |
| :--- | :--- | :--- | :--- |
| IPC-01 | Tipagem estrita centralizada de payloads e retornos IPC | High | passed |
| IPC-02 | Tratamento e tipagem padronizada de erros de IPC | Medium | passed |
| RING-01 | Ring-buffer de retenção de até 500 blocos no Terminal Veu | High | passed |
| RING-02 | Preservação de bloco ativo e prompt durante evicção FIFO | High | passed |
| RUNE-01 | Adoção de Svelte 5 runes em novos módulos e refatorações | Medium | passed |
| RUNE-02 | Compatibilidade retroativa de stores durante a migração | Medium | passed |

