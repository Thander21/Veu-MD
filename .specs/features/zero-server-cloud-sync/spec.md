# Feature Specification: Zero-Server Cloud Sync

**Feature Name**: `zero-server-cloud-sync`
**Status**: in-progress
**Approved**: 2026-11-10 - user: "aprovado"

## Problem Statement

Usuários que utilizam o Veu MD em múltiplos dispositivos (desktop e mobile) necessitam manter seus documentos sincronizados sem depender de uma infraestrutura proprietária de backend:
1. Soluções tradicionais de sincronização em nuvem exigem a hospedagem de servidores próprios com bancos de dados, gerando custos recorrentes e complexidade de manutenção.
2. Bibliotecas monolíticas de sincronização (ex: Git embutido com libgit2) aumentam drasticamente o footprint do executável e introduzem conflitos de merge intimidadores para usuários não técnicos.
3. Operações síncronas de rede correm o risco de bloquear o salvamento local do editor, introduzindo latência indesejada durante a digitação.

## Out of Scope

- Implementação de resolvedores automáticos complexos de conflitos de merge baseados em AST (árvore sintática de ProseMirror).
- Criação de contas de usuário ou servidores centrais gerenciados pela equipe do Veu MD.
- Sincronização em tempo real multiusuário estilo Google Docs (CRDT/OT colaborativo).

## Assumptions & Open Questions

| Assumption / Question | Chosen default | Rationale |
| :--- | :--- | :--- |
| Qual arquitetura adotar para sincronização sem servidor próprio? | Cliente modular HTTPS direto contra protocolos abertos (WebDAV e Google Drive appDataFolder) | Permite ao usuário utilizar seu próprio armazenamento (Nextcloud, Google Drive) sem intermediários. |
| Como proteger a experiência de digitação e auto-save local? | Isolamento total em worker ou thread de background em Rust desacoplada do salvamento em disco | Garante que o editor continue operando em modo local-first rápido mesmo offline. |
| Como agir quando houver alteração remota com a aba ativa aberta? | Notificar na StatusBar sem sobrescrever abas com `isDirty === true` | Previne perda de dados digitados localmente em caso de concorrência. |
| O que ocorre quando não houver conexão com a internet? | Operação silenciosa offline com fila de sincronização diferida | Mantém a fidelidade local sem travar o aplicativo com alertas contínuos de timeout. |

**Open questions**: none

## User Stories

### US01: Sincronização Desacoplada em Segundo Plano
1. **SYNC-01**: When cloud sync is configured with valid storage credentials, the system shall execute non-blocking background uploads of modified local markdown files.
2. **SYNC-02**: While synchronizing files in the background, the system shall isolate network I/O from the editor disk pipeline so that local editing and auto-save remain unblocked.

### US02: Consistência e Tolerância a Desconexão
3. **SYNC-03**: When a remote file modification is detected during background sync, the system shall pull the updated file content and notify the user via the StatusBar without overwriting dirty local tabs.
4. **SYNC-04**: Where network connectivity is unavailable, the system shall retain local file modifications in storage and defer synchronization until connectivity is restored.

## Requirement Traceability

| ID | Requirement | Priority | Status |
| :--- | :--- | :--- | :--- |
| SYNC-01 | Upload não-bloqueante em segundo plano de arquivos modificados | High | pending |
| SYNC-02 | Isolamento estrito de I/O de rede em relação ao auto-save local | High | pending |
| SYNC-03 | Atualização remota com notificação na StatusBar e proteção de dirty tabs | Medium | pending |
| SYNC-04 | Modo tolerante a desconexão com enfileiramento diferido de sincronização | Medium | pending |

