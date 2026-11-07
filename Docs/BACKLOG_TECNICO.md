# BACKLOG TÉCNICO & DIRETRIZES DE ARQUITETURA — VEU MD

Este documento consolida as melhorias técnicas válidas extraídas das discussões de evolução do produto, filtradas rigorosamente pelo princípio inegociável de **leveza, velocidade máxima e consumo mínimo de memória (~5 MB a repouso)**.

---

## 1. Filtro de Arquitetura: O que NÃO entra no escopo (Anti-Bloat)

Para preservar o binário enxuto em Rust, inicialização instantânea e integridade do editor WYSIWYG estilo Word, foram expurgados:

| Ideia Descartada | Motivo da Rejeição Técnica |
| :--- | :--- |
| **Modelos de IA Locais Embutidos (ex: Whisper.cpp / LLM no binário)** | Modelos locais exigem centenas de megabytes de RAM/disco e alto consumo de CPU/GPU, destruindo a meta de leveza (~5 MB). |
| **SDKs Pesados baseados em Node.js (ex: Claude Code SDK direto no core)** | Exigem runtime Node.js/npm no host ou empacotamento volumoso, quebrando a distribuição limpa de binário único. |
| **WebViews Secundárias Embutidas para Login Web** | Renders paralelos de Chromium consomem mais de 100 MB adicionais de memória. |
| **Estratégias de Divulgação / Monetização** | Marketing (Reddit, TikTok, Product Hunt, HN, planos de assinatura) não compõe o backlog de engenharia. |
| **Git Monolítico Embutido com Resolução de Conflitos Completa** | O `libgit2` completo com grafos de branches gera atrito para o público leigo e overhead desnecessário de binário. |

---

## 2. Invariante Crítica: Persistência e Continuidade do Terminal Multi-Projeto

### Contexto do Problema
Atualmente, no frontend (`src/App.svelte`), o componente de terminal era condicionado ao caminho do projeto via bloco reativo `{#key currentFolderPath}`. Ao alternar entre projetos abertos nas abas, o componente era destruído e remontado, provocando:
1. Perda do histórico e do buffer do terminal do projeto anterior.
2. Interrupção visual da sessão.
3. Necessidade de respawn de processo PTY.

### Diretriz Técnica de Solução
- **Sessões Isoladas por Projeto (`Map<ProjectId, TerminalSession>`):**
  - Cada projeto aberto mantém sua própria instância/buffer de terminal ativo em background.
  - O processo no backend Rust (`portable-pty`) **continua rodando ininterruptamente** (scripts de build, dev servers, monitoramento) mesmo quando o usuário troca para outro projeto.
- **Alternância Instantânea sem Destruição DOM:**
  - Em vez de destruir a árvore do xterm via `{#key}`, os terminais permanecem vivos em memória, apenas alternando visibilidade via CSS (`display: none` / `display: flex`) com base no `activeProjectId`.
  - Ao retornar ao projeto, a saída acumulada durante a ausência já está renderizada instantaneamente.

---

## 3. Backlog Técnico Priorizado

### Épico 1: Sessão & Continuidade do Terminal (Prioridade 0 — Imediato)

- [ ] **EP1-T01: Desacoplamento do Ciclo de Vida do Terminal vs. Projeto Ativo**
  - Remover a re-renderização destrutiva `{#key currentFolderPath}` em `App.svelte`.
  - Implementar pool de contêineres xterm indexados por `projectId`.
- [ ] **EP1-T02: Persistência do PTY no Backend Rust**
  - Garantir que `kill_terminal` só seja invocado quando um projeto for explicitamente fechado pelo usuário, e nunca durante a mera troca de abas/foco.
- [ ] **EP1-T03: Ajuste de Redimensionamento Automático (FitAddon on Focus)**
  - Executar `fitAddon.fit()` assim que um projeto oculto voltar ao foco para recalcular colunas/linhas sem glitch visual.

---

### Épico 2: Produtividade Cirúrgica de Texto & IA (Prioridade 1)

- [ ] **EP2-T01: Smart Paste para Textos de IA**
  - Interceptar o evento de colagem (`handlePaste`) no ProseMirror.
  - Normalizar blocos de código copiados sem crase tripla, listas quebradas e cabeçalhos perdidos.
  - *Higienização Opcional:* Toggle nas preferências para remover automaticamente saudações e encerramentos clichês de chatbots ("Aqui está o resumo solicitado:", "Espero ter ajudado!").
- [ ] **EP2-T02: Quick Open / Localizador Global Rápido (Ctrl + P)**
  - Janela de busca difusa (Fuzzy Search) ultrarrápida indexando apenas nomes de arquivos `.md` e `.txt` já mapeados na memória da árvore de arquivos.
  - Zero chamadas recursivas a disco durante a digitação.
- [ ] **EP2-T03: Exportação Multiformato Fiel ao Tema Ativo**
  - **Exportar PDF:** Disparo do diálogo nativo de impressão via `@media print` otimizado, herdando a tipografia e paleta do tema ativo.
  - **Copiar como HTML Formatado:** Ação rápida para exportar a seleção ou documento para o clipboard em MIME `text/html`, permitindo colar direto no Google Docs/Gmail/Word mantendo formatação rica.

---

### Épico 3: Usabilidade do Documento WYSIWYG (Prioridade 2)

- [ ] **EP3-T01: Navegação e Edição Ágil de Tabelas Markdown**
  - Melhorar os atalhos de navegação de tabelas no ProseMirror (`Tab`, `Shift+Tab`, `Enter`).
  - Botões contextuais flutuantes discretos para "Inserir Linha Acima/Abaixo" e "Inserir Coluna", garantindo serialização Markdown GFM perfeitamente alinhada no disco.
- [ ] **EP3-T02: Tratamento Limpo de Frontmatter YAML**
  - Ocultar ou renderizar de forma colapsável blocos de metadados delimitados por `---` no topo do arquivo.
  - Manter o cabeçalho intacto no disco sem poluir a leitura estilo Word.
- [ ] **EP3-T03: Context Dropper & Contador de Tokens**
  - Ação de menu de contexto nas pastas/arquivos: "Copiar como Contexto de IA" (concatena arquivos selecionados com tags `<context><file path="...">...</file></context>`).
  - Contador de tokens estimado ou via tokenizer leve em Rust integrado à StatusBar.

---

### Épico 4: Integrações Leves & Sincronização Desacoplada (Prioridade 3)

- [ ] **EP4-T01: Terminal em Modo Automação / Resposta Limpa**
  - Visualizador alternativo opcional no painel de terminal para comandos que geram texto (ex: `ollama run`, scripts locais de processamento de texto), filtrando escapes ANSI com opção de "Inserir no cursor".
- [ ] **EP4-T02: Sincronização em Nuvem sem Servidor Próprio (Zero-Server Sync)**
  - Arquitetura modular via requisições HTTPS diretas (Google Drive `appDataFolder`, WebDAV ou Dropbox API).
  - Isolamento total do core de edição: o editor escreve no disco local normalmente; o módulo de sync trabalha em background de forma silenciosa e não-bloqueante.

---

## 4. Matriz de Decisão de Performance

| Critério | Limite Inegociável |
| :--- | :--- |
| **Inicialização (Cold Start)** | < 300 ms no Desktop |
| **Consumo de Memória (Idle)** | < 15-25 MB (incluindo WebView nativo e processos PTY ativos) |
| **Custo de CPU na Troca de Temas** | Zero recalculo de layout JS (estritamente CSS Custom Properties) |
| **Operações de Disco** | Assíncronas e debounced para não travar o loop do editor |
