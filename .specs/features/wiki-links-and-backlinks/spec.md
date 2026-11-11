# Feature Specification: Wiki-Links & Backlinks

**Feature Name**: `wiki-links-and-backlinks`
**Status**: complete
**Approved**: 2026-11-11 - user: "ok implemente"

## Problem Statement

Escritores e desenvolvedores que constroem bases de conhecimento conectadas enfrentam fricção ao interligar documentos:
1. Necessidade de saber caminhos relativos complexos ao criar links entre arquivos Markdown.
2. Poluição de caracteres brutos `[[` e `]]` se não tratados por um schema rico WYSIWYG.
3. Impossibilidade de visualizar conexões reversas (quais documentos citam a nota ativa atual).

## Out of Scope

- Gráficos 3D interativos de grafo de nós estilo Obsidian Graph View em WebGL.
- Transclusão ou incrustação de blocos inteiros de outras notas (`![[nota#cabecalho]]`).

## Assumptions & Open Questions

| Assumption / Question | Chosen default | Rationale |
| :--- | :--- | :--- |
| Como acionar a criação de links? | Digitação de `[[` com menu de sugestão ou conversão direta de `[[nota]]` | Padrão consagrado da indústria de escrita em Markdown. |
| Como abrir a nota linkada? | `Ctrl + Clique` ou clique direto no link do ProseMirror | Previne navegação indesejada durante edição de texto normal. |
| O que ocorre se a nota não existir? | Cria o arquivo `.md` no workspace e o abre imediatamente | Fluxo natural de pensamento contínuo sem quebra de raciocínio. |

**Open questions**: none

## User Stories

### US01: Inserção e Renderização WYSIWYG de Wiki-Links
1. **WIKI-01**: When the user enters a wiki-link using `[[note-title]]`, the system shall convert it into an interactive wiki-link mark in the ProseMirror editor without raw bracket characters.
2. **WIKI-02**: While clicking a rendered wiki-link with `Ctrl` pressed, the system shall resolve the target file path in the active project and open it in the editor.

### US02: Descoberta e Backlinks
3. **WIKI-03**: When a wiki-link points to a non-existent note, the system shall offer to create `note-title.md` and open it immediately upon user confirmation.
4. **WIKI-04**: When viewing any document, the system shall identify and display backlinks in the sidebar outline panel showing notes that reference the active file.

## Requirement Traceability

| ID | Requirement | Priority | Status |
| :--- | :--- | :--- | :--- |
| WIKI-01 | Conversão e renderização rica de wiki-links no ProseMirror sem caracteres brutos | High | pending |
| WIKI-02 | Resolução e navegação imediata ao arquivo alvo ao clicar com Ctrl | High | pending |
| WIKI-03 | Criação sob demanda de notas inexistentes referenciadas em links | Medium | pending |
| WIKI-04 | Listagem reativa de referências reversas (Backlinks) no painel lateral | Medium | pending |

