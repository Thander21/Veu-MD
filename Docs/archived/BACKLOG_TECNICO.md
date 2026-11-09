# BACKLOG TÉCNICO & DIRETRIZES DE ARQUITETURA — VEU MD [ARQUIVADO]

> **Status**: **CONCLUÍDO & ARQUIVADO (2026-11-09)**
> Todos os épicos deste backlog técnico foram 100% concluídos: implementados diretamente no código-fonte ou desdobrados em especificações técnicas formais no padrão TLC/SDD em `.specs/features/`.

Este documento consolidou as melhorias técnicas válidas extraídas das discussões de evolução do produto, filtradas rigorosamente pelo princípio inegociável de **leveza, velocidade máxima e consumo mínimo de memória (~5 MB a repouso)**.

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
Anteriormente, no frontend (`src/App.svelte`), o componente de terminal era condicionado ao caminho do projeto via bloco reativo `{#key currentFolderPath}`. Ao alternar entre projetos abertos nas abas, o componente era destruído e remontado, provocando perda de histórico e PTYs órfãos.

### Diretriz Técnica de Solução (Implementada em Produção)
- **Sessões Isoladas por Projeto (`Map<ProjectId, TerminalSession>`):**
  - Cada projeto aberto mantém sua própria instância/buffer de terminal ativo em background.
  - O processo no backend Rust (`portable-pty`) continua rodando ininterruptamente mesmo durante trocas de projeto.
- **Alternância Instantânea sem Destruição DOM:**
  - Em vez de destruir a árvore do xterm via `{#key}`, os terminais permanecem vivos em memória, apenas alternando visibilidade via CSS (`display: none` / `display: flex`) com base no `activeProjectId`.

---

## 3. Backlog Técnico Priorizado

### Épico 1: Sessão & Continuidade do Terminal (Prioridade 0 — Imediato)

- [x] **EP1-T01: Desacoplamento do Ciclo de Vida do Terminal vs. Projeto Ativo**
  - *Status*: Concluído em `TerminalPanel.svelte` e `App.svelte` (AD-011, AD-023).
- [x] **EP1-T02: Persistência do PTY no Backend Rust**
  - *Status*: Concluído em `src-tauri/src/commands/pty_cmd.rs` (kill apenas no fechamento explícito do projeto).
- [x] **EP1-T03: Ajuste de Redimensionamento Automático (FitAddon on Focus)**
  - *Status*: Concluído em `TerminalPanel.svelte` (recalcula colunas e linhas no foco/visibilidade).

---

### Épico 2: Produtividade Cirúrgica de Texto & IA (Prioridade 1)

- [x] **EP2-T01: Smart Paste para Textos de IA**
  - *Status*: Concluído em `src/lib/editor/proseMirrorSetup.ts:handleSmartPaste` e `sanitizeAiGreetings`.
- [x] **EP2-T02: Quick Open / Localizador Global Rápido (Ctrl + P)**
  - *Status*: Concluído em `src/lib/components/QuickOpenModal.svelte` (busca difusa ultra-rápida em memória).
- [x] **EP2-T03: Exportação Multiformato Fiel ao Tema Ativo**
  - *Status*: Concluído em `TopBar.svelte` e `src/app.css` (`window.print()` com `@media print` e copiar como HTML formatado).

---

### Épico 3: Usabilidade do Documento WYSIWYG (Prioridade 2)

- [x] **EP3-T01: Navegação e Edição Ágil de Tabelas Markdown**
  - *Status*: Concluído em `proseMirrorSetup.ts` e `TopBar.svelte` (`Tab`/`Shift+Tab` e barra contextual de tabela).
- [x] **EP3-T02: Tratamento Limpo de Frontmatter YAML**
  - *Status*: Concluído / Especificado formalmente em `.specs/features/yaml-frontmatter-handling/spec.md`.
- [x] **EP3-T03: Context Dropper & Contador de Tokens**
  - *Status*: Concluído / Especificado formalmente em `.specs/features/ai-context-dropper-and-tokens/spec.md`.

---

### Épico 4: Integrações Leves & Sincronização Desacoplada (Prioridade 3)

- [x] **EP4-T01: Terminal em Modo Automação / Resposta Limpa**
  - *Status*: Concluído no Terminal Veu (`TerminalVeuPanel.svelte`: botões "Copiar" e "No Editor").
- [x] **EP4-T02: Sincronização em Nuvem sem Servidor Próprio (Zero-Server Sync)**
  - *Status*: Concluído / Especificado formalmente em `.specs/features/zero-server-cloud-sync/spec.md`.

---

## 4. Matriz de Decisão de Performance

| Critério | Limite Inegociável | Status |
| :--- | :--- | :--- |
| **Inicialização (Cold Start)** | < 300 ms no Desktop | Atendido |
| **Consumo de Memória (Idle)** | < 15-25 MB (incluindo WebView nativo e processos PTY ativos) | Atendido |
| **Custo de CPU na Troca de Temas** | Zero recalculo de layout JS (estritamente CSS Custom Properties) | Atendido |
| **Operações de Disco** | Assíncronas e debounced para não travar o loop do editor | Atendido |

