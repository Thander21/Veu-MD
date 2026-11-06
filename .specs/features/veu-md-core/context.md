# Context & Product Decisions: Veu MD Core (Phase 1 MVP)

## Discussed Gray Areas and Decisions

### 1. Escopo Focado no MVP Funcional & Arquitetura Correta
- **Decisão**: A fase atual foca estritamente no MVP funcional e arquitetura correta e limpa (Tauri v2 + Rust + Svelte 5 + ProseMirror puro). Recursos de detalhes e refinamentos avançados serão especificados em ciclo posterior.
- **Data**: 2026-11-06
- **Status**: aprovado pelo usuário

### 2. Auto-Save com Debounce Padrão
- **Decisão**: O salvamento automático ocorrerá com debounce padrão (1000ms após cessar a digitação), além do atalho explícito `Ctrl + S`.
- **Data**: 2026-11-06
- **Status**: aprovado pelo usuário

### 3. Criação Prévia de Arquivo e Pasta de Assets para Imagens
- **Decisão**: Todo documento é criado no sistema de arquivos antes de ser aberto e editado; o nome padrão ao criar sem especificar é `novo_arquivo.md`. Portanto, todo arquivo ativo já possui caminho em disco, permitindo salvar imagens coladas (`Ctrl + V`) de forma determinística na pasta `./assets/` relativa ao arquivo.
- **Data**: 2026-11-06
- **Status**: aprovado pelo usuário

### 4. Sincronização de Alterações Externas (File Watcher / Terminal) no MVP
- **Decisão**: No MVP, quando um arquivo aberto for alterado externamente (via terminal ou processo externo), o editor recarrega o conteúdo e emite uma notificação na barra de status; recursos avançados de visualização de diff inline (vermelho/verde) ficam planejados para a fase de refinamento.
- **Data**: 2026-11-06
- **Status**: aprovado pelo usuário

