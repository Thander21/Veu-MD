# Context & Gray Areas Analysis: YAML Frontmatter Handling

Este documento registra a análise de contexto e resolução prévia de áreas cinzentas (*gray areas*) para a feature **`yaml-frontmatter-handling`**, em conformidade com as diretrizes de Spec-Driven Development (TLC).

---

## 1. Contexto do Problema & Invariantes de UX

O **Veu MD** é um editor WYSIWYG de Markdown puro orientado à experiência limpa de leitura e escrita.
Em editores Markdown baseados em ContentEditable ou ProseMirror, o frontmatter YAML delimitado por `---` no início de arquivos de geradores estáticos (Jekyll, Astro, Hugo, Next.js) e ferramentas de notas (Obsidian, Foam) causa degradações severas:
1. O parser do ProseMirror consome os delimitadores `---` e os converte em nós `<hr>` (linha horizontal) ou parágrafos quebrados, expondo chaves como `title: Meu Post` diretamente no texto do documento.
2. Na serialização para o disco, o editor regrava o conteúdo sem reconstituir a integridade do frontmatter original, gerando perda ou corrupção de metadados externos.

---

## 2. Resolução de Áreas Cinzentas (*Gray Areas*)

### G1: Como isolar o frontmatter sem quebrar a interoperabilidade do ProseMirror?
* **Decisão**: A extração do frontmatter ocorre no momento do carregamento (`openFile`), antes do texto ser entregue ao ProseMirror.
* **Mecanismo**: Um módulo utilitário desacoplado `src/lib/utils/frontmatter.ts` isola o bloco delimitado por `^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)`. O corpo limpo é enviado ao ProseMirror e os metadados brutos são armazenados no campo `frontmatter` de `TabItem`.
* **Benefício**: Zero poluição no documento WYSIWYG, zero nós estranhos na árvore ProseMirror.

### G2: Como garantir fidelidade byte-a-byte na persistência em disco?
* **Decisão**: Na rotina de salvamento (`saveTab`), o bloco `frontmatter` original retido na aba é reanexado como cabeçalho delimitado antes de gravar no sistema de arquivos.
* **Mecanismo**: `attachFrontmatter(content, tab.frontmatter)` preserva a sintaxe e quebras de linha exatas.
* **Caso de Borda**: Se o arquivo não possuía frontmatter (`tab.frontmatter === null`), nenhum delimitador ou quebra vazia é introduzida.

### G3: Como renderizar metadados para consulta sem poluir o corpo do documento?
* **Decisão**: Componente `FrontmatterBanner.svelte` discreto, colapsável e temático, posicionado no topo de `.editor-pane` imediatamente acima do editor.
* **Aparência**: Apresenta badge visual "Metadados YAML", resumo com pílulas para chaves comuns (`title`, `tags`, `date`) e botão de expansão para visualizar o bloco YAML bruto.

### G4: Overhead de pacotes externos e princípio Anti-Bloat
* **Decisão**: Zero dependências de pacotes externos (proibido adicionar `js-yaml`, `yaml` ou bibliotecas volumosas ao `package.json`).
* **Mecanismo**: A extração de delimitadores e parsing para resumo visual utilizam Expressões Regulares nativas e seguras em TypeScript puro.

---

## 3. Decisões Arquiteturais Relacionadas (ADRs)

* **AD-026**: Extração desacoplada de Frontmatter YAML no ciclo de carregamento e reconstituição fiel na persistência em disco.

