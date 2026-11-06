# Feature Spec: Veu MD Core Engine & Workspace (MVP)

**Approved**: 2026-11-06 - user: "sim aprovo"

## Problem Statement

Usuários que leem e escrevem notas e documentação em Markdown enfrentam o dilema entre ferramentas pesadas de programação (como VS Code, que requer janelas divididas de preview) e editores simplificados de notas que escondem o sistema de arquivos ou exibem tags de formatação cruas (`#`, `**`, `*`, `>`), poluindo visualmente o texto. O **Veu MD** resolve isso oferecendo uma folha de leitura e escrita 100% WYSIWYG no estilo Microsoft Word (onde as tags de marcação nunca aparecem na tela, mas são salvas como `.md` puro no disco), um explorador de arquivos e pastas em árvore com ícones diferenciados, um motor de cores por tag acelerado por GPU sem custo de re-renderização, e um terminal integrado nativo posicionado na pasta do projeto.

## Out of Scope

- Sincronização em nuvem e armazenamento remoto proprietário (armazenamento estritamente local em disco).
- Colaboração multiusuário em tempo real (CRDTs / WebSockets).
- Visualizador de diff inline avançado com marcações vermelho/verde no MVP (recarregamento com notificação na status bar no MVP; diff inline em ciclo posterior).
- Marketplace público de plugins no lançamento inicial (temas gerenciados via JSON).
- Edição visual de arquivos binários não-texto (imagens abrem apenas como referências ou via links).

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| :--- | :--- | :--- | :--- |
| Estratégia de Escopo | MVP funcional e arquitetura correta | Reduz complexidade inicial e valida integração de baixo nível antes de refinos secundários (AD-007). | yes (user approved) |
| Salvamento Automático | Debounce padrão de 1000ms e Ctrl+S | Preserva dados do usuário de forma transparente sem sobrecarregar operações de I/O em disco (AD-008). | yes (user approved) |
| Criação Prévia de Arquivo | Arquivo criado no disco (`novo_arquivo.md`) | Garante que todo documento ativo possua diretório absoluto para salvar imagens locais de forma determinística (AD-009). | yes (user approved) |
| Colagem de Imagens (Ctrl+V) | Salva em `./assets/` relativo ao arquivo | Facilita portabilidade e visualização local sem depender de servidores remotos ou blobs temporários. | yes (user approved) |
| Sincronização Externa (Terminal/Git) | Recarga com aviso na barra de status | Fornece consistência imediata com alterações externas de forma simples e robusta no MVP (AD-010). | yes (user approved) |
| Formato de Armazenamento | Markdown padrão GFM puro | Garante compatibilidade universal com GitHub, Obsidian e VS Code sem lock-in. | yes (user approved) |
| Restrição de Edição | Apenas `.md`, `.markdown`, `.txt`, `.log` | Previne corrupção acidental de arquivos binários e mantém o editor focado. | yes (user approved) |

**Open questions:** none - all resolved or logged above (required before the spec is confirmed).

## User Stories

### P1: Edição WYSIWYG Estilo Word e Serialização GFM Pura

**User Story**: Como escritor de notas técnicas, quero editar meus textos em uma folha limpa sem caracteres de formatação bruta visíveis na tela, para que eu tenha uma experiência fluida de digitação estilo Word enquanto mantenho arquivos `.md` válidos no disco.

**Why P1**: É a proposta de valor central e o invariante primário do produto Veu MD.

**Acceptance Criteria**:

1. WHILE editing in the document editor, the system SHALL render headings H1 through H6, bold, italic, strikethrough, blockquotes, lists, and tables without displaying raw markdown delimiters on screen.
2. WHEN the active document is persisted to disk, the system SHALL serialize the ProseMirror state into valid standard GitHub Flavored Markdown text.
3. WHEN a file with `.txt` or `.log` extension is opened, the system SHALL display and edit the content as plain text without applying rich markdown block formatting.

**Independent Test**: Criar um documento com títulos, negrito e listas, verificar ausência de `#` ou `**` na tela, salvar e inspecionar o arquivo no disco para confirmar sintaxe GFM válida.

---

### P1: Árvore de Arquivos e Gestão de Documentos no Workspace

**User Story**: Como usuário gerenciando múltiplos documentos, quero explorar pastas e arquivos em uma árvore lateral com ícones visuais diferenciados, para navegar e organizar minhas anotações diretamente no aplicativo.

**Why P1**: Essencial para a navegação do usuário e para garantir que todo arquivo ativo tenha um caminho no disco.

**Acceptance Criteria**:

1. WHEN a workspace directory is loaded, the system SHALL display a hierarchical tree rendering folders, markdown files, text files, and images with distinct identifying icons.
2. WHEN the user clicks an item in the file tree, the system SHALL open only files matching `.md`, `.markdown`, `.txt`, or `.log` extensions into editor tabs.
3. WHEN the user triggers new file creation without typing a name, the system SHALL create a file named `novo_arquivo.md` in the target directory on disk and open it in an editor tab.
4. The system SHALL provide controls to create folders, delete files or folders, and filter the file tree by search query.

**Independent Test**: Abrir uma pasta de teste, validar a renderização de ícones por extensão, criar `novo_arquivo.md` sem digitar nome e verificar criação física no disco.

---

### P1: Sistema de Abas, Auto-Save Inteligente e Atalho Ctrl+S

**User Story**: Como autor de documentos, quero manter múltiplos arquivos abertos em abas com indicador de alterações pendentes e salvamento automático sem esforço, para nunca perder conteúdo digitado.

**Why P1**: Previne perda de dados e viabiliza trabalho contínuo com múltiplos arquivos simultâneos.

**Acceptance Criteria**:

1. WHEN an editable document is opened, the system SHALL render a dedicated tab showing the filename, an icon, and a close button.
2. WHILE a document has unsaved in-memory modifications, the system SHALL display a visible dirty indicator dot on its corresponding tab.
3. WHEN 1000 milliseconds elapse without new user keystrokes in a modified document, the system SHALL persist changes to disk automatically and clear the dirty indicator.
4. WHEN the user triggers the shortcut `Ctrl + S`, the system SHALL persist the active document to disk immediately and clear the dirty indicator.

**Independent Test**: Digitar caracteres em uma aba, constatar surgimento do indicador dirty, aguardar 1000ms e verificar remoção automática do indicador e escrita no disco.

---

### P1: Customização de Cores por Tag e Temas em Tempo Real

**User Story**: Como leitor focado em ergonomia visual, quero alterar as cores de cada elemento Markdown no painel lateral com atualização instantânea, para adequar a leitura à minha preferência sem perda de desempenho.

**Why P1**: Diferencial visual central do Veu MD projetado com custo zero de CPU através de CSS Custom Properties.

**Acceptance Criteria**:

1. WHEN any color or style property is adjusted in the theme drawer, the system SHALL update the corresponding CSS custom property on the document root immediately.
2. The system SHALL support switching between predefined reading themes including Dark, Light, and Sepia, and support exporting and importing theme files in JSON format.

**Independent Test**: Abrir o painel de temas, alterar a cor de H1, e constatar alteração imediata na tela via CSS custom property sem re-renderização do motor ProseMirror.

---

### P1: Terminal Integrado Contextual no Workspace

**User Story**: Como desenvolvedor e redator técnico, quero abrir um terminal embutido na pasta do meu projeto através de um atalho rápido, para rodar comandos git ou utilitários sem alternar janelas.

**Why P1**: Agiliza tarefas técnicas e fecha o loop de produtividade do desktop sem depender de terminal externo.

**Acceptance Criteria**:

1. WHEN the shortcut `Ctrl + '` is pressed or the terminal toggle is clicked, the system SHALL open an interactive pseudo-terminal session running in the active workspace directory.
2. The system SHALL transmit keyboard input to the operating system shell and render streaming output via WebGL canvas using xterm.js.

**Independent Test**: Pressionar `Ctrl + '`, verificar abertura do terminal no diretório correto e rodar um comando (ex: `dir` ou `ls`) confirmando saída no canvas.

---

### P1: Menus de Ação Rápida (Barra Superior, Barra Flutuante e Menus # e /)

**User Story**: Como escritor, quero formatar blocos e textos selecionados tanto pela barra superior quanto por menu flutuante e atalhos rápidos (`#` e `/`), para produzir conteúdo com agilidade estilo Word e Notion.

**Why P1**: Completa a experiência WYSIWYG permitindo formatação rápida sem necessidade de memorizar sintaxe Markdown.

**Acceptance Criteria**:

1. The system SHALL provide a fixed top toolbar offering format controls for headings H1 through H6, bold, italic, strikethrough, lists, code blocks, and blockquotes.
2. WHILE a text range is selected in the editor, the system SHALL display a floating bubble menu adjacent to the selection containing formatting actions.
3. WHEN the user types `#` at the beginning of an empty block, the system SHALL display a heading selector menu covering H1 through H6.
4. WHEN the user types `/` in an empty block, the system SHALL display a slash menu containing selectable block types.

**Independent Test**: Selecionar um trecho de texto e verificar aparição do menu flutuante; digitar `#` e verificar abertura da lista de títulos.

---

### P1: Colagem de Imagens da Área de Transferência e Sincronização Externa Básica

**User Story**: Como produtor de conteúdo, quero colar capturas de tela diretamente no texto e ter sincronização com o terminal, para incluir imagens com facilidade e manter o editor atualizado.

**Why P1**: Elimina o atrito de salvar imagens manualmente em pastas e garante consistência quando comandos git rodam no terminal.

**Acceptance Criteria**:

1. WHEN an image is pasted from clipboard via `Ctrl + V`, the system SHALL persist the image binary into a `./assets/` directory relative to the active document and insert standard markdown image syntax referencing the file.
2. WHEN the active document file is modified by an external process on disk, the system SHALL reload the updated content and display a notification message in the status bar.

**Independent Test**: Copiar um print de tela, pressionar `Ctrl + V` no editor, verificar criação física do arquivo PNG em `./assets/` e link inserido no texto.

---

## Edge Cases

- IF an invalid or unsupported file format is clicked in the tree THEN the system SHALL ignore the open request without throwing errors.
- IF an image is pasted into a document before `./assets/` exists THEN the system SHALL create the `./assets/` directory automatically before writing the image file.
- IF an external modification occurs while disk read is in progress THEN the system SHALL handle the file lock gracefully and retry or notify the user.

---

## Requirement Traceability

| Requirement ID | Story | Criterion ID | Status |
| :--- | :--- | :--- | :--- |
| CORE-01 | P1: Edição WYSIWYG Estilo Word e Serialização GFM Pura | AC-001 | verified |
| CORE-02 | P1: Edição WYSIWYG Estilo Word e Serialização GFM Pura | AC-002 | verified |
| CORE-03 | P1: Edição WYSIWYG Estilo Word e Serialização GFM Pura | AC-003 | verified |
| CORE-04 | P1: Árvore de Arquivos e Gestão de Documentos no Workspace | AC-004 | verified |
| CORE-05 | P1: Árvore de Arquivos e Gestão de Documentos no Workspace | AC-005 | verified |
| CORE-06 | P1: Árvore de Arquivos e Gestão de Documentos no Workspace | AC-006 | verified |
| CORE-07 | P1: Árvore de Arquivos e Gestão de Documentos no Workspace | AC-007 | verified |
| CORE-08 | P1: Sistema de Abas, Auto-Save Inteligente e Atalho Ctrl+S | AC-008 | verified |
| CORE-09 | P1: Sistema de Abas, Auto-Save Inteligente e Atalho Ctrl+S | AC-009 | verified |
| CORE-10 | P1: Sistema de Abas, Auto-Save Inteligente e Atalho Ctrl+S | AC-010 | verified |
| CORE-11 | P1: Sistema de Abas, Auto-Save Inteligente e Atalho Ctrl+S | AC-011 | verified |
| CORE-12 | P1: Customização de Cores por Tag e Temas em Tempo Real | AC-012 | verified |
| CORE-13 | P1: Customização de Cores por Tag e Temas em Tempo Real | AC-013 | verified |
| CORE-14 | P1: Terminal Integrado Contextual no Workspace | AC-014 | verified |
| CORE-15 | P1: Terminal Integrado Contextual no Workspace | AC-015 | verified |
| CORE-16 | P1: Menus de Ação Rápida (Barra Superior, Barra Flutuante e Menus # e /) | AC-016 | verified |
| CORE-17 | P1: Menus de Ação Rápida (Barra Superior, Barra Flutuante e Menus # e /) | AC-017 | verified |
| CORE-18 | P1: Menus de Ação Rápida (Barra Superior, Barra Flutuante e Menus # e /) | AC-018 | verified |
| CORE-19 | P1: Menus de Ação Rápida (Barra Superior, Barra Flutuante e Menus # e /) | AC-019 | verified |
| CORE-20 | P1: Colagem de Imagens da Área de Transferência e Sincronização Externa Básica | AC-020 | verified |
| CORE-21 | P1: Colagem de Imagens da Área de Transferência e Sincronização Externa Básica | AC-021 | verified |
