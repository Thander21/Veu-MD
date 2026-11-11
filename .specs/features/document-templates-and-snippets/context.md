# Context: Document Templates & Snippets

## Objetivo
Implementar sistema nativo de modelos de documentos (Templates & Snippets) no Veu MD, permitindo ao usuário criar notas estruturadas com um clique a partir de modelos predefinidos de alta qualidade (Ata de Reunião, Artigo de Blog, PRD / Especificação, Diário de Bordo) ou modelos personalizados armazenados na pasta `.templates/` do projeto ativo.

## Áreas Cinzentas e Decisões de Design

1. **Onde os templates são armazenados?**
   - **Templates Embutidos (Zero-Disk)**: Conjunto canônico embutido em TypeScript puro com metadados e frontmatter estruturado.
   - **Templates do Usuário**: Se existir a pasta `.templates/` na raiz do projeto ativo, arquivos `.md` contidos nela são detectados e exibidos como opções customizadas.

2. **Como preencher variáveis dinâmicas?**
   - **Placeholders Suportados**: `{{date}}` (data ISO YYYY-MM-DD), `{{time}}` (HH:MM), `{{title}}` (título escolhido), `{{project}}` (nome do projeto). Substituídos de forma determinística no momento da criação.

3. **Ergonomia e Ponto de Acesso**:
   - **Botão no Explorer**: Opção "Novo a partir de Modelo..." no menu de criação de arquivos ou botão com ícone de varinha/estampa (`Sparkles` / `FileSpreadsheet`).
   - **Modal de Escolha**: `TemplateModal.svelte` com preview do conteúdo, campo de nome do arquivo sugerido e botão de criação imediata.

