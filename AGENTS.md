# AGENTS.md — Veu MD Workspace Guidelines & Agent Harness

Este documento define as regras operacionais, invariantes arquiteturais, diretrizes de compilação e convenções para agentes de IA atuando no repositório **Veu MD**.

---

## 1. Visão Geral do Produto e Invariantes de UX

O **Veu MD** é um editor de Markdown e texto puro focado em alta velocidade, leveza e experiência visual limpa.

- **Edição 100% WYSIWYG Estilo Word:**
  - O editor ProseMirror **NUNCA** deve exibir caracteres brutos de formatação Markdown (`#`, `**`, `*`, `>`, ````) no corpo do texto durante leitura ou digitação.
  - A experiência visual deve ser fluida e direta, idêntica a processadores de texto ricos (Word/Pages).
- **Terminal Veu — Sequencial, Editorial e Interativo (Anti-CRT):**
  - O terminal adota prioritariamente o **Terminal Veu** com fluxo sequencial de blocos, tipografia editorial e parser ANSI semântico nativo (`ansiParser.ts`). O motor `@xterm/xterm` (v5.5.0) é mantido temporariamente em modo de convivência dual-engine via alternador na UI até a validação completa de maturidade do Terminal Veu em produção.
  - **Controle Total & Não-Interceptação de CLIs**: O Terminal Veu **NUNCA** deve interceptar, sequestrar ou redirecionar comandos de terminal (como `agy`, `claude`, `muse`, scripts ou subcomandos como `agy --add`) para gavetas de chat. O usuário possui controle total do PTY com streaming e parada via `Ctrl+C`.
  - **Normalização de ConPTY no Windows**: Retornos de carro (`\r`) e sequências de controle de cursor devem ser processados via `resolveCarriageReturns` para evitar texto sobreposto e ecos duplicados de comandos.
  - **Cold Start Imediato**: A inicialização do shell e seu banner inicial nunca devem ser descartados quando a lista de blocos estiver vazia; ao abrir o painel, a sessão deve estar pronta e o prompt imediatamente focado.
  - O prompt de entrada é interativo e editável com seleção nativa por mouse, navegação por histórico com setas (`ArrowUp`/`ArrowDown`) e clique livre para mover o cursor, posicionado ao final da linha do tempo quando a sessão está ociosa.
  - Durante a execução de um comando, a interface exibe streaming contínuo da saída com status, botão **Parar (`Ctrl+C`)** e ação de escape para liberar o prompt caso o processo silencie sem retorno padronizado.
  - **Eliminação de Processos Zumbis (Win32 ConPTY)**: Toda sessão `TerminalSession` no Rust deve reter o handle do processo filho (`child`). Ao invocar `kill_terminal` (fechamento explícito de projeto), o processo deve ser encerrado com `child.kill()`, impedindo processos órfãos consumindo CPU e memória no Windows.
- **Barra Lateral Direita Acoplada do Chat IA vs Gaveta Fixa de Temas:**
  - O **Chat IA (`AiAssistantPanel`)** atua como uma barra lateral direita acoplada (`position: relative; height: 100%; flex-shrink: 0;`) inserida diretamente no fluxo de `.workspace` ao lado de `.center-stage`. Isso assegura que o palco central e o editor ProseMirror contraiam proporcionalmente quando o chat estiver aberto, impedindo terminantemente que o chat flutue ou sobreponha o texto do documento em edição. Possui alça interativa de redimensionamento (`.sidebar-resize-handle`) e cabeçalho alinhado a 44px com a `TopBar`.
  - Painéis de configuração rápida e transitória como **`ThemeSettings`** permanecem como gavetas fixas flutuantes (`position: fixed; right: 0; top: 44px; bottom: 24px; z-index: 40;`), pois são diálogos de ajuste estético pontual e não barras laterais de trabalho contínuo.
- **Anti-Loop Reativo em Svelte 5:**
  - **NUNCA** altere propriedades diretas de nós DOM capturados por `bind:this` (ex: `inputEl.style.height = ...`) dentro de blocos reativos `$:` ou `$effect`.
  - Isso dispara `mutate()` recursivamente a cada microtask no Svelte 5 e congela a thread da UI a 100% de CPU. Use sentinelas pontuais de transição de estado (`let prevVisible = false; $: if (visible && !prevVisible) ...`) desacopladas com `setTimeout(..., 60)` e estilize tamanhos padrão via CSS (`min-height`).
  - Tags `<svelte:window>` devem permanecer obrigatoriamente no nível superior do markup, nunca aninhadas em blocos condicionais como `{#if}`.
- **Persistência e Continuidade do Terminal Multi-Projeto:**
  - **NUNCA** destrua o `<TerminalPanel>` usando blocos de re-renderização reativa como `{#key currentFolderPath}` ou `{#if visible}` ao recolher o painel.
  - O painel deve ser ocultado estritamente via classe CSS `.hidden` (`display: none`), preservando compilações, servidores locais e histórico de comandos em background ao alternar entre abas ou recolher com `Ctrl + '`.
  - O comando `kill_terminal` no backend Rust só deve ser disparado quando a aba do projeto for **explicitamente fechada** pelo usuário (`closeProject`), nunca durante troca de foco ou minimização.
- **Sincronização Atômica de Workspace e Debounce de Storage:**
  - Na alternância de projetos (`switchToProject`), o carregamento assíncrono de arquivos deve ser protegido por uma sentinela atômica (`isSwitchingProject`), impedindo que microtasks de I/O disparem blocos reativos que sobrescrevam abas do projeto de destino com dados defasados.
  - A serialização e salvamento em `localStorage` durante digitação no editor deve conter debounce de 500ms, evitando I/O síncrono bloqueante a cada caractere digitado.
  - Listeners IPC registrados em `onMount` (ex: `listen('file-changed-externally')`) devem armazenar o handle de `unlisten` e executá-lo obrigatoriamente no `onDestroy`.
- **Segurança Operacional, CSP e Sanitização de Caminhos:**
  - A Content Security Policy (CSP) em `tauri.conf.json` deve permitir estritamente recursos locais (`'self'`, `asset:`, `asset.localhost`), com permissão explícita para Google Fonts (`https://fonts.googleapis.com`, `https://fonts.gstatic.com`) e imagens remotas em Markdown (`https:`, `blob:`).
  - Comandos Rust de escrita (`save_image_asset`, `save_custom_theme`) devem aplicar extração estrita de nome base (`Path::file_name()`) e validação alfanumérica, neutralizando vulnerabilidades de _Path Traversal_ (`../../`).
- **Anti-Bloat & Filtro Inegociável de Leveza:**
  - O footprint do app deve permanecer em ~5 MB a repouso com cold start < 300 ms.
  - É estritamente proibido embutir runtimes pesados (Node.js/npm no host, modelos de IA embutidos como Whisper de 500MB, ou WebViews secundárias para login).
  - **Formatador de Código Embutido Leve (Zero-Bloat)**: A formatação de linguagens estruturadas (JSON, HTML, JS/TS/CSS, Markdown) é provida por formatadores puros em TypeScript (`codeFormatter.ts`), sem dependências pesadas externas (Prettier, Biome, Dprint) para preservar a integridade do binário leve.
- **Fidelidade no Disco (.md Puro Padrão GFM):**
  - O documento em memória é serializado para Markdown padrão GitHub Flavored Markdown (GFM) com fidelidade total (tabelas, checklists, citações, código, imagens).
  - Qualquer outro editor de texto ou visualizador de repositório deve ler o arquivo normalmente com todas as tags canônicas.
- **Abertura e Foco de Arquivos:**
  - Na árvore lateral (Explorer), apenas arquivos com extensão `.md` e `.txt` são abertos para edição no editor ProseMirror.
  - Arquivos de imagens (`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.bmp`, `.ico`) e vetores (`.svg`) são abertos como abas ativas dedicadas no componente `ImageViewer`.
  - Demais arquivos podem ser navegados ou gerenciados no Explorer, mas não abertos para edição direta de texto.
- **Visualização de Imagens e Vetores SVG (Dual-Mode):**
  - O componente `ImageViewer` deve prover visualização gráfica centrada com controles de zoom e pan.
  - Para arquivos SVG, a barra de ferramentas deve oferecer alternância fluida entre visualização gráfica renderizada e inspeção/cópia do código-fonte XML nativo.
- **Padronização do Ícone Canônico de Markdown (.md):**
  - Todos os nós de arquivos Markdown (`.md`, `.markdown`) na árvore lateral (`FileTreeNode`), na barra lateral (`Sidebar`) e na barra de abas (`TabBar`) **DEVEM** renderizar o componente canônico `VeuMdIcon`.
  - O ícone segue a estética oficial do _Material Icon Theme_ do VS Code (fundo roxo `#ab47bc` com cantos arredondados e os glifos brancos `M` e `↓`). É estritamente proibido substituir este ícone por logotipos com a letra "V" de Veu ou ícones genéricos de texto puro.
- **Comportamento e Retração da Gaveta do Chat IA:**
  - Ao abrir a gaveta lateral do Chat IA (`AiAssistantPanel`), o botão disparador externo na barra superior (`TopBar`) **DEVE** ser ocultado (`{#if !aiAssistantOpen}`).
  - O ícone do assistente posicionado no canto superior esquerdo do cabeçalho da gaveta atua obrigatoriamente como ação direta de retração (`on:click={onClose}`), permitindo recolher a gaveta sem depender unicamente do botão `X`.
- **Foco Editorial da Tela Inicial do Chat IA:**
  - O estado vazio (`messages.length === 0`) do Chat IA deve exibir exclusivamente o cabeçalho editorial de boas-vindas e os chips de ação rápida focados na assistência à escrita (_Revisar clareza e estilo_, _Resumo em 3 tópicos_, _Estruturar novos tópicos_, _Introdução envolvente_).
  - **NUNCA** insira cards intrusivos de execução de linha de comando ("Iniciar Normal" ou "Permissão Total") na tela inicial de chat; tais ações pertencem exclusivamente ao `TerminalPanel` ou às visões de Wizard/Configurações (`AiSettingsView`).
- **Performance de Temas via GPU:**
  - Todas as cores de elementos semânticos (H1..H6, negrito, itálico, citações, inline code, blocos de código, tabelas, links) e espaçamentos são aplicados estritamente via CSS Custom Properties no `:root`.
  - A troca de tema ocorre sem recálculo de árvore DOM no JavaScript (custo zero de CPU / re-render pela GPU).
  - O tema canônico de primeiro uso é **"Veu MD (Oficial)"** (`veumd`) com a paleta Catppuccin Mocha (`#11111b`, `#181825`, `#1e1e2e`, `#cba6f7`, `#f5c2e7`) e tipografia Roboto.
  - O tema legado **"Veu Crepúsculo"** (`veu`) permanece disponível para os usuários que apreciam a estética crepúsculo obsidian original.
  - O drawer de temas deve disponibilizar seleção via Dropdown; qualquer ajuste manual feito pelo usuário em cores, medidas ou fontes deve comutar automaticamente o seletor para **"Personalizado"** (`custom`).
- **Ergonomia e Invariantes da Barra de Projetos:**
  - **NUNCA** sobreponha botões flutuantes de fechar (`X`) no topo dos avatares de projetos na barra de atividades, evitando cliques acidentais e poluição visual.
  - A ação de fechar projeto deve ter destaque visual em vermelho vivo (`#ef4444`), localizada após o nome da pasta no cabeçalho do Explorer ou acionada via clique com botão direito no avatar.
- **Segregação Semântica da Barra Superior (TopBar) e Zero Duplicidades:**
  - As ações que operam diretamente sobre o documento em edição (_Salvar_, _Exportar PDF/Imprimir_, _Copiar HTML_) pertencem ao grupo de formatação do editor ProseMirror, posicionadas ao final após _Desfazer/Refazer_.
  - O grupo esquerdo da TopBar reserva-se a ações de contexto (_Alternar Barra Lateral_, _Abrir/Trocar Pasta_, _Assistente IA Wizard_ e _Localizador Rápido Ctrl+P_).
  - Ações de criação de arquivos e pastas pertencem exclusivamente à barra de ferramentas do Explorer, evitando duplicações desnecessárias no topo.
  - O terminal integrado possui seus pontos de acesso canônicos no topo direito e na barra de status; nunca o duplique dentro da barra de ferramentas do Explorer.

---

## 2. Arquitetura e Stack Tecnológica

| Camada             | Tecnologia                           | Papel                                                                                 |
| :----------------- | :----------------------------------- | :------------------------------------------------------------------------------------ |
| **Frontend UI**    | **Svelte 5 + TypeScript + Vite**     | Interface cirúrgica reativa, sistema de abas, explorer e painéis com zero Virtual DOM |
| **Editor Core**    | **ProseMirror Core Puro**            | Schema customizado, serializador bidirecional Markdown GFM, menus flutuantes e inline |
| **Terminal**       | **Terminal Veu + portable-pty Rust** | Terminal sequencial, editorial e leve contextualizado na pasta ativa                  |
| **Desktop / Core** | **Tauri v2 + Rust 2021**             | IPC seguro, manipulação de arquivos, PTY nativo (`portable-pty`), watcher (`notify`)  |
| **Mobile**         | **Tauri v2 Mobile (Android)**        | Wrapper nativo mobile para Android via NDK/Gradle                                     |

### 2.1. Modularização do Backend Rust (`src-tauri/src/`)

A arquitetura do backend é rigorosamente segregada por domínios de responsabilidade:

- **`commands/`**: Handlers IPC invocados pelo frontend via `invoke()`:
  - `fs_cmd.rs`: Operações seguras de sistema de arquivos (leitura de árvore de diretórios, leitura/escrita de arquivos, salvamento de imagens e verificação de existência).
  - `pty_cmd.rs`: Gestão de sessões de terminal interativo (`portable-pty`), spawn de PTY, redimensionamento de janela, escrita de dados no stdin e encerramento sem processos zumbis (`kill_terminal`).
  - `ai_cmd.rs`: Execução segura e streaming contínuo de ferramentas CLI de IA locais (`claude`, `muse`, scripts).
  - `theme_cmd.rs`: Persistência atômica de temas personalizados no diretório de dados do usuário.
  - `watcher_cmd.rs`: Monitoramento reativo de alterações em disco via `notify`, com debounce para evitar notificações concorrentes redundantes.
- **`utils/`**: Utilitários puros e auxiliares de baixo nível:
  - `tool_path.rs`: Resolução agnóstica de executáveis e ferramentas CLI no PATH do sistema operacional Windows/macOS/Linux.
  - `base64.rs`: Codificação e decodificação eficiente de payloads binários sem overhead de crates pesadas.
- **`state.rs`**: Estruturas de estado global compartilhado injetadas no runtime do Tauri via `tauri::State` (ex: `TerminalState` protegendo instâncias ativas com `Mutex<HashMap<String, TerminalSession>>`).
- **`lib.rs`**: Ponto central de inicialização do Tauri v2, registro de plugins oficiais e montagem de comandos IPC (`generate_handler!`).
- **`main.rs`**: Ponto de entrada canônico que delega diretamente a execução para `lib::run()`.

---

## 3. Modelo de Permissões e Segurança (Tauri v2 Capabilities)

O Tauri v2 adota o modelo de segurança declarativa baseado em **Capabilities** e **Listas de Controle de Acesso (ACL)**:

- **Declaração Central de Capabilities (`src-tauri/capabilities/default.json`)**:
  - Define as permissões estritas concedidas à janela principal (`main`).
  - Plugins ativos:
    - `core:default`: Ciclo de vida básico e infraestrutura IPC de eventos.
    - `shell:default`: Acesso controlado ao subsistema de execução de subprocessos.
    - `fs:default`: Operações de I/O em arquivos com escopos delimitados.
    - `dialog:default`: Caixas de diálogo nativas do sistema operacional (abrir pasta/arquivo).
- **Validação Estrita em Build (`tauri-build`)**:
  - O crate `tauri-build` em tempo de compilação gera os schemas em `src-tauri/gen/schemas/` e valida todas as permissões declaradas contra os manifests de ACL.
  - Qualquer referência a permissão inexistente ou incompatível bloqueia o build imediatamente antes da compilação do Rust.
- **Invariantes de Segurança do IPC**:
  - **Sanitização de Caminhos & Anti-Traversal**: Comandos Rust que gravam arquivos (`save_image_asset`, `save_custom_theme`) aplicam extração canônica de nome base (`Path::file_name()`) e validações estritas, rejeitando qualquer padrão de evasão de diretório (`..`, `/`, `\`).
  - **Content Security Policy (CSP)**: Configurada em `tauri.conf.json` para bloquear fontes externas não autorizadas, restringindo a origens locais (`'self'`, `asset:`), Google Fonts e imagens remotas em Markdown via `https:`.

---

## 4. Orquestração e Processo SDD (Tech Lead's Club - TLC)

O projeto adota a metodologia Spec-Driven Development através do framework canônico `tlc-spec-driven` localizado em `.agent/skills/tlc-spec-driven/`.

### 4.1. Fases Adaptativas do Ciclo de Vida

```
┌──────────┐   ┌──────────┐   ┌─────────┐   ┌─────────┐
│ SPECIFY  │ → │  DESIGN  │ → │  TASKS  │ → │ EXECUTE │
└──────────┘   └──────────┘   └─────────┘   └─────────┘
   Obrigatório    Opcional*      Opcional*    Obrigatório
* Dispensado automaticamente de acordo com o auto-sizing da complexidade.
```

- **Auto-Sizing de Complexidade**:
  - **Small** (≤ 3 arquivos, alteração pontual): Spec inline, pula Design e Tasks; implementa e valida diretamente.
  - **Medium** (Feature clara, < 10 tarefas): Spec conciso, pula Design formal, tarefas implícitas ou diretas; implementa e valida.
  - **Large** (Multi-componente, muitas interfaces): Spec completo com IDs rastreáveis (EARS), Design de arquitetura e breakdown completo de tarefas atômicas em `tasks.md`.
  - **Complex** (Ambiguidade, novo domínio): Spec completo com discussão prévia de áreas cinzentas (`context.md`), Design de arquitetura com pesquisa e plano de validação/UAT.

### 4.2. Invariantes Inegociáveis do SDD

1. **Parada Obrigatória para Aprovação Humana**:
   - NUNCA inicie a Fase de Execução (Fase 4) sem antes:
     a) Esclarecer todas as áreas cinzentas (_gray areas_) com o usuário e documentá-las em `.specs/features/<feature>/context.md`.
     b) Apresentar `spec.md` e `tasks.md` e aguardar aprovação explícita do usuário.
     c) Registrar a aprovação formal com a citação exata das palavras do usuário: `**Approved**: <data> - user: "<suas palavras>"`.
2. **Testes Derivados dos Critérios de Aceite**:
   - Os testes validam o comportamento especificado, nunca espelham a implementação.
3. **Commit Atômico com Portão Determinístico**:
   - Uma tarefa por commit atômico (`tasks.md` atualizada antes do commit). O script `check_commit.py` valida o portão antes de cada commit.
4. **Verificação Independente Obrigatória (Autor ≠ Verificador)**:
   - Ao finalizar a última tarefa, o script `check_proofs.py` consolida as evidências em `proofs.md`.
   - Um sub-agente ou sessão independente atuando como **Verifier** audita todas as provas no `HEAD`, testando casos de borda e garantindo que asserções não sejam mais frouxas que o critério.
5. **Árvore Limpa para Validação Final**:
   - `validate_verification.py` e `check_proofs.py` exigem estritamente `git status` 100% limpo para atestar conformidade.
6. **Raio de Explosão Delimitado (Blast Radius)**:
   - Aprovações cobrem implementação e commits locais. Comandos destrutivos ou remotos (`git push`, reset, force push) requerem autorização humana pontual explícita.

### 4.3. Parâmetros e Scripts Determinísticos do TLC

Todos os scripts residem em `.agent/skills/tlc-spec-driven/scripts/` e devem ser executados a partir da raiz do projeto:

| Momento                                   | Comando de Validação                                                                  | Finalidade e Parâmetros                                                                                                                |
| :---------------------------------------- | :------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------- |
| **Antes de apresentar a Spec**            | `python .agent/skills/tlc-spec-driven/scripts/validate_spec.py <feature> --strict`    | Valida sintaxe EARS, IDs de requisitos, ausência de números em seções H2 e preenchimento de premissas.                                 |
| **Antes de apresentar as Tasks**          | `python .agent/skills/tlc-spec-driven/scripts/validate_tasks.py <feature>`            | Valida granularidade, tags de metadados sem hífen (`**Where**:`, `**Gate**:`, `**Done When**:`), dependências e bloco `## Checks`.     |
| **Antes de iniciar a Execução (T01)**     | `python .agent/skills/tlc-spec-driven/scripts/validate_tasks.py <feature> --execute`  | Garante aprovação formal registrada em `spec.md` e `tasks.md`, e valida que o comando `**Build**:` passe antes do código.              |
| **Antes de cada Commit Atômico**          | `python .agent/skills/tlc-spec-driven/scripts/check_commit.py --message "<mensagem>"` | Assegura mensagem padronizada e integridade da tarefa concluída.                                                                       |
| **Após a última tarefa implementada**     | `python .agent/skills/tlc-spec-driven/scripts/check_proofs.py <feature>`              | Executa a suíte de provas no `HEAD` e gera o documento `proofs.md`.                                                                    |
| **Antes de declarar a feature concluída** | `python .agent/skills/tlc-spec-driven/scripts/validate_verification.py <feature>`     | Portão final: valida árvore limpa, provas passando no `HEAD`, aprovações documentadas e veredicto do Verificador em `verification.md`. |
| **Gestão de Lições Aprendidas**           | `python .agent/skills/tlc-spec-driven/scripts/lessons.py list --status confirmed`     | Consulta e atualiza o repositório contínuo de lições aprendidas em `.specs/lessons.json`.                                              |

---

## 5. Estrutura de Pastas e Ferramentas

```
├── .agent/skills/         # Habilidades de agentes (instaladas via @tech-leads-club/agent-skills)
├── .agents/               # Lockfile das skills (.skill-lock.json)
├── .specs/features/       # Especificações SDD, tasks, proofs e verificações
├── .vscode/               # Configurações canônicas de extensões e settings para Rust, Svelte e Tauri
├── Docs/                  # Documentação técnica, especificações de produto e comandos rápidos
│   ├── c.md               # Cheat-sheet de comandos rápidos (Web, Desktop, Android)
│   └── PLANO_E_STACK...   # Especificação e arquitetura detalhada
├── src/                   # Código-fonte Svelte 5 (UI, Editor ProseMirror, Componentes)
│   ├── lib/               # Componentes Svelte (Editor, TabBar, Sidebar, TopBar, etc.)
│   ├── prosemirror/       # Schema, Serializador Markdown, Regras de Input
│   └── stores/            # Estados reativos (tema, abas, arquivos, terminal)
├── src-tauri/             # Backend Tauri v2 em Rust
│   ├── capabilities/      # Declaração declarativa de permissões e ACLs (default.json)
│   ├── gen/schemas/       # Schemas de validação gerados pelo tauri-build
│   ├── src/
│   │   ├── commands/      # Módulos IPC (fs_cmd, pty_cmd, ai_cmd, theme_cmd, watcher_cmd)
│   │   ├── utils/         # Módulos auxiliares (tool_path, base64)
│   │   ├── state.rs       # Gestão de estado do terminal e watchers
│   │   ├── lib.rs         # Inicialização do Tauri v2 e registro de plugins
│   │   └── main.rs        # Ponto de entrada binário
│   ├── Cargo.toml         # Crates Rust (tauri v2, portable-pty, notify, serde)
│   └── tauri.conf.json    # Configuração de janelas, build, CSP e bundle
└── package.json           # Dependências frontend e scripts NPM
```

---

## 6. Diretrizes de Compilação Desktop & Toolchain Windows (Tauri v2 + Rust)

- **Detecção Automática do `rc.exe` (Windows Resource Compiler):**
  - O arquivo `src-tauri/build.rs` contém busca de fallback para o compilador de recursos `rc.exe` no diretório canônico `C:\Program Files (x86)\Windows Kits\10\bin\*\x64\rc.exe`.
  - Nunca remova esta rotina para evitar quebras em terminais Windows padrão.
- **Rastreamento de Recursos e Ícones Windows (`icon.ico`):**
  - O arquivo `src-tauri/build.rs` deve conter obrigatoriamente `println!("cargo:rerun-if-changed=icons/icon.ico");` para garantir que alterações no logotipo e nos ícones invalidem o cache de compilação do recurso no Windows.
- **Resolução de PATH Rust/Cargo no PowerShell:**
  - Caso o terminal não encontre `cargo` automaticamente, use o prefixo:
    ```powershell
    $env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
    ```
  - Ou execute via npm: `npm run check:rust`.

---

## 7. Comandos Canônicos do Projeto

Consulte `Docs/c.md` para a lista completa com todas as variáveis de ambiente.

- **Frontend Check:** `npm run check` (svelte-check com TypeScript e Svelte 5)
- **Rust Backend Check:** `npm run check:rust` (cargo check rápido em src-tauri)
- **Rust Linter / Clippy:** `npm run check:clippy` (análise semântica e idiomática de Rust)
- **Rust Unit Tests:** `npm run test:rust` (suíte de testes unitários em Rust)
- **Suíte Completa de Testes JS:** `npm test` (testes automatizados de regressão)
- **Web Dev:** `npm run dev`
- **Desktop Dev:** `npm run tauri dev`
- **Desktop Build:** `npm run tauri build`
- **Android Dev:** `npm run tauri android dev`
- **Android Build:** `npm run tauri android build`
