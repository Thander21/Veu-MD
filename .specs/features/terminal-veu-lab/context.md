# Context & Product Decisions: Terminal Veu Lab (Refinamento & Leitura Fluida)

**Feature**: `terminal-veu-lab`  
**Date**: 2026-11-07  
**Approved by User**: Sim (diretrizes fornecidas na solicitação: "melhor so o veu lab para tentarmo usar em test quando abre nao abre nenhum terminal e o uso esta confuso...")

---

## Gray Area Decisions

### Decision 1: Ativação Exclusiva do Terminal Veu Lab
- **Contexto**: Anteriormente havia uma alternância dupla `[xterm] | [Veu (Lab)]` no topo do painel que gerava conflitos de ciclo de vida e concorrência de PTYs.
- **Escolha**: Terminal Veu Lab passa a ser o motor de terminal exclusivo e direto no painel inferior.
- **Fundamento**: Foco total na experiência de teste editorial do Veu MD, sem duplicidades e sem ruído de alternância.

### Decision 2: Resolução do Cold Start ("Não Abre")
- **Contexto**: Ao abrir o terminal, a sessão ficava vazia sem retorno visível porque o chunk de inicialização do shell era descartado caso a lista de blocos estivesse vazia.
- **Escolha**: Ao abrir, o terminal dispara imediatamente a inicialização no diretório do projeto ativo (`currentFolderPath`), renderiza o banner de boas-vindas do ambiente e posiciona o cursor no prompt interativo `›` pronto para digitação imediata.

### Decision 3: Limpeza de Buffer do ConPTY e Normalização de Linhas
- **Contexto**: No Windows, o PTY envia retornos de carro (`\r`), comandos de cursor ANSI e caracteres de sobrescrita que poluíam a visualização dos blocos e tornavam o texto pior que o terminal original.
- **Escolha**: Normalização de retorno de carro e quebras de linha no parser, removendo artefatos de cursor ConPTY (`\r`, `\x1b[K`) e garantindo que cada linha seja legível, com suporte a cores semânticas integradas ao tema ativo.

### Decision 4: Resolução de Travamento de Prompt e Indicadores Claros de Status
- **Contexto**: A detecção de fim de comando dependia de um regex frágil de prompt. Comandos como `git status`, `npm run build` ou `cargo` podiam não bater com o regex, mantendo o bloco em `"Rodando..."` indefinidamente e escondendo o campo de digitação.
- **Escolha**:
  1. Aprimoramento da detecção semântica de prompt com debounce de estabilidade de buffer.
  2. Adição de botão de escape/conclusão manual e atalho `Ctrl+C` com resposta visual imediata no bloco ativo.
  3. Reativação automática do prompt interativo para que o usuário nunca fique bloqueado sem conseguir digitar o próximo comando.

