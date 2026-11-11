# Feature Specification: Workspace Global Search

**Feature Name**: `workspace-global-search`
**Status**: passed
**Approved**: 2026-11-10 - user: "aprovado adicione também o ajuste no icone da barra lateral dos projetos, esta aparecendo 2 letras sem saber o nome do projeto adicone as 4 primeiras letras dentro do icone para facilitar a identificação"

## Problem Statement

Usuários que gerenciam projetos com dezenas ou centenas de anotações e documentos Markdown no Veu MD enfrentam dificuldades para localizar trechos específicos de texto espalhados entre múltiplos arquivos:
1. A ferramenta de busca atual (`Ctrl + F`) opera exclusivamente sobre o documento ativo na memória, exigindo abrir e pesquisar arquivo por arquivo manualmente.
2. O localizador rápido (`Ctrl + P`) encontra arquivos apenas pelo nome do arquivo, sendo inútil quando o usuário lembra apenas de uma palavra, frase ou conceito dentro do texto.
3. Não há uma visão consolidada de ocorrências que permita saltar diretamente para a linha e posição exatas do arquivo de destino.

## Out of Scope

- Indexação permanente de banco de dados SQLite FTS ou ElasticSearch em disco (preservando o footprint leve de ~5MB sem arquivos de índice volumosos).
- Substituição em lote simultânea em múltiplos arquivos em disco (Search & Replace global sem confirmação), por risco de corrupção acidental em larga escala.
- Busca dentro de arquivos binários compilados ou imagens.

## Assumptions & Open Questions

| Assumption / Question | Chosen default | Rationale |
| :--- | :--- | :--- |
| Qual motor utilizar para a varredura de texto? | Rust IPC recursivo com leitura em streaming por linha | Velocidade nativa (< 100ms para 1.000 arquivos) com consumo mínimo de memória. |
| Quais tipos de arquivos incluir na busca? | Arquivos de texto e Markdown (`.md`, `.txt`, `.json`, `.yaml`, `.yml`) | Foco no conteúdo textual relevante do usuário. |
| Quais pastas ignorar automaticamente? | `node_modules`, `.git`, `dist`, `target`, `.tauri`, `.specs` | Evita poluição de resultados com dependências ou artefatos de build. |
| Como acionar e navegar nos resultados? | Atalho canônico `Ctrl + Shift + F` abrindo modal/drawer dedicado | Padrão unificado com os principais editores (VS Code, Obsidian, Sublime). |

**Open questions**: none

## User Stories

### US01: Busca Textual Rápida no Workspace
1. **SEARCH-01**: When the user triggers global search with a query string, the system shall search across all text and markdown files in the active project directory excluding ignored directories.
2. **SEARCH-02**: While executing the search, the system shall stream or return matching occurrences grouped by file path with line numbers and preview snippets.

### US02: Ergonomia, Filtros e Navegação
3. **SEARCH-03**: Where search options are selected, the system shall support case-sensitive matching and whole-word filtering.
4. **SEARCH-04**: When the user clicks on a search result item, the system shall open the corresponding file in an editor tab and navigate directly to the matched document.

## Requirement Traceability

| ID | Requirement | Priority | Status |
| :--- | :--- | :--- | :--- |
| SEARCH-01 | Varredura recursiva de texto em arquivos do projeto via backend Rust | High | passed |
| SEARCH-02 | Agrupamento de ocorrências por arquivo com exibição de número de linha e trecho | High | passed |
| SEARCH-03 | Suporte a filtros de correspondência de maiúsculas/minúsculas e palavra inteira | Medium | passed |
| SEARCH-04 | Navegação com abertura imediata do arquivo selecionado na aba correspondente | High | passed |

