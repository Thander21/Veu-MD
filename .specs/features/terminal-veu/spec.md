# Feature Spec: Terminal Veu — Terminal Sequencial, Interativo e de Leitura Fluida

**Approved**: 2026-11-07 - user: "1 modo chat padrao sem comutr para modo classico e o segundo principio do app... no terminal tem que ser dentro da janela mesmo para o texto ficar interativo e seguencial... vamos chamar te terminal veu"

## Problem Statement

O terminal integrado anterior do **Veu MD** utilizava o componente `xterm.js` com uma emulação rígida de terminal clássico dos anos 70/80. Isso impõe barreiras severas à ergonomia e aos princípios de design do produto:
1. **Dificuldade de Edição e Interação**: O usuário não consegue clicar livremente com o mouse no meio de um comando para reposicionar o cursor, selecionar trechos de texto com facilidade ou editar palavras antes de submeter a linha de comando.
2. **Poluição Visual de Códigos ANSI**: O retorno dos comandos mistura sequências de controle de cursor e caracteres brutos, quebrando a harmonia tipográfica e a legibilidade do editor.
3. **Desacoplamento e Concorrência**: Ter uma caixa de digitação no rodapé enquanto comandos de longa duração rodam na tela cria confusão sobre qual comando está ativo, além de incentivar digitação concorrente que causa erros no terminal.

O **Terminal Veu** redefine a experiência do terminal integrado, adotando um fluxo sequencial na janela, onde cada comando e sua resposta fluem como blocos legíveis de texto formatado, e o prompt interativo é incorporado de forma natural ao final do fluxo quando o sistema está pronto para uma nova instrução.

## Out of Scope

- Emulação avançada de programas gráficos em modo texto baseados em ncurses/TUI com tela cheia (como `vim`, `nano`, `htop`).
- Assistente conversacional de inteligência artificial generativa (escopo reservado ao futuro painel de IA lateral direito).
- Reimplementação do backend Rust `portable-pty`, que permanece intacto como provedor de processos nativos e streaming assíncrono.
- Configuração de atalhos de terminal móvel (Android).

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| :--- | :--- | :--- | :--- |
| Interface Única | 100% Terminal Veu sem modo clássico xterm | Alinhado aos princípios inegociáveis de leveza, facilidade de uso e modernidade do Veu MD. | yes (user approved) |
| Posicionamento do Prompt | Sequencial no final do fluxo ativo | O que é digitado corre junto com a leitura natural da janela, mantendo coerência contextual. | yes (user approved) |
| Gestão de Execução | Bloqueio de novo prompt durante execução | Previne digitação concorrente, confusão operacional e comandos acidentais durante processos ativos. | yes (user approved) |
| Interrupção de Processos | Botão evidente "Parar" (`Ctrl+C`) | Permite encerrar scripts e comandos contínuos sem exigir atalhos de teclado obscuros. | yes (user approved) |
| Formatação e Tipografia | Parser ANSI leve em TypeScript + cores semânticas | Converte códigos de cor ANSI em estilos elegantes integrados ao tema ativo com custo computacional nulo. | yes (user approved) |

**Open questions:** none - all resolved or logged above (required before the spec is confirmed).

## User Stories

### P1: Interface Sequencial e Leitura Editorial no Terminal Veu

**User Story**: Como desenvolvedor ou redator executando comandos locais, quero visualizar o histórico de comandos e suas saídas como um fluxo contínuo e limpo de texto formatado na janela, para poder ler os resultados confortavelmente com a tipografia do meu tema.

**Why P1**: Elimina a barreira visual dos terminais rígidos e alinha a experiência de terminal à filosofia de clareza do Veu MD.

**Acceptance Criteria**:

1. WHEN the user opens the terminal panel, the system SHALL render the "Terminal Veu" sequential timeline presenting previous commands and formatted output blocks without rendering raw xterm.js character matrices.
2. WHEN command output arrives from the backend, the system SHALL parse ANSI color codes into semantic styled spans matching the active theme while stripping cursor repositioning control characters.
3. WHEN viewing any executed command block in the timeline, the system SHALL display quick actions to copy the output text to the clipboard and insert the output directly into the active ProseMirror document.

**Independent Test**: Abrir o Terminal Veu, executar `dir` ou `git status` e verificar a saída formatada em texto limpo com botões de copiar e inserir no editor.

---

### P1: Prompt de Entrada Editável e Sequencial ao Final do Fluxo

**User Story**: Como usuário digitando comandos, quero uma linha de entrada interativa posicionada ao final do texto onde posso clicar com o mouse para mover o cursor, selecionar palavras e navegar pelo histórico de comandos.

**Why P1**: Permite edição natural e sem atritos de comandos antes do envio, corrigindo a maior frustração do xterm tradicional.

**Acceptance Criteria**:

1. WHEN the terminal session is idle and ready for a command, the system SHALL display an editable text input prompt positioned immediately after the latest output at the end of the sequential flow.
2. WHEN the user clicks anywhere inside the editable input prompt, the system SHALL position the text cursor at the clicked location and support native mouse text selection.
3. WHEN the user presses the `Enter` key with a non-empty command, the system SHALL submit the command string to the backend PTY session, add the command to the session history, and scroll the view to the new block.
4. WHEN the user presses the `ArrowUp` or `ArrowDown` keys in the prompt, the system SHALL navigate backward and forward through previous command inputs.

**Independent Test**: Clicar com o mouse no meio de uma frase digitada no prompt, verificar o reposicionamento livre do cursor, pressionar `Enter` e verificar o registro do comando no histórico com navegação via setas.

---

### P1: Controle de Concorrência e Ação de Parar Processo

**User Story**: Como usuário executando um comando de longa duração (ex: compilação ou script contínuo), quero ver a saída em tempo real sem uma caixa de digitação concorrente aberta e quero poder interromper a execução com um clique no botão "Parar".

**Why P1**: Evita estresse e digitação concorrente indevida enquanto um comando ainda está rodando.

**Acceptance Criteria**:

1. WHILE a command is executing in the active terminal session, the system SHALL hide or disable the new command input prompt to prevent concurrent input entry.
2. WHILE a command is executing, the system SHALL display a streaming execution status indicator alongside a visible Stop button (`Ctrl+C`).
3. WHEN the user clicks the Stop button while a command is executing, the system SHALL send the interrupt signal (`\x03`) to the backend PTY session to terminate execution.
4. WHEN the command process finishes or is stopped, the system SHALL re-enable and autofocus the sequential input prompt for the next command.

**Independent Test**: Executar um comando contínuo (ex: `ping -t 127.0.0.1` ou script de loop), verificar que o prompt de nova digitação fica ocultado, clicar em Parar e verificar a reativação imediata do prompt.

---

### P1: Isolamento de Sessões Multi-Projeto e Limpeza de Histórico

**User Story**: Como usuário alternando entre múltiplos projetos abertos, quero que cada projeto mantenha seu próprio histórico e processo de Terminal Veu isolados na memória, com opção de limpar a visualização sem fechar o processo.

**Why P1**: Garante continuidade do trabalho sem perda de contexto ao transitar entre pastas e workspaces.

**Acceptance Criteria**:

1. WHEN the user switches between open project tabs, the system SHALL preserve the sequential command blocks, input buffer state, and active process of each project without terminating background PTY sessions.
2. WHEN the user clicks the Clear action (`Eraser`) on the terminal header, the system SHALL clear the visual timeline of the active project without closing the backend PTY session.

**Independent Test**: Executar um comando no Projeto A, alternar para o Projeto B, executar outro comando, alternar de volta ao Projeto A e constatar a integridade do histórico do Projeto A.

---

## Requirement Traceability

| Requirement ID | User Story | Priority | Status |
| :--- | :--- | :--- | :--- |
| TERM-01 | Interface Sequencial e Leitura Editorial no Terminal Veu | P1 | Satisfied |
| TERM-02 | Parser Ultraleve de ANSI e Tipografia Limpa | P1 | Satisfied |
| TERM-03 | Ações de Copiar e Inserir no Editor por Bloco | P1 | Satisfied |
| TERM-04 | Prompt de Entrada Editável e Sequencial ao Final do Fluxo | P1 | Satisfied |
| TERM-05 | Navegação de Histórico com Setas Cima/Baixo | P1 | Satisfied |
| TERM-06 | Controle de Concorrência e Bloqueio Durante Execução | P1 | Satisfied |
| TERM-07 | Botão de Interrupção e Cancelamento (Ctrl+C / Parar) | P1 | Satisfied |
| TERM-08 | Preservação de Sessões e Buffers Multi-Projeto | P1 | Satisfied |
| TERM-09 | Limpeza do Histórico Visual Mantendo Sessão | P1 | Satisfied |
