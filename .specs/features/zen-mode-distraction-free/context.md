# Feature Context: Zen Mode / Distraction-Free (`zen-mode-distraction-free`)

## Problem
Escritores, jornalistas e desenvolvedores em sessões profundas de escrita (deep work) frequentemente se distraem com múltiplos estímulos visuais na tela:
1. Árvore de arquivos lateral, avatares de múltiplos projetos e abas de documentos abertos competem por atenção visual.
2. Barras de ferramentas superiores e status bar no rodapé poluem o campo de visão em telas grandes ou laptops.
3. Não há uma alternância rápida de foco que isole o texto central com largura de leitura ideal.

## Goals
1. Modo Zen ativável por atalho de teclado global (`F11` ou `Ctrl + Shift + Enter`) e botão dedicado na `TopBar`.
2. Ocultação total e fluida de todas as barras circundantes (Sidebar, ProjectSidebar, TabBar, TopBar, StatusBar, Terminal).
3. Palco central de escrita imersivo com alinhamento tipográfico equilibrado.
4. Restauração instantânea ao pressionar `Escape`, `F11` ou ao clicar na pílula flutuante de saída.

## Invariants & Guardrails
- **Invariante WYSIWYG & Auto-Save**: Durante o Modo Zen, a digitação continua gravando normalmente via auto-save no disco e os atalhos de formatação permanecem 100% funcionais.
- **Transição CSS sem Re-renderização Destrutiva**: Painéis são ocultados via CSS (`display: none` ou transição de opacidade/visibilidade), preservando estados de abas e terminal em background.

