# Feature Spec: Veu MD Phase 2 — Terminal Multi-Projeto Persistente & Produtividade Sem Sobrecarga

**Approved**: 2026-11-07 - user: "1 - opcao b mas de forma simples e rapida... 2 - opção a. 3 - opção b. 4 - opçao a. 5 - validar o terminal..."

## Problem Statement

Durante o uso diário com múltiplos workspaces, os usuários enfrentam a interrupção das sessões de terminal sempre que alternam a visualização entre projetos abertos, pois a reconstrução do componente de interface encerra a conexão xterm e descarta o buffer de saída. Adicionalmente, a experiência padrão do terminal é árida e propensa a falhas: a seleção de texto com o mouse é truncada, o redimensionamento de janelas quebra quebras de linha e o visual cru intimida usuários que não são desenvolvedores. Usuários que manipulam notas de IA também sofrem com textos colados que perdem formatação ou trazem saudações dispensáveis. O **Veu MD** precisa garantir a persistência completa dos terminais PTY em background entre projetos, uma interface ergonômica e amigável com seleção nativa e botões de ação rápida, colagem inteligente de IA e busca rápida de arquivos em memória (Ctrl+P), preservando o invariante inegociável de leveza (~5 MB a repouso).

## Out of Scope

- Modelos de IA locais ou transcrição de áudio embutidos no binário (ex: Whisper.cpp / Ollama local bundle), que elevariam o consumo de memória para centenas de megabytes.
- SDKs pesados baseados em Node.js ou runtime npm empacotados na distribuição.
- WebViews secundárias ou navegadores headless para fluxos de autenticação.
- Sincronização em nuvem proprietária ou colaboração multiusuário em tempo real nesta fase.
- Edição visual de arquivos binários não suportados (imagens, PDFs).

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| :--- | :--- | :--- | :--- |
| Estado do Terminal por Projeto | Opção B: Memorizado em memória reativa | Cada projeto memoriza se seu terminal estava aberto/fechado e suas dimensões sem sobrecarga de disco (Decision 1). | yes (user approved) |
| Encerramento de Sessão PTY | Opção A: Imediato ao fechar aba do projeto | Fechar a aba do projeto dispara `kill_terminal` para liberar recursos do sistema (Decision 2). | yes (user approved) |
| Escopo de Busca (Ctrl+P) | Opção B: Restrito ao projeto ativo em foco | Proporciona máxima relevância e busca instantânea dentro do escopo de trabalho (Decision 3). | yes (user approved) |
| Smart Paste com Higienização | Opção A: Ativado por padrão com toggle | Remove introduções de chatbots mantendo formatação rica, com opção de desligar nas preferências (Decision 4). | yes (user approved) |
| Ergonomia e Visual Amigável | Seleção nativa de mouse, botões rápidos e proteção de fit | Corrige falhas de seleção, evita quebras de redimensionamento e oferece botões de cópia e injeção no editor (Decision 5). | yes (user approved) |

**Open questions:** none - all resolved or logged above (required before the spec is confirmed).

## User Stories

### P1: Continuidade e Persistência do Terminal Multi-Projeto

**User Story**: Como desenvolvedor ou escritor técnico trabalhando em múltiplos projetos, quero que as sessões de terminal continuem rodando em background ao alternar entre abas de projetos, para que compilações, servidores locais ou scripts não sejam interrompidos e meu histórico de comandos seja preservado instantaneamente.

**Why P1**: É o requisito funcional crítico para viabilizar o fluxo multi-projeto sem perda de estado ou processos.

**Acceptance Criteria**:

1. WHILE switching between active open projects in the workspace, the system SHALL retain running PTY processes in the Rust backend without terminating them.
2. WHEN the user switches the active project view, the system SHALL display the terminal session corresponding to the newly focused project according to that project's memorized visibility state.
3. WHEN a project tab is explicitly closed by the user, the system SHALL terminate associated PTY sessions and release memory resources.
4. WHEN the terminal panel is brought back into view after project switching, the system SHALL execute `fitAddon.fit()` only when container dimensions are greater than zero to calibrate viewport dimensions without corrupting columns.

**Independent Test**: Iniciar um comando contínuo no terminal do Projeto A, alternar para o Projeto B, aguardar 5 segundos e retornar ao Projeto A; o processo deve continuar em execução com todo o log impresso.

---

### P1: Ergonomia, Seleção e Usabilidade Amigável do Terminal

**User Story**: Como usuário que executa comandos e rotinas no terminal, quero selecionar texto facilmente com o mouse, ter redimensionamento sem quebras visuais e contar com botões rápidos de ação, para que o terminal seja uma ferramenta convidativa e prática em vez de intimidante.

**Why P1**: Resolve os problemas de usabilidade, seleção quebrada e visual cru reportados diretamente no fluxo de trabalho.

**Acceptance Criteria**:

1. WHILE interacting with the terminal output, the system SHALL allow continuous mouse drag selection with native clipboard copying.
2. WHEN the terminal container is resized or maximized, the system SHALL adjust row and column metrics via debounced fit recalculation to prevent line wrapping glitches.
3. The system SHALL provide quick action toolbar buttons on the terminal panel including "Copiar Seleção", "Limpar Terminal" and "Inserir Saída no Cursor".
4. The system SHALL apply styling and typography aligned with the active theme colors without exceeding 1 MB of memory overhead.

**Independent Test**: Executar um comando no terminal, selecionar trechos de texto arrastando o mouse, clicar no botão de copiar e colar no editor confirmando fidelidade de texto.

---

### P1: Colagem Inteligente de Conteúdo de IA (Smart Paste)

**User Story**: Como usuário que copia blocos de código, tabelas e resumos de assistentes de IA (ChatGPT, Claude), quero colar o conteúdo no editor com formatação preservada e sem saudações desnecessárias, para que eu não perca tempo reformatando manualmente.

**Why P1**: Elimina a maior fricção de produtividade identificada no consumo e edição de textos de IA.

**Acceptance Criteria**:

1. WHEN rich text or raw Markdown containing code blocks, tables, or blockquotes is pasted from clipboard, the system SHALL convert and insert valid ProseMirror document nodes without losing structure.
2. IF the pasted content begins with common conversational AI greetings or endings (e.g. "Com certeza! Aqui está:", "Espero ter ajudado!"), the system SHALL automatically sanitize and remove these phrases when the cleaning toggle is active by default.
3. The system SHALL execute paste transformation in under 10ms without degrading typing responsiveness.

**Independent Test**: Copiar um trecho de resposta de IA contendo tabela e bloco de código, colar no editor com Ctrl+V e verificar se a tabela e o bloco de código são renderizados como elementos visuais ricos sem marcas cruas.

---

### P2: Localizador Rápido no Projeto Ativo (Quick Open Ctrl+P)

**User Story**: Como usuário que navega por notas e documentações, quero abrir arquivos rapidamente via teclado buscando pelo nome dentro do projeto atual, para que eu encontre notas em milissegundos sem tirar as mãos do teclado.

**Why P2**: Aumenta a velocidade de navegação sem adicionar overhead de disco ou memória.

**Acceptance Criteria**:

1. WHEN the user presses `Ctrl + P` (or `Cmd + P`), the system SHALL display a centered, floating fuzzy search dialog over the active workspace.
2. WHILE the user types a search query, the system SHALL filter candidate `.md` and `.txt` files in memory restricted to the currently active project folder within 10ms.
3. WHEN the user presses `Enter` or clicks on a candidate file, the system SHALL open the selected file in a new or existing editor tab and close the search dialog.
4. WHEN the user presses `Escape`, the system SHALL close the dialog without changing editor focus.

**Independent Test**: Pressionar Ctrl+P, digitar as primeiras letras de um arquivo do projeto ativo, teclar Enter e verificar a abertura imediata do arquivo no editor.

---

### P2: Exportação Fiel ao Tema Ativo (PDF e HTML Formatado)

**User Story**: Como redator que compartilha notas com clientes ou colegas, quero exportar o documento para PDF com a paleta do tema ativo e copiar o texto formatado para a área de transferência, para colar no Gmail ou Google Docs sem perder o estilo.

**Why P2**: Entrega acabamento profissional sem embutir conversores de arquivos pesados.

**Acceptance Criteria**:

1. WHEN the export to PDF action is triggered, the system SHALL open the native system print dialog applying `@media print` styles aligned with the active theme colors.
2. WHEN the "Copiar como HTML formatado" action is invoked, the system SHALL write the rendered document HTML to the system clipboard with MIME type `text/html`.
3. IF the user pastes the copied rich HTML into an external rich text editor, the external application SHALL receive bold, italic, headings, and tables with formatting preserved.

**Independent Test**: Executar "Copiar como HTML formatado", colar no Word ou navegador e verificar preservação das tags estruturais sem caracteres Markdown crus.

---

## Requirement Traceability

| Requirement ID | Story | Criterion ID | Status |
| :--- | :--- | :--- | :--- |
| ADV-01 | P1: Continuidade e Persistência do Terminal Multi-Projeto | AC-ADV-001 | planned |
| ADV-02 | P1: Continuidade e Persistência do Terminal Multi-Projeto | AC-ADV-002 | planned |
| ADV-03 | P1: Continuidade e Persistência do Terminal Multi-Projeto | AC-ADV-003 | planned |
| ADV-04 | P1: Continuidade e Persistência do Terminal Multi-Projeto | AC-ADV-004 | planned |
| ADV-05 | P1: Ergonomia, Seleção e Usabilidade Amigável do Terminal | AC-ADV-005 | planned |
| ADV-06 | P1: Ergonomia, Seleção e Usabilidade Amigável do Terminal | AC-ADV-006 | planned |
| ADV-07 | P1: Ergonomia, Seleção e Usabilidade Amigável do Terminal | AC-ADV-007 | planned |
| ADV-08 | P1: Ergonomia, Seleção e Usabilidade Amigável do Terminal | AC-ADV-008 | planned |
| ADV-09 | P1: Colagem Inteligente de Conteúdo de IA (Smart Paste) | AC-ADV-009 | planned |
| ADV-10 | P1: Colagem Inteligente de Conteúdo de IA (Smart Paste) | AC-ADV-010 | planned |
| ADV-11 | P1: Colagem Inteligente de Conteúdo de IA (Smart Paste) | AC-ADV-011 | planned |
| ADV-12 | P2: Localizador Rápido no Projeto Ativo (Quick Open Ctrl+P) | AC-ADV-012 | planned |
| ADV-13 | P2: Localizador Rápido no Projeto Ativo (Quick Open Ctrl+P) | AC-ADV-013 | planned |
| ADV-14 | P2: Localizador Rápido no Projeto Ativo (Quick Open Ctrl+P) | AC-ADV-014 | planned |
| ADV-15 | P2: Localizador Rápido no Projeto Ativo (Quick Open Ctrl+P) | AC-ADV-015 | planned |
| ADV-16 | P2: Exportação Fiel ao Tema Ativo (PDF e HTML Formatado) | AC-ADV-016 | planned |
| ADV-17 | P2: Exportação Fiel ao Tema Ativo (PDF e HTML Formatado) | AC-ADV-017 | planned |
| ADV-18 | P2: Exportação Fiel ao Tema Ativo (PDF e HTML Formatado) | AC-ADV-018 | planned |
