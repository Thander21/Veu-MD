# Context: Split View Editor (Edição Lado a Lado)

## Objetivo
Implementar a funcionalidade de divisão do palco central de edição (Split View) no Veu MD, permitindo que dois documentos (ou imagens) sejam visualizados e editados simultaneamente lado a lado (vertical) ou empilhados (horizontal), com alça interativa de redimensionamento e controle de foco.

## Áreas Cinzentas e Decisões de Design

1. **Como representar o estado de divisão?**
   - **Decisão**: Estado desacoplado com `splitActive: boolean`, `splitOrientation: 'vertical' | 'horizontal'`, `secondaryTabId: string | null` e `splitRatio: number = 50`.
   - **Razão**: Mantém retrocompatibilidade total com a lista de abas `tabs` e o `activeTabId` existente, sem quebrar o ciclo de vida multi-projeto em `openProjects`.

2. **Qual é o comportamento ao abrir um arquivo no modo Split?**
   - **Decisão**: O foco do painel ativo (primário vs secundário) determina onde o novo arquivo é aberto. Além disso, uma ação direta "Abrir ao Lado" (menu de contexto do arquivo na árvore ou botão de divisão) ativa o split view e coloca o arquivo no painel secundário.

3. **Como tratar a edição concorrente do mesmo arquivo nos dois painéis?**
   - **Decisão**: Se o mesmo arquivo for selecionado em ambos os painéis, as alterações propagam-se imediatamente através do objeto `TabItem` em memória, mantendo o timer de debounce de salvamento isolado por `tabId`.

4. **Ergonomia e Atalhos**:
   - **Atalho Principal**: `Ctrl + \` (alterna a divisão lado a lado).
   - **Botão na Interface**: Ação rápida de alternância na barra superior (`TopBar`) e no cabeçalho do painel secundário.
   - **Redimensionamento**: Barra de separação suave (`.split-resizer`) com suporte a arraste e limite mínimo de 20% para cada painel.

