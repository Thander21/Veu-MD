# AGENTS.md — Veu MD Workspace Guidelines & Agent Harness

Este documento define as regras operacionais, invariantes arquiteturais, diretrizes de compilação e convenções para agentes de IA atuando no repositório **Veu MD**.

---

## 1. Visão Geral do Produto e Invariantes de UX

O **Veu MD** é um editor de Markdown e texto puro focado em alta velocidade, leveza e experiência visual limpa.

- **Edição 100% WYSIWYG Estilo Word:**
  - O editor ProseMirror **NUNCA** deve exibir caracteres brutos de formatação Markdown (`#`, `**`, `*`, `>`, ````) no corpo do texto durante leitura ou digitação.
  - A experiência visual deve ser fluida e direta, idêntica a processadores de texto ricos (Word/Pages).
- **Persistência e Continuidade do Terminal Multi-Projeto:**
  - **NUNCA** destrua o `<TerminalPanel>` usando blocos de re-renderização reativa como `{#key currentFolderPath}`.
  - Cada projeto aberto mantém suas sessões e buffers de PTY ativos em background (ocultos via CSS `.hidden`), preservando compilações, servidores locais e histórico de comandos ao alternar entre abas de projetos.
  - O comando `kill_terminal` no backend Rust só deve ser disparado quando a aba do projeto for **explicitamente fechada** pelo usuário (`closeProject`), nunca durante troca de foco.
  - O redimensionamento do xterm (`fitAddon.fit()`) só pode ser invocado quando o contêiner possuir dimensões reais (`clientWidth > 0 && clientHeight > 0`) para evitar corrupção de colunas no PTY.
- **Anti-Bloat & Filtro Inegociável de Leveza:**
  - O footprint do app deve permanecer em ~5 MB a repouso com cold start < 300 ms.
  - É estritamente proibido embutir runtimes pesados (Node.js/npm no host, modelos de IA embutidos como Whisper de 500MB, ou WebViews secundárias para login).
- **Fidelidade no Disco (.md Puro Padrão GFM):**
  - O documento em memória é serializado para Markdown padrão GitHub Flavored Markdown (GFM) com fidelidade total (tabelas, checklists, citações, código, imagens).
  - Qualquer outro editor de texto ou visualizador de repositório deve ler o arquivo normalmente com todas as tags canônicas.
- **Abertura e Foco de Arquivos:**
  - Na árvore lateral (Explorer), apenas arquivos com extensão `.md` e `.txt` são abertos para edição no editor ProseMirror.
  - Demais arquivos podem ser navegados ou gerenciados, mas não abertos para edição direta de texto.
- **Performance de Temas via GPU:**
  - Todas as cores de elementos semânticos (H1..H6, negrito, itálico, citações, inline code, blocos de código, tabelas, links) e espaçamentos são aplicados estritamente via CSS Custom Properties no `:root`.
  - A troca de tema ocorre sem recálculo de árvore DOM no JavaScript (custo zero de CPU / re-render pela GPU).
  - O tema canônico de primeiro uso é **"Veu MD (Oficial)"** (`veumd`) com a paleta Crepúsculo Obsidian (`#0e0b16`, `#f472b6`, `#c084fc`, `#7c3aed`).
  - O drawer de temas deve disponibilizar seleção via Dropdown; qualquer ajuste manual feito pelo usuário em cores, medidas ou fontes deve comutar automaticamente o seletor para **"Personalizado"** (`custom`).
- **Ergonomia e Invariantes da Barra de Projetos:**
  - **NUNCA** sobreponha botões flutuantes de fechar (`X`) no topo dos avatares de projetos na barra de atividades, evitando cliques acidentais e poluição visual.
  - A ação de fechar projeto deve ter destaque visual em vermelho vivo (`#ef4444`), localizada após o nome da pasta no cabeçalho do Explorer ou acionada via clique com botão direito no avatar.
- **Segregação Semântica da Barra Superior (TopBar) e Zero Duplicidades:**
  - As ações que operam diretamente sobre o documento em edição (*Salvar*, *Exportar PDF/Imprimir*, *Copiar HTML*) pertencem ao grupo de formatação do editor ProseMirror, posicionadas ao final após *Desfazer/Refazer*.
  - O grupo esquerdo da TopBar reserva-se a ações de contexto (*Alternar Barra Lateral*, *Abrir/Trocar Pasta*, *Assistente IA Wizard* e *Localizador Rápido Ctrl+P*).
  - Ações de criação de arquivos e pastas pertencem exclusivamente à barra de ferramentas do Explorer, evitando duplicações desnecessárias no topo.
  - O terminal integrado possui seus pontos de acesso canônicos no topo direito e na barra de status; nunca o duplique dentro da barra de ferramentas do Explorer.

---

## 2. Arquitetura e Stack Tecnológica

| Camada | Tecnologia | Papel |
| :--- | :--- | :--- |
| **Frontend UI** | **Svelte 5 + TypeScript + Vite** | Interface cirúrgica reativa, sistema de abas, explorer e painéis com zero Virtual DOM |
| **Editor Core** | **ProseMirror Core Puro** | Schema customizado, serializador bidirecional Markdown GFM, menus flutuantes e inline |
| **Terminal** | **@xterm/xterm + WebGL** | Terminal integrado contextualizado na pasta ativa |
| **Desktop / Core**| **Tauri v2 + Rust 2021** | IPC seguro, manipulação de arquivos, PTY nativo (`portable-pty`), watcher (`notify`) |
| **Mobile** | **Tauri v2 Mobile (Android)** | Wrapper nativo mobile para Android via NDK/Gradle |

---

## 3. Orquestração e Processo SDD (Tech Lead's Club)

O projeto adota a metodologia Spec-Driven Development através do framework `tlc-spec-driven` localizado em `.agent/skills/tlc-spec-driven/`.

### Fluxo de Trabalho de Features
1. **Especificação (`spec.md`):** Requisitos no formato EARS e modelo de dados.
   - Validação: `python .agent/skills/tlc-spec-driven/scripts/validate_spec.py <feature> --strict`
2. **Tarefas (`tasks.md`):** Tarefas atômicas com portões executáveis determinísticos.
   - Validação: `python .agent/skills/tlc-spec-driven/scripts/validate_tasks.py <feature> --execute`
3. **Execução & Verificação:** Implementação tarefa a tarefa com verificação independente (`proofs.md` e `verification.md`).
   - Validação Final: `python .agent/skills/tlc-spec-driven/scripts/validate_verification.py <feature>`

### Invariantes Estritos do SDD
- **Parada Obrigatória para Aprovação Humana:** NUNCA inicie a Fase 4 (Execute) sem antes:
  1. Clarificar todas as áreas cinzentas (*gray areas*) com o usuário e documentá-las em `context.md`.
  2. Obter a aprovação formal do usuário e registrá-la em `spec.md` e `tasks.md` como `**Approved**: <data> - user: "<suas palavras>"`.
- **Sintaxe Canônica em `spec.md`:** Os títulos de seção **NÃO** devem conter números (use `## Problem Statement`, `## Out of Scope`, `## Assumptions & Open Questions`, `## User Stories`, `## Requirement Traceability`).
- **Execução de Scripts no Windows:** Sempre execute scripts no diretório do projeto: `cd "W:\_Projetos\Veu MD"; python .agent/skills/tlc-spec-driven/scripts/...`
- **Árvore Limpa para Verificação:** `check_proofs.py` e `validate_verification.py` só atestam sucesso sobre uma árvore limpa (`git status` sem alterações pendentes).

### Sintaxe Obrigatória em `tasks.md`
- Nos blocos de tarefa (`### T01: ...`), as tags de metadados **NÃO** devem ter hífen de lista:
  ```markdown
  ### T01: Descrição da tarefa
  **Where**: src/caminho/arquivo.svelte
  **Depends on**: T00
  **Tests**: npm run check
  **Gate**: npm run check
  **Done When**: Critério atendido
  ```
- O bloco `## Checks` deve conter:
  ```markdown
  Build: <comando>
  Run <name>: <comando>
  Check: C01
  Proof: run <name> | <expressão regex>
  ```

---

## 4. Estrutura de Pastas e Ferramentas

```
├── .agent/skills/         # Habilidades de agentes (instaladas via @tech-leads-club/agent-skills)
├── .agents/               # Lockfile das skills (.skill-lock.json)
├── .specs/features/       # Especificações SDD, tasks, proofs e verificações
├── Docs/                  # Documentação técnica, especificações de produto e comandos rápidos
│   ├── c.md               # Cheat-sheet de comandos rápidos (Web, Desktop, Android)
│   └── PLANO_E_STACK...   # Especificação e arquitetura detalhada
├── src/                   # Código-fonte Svelte 5 (UI, Editor ProseMirror, Componentes)
│   ├── lib/               # Componentes Svelte (Editor, TabBar, Sidebar, TopBar, etc.)
│   ├── prosemirror/       # Schema, Serializador Markdown, Regras de Input
│   └── stores/            # Estados reativos (tema, abas, arquivos)
├── src-tauri/             # Backend Tauri v2 em Rust
│   ├── src/               # Código Rust (lib.rs, main.rs, PTY, watcher)
│   ├── Cargo.toml         # Crates Rust (tauri, portable-pty, notify, serde)
│   └── tauri.conf.json    # Configuração da janela, build e bundle Tauri v2
└── package.json           # Dependências frontend e scripts NPM
```

---

## 5. Diretrizes de Compilação Desktop & Toolchain Windows (Tauri v2 + Rust)

- **Detecção Automática do `rc.exe` (Windows Resource Compiler):**
  - O arquivo `src-tauri/build.rs` contém busca de fallback para o compilador de recursos `rc.exe` no diretório canônico `C:\Program Files (x86)\Windows Kits\10\bin\*\x64\rc.exe`.
  - Nunca remova esta rotina para evitar quebras em terminais Windows padrão.
- **Resolução de PATH Rust/Cargo no PowerShell:**
  - Caso o terminal não encontre `cargo` automaticamente, use o prefixo:
    ```powershell
    $env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
    ```
  - Ou execute via npm: `npm run check:rust`.

---

## 6. Comandos Canônicos do Projeto

Consulte `Docs/c.md` para a lista completa com todas as variáveis de ambiente.

- **Frontend Check:** `npm run check`
- **Rust Backend Check:** `npm run check:rust`
- **Web Dev:** `npm run dev`
- **Desktop Dev:** `npm run tauri dev`
- **Desktop Build:** `npm run tauri build`
- **Android Dev:** `npm run tauri android dev`
- **Android Build:** `npm run tauri android build`

