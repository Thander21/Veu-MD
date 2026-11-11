# Feature Specification: Document Templates & Snippets

**Feature Name**: `document-templates-and-snippets`
**Status**: complete
**Approved**: 2026-11-11 - user: "aprovado"

## Problem Statement

Usuários que iniciam notas frequentes (atas de reunião, relatórios técnicos, diários ou postagens de blog) enfrentam atrito ao começarem repetidamente a partir de um documento em branco:

1. Requer digitação manual repetitiva de estruturas de títulos, listas e frontmatter YAML em cada novo documento.
2. Inconsistência na padronização de anotações em equipes ou bases de conhecimento.
3. Ausência de preenchimento automático de metadados como datas correntes e identificadores de projeto.

## Out of Scope

- Motores de template complexos baseados em sintaxe Jinja2/Liquid com laços condicionais avançados.
- Download de templates externos de repositórios remotos sem intervenção do usuário.
- Edição de snippets inline por digitação de prefixo estilo IDE (tab-trigger snippets).

## Assumptions & Open Questions

| Assumption / Question               | Chosen default                                                                | Rationale                                                            |
| :---------------------------------- | :---------------------------------------------------------------------------- | :------------------------------------------------------------------- |
| Quais templates embutir por padrão? | Ata de Reunião, Artigo de Blog, Especificação Técnica / PRD e Diário de Bordo | Cobrem mais de 90% dos casos de uso de escrita em Markdown.          |
| Como suportar templates do usuário? | Leitura automática da pasta `.templates/` no projeto                          | Permite versionar templates no próprio repositório sem configuração. |
| Como preencher variáveis?           | Substituição de strings `{{date}}`, `{{time}}`, `{{title}}`, `{{project}}`    | Leve, instantâneo e livre de dependências pesadas.                   |

**Open questions**: none

## User Stories

### US01: Catálogo e Seleção de Modelos

1. **TMPL-01**: When the user requests creating a document from template, the system shall present a template selection modal displaying built-in and workspace `.templates/` models with live preview.
2. **TMPL-02**: While browsing templates, the system shall interpolate dynamic placeholders (`{{date}}`, `{{time}}`, `{{title}}`, `{{project}}`) with current contextual values.

### US02: Criação e Abertura Imediata

3. **TMPL-03**: When the user confirms template creation with a chosen file name, the system shall generate the file on disk in the project workspace and refresh the file tree.
4. **TMPL-04**: When the new template-based file is created, the system shall open it immediately in an active editor tab with focus.

## Requirement Traceability

| ID      | Requirement                                                                       | Priority | Status  |
| :------ | :-------------------------------------------------------------------------------- | :------- | :------ |
| TMPL-01 | Modal de seleção de templates com catálogo embutido e suporte a pasta .templates/ | High     | pending |
| TMPL-02 | Interpolação determinística de variáveis dinâmicas de data, hora e título         | High     | pending |
| TMPL-03 | Criação física do arquivo no disco com metadados e atualização da árvore          | High     | pending |
| TMPL-04 | Abertura imediata do novo documento na aba ativa do editor ProseMirror            | High     | pending |
