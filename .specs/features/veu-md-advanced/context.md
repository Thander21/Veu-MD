# Context & Product Decisions: Veu MD Phase 2 (Advanced & Terminal Ergonomics)

**Feature**: `veu-md-advanced`  
**Date**: 2026-11-07  
**Approved by User**: Sim (decisões 1, 2, 3, 4 e 5)

---

## Gray Area Decisions

### Decision 1: Estado do Terminal por Projeto
- **Choice**: Opção B (em memória reativa no estado do workspace).
- **Rule**: Cada projeto memoriza se o seu painel de terminal estava aberto ou recolhido e suas dimensões. Ao alternar para o Projeto B, a visibilidade do terminal reflete o estado particular do Projeto B, sem persistência pesada em disco (apenas no estado reativo em memória do `openProjects`).

### Decision 2: Encerramento de Sessão PTY ao Fechar Projeto
- **Choice**: Opção A (encerramento imediato).
- **Rule**: Ao clicar no `X` para fechar a aba de um projeto na barra lateral, todas as sessões PTY e buffers associados a esse projeto são encerrados via `kill_terminal` no backend Rust, liberando memória e processos do sistema operacional.

### Decision 3: Escopo de Busca do Quick Open (Ctrl + P)
- **Choice**: Opção B (restrito ao projeto ativo).
- **Rule**: O modal de busca rápida pesquisa apenas arquivos `.md` e `.txt` pertencentes à pasta do projeto atualmente focado em tela, garantindo relevância máxima e busca instantânea (< 5ms).

### Decision 4: Higienização de IA no Smart Paste
- **Choice**: Opção A (ativada por padrão com toggle de preferências).
- **Rule**: Ao colar textos ricos ou Markdown no editor, o sistema higieniza automaticamente saudações e encerramentos conversacionais de chatbots ("Com certeza! Aqui está:", "Espero ter ajudado!"), permitindo desativar o filtro através de uma opção acessível nas configurações/preferências.

### Decision 5: Ergonomia e Redesenho Amigável do Terminal (Rich Blocks / Stream Amigável)
- **Diagnosis**: O xterm clássico cru dificulta a seleção de texto com o cursor do mouse, sofre quebra de quebras de linha em redimensionamentos com o painel oculto e intimida o usuário comum com visual árido.
- **Solution Técnica Leve (< 1 MB RAM, Zero Overhead)**:
  1. **Seleção e Redimensionamento Confiáveis no xterm**:
     - Configurar seleção nativa de mouse e clipboard no xterm.js.
     - Proteger `fitAddon.fit()` para só disparar quando o container possuir dimensões válidas (> 0px), evitando corrupção de colunas no PTY Rust.
  2. **Modo Amigável (Blocos de Comando & Saída Formatada)**:
     - Oferecer uma visão alternativa e elegante onde comandos e respostas aparecem como "blocos" de texto selecionável comum em HTML/CSS nativo com a tipografia e cores do tema ativo.
     - Botões rápidos em cada bloco: `Copiar Saída` e `Inserir no Editor`.
     - Toggle simples na barra do terminal: `Modo Amigável (Blocos)` ⇄ `Modo Shell (Raw)`.
