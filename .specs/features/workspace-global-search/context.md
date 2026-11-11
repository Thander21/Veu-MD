# Context: Workspace Global Search (Grep no Projeto)

## Objetivo
Implementar mecanismo de busca textual em alta velocidade através de todos os arquivos de texto e Markdown do projeto ativo (`Ctrl + Shift + F`), fornecendo localização instantânea de termos, agrupamento por arquivo, pré-visualização de linhas e navegação com salto direto ao ponto de correspondência no editor.

## Áreas Cinzentas e Decisões de Design

1. **Onde a busca é executada (Rust vs JS)?**
   - **Decisão**: Executada nativamente em Rust via comando IPC seguro `search_in_files`.
   - **Razão**: Rust garante I/O concorrente de baixa latência e leitura direta em disco com custo de memória desprezível (< 2 MB), sem precisar carregar centenas de arquivos na memória JavaScript do WebView2.

2. **Quais arquivos e pastas são pesquisados?**
   - **Decisão**: Busca restrita a arquivos de texto (`.md`, `.markdown`, `.txt`, `.json`, `.yaml`, `.yml`).
   - **Exclusão de Ruído**: Pastas de dependências e compilações (`node_modules`, `.git`, `dist`, `target`, `.tauri`, `.specs`) são ignoradas automaticamente, além de arquivos binários (imagens, executáveis).

3. **Ergonomia Visual e Atalhos**:
   - **Decisão**: Painel dedicado ou modal responsivo acionado por atalho canônico `Ctrl + Shift + F`.
   - **Resultados**: Apresenta contagem total de ocorrências, lista colapsável por arquivo, número de linha e fragmento da linha com o termo destacado.
   - **Ação ao Clicar**: Abre o arquivo correspondente em uma aba (ou ativa a aba existente) e foca a visualização.

4. **Filtros e Modos de Pesquisa**:
   - Diferenciar maiúsculas/minúsculas (*Match Case*).
   - Palavra inteira (*Match Whole Word*).
   - Limite de segurança de resultados (ex: até 500 ocorrências) para evitar travamentos de UI em pesquisas genéricas.

