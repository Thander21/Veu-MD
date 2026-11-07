# Context & Product Decisions: Terminal Veu (Visual & Sequencial)

**Feature**: `terminal-veu`  
**Date**: 2026-11-07  
**Approved by User**: Sim (decisões 1 e 2 alinhadas na conversa)

---

## Gray Area Decisions

### Decision 1: Substituição Definitiva vs. Comutação para Modo Clássico
- **Contexto**: O usuário foi consultado se desejava manter uma opção/botão de comutação para o modo xterm.js clássico ou substituir diretamente pelo modo amigável/chat.
- **Escolha**: Modo Chat/Veu definitivo, sem comutador para modo clássico.
- **Fundamento do Usuário**:
  1. Primeiro princípio do app: ser leve e rápido.
  2. Segundo princípio do app: ser intuitivo e fácil de usar.
  - Assim como o editor ProseMirror não exibe tags Markdown brutas (`#`, `**`), o terminal não precisa prender o usuário ao formato CRT antiquado dos anos 70 para permitir execução de comandos avançados.
- **Nomenclatura**: A funcionalidade chama-se oficialmente **"Terminal Veu"** (diferenciando-se do futuro Assistente de IA que ocupará a barra lateral direita).

### Decision 2: Posicionamento da Entrada de Texto e Gestão de Concorrência
- **Contexto**: Perguntou-se se a caixa de texto deveria ficar fixa no rodapé da janela ou dentro do fluxo sequencial.
- **Escolha**: Entrada de texto sequencial dentro da janela, ao final do texto corrido.
- **Regras Operacionais**:
  1. **Prompt Interativo ao Final**: Quando a sessão está ociosa aguardando comando (idle), a linha de digitação fica posicionada diretamente no final do histórico sequencial, permitindo clicar livremente com o mouse para mover o cursor, selecionar palavras, editar e dar `Enter`.
  2. **Bloqueio Durante Execução**: Enquanto um comando estiver rodando (ex: compilação, scripts contínuos), a caixa de nova digitação não fica aberta simultaneamente, evitando estresse, confusão e comandos sobrepostos.
  3. **Interrupção e Cancelamento**: Enquanto um comando roda, o bloco ativo exibe indicador visual de streaming/execução e um botão evidente de interrupção (**"Parar" / `Ctrl+C`**).
  4. **Retorno Formatado**: A saída é convertida em texto limpo com parser ANSI leve em TypeScript, aplicando as cores e fontes do tema ativo com leitura confortável.
