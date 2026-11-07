# Feature Spec: Veu MD Phase 2 — Refinamentos Avançados & Produtividade

**Status**: Planned / Ready for Review  
**Date**: 2026-11-07  
**Predecessor**: `veu-md-core` (MVP 100% Concluído & Verificado)

---

## 1. Problem Statement

Após a consolidação do núcleo funcional do **Veu MD** (motor WYSIWYG estilo Word, serialização GFM pura, terminal PTY multi-divisão com temas, árvore recursiva de arquivos com CRUD e sincronização externa com notify), usuários avançados que escrevem documentação técnica e notas de código necessitam de ferramentas superiores de produtividade:
1. Destaque de sintaxe contextual em blocos de código com seletor de linguagem e botão de cópia com um clique.
2. Manipulação espacial de arquivos via arrastar e soltar (*Drag & Drop*) na árvore lateral.
3. Modo Foco / Zen Mode (tela cheia sem distrações) para imersão total na escrita.
4. Gerenciamento e criação visual de temas personalizados salvos no disco.

---

## 2. Out of Scope

- Edição colaborativa em tempo real com CRDTs (fase de nuvem futura).
- Plugins de terceiros via sandbox WASM (planejado para v1.0).
- Embutimento de reprodutores de vídeo locais pesados.

---

## 3. Assumptions & Architectural Decisions

| Decisão | Escolha Padrão | Justificativa |
| :--- | :--- | :--- |
| **Destaque de Sintaxe** | Parser leve baseado em tokens CSS nativos / Prism | Não adiciona overhead pesado de bundling e renderiza via CSS custom properties do tema ativo. |
| **Drag & Drop** | Eventos nativos HTML5 Drag & Drop com IPC Tauri `rename_entry` | Movimentação atômica no filesystem nativo sem risco de perda de arquivos. |
| **Modo Foco (Zen)** | Atalho `F11` / `Ctrl+Shift+F` colapsando Sidebar, TopBar e StatusBar | Preserva a mesma instância do editor ProseMirror sem reconstrução de DOM. |
| **Theme Studio** | UI integrada com salvamento direto via `save_custom_theme` em Rust | Permite ao usuário criar paletas customizadas salvas na pasta de config do SO. |

---

## 4. User Stories & Acceptance Criteria

### P1: Destaque de Sintaxe e Utilitários de Bloco de Código

**User Story**: Como desenvolvedor e escritor técnico, quero que blocos de código exibam cores de sintaxe para linguagens populares e ofereçam botão de copiar, para que meus snippets sejam legíveis e facilmente utilizáveis.

**Acceptance Criteria**:
1. WHEN a `code_block` node is rendered in the editor, the system SHALL apply syntax highlighting tokens based on the language attribute (e.g. `javascript`, `typescript`, `rust`, `python`, `sql`, `json`, `html`, `css`, `bash`, `markdown`).
2. WHEN the user hovers over a code block, the system SHALL display a header showing the current language and a "Copiar" button.
3. WHEN the "Copiar" button is clicked, the system SHALL copy the raw code content to the system clipboard and display a visual confirmation ("Copiado!").

---

### P1: Arrastar e Soltar (Drag & Drop) na Árvore Lateral

**User Story**: Como usuário organizando minhas notas, quero arrastar arquivos ou pastas e soltá-los dentro de outras pastas na árvore lateral, para reorganizar minha estrutura de arquivos sem abrir o explorador do Windows.

**Acceptance Criteria**:
1. WHEN the user drags an item in the file tree and drops it over a target folder, the system SHALL execute `rename_entry` moving the item into the target directory on disk.
2. WHEN a drop operation succeeds, the system SHALL refresh the file tree and preserve the expanded state of surrounding folders.
3. IF the user attempts to drop a folder inside itself or a direct subfolder, the system SHALL cancel the drop operation gracefully without errors.

---

### P2: Modo Foco / Zen Mode (Escrita sem Distrações)

**User Story**: Como redator que busca foco profundo, quero entrar em um modo sem barras ou painéis com o texto centralizado na tela, para produzir conteúdo sem distrações visuais.

**Acceptance Criteria**:
1. WHEN the shortcut `F11` or `Ctrl + Shift + F` is pressed, the system SHALL hide the TopBar, Sidebar, and StatusBar, expanding the editor to occupy 100% of the window.
2. WHILE in Zen mode, pressing `Escape` or `F11` SHALL restore all interface panels to their previous visible states.
3. The system SHALL maintain smooth keyboard navigation and auto-save functionality while in Zen mode.

---

### P2: Criador e Gerenciador de Temas Customizados

**User Story**: Como leitor com preferências estéticas específicas, quero criar temas personalizados com nomes próprios e salvá-los no disco, para alternar entre diferentes esquemas de trabalho.

**Acceptance Criteria**:
1. The system SHALL provide a "Novo Tema" action in the theme settings panel allowing users to define a custom theme name and adjust palette colors.
2. WHEN a custom theme is saved, the system SHALL persist the JSON definition to the application configuration directory via the native `save_custom_theme` Tauri command.
3. WHEN the application initializes, the system SHALL automatically load all user themes from disk via `load_custom_themes` and list them alongside the default presets (Dark, Light, Sepia, Cyberpunk).

---

## 5. Requirement Traceability Matrix

| Requirement ID | Story | Criterion ID | Status |
| :--- | :--- | :--- | :--- |
| ADV-01 | P1: Destaque de Sintaxe em Código | AC-P2-001 | planned |
| ADV-02 | P1: Destaque de Sintaxe em Código | AC-P2-002 | planned |
| ADV-03 | P1: Destaque de Sintaxe em Código | AC-P2-003 | planned |
| ADV-04 | P1: Drag & Drop no Workspace | AC-P2-004 | planned |
| ADV-05 | P1: Drag & Drop no Workspace | AC-P2-005 | planned |
| ADV-06 | P1: Drag & Drop no Workspace | AC-P2-006 | planned |
| ADV-07 | P2: Modo Foco / Zen Mode | AC-P2-007 | planned |
| ADV-08 | P2: Modo Foco / Zen Mode | AC-P2-008 | planned |
| ADV-09 | P2: Criador de Temas Customizados | AC-P2-009 | planned |
| ADV-10 | P2: Criador de Temas Customizados | AC-P2-010 | planned |
| ADV-11 | P2: Criador de Temas Customizados | AC-P2-011 | planned |
