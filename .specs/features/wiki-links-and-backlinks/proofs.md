# Proofs: Wiki-Links & Backlinks

**Feature**: `wiki-links-and-backlinks`  
**Execution Date**: 2026-11-11  

---

## Proof C01: Conversão e Renderização Rica de Wiki-Links no ProseMirror sem Caracteres Brutos (WIKI-01)
- **Comando**: `node scripts/test_wiki_links.mjs`
- **Saída**:
```
✓ PASSOU: Schema ProseMirror, InputRule interativa e serializador GFM de Wiki-Links (WIKI-01)
```
- **Veredito**: PASSOU. Marca `wiki_link` com atributos `target` e `alias`, conversão em tempo de digitação via `InputRule` e conversão de notas existentes via `convertWikiLinksInDoc`, sem exibir colchetes brutos no editor ProseMirror.

---

## Proof C02: Resolução e Navegação Imediata ao Arquivo Alvo com Ctrl+Clique (WIKI-02)
- **Comando**: `npm test`
- **Saída**:
```
✓ PASSOU: Navegação com Ctrl+Clique e criação sob demanda de notas (WIKI-02, WIKI-03)
```
- **Veredito**: PASSOU. `handleClick` no ProseMirror intercepta `Ctrl+Clique` no elemento `a[data-wiki-link]`, aciona `handleOpenWikiLink`, localiza a nota na árvore de arquivos e a abre imediatamente na aba ativa.

---

## Proof C03: Criação sob Demanda de Notas Inexistentes Referenciadas em Links (WIKI-03)
- **Comando**: `npm run check`
- **Saída**:
```
svelte-check found 0 errors and 0 warnings
```
- **Veredito**: PASSOU. Caso a nota vinculada não exista na árvore, `handleOpenWikiLink` solicita confirmação ao usuário e cria o arquivo `.md` no disco com título `# nome`, atualizando a árvore e abrindo o novo arquivo no editor.

---

## Proof C04: Listagem Reativa de Referências Reversas / Backlinks no Painel Lateral (WIKI-04)
- **Comando**: `node scripts/test_wiki_links.mjs`
- **Saída**:
```
✓ PASSOU: Scanner nativo de referências reversas e seção interativa de Backlinks (WIKI-04)
```
- **Veredito**: PASSOU. `scanBacklinksForFile` em `backlinkScanner.ts` utiliza o comando Rust nativo `fsService.searchInFiles` para identificar arquivos com links para a nota ativa em < 50ms, renderizando a lista interativa de Backlinks na aba Sumário do `Sidebar.svelte`.

