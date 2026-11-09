# Feature Specification: YAML Frontmatter Handling

**Feature Name**: `yaml-frontmatter-handling`
**Status**: pending

## Problem Statement

Arquivos Markdown com metadados YAML no início delimitados por `---` (ex: Jekyll, Hugo, Astro, Obsidian e cabeçalhos de PRD) são frequentemente corrompidos ou degradados ao serem abertos em editores WYSIWYG:
1. O parser do ProseMirror interpreta os delimitadores `---` como linhas horizontais (`hr`) ou texto comum desformatado, poluindo o corpo do texto e violando o princípio de leitura limpa estilo Word.
2. A serialização ao salvar o arquivo em disco pode truncar, reformatar ou descartar os metadados brutos do frontmatter original.
3. Não há mecanismo visual discreto ou colapsável para que o usuário visualize ou consulte os metadados do documento sem misturá-los ao fluxo de parágrafos.

## Out of Scope

- Validação estrita de schemas JSON/YAML específicos por framework estático.
- Construção de formulários gráficos dinâmicos para edição de chaves aninhadas complexas de YAML.
- Suporte a formatos alternativos de metadados como TOML (`+++`) ou JSON frontmatter no escopo imediato.

## Assumptions & Open Questions

| Assumption / Question | Chosen default | Rationale |
| :--- | :--- | :--- |
| Como reter o bloco de frontmatter sem expor no ProseMirror? | Extrair o bloco de frontmatter antes do parser e armazená-lo no estado da aba | Isola o texto bruto do grafo de nós do ProseMirror, impedindo que `---` vire `hr`. |
| Como renderizar o frontmatter na interface sem poluir o texto? | Barra de metadados discreta e colapsável no topo do estágio de edição | Permite inspecionar títulos e tags sem violar a estética editorial WYSIWYG limpa. |
| Como garantir persistência fiel ao salvar no disco? | Reanexar o bloco YAML delimitado intacto antes da serialização GFM | Garante que editores externos leiam o mesmo arquivo Markdown com fidelidade total de tags. |
| O que acontece se o documento não possuir frontmatter? | O ciclo de edição e salvamento segue o fluxo padrão sem blocos extras | Evita adicionar delimitadores vazios em documentos comuns `.md` e `.txt`. |

**Open questions**: none

## User Stories

### US01: Isolamento e Retenção do Frontmatter YAML
1. **YAML-01**: When a markdown document containing YAML frontmatter bounded by triple-dash delimiters (`---`) is loaded, the system shall isolate the frontmatter block from the editable ProseMirror body.
2. **YAML-02**: While editing a document with detected frontmatter, the system shall display a collapsible metadata indicator at the top of the editor stage without exposing raw formatting tokens in the body text.

### US02: Fidelidade de Persistência no Disco
3. **YAML-03**: When saving a modified document that contains frontmatter to disk, the system shall prepend the intact YAML frontmatter block before the serialized markdown content.
4. **YAML-04**: Where a markdown document does not contain YAML frontmatter, the system shall save the document directly without introducing empty frontmatter delimiters.

## Requirement Traceability

| ID | Requirement | Priority | Status |
| :--- | :--- | :--- | :--- |
| YAML-01 | Isolamento e extração de bloco YAML frontmatter no carregamento | High | pending |
| YAML-02 | Visualizador discreto e colapsável de metadados no topo do editor | Medium | pending |
| YAML-03 | Persistência e reanexação fiel do bloco YAML ao salvar no disco | High | pending |
| YAML-04 | Preservação do fluxo padrão em arquivos sem frontmatter | High | pending |
