# Feature Specification: Split View Editor

**Feature Name**: `split-view-editor`
**Status**: passed
**Approved**: 2026-11-11 - user: "aprovado"

## Problem Statement

Usuários que utilizam o Veu MD para tarefas de escrita comparativa, tradução, conferência de notas ou documentação técnica enfrentam atrito ao precisarem alternar constantemente entre abas de arquivo:
1. O palco central renderiza exclusivamente um documento por vez (`activeTab`), impossibilitando a leitura de uma referência enquanto se edita outro texto.
2. A alternância contínua de abas quebra o fluxo de raciocínio e desloca a posição de leitura do documento de consulta.
3. Não existe suporte para redimensionar proporcionalmente duas áreas de trabalho dentro do editor de forma leve e responsiva.

## Out of Scope

- Divisão em grid complexo de mais de 2 painéis (3 ou 4 painéis simultâneos), preservando a clareza e foco visual do Veu MD.
- Sincronização de scroll forçada estilo diff (scroll lock), mantendo os painéis navegáveis de forma independente.
- Desacoplamento de janelas flutuantes multi-monitor separadas (janelas secundárias de SO).

## Assumptions & Open Questions

| Assumption / Question | Chosen default | Rationale |
| :--- | :--- | :--- |
| Qual orientação adotar como padrão? | Vertical (lado a lado / duas colunas) | Formato natural para comparação e escrita de textos em telas widescreen. |
| Como gerenciar abas de documentos no painel secundário? | Dropdown seletor ou botão "Abrir ao Lado" | Interface limpa sem poluição de múltiplas barras de abas complexas. |
| O que ocorre ao fechar a divisão? | O painel secundário é ocultado e a aba primária retém foco total | Preserva todas as abas abertas na barra de abas sem descartar conteúdos. |
| Como manter a integridade do auto-save? | Reutilização estrita da rotina `saveTab` isolada por `tab.id` | Garante que cada documento continue sendo gravado com seu próprio debounce de 1000ms. |

**Open questions**: none

## User Stories

### US01: Divisão e Redimensionamento do Palco Central
1. **SPLIT-01**: When the user triggers split view via shortcut `Ctrl + \` or UI toggle button, the system shall divide the editor area into primary and secondary panels with independent documents.
2. **SPLIT-02**: While split view is active, the system shall allow resizing the proportion between the two panels via a draggable separator handle.

### US02: Edição Independente e Persistência Concorrente
3. **SPLIT-03**: When modifying text in either panel, the system shall execute ProseMirror editing independently and flush auto-save safely per document ID without state collision.
4. **SPLIT-04**: When the user closes the split view, the system shall restore single-pane full width view while keeping both documents accessible in the main tab list.

## Requirement Traceability

| ID | Requirement | Priority | Status |
| :--- | :--- | :--- | :--- |
| SPLIT-01 | Divisão do palco central em painéis primário e secundário via atalho e botão | High | passed |
| SPLIT-02 | Alça interativa de redimensionamento de largura/altura entre os dois painéis | High | passed |
| SPLIT-03 | Edição independente com auto-save isolado por documento nos dois painéis | High | passed |
| SPLIT-04 | Restauração fluida para painel único sem descarte de abas abertas | Medium | passed |

