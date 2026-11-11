# Feature Context: Wiki-Links & Backlinks (`wiki-links-and-backlinks`)

## Problem
Usuários que organizam conhecimento pessoal, documentação técnica ou notas interligadas (estilo Obsidian / Zettelkasten) necessitam criar conexões entre notas de forma instantânea sem precisar copiar caminhos relativos de arquivos manualmente:
1. Digitar caminhos longos como `[Minha Nota](./pasta/minha-nota.md)` é lento e propenso a erros.
2. Não há descoberta facilitada de notas já existentes durante a digitação.
3. Não há visibilidade de quais outros documentos apontam para a nota atualmente aberta (Backlinks).

## Goals
1. Reconhecimento de marcações `[[nome-da-nota]]` com autocomplete de notas do projeto.
2. No ProseMirror WYSIWYG, exibição estilizada de Wiki-Link (sem colchetes brutos poluindo o visual).
3. Navegação com clique para abrir a nota referenciada diretamente no editor (com criação opcional se a nota ainda não existir).
4. Seção/aba de Backlinks na barra lateral identificando documentos que citam a nota ativa.

## Invariants & Guardrails
- **Invariante WYSIWYG do AGENTS.md**: Colchetes brutos `[[` e `]]` nunca devem poluir a leitura do documento; transformam-se em nós/marcas ricos do ProseMirror.
- **Fidelidade no Disco**: Na serialização para `.md`, os links são convertidos para Markdown canônico compatível com GFM (`[Título](caminho.md)`) ou preservados como `[[Link]]` padrão Obsidian com portabilidade total.
- **Zero-Bloat**: Resolução rápida de caminhos em memória com base na árvore de arquivos já carregada, sem necessidade de banco de dados SQLite ou índices pesados.

