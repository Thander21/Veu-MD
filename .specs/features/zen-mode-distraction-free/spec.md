# Feature Specification: Zen Mode / Distraction-Free

**Feature Name**: `zen-mode-distraction-free`
**Status**: complete
**Approved**: 2026-11-11 - user: "aprovado"

## Problem Statement

Escritores de textos longos necessitam de foco imersivo, eliminando estímulos e barras de ferramentas durante sessões de concentração:
1. Painéis laterais e barras de status ocupam até 35% da tela.
2. Interrupções visuais reduzem a velocidade e o fluxo de produção de conteúdo.
3. Necessidade de transição fluida entre modo de edição completa e modo minimalista sem perder estado.

## Out of Scope

- Sons de máquina de escrever binaurais embutidos.
- Bloqueio de outros programas do sistema operacional.

## Assumptions & Open Questions

| Assumption / Question | Chosen default | Rationale |
| :--- | :--- | :--- |
| Qual atalho de teclado adotar? | `F11` e `Ctrl + Shift + Enter` | Padrão reconhecido em navegadores e editores modernos. |
| Como sair do Modo Zen? | Tecla `Escape`, repetição do atalho ou pílula flutuante no topo | Múltiplas saídas intuitivas sem risco de usuário ficar preso. |
| O que acontece com o auto-save? | Permanece ativo e idêntico ao modo normal | Segurança total contra perda de dados. |

**Open questions**: none

## User Stories

### US01: Ativação e Imersão
1. **ZEN-01**: When the user triggers Zen Mode (via `F11`, `Ctrl + Shift + Enter` or TopBar button), the system shall hide sidebars, tabbar, statusbar and toolbars.
2. **ZEN-02**: While in Zen Mode, the editor shall expand to an immersive, centered layout with comfortable reading margins.

### US02: Ergonomia e Restauração
3. **ZEN-03**: While in Zen Mode, the system shall display a discreet floating indicator allowing quick exit or showing word count.
4. **ZEN-04**: When the user presses `Escape` or the exit button, the system shall restore the previous workspace visibility state without reloading.

## Requirement Traceability

| ID | Requirement | Priority | Status |
| :--- | :--- | :--- | :--- |
| ZEN-01 | Ocultação total e fluida de barras circundantes via estado reativo | High | pending |
| ZEN-02 | Palco central com centralização imersiva e largura tipográfica ideal | High | pending |
| ZEN-03 | Pílula flutuante discreta com ação de saída e contagem de palavras | Medium | pending |
| ZEN-04 | Restauração instantânea do layout anterior via Escape ou atalho | High | pending |

