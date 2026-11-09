# Veu MD — Especificação de Produto e Pesquisa de Arquitetura [ARQUIVADO]

> **Status**: **CONCLUÍDO & ARQUIVADO (2026-11-09)**
> Este documento fundacional definiu a arquitetura original, stack tecnológica e os 7 refinamentos essenciais do MVP.
> 100% dos requisitos descritos nas 3 camadas de arquitetura (Svelte 5 + ProseMirror WYSIWYG + Tauri v2 / Rust PTY) e os 7 refinamentos essenciais foram implementados, testados deterministicamente e estão em produção.

---

## 1. Visão Geral do Projeto

O **Veu MD** é um editor desktop leve, rápido e focado na leitura e escrita de documentos **Markdown (`.md`)** e **Texto Puro (`.txt`)**, unindo:

1. **Edição 100% WYSIWYG (Estilo Microsoft Word):** Você edita o documento totalmente formatado na tela **sem nunca exibir as tags (`#`, `**`, `>`, `` ` ``)**. Porém, no disco, o arquivo é salvo como `.md` puro padrão (ao abrir em qualquer outro editor, todas as tags estão lá).

2. **Barra Superior Completa + Barra Flutuante + Autocomplete (`#` e `/`):**

   * **Barra Superior Fixa:** Contém todas as formatações suportadas pelo Markdown atual (Títulos `H1`–`H6`, Negrito, Itálico, Tachado, Sublinhado, Marca-texto, Código Inline, Bloco de Código, Citações/Callouts, Listas, Checklists `- [ ]`, Tabelas, Links, Imagens e Linha Divisória). Atua sobre a linha do cursor ou sobre a seleção.

   * **Barra Flutuante:** Aparece ao selecionar um trecho de texto para formatação rápida.

   * **Sugestão Inteligente ao Digitar:** Digitar `#` abre uma lista rápida para escolher `H1`–`H6` (e some automaticamente se o usuário continuar digitando normalmente); digitar `/` abre o menu completo de blocos.

3. **Sistema de Abas (Estilo VS Code / Sublime):**

   * Permite abrir múltiplos arquivos `.md` e `.txt` em abas simultâneas, com **Auto-Save inteligente**, atalho `Ctrl + S`, indicador de alteração na aba e restauração automática da sessão (última pasta e abas abertas).

4. **Painel Lateral Direito de Cores por Tag e Temas de Leitura:**

   * Painel retrátil com **preview ao vivo** (altera as cores do documento aberto em tempo real).

   * Permite configurar **Cor do Texto + Cor de Fundo/Destaque + Estilo** para cada elemento: `H1` a `H6` (com opção de linha divisória), Negrito, Itálico, Tachado, Marca-texto, Código Inline, Links, Citações (`>`), Blocos de Código, Tabelas e Checklists.

   * Controle de layout de leitura (largura máxima da página, fonte, tamanho, espaçamento) e exportação/importação de **Temas JSON**.

5. **Aba Lateral Esquerda em Árvore (Explorer) + Sumário (Outline):**

   * Exibe toda a árvore de pastas e arquivos com **ícones diferenciados** para Pastas (aberta/fechada), `.md`, `.txt`, imagens e outros arquivos.

   * **Regra de Foco:** Mostra todos os arquivos da pasta com seus ícones na árvore, mas permite abrir para edição apenas arquivos `.md` e `.txt`.

   * **Organização Completa:** Criar arquivo/pasta, renomear, excluir, arrastar e soltar (*Drag & Drop*), busca rápida de arquivos e aba de **Sumário (Outline)** com os títulos `H1`–`H6` do documento atual.

6. **Terminal Integrado Contextual (`Ctrl + '`):**

   * Painel inferior retrátil com múltiplas abas de terminal (PowerShell, CMD, Git Bash) que já inicia posicionado no diretório da pasta aberta no Explorer (ou na subpasta clicada na árvore).

---

## 2. A Stack "Ultra-Leve & Rápida" Selecionada (Tauri v2 + Rust + ProseMirror + Svelte 5 / SolidJS)

Optamos pelo caminho de **máxima performance, menor consumo de memória e zero gordura**, priorizando arquitetura de baixo nível sem Virtual DOM:

```
flowchart TD
    subgraph Frontend["Frontend Compilado (Zero Virtual DOM: Svelte 5 / SolidJS + TypeScript)"]
        UI["Interface Reativa Cirúrgica (Abas + Árvore Lateral + Painel de Temas)"]
        Editor["Motor WYSIWYG Estilo Word: ProseMirror Core Direto\n• Zero tags visíveis na tela\n• Barra Superior, Barra Flutuante e Menus # e /\n• Serializador GFM Markdown bidirecional puro"]
        ThemeEngine["Motor de Cores por Tag: 100% Variáveis CSS Nativas via GPU\n• --v-h1-color, --v-bold-color, etc. (0ms de custo de CPU ao trocar cores)"]
        TermFrontend["Terminal UI: xterm.js WebGL"]
        
        UI --> Editor
        UI --> ThemeEngine
        UI --> TermFrontend
    end

    Frontend <-->|Tauri IPC / Channels de Alta Velocidade| RustBackend

    subgraph RustBackend["Backend Nativo em Rust (Tauri v2) — Pegada de RAM ~35MB"]
        FS["Gerenciador de Arquivos & Pastas Nativo (.md e .txt)"]
        Watcher["File Watcher em tempo real (crate 'notify')"]
        ThemesRS["Gerenciador e Persistência de Temas JSON"]
        PTY["Terminal Real PTY (crate 'portable-pty' com PowerShell / CMD / Git Bash)"]
    end
```

### Detalhamento das 3 Camadas:

1. **Camada 1A — Interface (UI): Svelte 5 (Zero Virtual DOM)**

   * Ao contrário do React (que mantém um Virtual DOM pesado na memória recriando árvores inteiras), o Svelte 5 compila diretamente para manipulação cirúrgica do DOM nativo.

   * Consumo de memória JS heap mínimo, inicialização instantânea e atualização de abas e árvores de arquivos sem engasgos.

2. **Camada 1B — Motor WYSIWYG Markdown: ProseMirror Core Direto**

   * Sem as camadas extras pesadas de wrappers de alto nível.

   * O documento em tela é 100% WYSIWYG estilo Word (sem mostrar `#` ou `**`), mas serializa de/para Markdown GFM puro no disco com fidelidade total (tabelas, checklists, blocos de código e citações).

   * Suporte direto à Barra Superior, Barra Flutuante e sugestões inteligentes ao digitar `#` ou `/`.

3. **Camada 2 — Motor de Cores por Tag e Temas: Variáveis CSS GPU-Accelerated + Temas JSON Rust**

   * O editor atribui classes semânticas fixas (`.v-h1`, `.v-h2`, `.v-bold`, `.v-quote`, `.v-code`, etc.).

   * A troca de cor de qualquer tag no painel lateral direito altera instantaneamente a variável CSS na raiz, sendo processada pelo pipeline da GPU em menos de 0,1ms, sem disparar re-renderizações no JavaScript.

   * O Rust salva e carrega os temas JSON instantaneamente do disco.

4. **Camada 3 — Base Desktop e Terminal: Tauri v2 + Rust**

   * Executável final minúsculo (~10MB a 15MB) e consumo de RAM de apenas ~35MB a 50MB (contra 250MB+ do Electron).

   * Terminal integrado real com `portable-pty` e suporte a PowerShell, CMD e Git Bash contextualizado na pasta aberta.

   * Sistema de arquivos nativo de alta velocidade com monitoramento de alterações de arquivos em tempo real.

---

## 3. Refinamentos Essenciais Integrados (Gaps Resolvidos)

1. **Colar Imagens e Capturas de Tela (`Ctrl + V`):**

   * O Rust salva automaticamente imagens coladas ou arrastadas numa pasta local relativa (ex: `./assets/`) e o ProseMirror insere a sintaxe Markdown correspondente `![imagem](./assets/nome.png)`.

2. **Sincronização com Mudanças Externas (Git / Terminal):**

   * O Rust (via crate `notify`) detecta alterações no disco:

     * Se o arquivo na aba não tiver edições pendentes: recarrega silenciosamente.

     * Se houver edições locais não salvas: exibe barra de alerta e preserva o buffer local sem descarte.

3. **Localizar e Substituir (`Ctrl + F` / `Ctrl + H`):**

   * Barra de busca in-document discreta com contagem de ocorrências, navegação rápida (`Enter` / `Shift+Enter`) e substituição pontual ou global.

4. **Barra de Status Inferior (Status Bar):**

   * Faixa minimalista no rodapé com contagem de palavras/caracteres, estimativa de tempo de leitura, linha/coluna e alternância rápida do terminal.

5. **Edição de Tabelas no Modo Word:**

   * Tecla `Tab` na última célula cria automaticamente nova linha; botões contextuais na TopBar para inserir ou excluir linhas e colunas.

6. **Blocos de Código com Destaque de Sintaxe:**

   * Destaque automático leve via tokenizer para linguagens comuns (JS, TS, Python, Rust, SQL, HTML, JSON, etc.), respeitando o tema ativo.

7. **Exportação (PDF / HTML / Impressão):**

   * Atalho `Ctrl + Shift + P` ou comando de exportação, permitindo salvar em PDF via `@media print` com o layout e as cores exatas do tema ativo.

