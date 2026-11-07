# Feature Spec: Terminal Veu Lab — Terminal Editorial Exclusivo, Inicialização Imediata e Parser Limpo

**Approved**: 2026-11-07 - user: "sim"

## Problem Statement

Na implementação anterior do Terminal Veu (Lab), a experiência do usuário encontrava três obstáculos críticos:
1. **Falha de Inicialização (Cold Start Vazio)**: Ao abrir o painel do terminal, o usuário via uma tela em branco sem nenhum terminal ativo, pois o buffer de inicialização do shell hospedeiro (PowerShell/Bash) era descartado quando não havia blocos pré-existentes, além do conflito de ciclo de vida com o motor xterm antigo.
2. **Saída Poluída e Textos Sobrepostos**: O ConPTY do Windows envia sequências de controle de cursor brutas (`\r`, `\x1b[K`, reposicionamento de cursor), que eram concatenadas de forma ingênua como texto simples, gerando repetições de comandos, quebras de linhas confusas e legibilidade inferior a qualquer terminal comum.
3. **Bloqueio Irreversível do Prompt de Digitação**: O reconhecimento de conclusão do comando dependia exclusivamente de um padrão regex rígido de prompt. Qualquer comando cuja saída não casasse perfeitamente com a expressão regular permanecia no estado `"Rodando..."` para sempre, ocultando o campo de entrada e impedindo a execução de novos comandos pelo usuário.

Esta especificação define o refinamento do **Terminal Veu Lab** como motor único e oficial, garantindo abertura instantânea contextualizada no projeto ativo, parser semântico com tratamento limpo de `\r` e sequências ANSI, e ciclo de vida de comandos não-bloqueante.

## Out of Scope

- Emulação de aplicações gráficas completas de console ncurses/TUI com tela cheia (ex: `vim`, `nano`, `htop`).
- Terminal móvel touch para Android (foco exclusivo no ambiente Desktop Tauri v2).
- Substituição do backend Rust `portable-pty`, que continua como base nativa e segura para comunicação PTY.

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| :--- | :--- | :--- | :--- |
| Motor Exclusivo | 100% Terminal Veu Lab no painel inferior | Elimina a duplicidade confusa de motores e concentra a experiência editorial do app. | yes (user requested) |
| Inicialização Imediata | Spawn automático na pasta do projeto ativo | Garante que ao abrir o terminal, a sessão e o prompt já estejam disponíveis e utilizáveis. | yes (user requested) |
| Normalização de Linhas | Tratamento de retornos de carro (`\r`) e ANSI | Limpa artefatos de cursor do Windows ConPTY para leitura agradável e sem ecos quebrados. | yes (user requested) |
| Recuperação do Prompt | Debounce de silêncio + Fallback de conclusão manual | Impede que comandos presos tranquem a caixa de digitação permanentemente. | yes (user requested) |

**Open questions:** none - all resolved or logged above (required before the spec is confirmed).

## User Stories

### P1: Inicialização Instantânea do Terminal Veu Lab no Projeto Ativo

**User Story**: Como usuário abrindo o painel do terminal, quero que a sessão do Terminal Veu inicie imediatamente na pasta do meu projeto ativo, com um cabeçalho informativo e o cursor pronto no prompt para digitação.

**Why P1**: Resolve o problema de "quando abre não abre nenhum terminal", fornecendo feedback imediato de prontidão.

**Acceptance Criteria**:

1. WHEN the user opens the terminal panel, the system SHALL immediately initialize the Terminal Veu Lab session contextualized in the active project folder.
2. WHEN the terminal session starts, the system SHALL display the active folder path and focus the input prompt cursor without presenting an empty black or blank area.
3. WHEN the user switches projects, the system SHALL preserve the background session and output history of the Terminal Veu for each project independently.

**Independent Test**: Abrir o painel do terminal em um projeto novo e constatar a renderização imediata do cabeçalho da pasta e o prompt focado pronto para digitação.

---

### P1: Parser de Saída Limpo sem Poluição de Cursor do Windows ConPTY

**User Story**: Como usuário visualizando a resposta de comandos como `git`, `npm` ou `cargo`, quero ler uma saída textual limpa, formatada com as cores do meu tema, sem repetições de linhas, retornos de carro duplicados ou códigos ANSI quebrados.

**Why P1**: Corrige a sensação de "texto confuso e pior que ler no terminal", entregando a tipografia editorial prometida pelo Veu MD.

**Acceptance Criteria**:

1. WHEN output chunks arrive from the Windows ConPTY backend, the system SHALL process carriage returns (`\r`) and erase sequences (`\x1b[K`) so that rewritten lines do not produce duplicated stacked text.
2. WHEN ANSI styling codes are present in the output, the system SHALL convert standard ANSI color codes into semantic CSS classes matching the active theme palette.
3. WHEN a command block finishes, the system SHALL display action buttons to copy the cleaned plain-text output and insert the formatted output into the active Markdown editor.

**Independent Test**: Executar `dir` e `git status`, verificando que a listagem de arquivos é renderizada em linhas limpas e ordenadas sem artefatos de controle de cursor.

---

### P1: Ciclo de Vida do Comando e Recuperação Confiável do Prompt

**User Story**: Como usuário executando comandos no terminal, quero que a conclusão de cada comando seja detectada com precisão, com indicador de status em tempo real, capacidade de interromper via `Ctrl+C` ou botão Parar, e garantia de que o prompt de nova digitação retorne sem travar.

**Why P1**: Elimina o travamento onde o terminal ficava eternamente em "Rodando" e não permitia novas ações.

**Acceptance Criteria**:

1. WHEN the user presses Enter on a non-empty command, the system SHALL record the command block in the sequential stream, display an active execution indicator, and stream output in real time.
2. WHILE a command is executing, the system SHALL offer a visible Stop button (`Ctrl+C`) that immediately sends the interrupt signal (`\x03`) to the backend PTY session.
3. WHEN the command completes its output stream or is interrupted by the user, the system SHALL mark the command block status as completed or interrupted and immediately restore and autofocus the sequential input prompt for the next instruction.
4. IF a command process stays silent after returning prompt markers, the system SHALL finalize the block and prevent the input textarea from being permanently locked.

**Independent Test**: Executar um comando rápido (`echo ola`) e verificar que o prompt é liberado em menos de 500ms; executar um comando contínuo (`ping -t 127.0.0.1`), clicar em Parar e verificar a liberação instantânea do campo de entrada.

---

## Requirement Traceability

| Requirement ID | User Story | Priority | Status |
| :--- | :--- | :--- | :--- |
| VEULAB-01 | Inicialização Instantânea do Terminal Veu Lab no Projeto Ativo | P1 | Pending |
| VEULAB-02 | Foco Automático e Cabeçalho Informativo na Abertura | P1 | Pending |
| VEULAB-03 | Preservação de Sessões em Segundo Plano Multi-Projeto | P1 | Pending |
| VEULAB-04 | Normalização de Retornos de Carro (`\r`) do ConPTY | P1 | Pending |
| VEULAB-05 | Parser Semântico de Cores ANSI Integrado ao Tema | P1 | Pending |
| VEULAB-06 | Ações de Copiar e Inserir no Editor por Bloco | P1 | Pending |
| VEULAB-07 | Streaming em Tempo Real com Indicador de Execução | P1 | Pending |
| VEULAB-08 | Interrupção Imediata via Botão Parar e Atalho Ctrl+C | P1 | Pending |
| VEULAB-09 | Recuperação Confiável do Prompt sem Travamento | P1 | Pending |

