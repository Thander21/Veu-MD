# Blind claim deck — run `2026-11-09-full`

> Score every row. Some rows may be synthetic calibration rows.
> Do NOT read trap-key.json, claims.jsonl, Judge1 scores, or prior agreement reports.
> README is out of harness scope — do not cite it as rediscovery evidence.

## Rubric

| Cost | Meaning |
|------|---------|
| 0 | Exact string in a discovered manifest/config |
| 1 | Obvious from one directory listing or one file header |
| 2 | Needs reading implementation across modules |
| 3 | Runtime failure, environment-specific, or process/policy |

Classes: REDUNDANT-CODE | REDUNDANT-GENERAL | KEEP-POLICY | KEEP-CAVEAT | KEEP-ROUTING | KEEP-COMPRESSED | UNCLEAR

**Hard rule:** cost ≥ 2 → never REDUNDANT-*. Default UNCLEAR/KEEP when unsure.

## Claims

| ID | Tier | Source | Quote |
|----|------|--------|-------|
| C001 | T0 | `AGENTS.md` | Este documento define as regras operacionais, invariantes arquiteturais, diretrizes de compilação e convenções para agentes de IA atuando no repositório **Veu MD**. |
| C002 | T0 | `AGENTS.md` | O **Veu MD** é um editor de Markdown e texto puro focado em alta velocidade, leveza e experiência visual limpa. |
| C003 | T0 | `AGENTS.md` | **Edição 100% WYSIWYG Estilo Word:** |
| C004 | T0 | `AGENTS.md` | O editor ProseMirror **NUNCA** deve exibir caracteres brutos de formatação Markdown (`#`, `**`, `*`, `>`, ````) no corpo do texto durante leitura ou digitação. |
| C005 | T0 | `AGENTS.md` | A experiência visual deve ser fluida e direta, idêntica a processadores de texto ricos (Word/Pages). |
| C006 | T0 | `AGENTS.md` | **Terminal Veu — Sequencial, Editorial e Interativo (Anti-CRT):** |
| C007 | T0 | `AGENTS.md` | O terminal adota prioritariamente o **Terminal Veu** com fluxo sequencial de blocos, tipografia editorial e parser ANSI semântico nativo (`ansiParser.ts`). O motor `@xterm/xterm` (v5.5.0) é mantido temporariamente em modo de convivência dual-engine via alternador na UI até a validação completa de maturidade do Terminal Veu em produção. |
| C008 | T0 | `AGENTS.md` | **Controle Total & Não-Interceptação de CLIs**: O Terminal Veu **NUNCA** deve interceptar, sequestrar ou redirecionar comandos de terminal (como `agy`, `claude`, `muse`, scripts ou subcomandos como `agy --add`) para gavetas de chat. O usuário possui controle total do PTY com streaming e parada via `Ctrl+C`. |
| C009 | T0 | `AGENTS.md` | **Normalização de ConPTY no Windows**: Retornos de carro (`\r`) e sequências de controle de cursor devem ser processados via `resolveCarriageReturns` para evitar texto sobreposto e ecos duplicados de comandos. |
| C010 | T0 | `AGENTS.md` | **Cold Start Imediato**: A inicialização do shell e seu banner inicial nunca devem ser descartados quando a lista de blocos estiver vazia; ao abrir o painel, a sessão deve estar pronta e o prompt imediatamente focado. |
| C011 | T0 | `AGENTS.md` | O prompt de entrada é interativo e editável com seleção nativa por mouse, navegação por histórico com setas (`ArrowUp`/`ArrowDown`) e clique livre para mover o cursor, posicionado ao final da linha do tempo quando a sessão está ociosa. |
| C012 | T0 | `AGENTS.md` | Durante a execução de um comando, a interface exibe streaming contínuo da saída com status, botão **Parar (`Ctrl+C`)** e ação de escape para liberar o prompt caso o processo silencie sem retorno padronizado. |
| C013 | T0 | `AGENTS.md` | **Eliminação de Processos Zumbis (Win32 ConPTY)**: Toda sessão `TerminalSession` no Rust deve reter o handle do processo filho (`child`). Ao invocar `kill_terminal` (fechamento explícito de projeto), o processo deve ser encerrado com `child.kill()`, impedindo processos órfãos consumindo CPU e memória no Windows. |
| C014 | T0 | `AGENTS.md` | **Barra Lateral Direita Acoplada do Chat IA vs Gaveta Fixa de Temas:** |
| C015 | T0 | `AGENTS.md` | O **Chat IA (`AiAssistantPanel`)** atua como uma barra lateral direita acoplada (`position: relative; height: 100%; flex-shrink: 0;`) inserida diretamente no fluxo de `.workspace` ao lado de `.center-stage`. Isso assegura que o palco central e o editor ProseMirror contraiam proporcionalmente quando o chat estiver aberto, impedindo terminantemente que o chat flutue ou sobreponha o texto do documento em edição. Possui alça interativa de redimensionamento (`.sidebar-resize-handle`) e cabeçalho alinhado a 44px com a `TopBar`. |
| C016 | T0 | `AGENTS.md` | Painéis de configuração rápida e transitória como **`ThemeSettings`** permanecem como gavetas fixas flutuantes (`position: fixed; right: 0; top: 44px; bottom: 24px; z-index: 40;`), pois são diálogos de ajuste estético pontual e não barras laterais de trabalho contínuo. |
| C017 | T0 | `AGENTS.md` | **Anti-Loop Reativo em Svelte 5:** |
| C018 | T0 | `AGENTS.md` | **NUNCA** altere propriedades diretas de nós DOM capturados por `bind:this` (ex: `inputEl.style.height = ...`) dentro de blocos reativos `$:` ou `$effect`. |
| C019 | T0 | `AGENTS.md` | Isso dispara `mutate()` recursivamente a cada microtask no Svelte 5 e congela a thread da UI a 100% de CPU. Use sentinelas pontuais de transição de estado (`let prevVisible = false; $: if (visible && !prevVisible) ...`) desacopladas com `setTimeout(..., 60)` e estilize tamanhos padrão via CSS (`min-height`). |
| C020 | T0 | `AGENTS.md` | Tags `<svelte:window>` devem permanecer obrigatoriamente no nível superior do markup, nunca aninhadas em blocos condicionais como `{#if}`. |
| C021 | T0 | `AGENTS.md` | **Persistência e Continuidade do Terminal Multi-Projeto:** |
| C022 | T0 | `AGENTS.md` | **NUNCA** destrua o `<TerminalPanel>` usando blocos de re-renderização reativa como `{#key currentFolderPath}` ou `{#if visible}` ao recolher o painel. |
| C023 | T0 | `AGENTS.md` | O painel deve ser ocultado estritamente via classe CSS `.hidden` (`display: none`), preservando compilações, servidores locais e histórico de comandos em background ao alternar entre abas ou recolher com `Ctrl + '`. |
| C024 | T0 | `AGENTS.md` | O comando `kill_terminal` no backend Rust só deve ser disparado quando a aba do projeto for **explicitamente fechada** pelo usuário (`closeProject`), nunca durante troca de foco ou minimização. |
| C025 | T0 | `AGENTS.md` | **Sincronização Atômica de Workspace e Debounce de Storage:** |
| C026 | T0 | `AGENTS.md` | Na alternância de projetos (`switchToProject`), o carregamento assíncrono de arquivos deve ser protegido por uma sentinela atômica (`isSwitchingProject`), impedindo que microtasks de I/O disparem blocos reativos que sobrescrevam abas do projeto de destino com dados defasados. |
| C027 | T0 | `AGENTS.md` | A serialização e salvamento em `localStorage` durante digitação no editor deve conter debounce de 500ms, evitando I/O síncrono bloqueante a cada caractere digitado. |
| C028 | T0 | `AGENTS.md` | Listeners IPC registrados em `onMount` (ex: `listen('file-changed-externally')`) devem armazenar o handle de `unlisten` e executá-lo obrigatoriamente no `onDestroy`. |
| C029 | T0 | `AGENTS.md` | **Segurança Operacional, CSP e Sanitização de Caminhos:** |
| C030 | T0 | `AGENTS.md` | A Content Security Policy (CSP) em `tauri.conf.json` deve permitir estritamente recursos locais (`'self'`, `asset:`, `asset.localhost`), com permissão explícita para Google Fonts (`https://fonts.googleapis.com`, `https://fonts.gstatic.com`) e imagens remotas em Markdown (`https:`, `blob:`). |
| C031 | T0 | `AGENTS.md` | Comandos Rust de escrita (`save_image_asset`, `save_custom_theme`) devem aplicar extração estrita de nome base (`Path::file_name()`) e validação alfanumérica, neutralizando vulnerabilidades de _Path Traversal_ (`../../`). |
| C032 | T0 | `AGENTS.md` | **Anti-Bloat & Filtro Inegociável de Leveza:** |
| C033 | T0 | `AGENTS.md` | O footprint do app deve permanecer em ~5 MB a repouso com cold start < 300 ms. |
| C034 | T0 | `AGENTS.md` | É estritamente proibido embutir runtimes pesados (Node.js/npm no host, modelos de IA embutidos como Whisper de 500MB, ou WebViews secundárias para login). |
| C035 | T0 | `AGENTS.md` | **Formatador de Código Embutido Leve (Zero-Bloat)**: A formatação de linguagens estruturadas (JSON, HTML, JS/TS/CSS, Markdown) é provida por formatadores puros em TypeScript (`codeFormatter.ts`), sem dependências pesadas externas (Prettier, Biome, Dprint) para preservar a integridade do binário leve. |
| C036 | T0 | `AGENTS.md` | **Fidelidade no Disco (.md Puro Padrão GFM):** |
| C037 | T0 | `AGENTS.md` | O documento em memória é serializado para Markdown padrão GitHub Flavored Markdown (GFM) com fidelidade total (tabelas, checklists, citações, código, imagens). |
| C038 | T0 | `AGENTS.md` | Qualquer outro editor de texto ou visualizador de repositório deve ler o arquivo normalmente com todas as tags canônicas. |
| C039 | T0 | `AGENTS.md` | **Abertura e Foco de Arquivos:** |
| C040 | T0 | `AGENTS.md` | Na árvore lateral (Explorer), apenas arquivos com extensão `.md` e `.txt` são abertos para edição no editor ProseMirror. |
| C041 | T0 | `AGENTS.md` | Arquivos de imagens (`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.bmp`, `.ico`) e vetores (`.svg`) são abertos como abas ativas dedicadas no componente `ImageViewer`. |
| C042 | T0 | `AGENTS.md` | Demais arquivos podem ser navegados ou gerenciados no Explorer, mas não abertos para edição direta de texto. |
| C043 | T0 | `AGENTS.md` | **Visualização de Imagens e Vetores SVG (Dual-Mode):** |
| C044 | T0 | `AGENTS.md` | O componente `ImageViewer` deve prover visualização gráfica centrada com controles de zoom e pan. |
| C045 | T0 | `AGENTS.md` | Para arquivos SVG, a barra de ferramentas deve oferecer alternância fluida entre visualização gráfica renderizada e inspeção/cópia do código-fonte XML nativo. |
| C046 | T0 | `AGENTS.md` | **Padronização do Ícone Canônico de Markdown (.md):** |
| C047 | T0 | `AGENTS.md` | Todos os nós de arquivos Markdown (`.md`, `.markdown`) na árvore lateral (`FileTreeNode`), na barra lateral (`Sidebar`) e na barra de abas (`TabBar`) **DEVEM** renderizar o componente canônico `VeuMdIcon`. |
| C048 | T0 | `AGENTS.md` | O ícone segue a estética oficial do _Material Icon Theme_ do VS Code (fundo roxo `#ab47bc` com cantos arredondados e os glifos brancos `M` e `↓`). É estritamente proibido substituir este ícone por logotipos com a letra "V" de Veu ou ícones genéricos de texto puro. |
| C049 | T0 | `AGENTS.md` | **Comportamento e Retração da Gaveta do Chat IA:** |
| C050 | T0 | `AGENTS.md` | Ao abrir a gaveta lateral do Chat IA (`AiAssistantPanel`), o botão disparador externo na barra superior (`TopBar`) **DEVE** ser ocultado (`{#if !aiAssistantOpen}`). |
| C051 | T0 | `AGENTS.md` | O ícone do assistente posicionado no canto superior esquerdo do cabeçalho da gaveta atua obrigatoriamente como ação direta de retração (`on:click={onClose}`), permitindo recolher a gaveta sem depender unicamente do botão `X`. |
| C052 | T0 | `AGENTS.md` | **Foco Editorial da Tela Inicial do Chat IA:** |
| C053 | T0 | `AGENTS.md` | O estado vazio (`messages.length === 0`) do Chat IA deve exibir exclusivamente o cabeçalho editorial de boas-vindas e os chips de ação rápida focados na assistência à escrita (_Revisar clareza e estilo_, _Resumo em 3 tópicos_, _Estruturar novos tópicos_, _Introdução envolvente_). |
| C054 | T0 | `AGENTS.md` | **NUNCA** insira cards intrusivos de execução de linha de comando ("Iniciar Normal" ou "Permissão Total") na tela inicial de chat; tais ações pertencem exclusivamente ao `TerminalPanel` ou às visões de Wizard/Configurações (`AiSettingsView`). |
| C055 | T0 | `AGENTS.md` | **Performance de Temas via GPU:** |
| C056 | T0 | `AGENTS.md` | Todas as cores de elementos semânticos (H1..H6, negrito, itálico, citações, inline code, blocos de código, tabelas, links) e espaçamentos são aplicados estritamente via CSS Custom Properties no `:root`. |
| C057 | T0 | `AGENTS.md` | A troca de tema ocorre sem recálculo de árvore DOM no JavaScript (custo zero de CPU / re-render pela GPU). |
| C058 | T0 | `AGENTS.md` | O tema canônico de primeiro uso é **"Veu MD (Oficial)"** (`veumd`) com a paleta Catppuccin Mocha (`#11111b`, `#181825`, `#1e1e2e`, `#cba6f7`, `#f5c2e7`) e tipografia Roboto. |
| C059 | T0 | `AGENTS.md` | O tema legado **"Veu Crepúsculo"** (`veu`) permanece disponível para os usuários que apreciam a estética crepúsculo obsidian original. |
| C060 | T0 | `AGENTS.md` | O drawer de temas deve disponibilizar seleção via Dropdown; qualquer ajuste manual feito pelo usuário em cores, medidas ou fontes deve comutar automaticamente o seletor para **"Personalizado"** (`custom`). |
| C061 | T0 | `AGENTS.md` | **Ergonomia e Invariantes da Barra de Projetos:** |
| C062 | T0 | `AGENTS.md` | **NUNCA** sobreponha botões flutuantes de fechar (`X`) no topo dos avatares de projetos na barra de atividades, evitando cliques acidentais e poluição visual. |
| C063 | T0 | `AGENTS.md` | A ação de fechar projeto deve ter destaque visual em vermelho vivo (`#ef4444`), localizada após o nome da pasta no cabeçalho do Explorer ou acionada via clique com botão direito no avatar. |
| C064 | T0 | `AGENTS.md` | **Segregação Semântica da Barra Superior (TopBar) e Zero Duplicidades:** |
| C065 | T0 | `AGENTS.md` | As ações que operam diretamente sobre o documento em edição (_Salvar_, _Exportar PDF/Imprimir_, _Copiar HTML_) pertencem ao grupo de formatação do editor ProseMirror, posicionadas ao final após _Desfazer/Refazer_. |
| C066 | T0 | `AGENTS.md` | O grupo esquerdo da TopBar reserva-se a ações de contexto (_Alternar Barra Lateral_, _Abrir/Trocar Pasta_, _Assistente IA Wizard_ e _Localizador Rápido Ctrl+P_). |
| C067 | T0 | `AGENTS.md` | Ações de criação de arquivos e pastas pertencem exclusivamente à barra de ferramentas do Explorer, evitando duplicações desnecessárias no topo. |
| C068 | T0 | `AGENTS.md` | O terminal integrado possui seus pontos de acesso canônicos no topo direito e na barra de status; nunca o duplique dentro da barra de ferramentas do Explorer. |
| C069 | T0 | `AGENTS.md` | A arquitetura do backend é rigorosamente segregada por domínios de responsabilidade: |
| C070 | T0 | `AGENTS.md` | **`commands/`**: Handlers IPC invocados pelo frontend via `invoke()`: |
| C071 | T0 | `AGENTS.md` | `fs_cmd.rs`: Operações seguras de sistema de arquivos (leitura de árvore de diretórios, leitura/escrita de arquivos, salvamento de imagens e verificação de existência). |
| C072 | T0 | `AGENTS.md` | `pty_cmd.rs`: Gestão de sessões de terminal interativo (`portable-pty`), spawn de PTY, redimensionamento de janela, escrita de dados no stdin e encerramento sem processos zumbis (`kill_terminal`). |
| C073 | T0 | `AGENTS.md` | `ai_cmd.rs`: Execução segura e streaming contínuo de ferramentas CLI de IA locais (`claude`, `muse`, scripts). |
| C074 | T0 | `AGENTS.md` | `theme_cmd.rs`: Persistência atômica de temas personalizados no diretório de dados do usuário. |
| C075 | T0 | `AGENTS.md` | `watcher_cmd.rs`: Monitoramento reativo de alterações em disco via `notify`, com debounce para evitar notificações concorrentes redundantes. |
| C076 | T0 | `AGENTS.md` | **`utils/`**: Utilitários puros e auxiliares de baixo nível: |
| C077 | T0 | `AGENTS.md` | `tool_path.rs`: Resolução agnóstica de executáveis e ferramentas CLI no PATH do sistema operacional Windows/macOS/Linux. |
| C078 | T0 | `AGENTS.md` | `base64.rs`: Codificação e decodificação eficiente de payloads binários sem overhead de crates pesadas. |
| C079 | T0 | `AGENTS.md` | **`state.rs`**: Estruturas de estado global compartilhado injetadas no runtime do Tauri via `tauri::State` (ex: `TerminalState` protegendo instâncias ativas com `Mutex<HashMap<String, TerminalSession>>`). |
| C080 | T0 | `AGENTS.md` | **`lib.rs`**: Ponto central de inicialização do Tauri v2, registro de plugins oficiais e montagem de comandos IPC (`generate_handler!`). |
| C081 | T0 | `AGENTS.md` | **`main.rs`**: Ponto de entrada canônico que delega diretamente a execução para `lib::run()`. |
| C082 | T0 | `AGENTS.md` | O Tauri v2 adota o modelo de segurança declarativa baseado em **Capabilities** e **Listas de Controle de Acesso (ACL)**: |
| C083 | T0 | `AGENTS.md` | **Declaração Central de Capabilities (`src-tauri/capabilities/default.json`)**: |
| C084 | T0 | `AGENTS.md` | Define as permissões estritas concedidas à janela principal (`main`). |
| C085 | T0 | `AGENTS.md` | `core:default`: Ciclo de vida básico e infraestrutura IPC de eventos. |
| C086 | T0 | `AGENTS.md` | `shell:default`: Acesso controlado ao subsistema de execução de subprocessos. |
| C087 | T0 | `AGENTS.md` | `fs:default`: Operações de I/O em arquivos com escopos delimitados. |
| C088 | T0 | `AGENTS.md` | `dialog:default`: Caixas de diálogo nativas do sistema operacional (abrir pasta/arquivo). |
| C089 | T0 | `AGENTS.md` | **Validação Estrita em Build (`tauri-build`)**: |
| C090 | T0 | `AGENTS.md` | O crate `tauri-build` em tempo de compilação gera os schemas em `src-tauri/gen/schemas/` e valida todas as permissões declaradas contra os manifests de ACL. |
| C091 | T0 | `AGENTS.md` | Qualquer referência a permissão inexistente ou incompatível bloqueia o build imediatamente antes da compilação do Rust. |
| C092 | T0 | `AGENTS.md` | **Invariantes de Segurança do IPC**: |
| C093 | T0 | `AGENTS.md` | **Sanitização de Caminhos & Anti-Traversal**: Comandos Rust que gravam arquivos (`save_image_asset`, `save_custom_theme`) aplicam extração canônica de nome base (`Path::file_name()`) e validações estritas, rejeitando qualquer padrão de evasão de diretório (`..`, `/`, `\`). |
| C094 | T0 | `AGENTS.md` | **Content Security Policy (CSP)**: Configurada em `tauri.conf.json` para bloquear fontes externas não autorizadas, restringindo a origens locais (`'self'`, `asset:`), Google Fonts e imagens remotas em Markdown via `https:`. |
| C095 | T0 | `AGENTS.md` | O projeto adota a metodologia Spec-Driven Development através do framework canônico `tlc-spec-driven` localizado em `.agent/skills/tlc-spec-driven/`. |
| C096 | T0 | `AGENTS.md` | **Auto-Sizing de Complexidade**: |
| C097 | T0 | `AGENTS.md` | **Small** (≤ 3 arquivos, alteração pontual): Spec inline, pula Design e Tasks; implementa e valida diretamente. |
| C098 | T0 | `AGENTS.md` | **Medium** (Feature clara, < 10 tarefas): Spec conciso, pula Design formal, tarefas implícitas ou diretas; implementa e valida. |
| C099 | T0 | `AGENTS.md` | **Large** (Multi-componente, muitas interfaces): Spec completo com IDs rastreáveis (EARS), Design de arquitetura e breakdown completo de tarefas atômicas em `tasks.md`. |
| C100 | T0 | `AGENTS.md` | **Complex** (Ambiguidade, novo domínio): Spec completo com discussão prévia de áreas cinzentas (`context.md`), Design de arquitetura com pesquisa e plano de validação/UAT. |
| C101 | T0 | `AGENTS.md` | **Parada Obrigatória para Aprovação Humana**: |
| C102 | T0 | `AGENTS.md` | NUNCA inicie a Fase de Execução (Fase 4) sem antes: a) Esclarecer todas as áreas cinzentas (_gray areas_) com o usuário e documentá-las em `.specs/features/<feature>/context.md`. b) Apresentar `spec.md` e `tasks.md` e aguardar aprovação explícita do usuário. c) Registrar a aprovação formal com a citação exata das palavras do usuário: `**Approved**: <data> - user: "<suas palavras>"`. |
| C103 | T0 | `AGENTS.md` | **Testes Derivados dos Critérios de Aceite**: |
| C104 | T0 | `AGENTS.md` | Os testes validam o comportamento especificado, nunca espelham a implementação. |
| C105 | T0 | `AGENTS.md` | **Commit Atômico com Portão Determinístico**: |
| C106 | T0 | `AGENTS.md` | Uma tarefa por commit atômico (`tasks.md` atualizada antes do commit). O script `check_commit.py` valida o portão antes de cada commit. |
| C107 | T0 | `AGENTS.md` | **Verificação Independente Obrigatória (Autor ≠ Verificador)**: |
| C108 | T0 | `AGENTS.md` | Ao finalizar a última tarefa, o script `check_proofs.py` consolida as evidências em `proofs.md`. |
| C109 | T0 | `AGENTS.md` | Um sub-agente ou sessão independente atuando como **Verifier** audita todas as provas no `HEAD`, testando casos de borda e garantindo que asserções não sejam mais frouxas que o critério. |
| C110 | T0 | `AGENTS.md` | **Árvore Limpa para Validação Final**: |
| C111 | T0 | `AGENTS.md` | `validate_verification.py` e `check_proofs.py` exigem estritamente `git status` 100% limpo para atestar conformidade. |
| C112 | T0 | `AGENTS.md` | **Raio de Explosão Delimitado (Blast Radius)**: |
| C113 | T0 | `AGENTS.md` | Aprovações cobrem implementação e commits locais. Comandos destrutivos ou remotos (`git push`, reset, force push) requerem autorização humana pontual explícita. |
| C114 | T0 | `AGENTS.md` | Todos os scripts residem em `.agent/skills/tlc-spec-driven/scripts/` e devem ser executados a partir da raiz do projeto: |
| C115 | T0 | `AGENTS.md` | **Detecção Automática do `rc.exe` (Windows Resource Compiler):** |
| C116 | T0 | `AGENTS.md` | O arquivo `src-tauri/build.rs` contém busca de fallback para o compilador de recursos `rc.exe` no diretório canônico `C:\Program Files (x86)\Windows Kits\10\bin\*\x64\rc.exe`. |
| C117 | T0 | `AGENTS.md` | Nunca remova esta rotina para evitar quebras em terminais Windows padrão. |
| C118 | T0 | `AGENTS.md` | **Rastreamento de Recursos e Ícones Windows (`icon.ico`):** |
| C119 | T0 | `AGENTS.md` | O arquivo `src-tauri/build.rs` deve conter obrigatoriamente `println!("cargo:rerun-if-changed=icons/icon.ico");` para garantir que alterações no logotipo e nos ícones invalidem o cache de compilação do recurso no Windows. |
| C120 | T0 | `AGENTS.md` | **Resolução de PATH Rust/Cargo no PowerShell:** |
| C121 | T0 | `AGENTS.md` | Caso o terminal não encontre `cargo` automaticamente, use o prefixo: |
| C122 | T0 | `AGENTS.md` | Ou execute via npm: `npm run check:rust`. |
| C123 | T0 | `AGENTS.md` | Consulte `Docs/c.md` para a lista completa com todas as variáveis de ambiente. |
| C124 | T0 | `AGENTS.md` | **Frontend Check:** `npm run check` (svelte-check com TypeScript e Svelte 5) |
| C125 | T0 | `AGENTS.md` | **Rust Backend Check:** `npm run check:rust` (cargo check rápido em src-tauri) |
| C126 | T0 | `AGENTS.md` | **Rust Linter / Clippy:** `npm run check:clippy` (análise semântica e idiomática de Rust) |
| C127 | T0 | `AGENTS.md` | **Rust Unit Tests:** `npm run test:rust` (suíte de testes unitários em Rust) |
| C128 | T0 | `AGENTS.md` | **Suíte Completa de Testes JS:** `npm test` (testes automatizados de regressão) |
| C129 | T0 | `AGENTS.md` | **Web Dev:** `npm run dev` |
| C130 | T0 | `AGENTS.md` | **Desktop Dev:** `npm run tauri dev` |
| C131 | T0 | `AGENTS.md` | **Desktop Build:** `npm run tauri build` |
| C132 | T0 | `AGENTS.md` | **Android Dev:** `npm run tauri android dev` |
| C133 | T0 | `AGENTS.md` | **Android Build:** `npm run tauri android build` |
| C134 | T1 | `.agent/skills/best-practices/SKILL.md` | Apply modern web development best practices for security, compatibility, and code quality. Use when asked to "apply best practices", "security audit", "modernize code", "code quality review", or "check for vulnerabilities". Do NOT use for accessibility (use web-accessibility), SEO (use seo), performance (use core-web-vitals), or comprehensive multi-area audits (use web-quality-audit). |
| C135 | T1 | `.agent/skills/best-practices/SKILL.md` | Modern web development standards based on Lighthouse best practices audits. Covers security, browser compatibility, and code quality patterns. |
| C136 | T1 | `.agent/skills/best-practices/SKILL.md` | **CSP Header (recommended):** |
| C137 | T1 | `.agent/skills/best-practices/SKILL.md` | **Using nonces for inline scripts:** |
| C138 | T1 | `.agent/skills/best-practices/SKILL.md` | **Keep dependencies updated:** |
| C139 | T1 | `.agent/skills/best-practices/SKILL.md` | **Known vulnerable patterns to avoid:** |
| C140 | T1 | `.agent/skills/codenavi/SKILL.md` | Your pathfinder for navigating unknown codebases. Investigates with precision, implements surgically, and never assumes — if it doesn't know, it says so. Maintains a .notebook/ knowledge base that grows across sessions, turning every discovery into lasting intelligence. Summons available skills, MCPs, and docs when the mission demands. Use when fixing bugs, implementing features, refactoring, investigating flows, or any development task in unfamiliar territory. Triggers on "fix this", "implement |
| C141 | T1 | `.agent/skills/codenavi/SKILL.md` | You are the developer's companion — a methodical pathfinder for navigating unfamiliar, messy, or undocumented codebases. You investigate before acting, execute with surgical precision, and never assume what you don't know. Every discovery you make becomes lasting intelligence in the project's `.notebook/`. You and the developer are on this quest together. Your job is to make the mission succeed — no wasted effort, no guesswork, no collateral damage. |
| C142 | T1 | `.agent/skills/codenavi/SKILL.md` | These rules override everything else. They are non-negotiable. |
| C143 | T1 | `.agent/skills/codenavi/SKILL.md` | **Never assume, never invent.** If you don't know, say "I don't know — I need more context." Uncertainty is always explicit. |
| C144 | T1 | `.agent/skills/codenavi/SKILL.md` | **If it cost investigation, it deserves a note.** Knowledge that would take time to rediscover goes into `.notebook/`. |
| C145 | T1 | `.agent/skills/codenavi/SKILL.md` | **Pointers, not copies.** Reference code by `file:function()` or `file` (L10-25). Never paste code blocks into notes. |
| C146 | T1 | `.agent/skills/codenavi/SKILL.md` | **Surgical precision.** Touch only what the mission requires. Match existing style. Leave unrelated code alone. |
| C147 | T1 | `.agent/skills/codenavi/SKILL.md` | **Verify against source, not memory.** Language best practices, API signatures, framework behavior — always confirm with current documentation before acting. |
| C148 | T1 | `.agent/skills/codenavi/SKILL.md` | Every task follows this cycle. No exceptions, no shortcuts. |
| C149 | T1 | `.agent/skills/codenavi/SKILL.md` | Understand the mission before moving. |
| C150 | T1 | `.agent/skills/codenavi/SKILL.md` | Read `.notebook/INDEX.md` if it exists. This is your accumulated intelligence about the project — use it. |
| C151 | T1 | `.agent/skills/codenavi/SKILL.md` | Listen to the developer's request. Identify: |
| C152 | T1 | `.agent/skills/codenavi/SKILL.md` | What is the objective? |
| C153 | T1 | `.agent/skills/codenavi/SKILL.md` | What does success look like? |
| C154 | T1 | `.agent/skills/codenavi/SKILL.md` | What constraints exist? |
| C155 | T1 | `.agent/skills/codenavi/SKILL.md` | If anything is unclear, ask. Do not proceed with ambiguity. Frame questions precisely: "I need to understand X before I can Y." |
| C156 | T1 | `.agent/skills/codenavi/SKILL.md` | Scan for allies — check what tools, skills, and MCPs are available in the current environment. Note them for later use. |
| C157 | T1 | `.agent/skills/codenavi/SKILL.md` | Expected output: A clear understanding of what needs to happen and why. |
| C158 | T1 | `.agent/skills/codenavi/SKILL.md` | Investigate the relevant parts of the codebase. Only the relevant parts. |
| C159 | T1 | `.agent/skills/codenavi/SKILL.md` | Start from the entry point closest to the problem. Do not read the entire project. |
| C160 | T1 | `.agent/skills/codenavi/SKILL.md` | Trace the flow that relates to the mission. Follow imports, calls, and data paths. |
| C161 | T1 | `.agent/skills/codenavi/SKILL.md` | Check `.notebook/` entries that might be relevant (INDEX.md tags). |
| C162 | T1 | `.agent/skills/codenavi/SKILL.md` | Note what you find — patterns, conventions, surprises, gotchas. Hold these for the Debrief. |
| C163 | T1 | `.agent/skills/codenavi/SKILL.md` | Token discipline during Recon: |
| C164 | T1 | `.agent/skills/codenavi/SKILL.md` | Read function signatures and key logic, not every line of every file. |
| C165 | T1 | `.agent/skills/codenavi/SKILL.md` | If a file is large, read the relevant section, not the whole file. |
| C166 | T1 | `.agent/skills/codenavi/SKILL.md` | Use search/grep to find what you need instead of reading sequentially. |
| C167 | T1 | `.agent/skills/codenavi/SKILL.md` | If the project has existing docs, check them first. |
| C168 | T1 | `.agent/skills/codenavi/SKILL.md` | Expected output: Enough understanding to form a plan. No more. |
| C169 | T1 | `.agent/skills/codenavi/SKILL.md` | Present the plan before executing. Always. |
| C170 | T1 | `.agent/skills/codenavi/SKILL.md` | Each step has a verification criterion. No vague steps. |
| C171 | T1 | `.agent/skills/codenavi/SKILL.md` | If the plan requires knowledge you're unsure about, flag it: "I need to verify X before step N — will consult docs." |
| C172 | T1 | `.agent/skills/codenavi/SKILL.md` | If the plan is trivial (rename a variable, fix a typo), keep it proportional — a one-liner plan for a one-liner fix. |
| C173 | T1 | `.agent/skills/codenavi/SKILL.md` | Wait for developer confirmation before executing. If the developer has given prior authorization to proceed autonomously on simple tasks, respect that — but still show the plan. |
| C174 | T1 | `.agent/skills/codenavi/SKILL.md` | Expected output: A plan the developer can approve, modify, or reject. |
| C175 | T1 | `.agent/skills/codenavi/SKILL.md` | Implement the approved plan. Follow these principles: |
| C176 | T1 | `.agent/skills/codenavi/SKILL.md` | **Simplicity first** |
| C177 | T1 | `.agent/skills/codenavi/SKILL.md` | Minimum code that solves the problem. Nothing speculative. |
| C178 | T1 | `.agent/skills/codenavi/SKILL.md` | No features beyond what was asked. |
| C179 | T1 | `.agent/skills/codenavi/SKILL.md` | No abstractions for single-use code. |
| C180 | T1 | `.agent/skills/codenavi/SKILL.md` | No premature flexibility or configurability. |
| C181 | T1 | `.agent/skills/codenavi/SKILL.md` | If you wrote 200 lines and it could be 50, rewrite it. |
| C182 | T1 | `.agent/skills/codenavi/SKILL.md` | **Surgical changes** |
| C183 | T1 | `.agent/skills/codenavi/SKILL.md` | Only touch what the plan requires. |
| C184 | T1 | `.agent/skills/codenavi/SKILL.md` | Match existing code style, even if you'd do it differently. |
| C185 | T1 | `.agent/skills/codenavi/SKILL.md` | If your changes create orphaned imports or variables, clean them. |
| C186 | T1 | `.agent/skills/codenavi/SKILL.md` | Do NOT clean pre-existing dead code unless asked. |
| C187 | T1 | `.agent/skills/codenavi/SKILL.md` | Every changed line traces directly to the mission objective. |
| C188 | T1 | `.agent/skills/codenavi/SKILL.md` | **Verify knowledge before applying it** |
| C189 | T1 | `.agent/skills/codenavi/SKILL.md` | Before using any API, framework method, or language feature you're not 100% certain about, consult documentation. |
| C190 | T1 | `.agent/skills/codenavi/SKILL.md` | Follow the Knowledge Verification Chain (see below). |
| C191 | T1 | `.agent/skills/codenavi/SKILL.md` | Follow the language's official best practices and conventions. |
| C192 | T1 | `.agent/skills/codenavi/SKILL.md` | If best practices conflict with the project's existing style, raise it to the developer — don't silently change conventions. |
| C193 | T1 | `.agent/skills/codenavi/SKILL.md` | For detailed coding principles, read `references/coding-principles.md`. |
| C194 | T1 | `.agent/skills/codenavi/SKILL.md` | Expected output: Clean implementation that solves exactly what was asked. |
| C195 | T1 | `.agent/skills/codenavi/SKILL.md` | Validate the work against the plan's success criteria. |
| C196 | T1 | `.agent/skills/codenavi/SKILL.md` | Check each verification criterion from the Plan. |
| C197 | T1 | `.agent/skills/codenavi/SKILL.md` | If tests exist, run them. If the mission was a bug fix, confirm the bug no longer reproduces. |
| C198 | T1 | `.agent/skills/codenavi/SKILL.md` | If something doesn't pass, fix it before declaring success. |
| C199 | T1 | `.agent/skills/codenavi/SKILL.md` | If you cannot verify (no tests, no way to run the code), be explicit: "I cannot verify this automatically — here's what to check manually: [specific steps]." |
| C200 | T1 | `.agent/skills/codenavi/SKILL.md` | Expected output: Confirmation that the mission is complete, or a clear statement of what still needs attention. |
| C201 | T1 | `.agent/skills/codenavi/SKILL.md` | The mission is done. Now capture what you learned. |
| C202 | T1 | `.agent/skills/codenavi/SKILL.md` | Ask yourself: "Did I discover anything during this mission that would cost time to rediscover?" |
| C203 | T1 | `.agent/skills/codenavi/SKILL.md` | **Triggers for creating a note:** |
| C204 | T1 | `.agent/skills/codenavi/SKILL.md` | You had to read 3+ files to understand a flow → document the flow |
| C205 | T1 | `.agent/skills/codenavi/SKILL.md` | Something didn't work as the name or interface suggested → gotcha |
| C206 | T1 | `.agent/skills/codenavi/SKILL.md` | You found a pattern the codebase repeats → document the pattern |
| C207 | T1 | `.agent/skills/codenavi/SKILL.md` | You encountered a business term that isn't obvious → domain entry |
| C208 | T1 | `.agent/skills/codenavi/SKILL.md` | You found a dependency or integration that's not straightforward → flow |
| C209 | T1 | `.agent/skills/codenavi/SKILL.md` | **Triggers for updating an existing note:** |
| C210 | T1 | `.agent/skills/codenavi/SKILL.md` | New information enriches a note you read during Recon |
| C211 | T1 | `.agent/skills/codenavi/SKILL.md` | A gotcha you documented now has a known fix |
| C212 | T1 | `.agent/skills/codenavi/SKILL.md` | A flow changed because of the work you just did |
| C213 | T1 | `.agent/skills/codenavi/SKILL.md` | **Triggers for NOT creating a note:** |
| C214 | T1 | `.agent/skills/codenavi/SKILL.md` | The discovery is trivial (obvious from file names or comments) |
| C215 | T1 | `.agent/skills/codenavi/SKILL.md` | The information exists in the project's own documentation |
| C216 | T1 | `.agent/skills/codenavi/SKILL.md` | The note would be a copy of what's already in the code |
| C217 | T1 | `.agent/skills/codenavi/SKILL.md` | For the `.notebook/` format specification, read `references/notebook-spec.md`. |
| C218 | T1 | `.agent/skills/codenavi/SKILL.md` | Expected output: Updated `.notebook/` with new intelligence, or explicit decision that nothing worth noting was discovered. |
| C219 | T1 | `.agent/skills/codenavi/SKILL.md` | You don't work alone. Before struggling with a task, check your allies. |
| C220 | T1 | `.agent/skills/codenavi/SKILL.md` | **Available skills** — Check if another loaded skill handles part of the task better (e.g., a skill for creating documents, a skill for specific frameworks). Use `view` on the available skills list if unsure. |
| C221 | T1 | `.agent/skills/codenavi/SKILL.md` | **MCP servers** — Check if connected MCPs provide relevant tools. Priority MCPs for development: |
| C222 | T1 | `.agent/skills/codenavi/SKILL.md` | **Context7** → current documentation for any library or framework. Always prefer this for doc lookups. |
| C223 | T1 | `.agent/skills/codenavi/SKILL.md` | **Any other connected MCP** that provides relevant capabilities. |
| C224 | T1 | `.agent/skills/codenavi/SKILL.md` | **Web search** — When no MCP can answer, search the web for current documentation, Stack Overflow solutions, or GitHub issues. |
| C225 | T1 | `.agent/skills/codenavi/SKILL.md` | **Built-in tools** — File operations, bash commands, code execution — use what's available in the environment. |
| C226 | T1 | `.agent/skills/codenavi/SKILL.md` | When you need to verify how something works: |
| C227 | T1 | `.agent/skills/codenavi/SKILL.md` | Never skip to step 5 if steps 1-4 are available. And step 5 is always flagged as uncertain — never presented as fact. |
| C228 | T1 | `.agent/skills/codenavi/SKILL.md` | Not every mission needs the full ceremony. Scale the cycle to the task. |
| C229 | T1 | `.agent/skills/codenavi/SKILL.md` | **Trivial** (typo fix, rename, simple change): |
| C230 | T1 | `.agent/skills/codenavi/SKILL.md` | Briefing: understood → Plan: one-liner → Execute → Verify → Debrief: skip |
| C231 | T1 | `.agent/skills/codenavi/SKILL.md` | Total: ~30 seconds of overhead |
| C232 | T1 | `.agent/skills/codenavi/SKILL.md` | **Standard** (bug fix, small feature, refactoring): |
| C233 | T1 | `.agent/skills/codenavi/SKILL.md` | Full cycle. Plan is 3-5 steps. Debrief captures 0-2 notes. |
| C234 | T1 | `.agent/skills/codenavi/SKILL.md` | **Complex** (cross-module feature, architectural change, deep investigation): |
| C235 | T1 | `.agent/skills/codenavi/SKILL.md` | Full cycle with extended Recon. Plan may need developer input at multiple points. Debrief likely produces 2-5 notes. |
| C236 | T1 | `.agent/skills/codenavi/SKILL.md` | **Exploration** (understanding a flow, onboarding to a module): |
| C237 | T1 | `.agent/skills/codenavi/SKILL.md` | Recon IS the mission. Plan becomes "investigate X, document Y." Debrief is the primary deliverable. |
| C238 | T1 | `.agent/skills/codenavi/SKILL.md` | This is what the developer can always expect from you: |
| C239 | T1 | `.agent/skills/codenavi/SKILL.md` | You always read `.notebook/INDEX.md` first if it exists. |
| C240 | T1 | `.agent/skills/codenavi/SKILL.md` | You always show a plan before executing non-trivial changes. |
| C241 | T1 | `.agent/skills/codenavi/SKILL.md` | You never present uncertain information as fact. |
| C242 | T1 | `.agent/skills/codenavi/SKILL.md` | You never modify code outside the scope of the current mission. |
| C243 | T1 | `.agent/skills/codenavi/SKILL.md` | You always verify against current docs, not training memory. |
| C244 | T1 | `.agent/skills/codenavi/SKILL.md` | You always flag when you've reached the limit of what you know. |
| C245 | T1 | `.agent/skills/codenavi/SKILL.md` | You always capture valuable discoveries in `.notebook/`. |
| C246 | T1 | `.agent/skills/codenavi/SKILL.md` | You always summon allies when they can help. |
| C247 | T1 | `.agent/skills/codenavi/SKILL.md` | You always match the project's existing code style. |
| C248 | T1 | `.agent/skills/codenavi/SKILL.md` | You always communicate in the developer's language (the human language they use, not the programming language). |
| C249 | T1 | `.agent/skills/harness-eval/SKILL.md` | Evaluate a repo agent harness (AGENTS.md, rules, skills, skill refs) for broken paths/commands, redundant instructions, and usefulness using a stack-agnostic dual-judge protocol with planted traps. HIGH PRIORITY questionnaires at top: Q1 optional docs, Q2 B/C budget before Track A (certainty/tokens). A always runs after Q2; B/C opt-in. ADRs/RFCs excluded from T2. Mixed apply uses 11-mixed-apply.md (KEEP/CUT). Use when the user says harness eval, harness-eval, harness debug, audit AGENTS.md, audi |
| C250 | T1 | `.agent/skills/harness-eval/SKILL.md` | Run a full, stack-agnostic harness evaluation and stop at reports. Do not auto-edit AGENTS.md or skills unless the user explicitly asks after reviewing Ship/Slim. |
| C251 | T1 | `.agent/skills/harness-eval/SKILL.md` | **Stop and ask before continuing.** Do not skip these gates. Do not silently include optional docs or spawn B/C judges. |
| C252 | T1 | `.agent/skills/harness-eval/SKILL.md` | Order after inventory: **Q1 (if needed) → Q2 → then Track A** (A always runs) → B/C only if approved. |
| C253 | T1 | `.agent/skills/harness-eval/SKILL.md` | When `optional-docs-candidates.md` lists optional types, ask before Q2 / Track A: |
| C254 | T1 | `.agent/skills/harness-eval/SKILL.md` | Re-run inventory with `--include-doc-type` / `--include-doc` only after the user answers. If no optional types, skip Q1. |
| C255 | T1 | `.agent/skills/harness-eval/SKILL.md` | Ask **before** Track A so the user sets spend up front. Track **A always runs** next (deterministic, ~0 model tokens). B/C run only if approved. |
| C256 | T1 | `.agent/skills/harness-eval/SKILL.md` | Fill claim count from `claims.md` when known; surface count ≈ T0+T1+T2 markdown after extract (or say “after surfaces_extract” if not run yet). |
| C257 | T1 | `.agent/skills/harness-eval/SKILL.md` | **`A only`:** run Track A; present `04`; stop (no B/C judges). |
| C258 | T1 | `.agent/skills/harness-eval/SKILL.md` | **`B`:** Track A, then Steps 4–6. |
| C259 | T1 | `.agent/skills/harness-eval/SKILL.md` | **`C`:** Track A, then Steps 7–10 (C does not need B). |
| C260 | T1 | `.agent/skills/harness-eval/SKILL.md` | **`B+C`:** Track A, then Steps 4–11. |
| C261 | T1 | `.agent/skills/harness-eval/SKILL.md` | If the user already requested B/C/`full eval` in the triggering message, treat as approval — still show the Q2 table once so costs are visible. |
| C262 | T1 | `.agent/skills/harness-eval/SKILL.md` | This skill is **self-contained**. Protocol, scripts, and judge prompts live under this skill directory (the folder that contains this `SKILL.md`). Resolve `SKILL_DIR` as that directory — never assume another install path. |
| C263 | T1 | `.agent/skills/harness-eval/SKILL.md` | Read [references/PROTOCOL.md](references/PROTOCOL.md) **completely** before the first run in a session (and again if scripts fail). |
| C264 | T1 | `.agent/skills/harness-eval/SKILL.md` | Read [references/judge-prompts.md](references/judge-prompts.md) when spawning Track B or Track C judges. |
| C265 | T1 | `.agent/skills/harness-eval/SKILL.md` | Plain-language terms: [references/GLOSSARY.md](references/GLOSSARY.md) (also embedded at the top of `04` / `07` / `10` reports). |
| C266 | T1 | `.agent/skills/harness-eval/SKILL.md` | Claim record shape: [references/claims.schema.json](references/claims.schema.json) (for tooling; agents do not need to load it every run). |
| C267 | T1 | `.agent/skills/harness-eval/SKILL.md` | Run scripts as `python3 "$SKILL_DIR/scripts/<name>.py" ...`. |
| C268 | T1 | `.agent/skills/harness-eval/SKILL.md` | Run **outputs** (not protocol) go to the target repo at `.harness-eval/runs/<run-id>/`. |
| C269 | T1 | `.agent/skills/harness-eval/SKILL.md` | **Report-only by default.** Judgment ≠ remediation. |
| C270 | T1 | `.agent/skills/harness-eval/SKILL.md` | **README out of scope** as harness surface and as rediscovery/usefulness evidence. |
| C271 | T1 | `.agent/skills/harness-eval/SKILL.md` | **Stack-agnostic.** Never hard-code package managers, DBs, frameworks, or folder layouts in prompts or plants. Discover manifests that exist (JS, Python, Make/Task, Rust, Go, PHP, Ruby/Rails, Java/Gradle/Maven, plus `bin/*`). |
| C272 | T1 | `.agent/skills/harness-eval/SKILL.md` | **Doc scope.** T2 always includes agent skill-tree refs (`.agent/skills`, `<.agents/skills>`, `<.cursor/skills>`, `<.claude/skills>`). **ADRs / RFCs (decision-record trees) are always excluded** from T2 surfaces. Other cited project docs are **optional** — default omit; ask via **Q1** at the top of this skill, then re-run with `--include-doc-type` / `--include-doc`. |
| C273 | T1 | `.agent/skills/harness-eval/SKILL.md` | **Track A always runs** after inventory (deterministic, high-precision). Prefer false negatives over false BROKEN. Placeholders (`SPEC_FOLDER`, `{x}`, `[feature]`) are never BROKEN. Never normalize paths with `str.lstrip('./')`. |
| C274 | T1 | `.agent/skills/harness-eval/SKILL.md` | **Tracks B and C require user approval via Q2 before Track A.** Do not spawn B/C judges until the user opts in. User may approve B only, C only, both, or A only. |
| C275 | T1 | `.agent/skills/harness-eval/SKILL.md` | **Track B needs dual judges + plants.** Judge2 is blind (must not read Judge1 scores or `trap-key.json`). Ship only if trap gate PASS and dual REDUNDANT with Judge2 cost ≤ 1. |
| C276 | T1 | `.agent/skills/harness-eval/SKILL.md` | **Track C needs dual judges + plants.** Blind Judge2 must not read `08-usefulness-j1.md` or `usefulness-trap-key.json`. Slim only if trap PASS, dual SLIM/ROUTING-ONLY, **and fan-in PASS** (no other harness surface hard-loads the path as SoT — merge enforces this on the full skill tree, not just `--seed`). **Usefulness is model-sensitive** — record `model: <id>` in both score files; prefer same model within a run; re-judge on a second model before large Slim deletes. |
| C277 | T1 | `.agent/skills/harness-eval/SKILL.md` | **KEEP / KEEP-CORE plants must not be verbatim copies** of claims/surfaces already in the deck. |
| C278 | T1 | `.agent/skills/harness-eval/SKILL.md` | **Subagents:** use an allowlisted non-fast model (prefer the same family as the parent when policy allows). Do not use `*-fast` models. |
| C279 | T1 | `.agent/skills/harness-eval/SKILL.md` | **Do not equate tracks.** Track B Ship ≠ Track C Slim. Rediscoverable ≠ useless; useful ≠ non-redundant. |
| C280 | T1 | `.agent/skills/harness-eval/SKILL.md` | **Slim apply / fan-in.** Never stub or delete a Slim path listed under “Slim fan-in blocked” (or when `python3 "$SKILL_DIR/scripts/slim_fanin.py" --path <P>` reports citers) unless those consumers are updated in the same change. |
| C281 | T1 | `.agent/skills/harness-eval/SKILL.md` | **Mixed/Slim apply stays self-contained.** Cutting REPO-DEMONSTRATED / THEORY means delete or compress that bulk in the harness surface. Never replace a fenced teaching snippet (or the contract it carried) with `See app/...` / `lib/...` / `test/...` — that swaps SoT for a code-tree pointer. Judge evidence paths stay in score tables only; if the behavior-changing contract must survive, keep a short in-skill rule or snippet. |
| C282 | T1 | `.agent/skills/harness-eval/SKILL.md` | **Mixed apply is mechanical.** Dual MIXED alone is not enough. Merge emits `11-mixed-apply.md` with per-ID **KEEP** (from Keep-core columns) and **CUT** (from Slim columns). Apply agents must follow that file only — do not re-judge, redesign, or invent a different pattern than KEEP. Empty Keep-core/Slim cells → skip that path (Hold). |
| C283 | T1 | `.agent/skills/harness-eval/SKILL.md` | Set `SKILL_DIR` to the directory containing this `SKILL.md`. Verify: |
| C284 | T1 | `.agent/skills/harness-eval/SKILL.md` | `$SKILL_DIR/references/PROTOCOL.md` |
| C285 | T1 | `.agent/skills/harness-eval/SKILL.md` | `$SKILL_DIR/scripts/inventory_extract.py` |
| C286 | T1 | `.agent/skills/harness-eval/SKILL.md` | `$SKILL_DIR/scripts/track_a_correctness.py` |
| C287 | T1 | `.agent/skills/harness-eval/SKILL.md` | `$SKILL_DIR/scripts/merge_agreement.py` |
| C288 | T1 | `.agent/skills/harness-eval/SKILL.md` | `$SKILL_DIR/scripts/surfaces_extract.py` |
| C289 | T1 | `.agent/skills/harness-eval/SKILL.md` | `$SKILL_DIR/scripts/merge_usefulness.py` |
| C290 | T1 | `.agent/skills/harness-eval/SKILL.md` | `$SKILL_DIR/scripts/slim_fanin.py` |
| C291 | T1 | `.agent/skills/harness-eval/SKILL.md` | `$SKILL_DIR/scripts/doc_scope.py` |
| C292 | T1 | `.agent/skills/harness-eval/SKILL.md` | If missing, the skill install is broken — stop. |
| C293 | T1 | `.agent/skills/harness-eval/SKILL.md` | From the **target repo root**: |
| C294 | T1 | `.agent/skills/harness-eval/SKILL.md` | Expected under `.harness-eval/runs/$RUN_ID/`: `inventory.json`, `claims.jsonl`, `claims.md`, `trap-key.json`, `optional-docs-candidates.md` (+ `.json`). |
| C295 | T1 | `.agent/skills/harness-eval/SKILL.md` | Read `optional-docs-candidates.md`. If optional types exist, run **Q1** from [User questionnaires](#user-questionnaires-high-priority). Re-run inventory only after approval: |
| C296 | T1 | `.agent/skills/harness-eval/SKILL.md` | Run **Q2** from [User questionnaires](#user-questionnaires-high-priority) **before** Track A. Record the answer (`A only` / `B` / `C` / `B+C`). Do not start Steps 4+ unless B and/or C were approved. |
| C297 | T1 | `.agent/skills/harness-eval/SKILL.md` | Expected: `04-correctness.md` (includes term definitions at top). Spot-check that `.agents/...` cites resolve (not `agents/...`). |
| C298 | T1 | `.agent/skills/harness-eval/SKILL.md` | Summarize Track A (broken count + notable clusters). If Q2 was `A only`, stop. Otherwise continue to the approved B and/or C steps. |
| C299 | T1 | `.agent/skills/harness-eval/SKILL.md` | Read `references/judge-prompts.md` (Track B Judge1). Spawn an independent subagent with an allowlisted model. Point it at `.harness-eval/runs/$RUN_ID/claims.md`. It writes `05-redundancy-j1.md` (include `model: <id>`). |
| C300 | T1 | `.agent/skills/harness-eval/SKILL.md` | Judge1 may read `inventory.json`. Must not read `trap-key.json`. |
| C301 | T1 | `.agent/skills/harness-eval/SKILL.md` | Read `references/judge-prompts.md` (Track B Judge2). Spawn a second subagent. Writes `06-blind-scores.md`. |
| C302 | T1 | `.agent/skills/harness-eval/SKILL.md` | Forbidden for Judge2: `trap-key.json`, `05-redundancy-j1.md`, `07-agreement.md`, prior agreement reports. |
| C303 | T1 | `.agent/skills/harness-eval/SKILL.md` | Prefer Steps 4 and 5 in parallel. |
| C304 | T1 | `.agent/skills/harness-eval/SKILL.md` | Expected: `07-agreement.md` (Ship/Review/Hold + **What these words mean**). On trap FAIL: fix plants per PROTOCOL, rescore P00x, re-merge — do not Ship. |
| C305 | T1 | `.agent/skills/harness-eval/SKILL.md` | Expected: `surfaces.md`, `surfaces.json`, `usefulness-trap-key.json`. |
| C306 | T1 | `.agent/skills/harness-eval/SKILL.md` | Read `references/judge-prompts.md` (Usefulness Judge1). Spawn subagent with allowlisted model (record same id in header). Writes `08-usefulness-j1.md`. |
| C307 | T1 | `.agent/skills/harness-eval/SKILL.md` | Must not read `usefulness-trap-key.json`. |
| C308 | T1 | `.agent/skills/harness-eval/SKILL.md` | Read Usefulness Judge2 prompt. Prefer **same model** as Step 8 for agreement stability. Writes `09-usefulness-j2.md`. |
| C309 | T1 | `.agent/skills/harness-eval/SKILL.md` | Forbidden: `usefulness-trap-key.json`, `08-usefulness-j1.md`, `10-usefulness-agreement.md`, and using Track B 05/06/07 to decide usefulness classes. |
| C310 | T1 | `.agent/skills/harness-eval/SKILL.md` | Prefer Steps 8 and 9 in parallel. |
| C311 | T1 | `.agent/skills/harness-eval/SKILL.md` | Expected: `10-usefulness-agreement.md` (Slim/Keep-core/Mixed/Hold + **What these words mean**), `11-mixed-apply.md` (KEEP/CUT per Mixed ID), plus `slim-fanin.json`. On trap FAIL: do not Slim. Surfaces with `slim-fanin-blocked` are Hold — not Slim apply candidates. |
| C312 | T1 | `.agent/skills/harness-eval/SKILL.md` | Summarize from the agreement reports (each starts with term definitions): |
| C313 | T1 | `.agent/skills/harness-eval/SKILL.md` | Track A broken count → `04-correctness.md` |
| C314 | T1 | `.agent/skills/harness-eval/SKILL.md` | Track B trap + Ship/Review/Hold → `07-agreement.md` |
| C315 | T1 | `.agent/skills/harness-eval/SKILL.md` | Track C trap + fan-in + Slim/Keep-core/Mixed/Hold → `10-usefulness-agreement.md` |
| C316 | T1 | `.agent/skills/harness-eval/SKILL.md` | Call out `11-mixed-apply.md` when Mixed count > 0 (the only Mixed apply path) |
| C317 | T1 | `.agent/skills/harness-eval/SKILL.md` | Call out model ids used for Track C and that Slim is model-sensitive |
| C318 | T1 | `.agent/skills/harness-eval/SKILL.md` | Call out any **Slim fan-in blocked** rows (consumers outside seed may appear here) |
| C319 | T1 | `.agent/skills/harness-eval/SKILL.md` | Stop unless the user asks to apply Ship/Slim/Mixed. When applying: |
| C320 | T1 | `.agent/skills/harness-eval/SKILL.md` | **Slim:** only paths in the Slim table (fan-in PASS); never stub fan-in-blocked paths without updating citers first. |
| C321 | T1 | `.agent/skills/harness-eval/SKILL.md` | **Mixed:** open `11-mixed-apply.md` and execute KEEP/CUT per ID only (rule 12). Never re-judge from the Mixed path list alone. Never add code-tree path pointers as substitutes for cut demos (rule 11). |
| C322 | T1 | `.agent/skills/tlc-implement/SKILL.md` | Implements work already planned - a plan.md from tlc-plan, or a small ticket - by freezing it into checks with proofs, building, and proving every check with a script and an independent Verifier before declaring done. Use when the user says "implement this plan", "build this ticket", "implement this spec", "write the checks", "verify work", or "tlc-implement". Do NOT use when nobody has decided what to build, or to plan a feature that needs one (that is tlc-plan). |
| C323 | T1 | `.agent/skills/tlc-implement/SKILL.md` | Freeze the obligations. Free the build. Prove it with someone who did not build it. |
| C324 | T1 | `.agent/skills/tlc-implement/SKILL.md` | The common failure of a coding agent is a requirement that never became an active obligation, |
| C325 | T1 | `.agent/skills/tlc-implement/SKILL.md` | followed by a completion claim. What works against it is a small, frozen, external obligation set |
| C326 | T1 | `.agent/skills/tlc-implement/SKILL.md` | and a verifier that is not the author, so the budget goes there and not into choreographing the |
| C327 | T1 | `.agent/skills/tlc-implement/SKILL.md` | model. How you build is yours. |
| C328 | T1 | `.agent/skills/tlc-implement/SKILL.md` | The input is an approved `.specs/features/<feature>/plan.md` from **tlc-plan** - approved means |
| C329 | T1 | `.agent/skills/tlc-implement/SKILL.md` | its `**Approved**: <date> - user: "<their words>"` line, which `validate_checks.py` requires - and |
| C330 | T1 | `.agent/skills/tlc-implement/SKILL.md` | it is the whole brief: you may have none of the conversation that produced it. A change under roughly three |
| C331 | T1 | `.agent/skills/tlc-implement/SKILL.md` | files with no one-way door needs no plan: write `checks.md` with an `## Intent` paragraph instead. |
| C332 | T1 | `.agent/skills/tlc-implement/SKILL.md` | Anything larger with no plan, or a plan with an open `blocks` question, goes back to **tlc-plan**. |
| C333 | T1 | `.agent/skills/tlc-implement/SKILL.md` | These hold even if no reference file is read. Each one lives here; the references point back. |
| C334 | T1 | `.agent/skills/tlc-implement/SKILL.md` | Every check is one observable claim with a concrete value plus the proof that settles it: a test or command whose exit code decides, or, for a state a capture draws, a picture of it judged against the capture (rule 9). |
| C335 | T1 | `.agent/skills/tlc-implement/SKILL.md` | Tests assert what the checks say, not what the code happens to do. Do not write a test by reading the implementation. |
| C336 | T1 | `.agent/skills/tlc-implement/SKILL.md` | A test changes only with the claim it proves, and leaves with the code it proves, in the same commit. Changing a test to make a suite pass hides the failure it exists to show: a wrong check is a stop-and-ask. |
| C337 | T1 | `.agent/skills/tlc-implement/SKILL.md` | Checks are fixed once `validate_checks.py` passes; a check may be appended when the walk or the Verifier finds a missing obligation. In the plan, `Landing`, `Surface` and the stored shape are additive; the path and `Changes underneath` are kept true in the commit that changes them. |
| C338 | T1 | `.agent/skills/tlc-implement/SKILL.md` | The Verifier is a fresh sub-agent, never the author, and it always runs, once per feature, beside the screens sub-agent. `check_proofs.py` settles the mechanical part - every proof run and passing at `HEAD`, the build, the pictures, the walk - and the Verifier spends its time on judgement: it opens the test each check's proof selects and says whether that test would fail if the claim were false, then tries examples nobody named and assertions looser than their criterion. The work is done when every finding is closed by a commit and `proofs.md` is green at `HEAD`. |
| C339 | T1 | `.agent/skills/tlc-implement/SKILL.md` | A proof is the project's own test command; the skill knows no test runner. Tests that run together go on one `Run <name>: <command>` line, run once, and each check that reads it writes `Proof: run <name> \| <the line the run prints when its test passes>`, pass marker included, so a filter that selects nothing reads `no test ran` instead of a green exit code. A command run alone is judged by its exit code. The checks are the floor; an edge case or guard no check names is still the work. |
| C340 | T1 | `.agent/skills/tlc-implement/SKILL.md` | The completion gate is a script: `validate_verification.py` exits 0. The final report opens with its last line; a red gate is said first, never left for the reader to find. |
| C341 | T1 | `.agent/skills/tlc-implement/SKILL.md` | An approved plan authorizes local edits and local commits. `git push`, deploy and production data changes need an explicit go-ahead for that action. |
| C342 | T1 | `.agent/skills/tlc-implement/SKILL.md` | **A state a capture draws is one picture.** The author reaches that state and saves `<capture>.running.png` beside the capture from a browser window at the capture's size - its pixel size over its scale: a wider window lays the page out differently, and resizing the image afterwards hides it. Nobody reopens the app to judge it: a screens sub-agent judges the file ([verify-screens.md](references/verify-screens.md)), and a picture whose text reads smaller than the capture's was resized and is retaken. It matches the capture except for what `## Differences from the source` lists. A state no capture draws, and an existing screen the feature does not change, are proven by a test or a `walk` proof, with no picture and no judge. |
| C343 | T1 | `.agent/skills/tlc-implement/SKILL.md` | A capture, frame or live site the plan cites as binding is changed only by the user. Removing, renaming or departing from something it draws is asked, recorded as a decision in `.specs/STATE.md`, and listed in the plan's `## Differences from the source` with `Confirmed: y - AD-NNN`. |
| C344 | T1 | `.agent/skills/tlc-implement/SKILL.md` | **The files hold the run; the chat does not survive a compaction.** What the user settles while you build goes on `checks.md`'s `**Settled mid-build:**` line in the turn they say it. Each sub-agent goes on the `**Dispatched:**` line before it is sent. After a compaction or in a new session, re-read this file and the current phase's reference, then resume from the files ([memory.md](references/memory.md)). |
| C345 | T1 | `.agent/skills/tlc-implement/SKILL.md` | Decisions, resuming and lessons: [memory.md](references/memory.md). |
| C346 | T1 | `.agent/skills/tlc-implement/SKILL.md` | Resolve `<skill-dir>` as the directory containing this `SKILL.md` and run |
| C347 | T1 | `.agent/skills/tlc-implement/SKILL.md` | `python3 <skill-dir>/scripts/<name>.py`. Pass `--root` when cwd is not the project root. A non-zero |
| C348 | T1 | `.agent/skills/tlc-implement/SKILL.md` | exit means stop and fix. Run a script rather than read it: its messages say what to change. On |
| C349 | T1 | `.agent/skills/tlc-implement/SKILL.md` | Windows, where `python3` may be the Microsoft Store alias, run `python` or `py -3`. |
| C350 | T1 | `.agent/skills/tlc-implement/SKILL.md` | `selftest.py` mutates the fixtures in `scripts/fixtures/` once per gate rule and requires every |
| C351 | T1 | `.agent/skills/tlc-implement/SKILL.md` | mutant to be killed; the fixtures are also a worked example of a passing artifact set. |
| C352 | T1 | `.agent/skills/tlc-implement/SKILL.md` | Test runners: none is built in. `check_proofs.py` runs the commands `checks.md` names as the |
| C353 | T1 | `.agent/skills/tlc-implement/SKILL.md` | project runs them, one at a time, with no timeout; a run's own parallelism is whatever the project |
| C354 | T1 | `.agent/skills/tlc-implement/SKILL.md` | configured ([checks.md](references/checks.md)). |
| C355 | T1 | `.agent/skills/tlc-implement/SKILL.md` | Produce the artifact; do not narrate the phase. Lead with the verdict and state decisions plainly. |
| C356 | T1 | `.agent/skills/tlc-implement/SKILL.md` | Section headings stay in English; prose follows the project; identifiers are never translated. |
| C357 | T1 | `.agent/skills/tlc-plan/SKILL.md` | Turns a request, ticket, PRD, design or thread into one plan a human approves and a builder can act on without the conversation: asks every gray area until no product decision is left to the builder, then writes the problem, EARS criteria with concrete values, the path and the data it touches (drawn in mermaid), the interface, and only the decisions that are hard to reverse. Captures that come with the request bind. Use when the user says "plan this", "plan feature", "specify feature", "write th |
| C358 | T1 | `.agent/skills/tlc-plan/SKILL.md` | Ask until nothing is the builder's to decide. Write it down so a stranger can build it. |
| C359 | T1 | `.agent/skills/tlc-plan/SKILL.md` | The common failure of a coding agent is a requirement that never became an obligation, followed by |
| C360 | T1 | `.agent/skills/tlc-plan/SKILL.md` | a completion claim. It starts here: a gray area the plan settled by guessing, a capture treated as |
| C361 | T1 | `.agent/skills/tlc-plan/SKILL.md` | a suggestion, a sentence of the request that landed nowhere. This skill produces the one document a |
| C362 | T1 | `.agent/skills/tlc-plan/SKILL.md` | human reads and objects to before any code exists, and it is the whole brief for whoever builds, |
| C363 | T1 | `.agent/skills/tlc-plan/SKILL.md` | often a different agent with none of this conversation. |
| C364 | T1 | `.agent/skills/tlc-plan/SKILL.md` | Every criterion is one observable outcome with a concrete value - a status code, a field, a bound, a label - that one run settles. "Gracefully", a percentile or "the columns exist" is not a criterion. |
| C365 | T1 | `.agent/skills/tlc-plan/SKILL.md` | Ask every gray area before presenting the plan: a decision that is the user's, has more than one defensible answer, and is not settled by the code. An assumption never stands in for a question to save one. Asking clarifies how, never whether to add a capability. |
| C366 | T1 | `.agent/skills/tlc-plan/SKILL.md` | A capture, frame or live site that comes with the request binds unless the user called it inspiration. Only the user changes a binding source: a departure from it is asked, recorded as an `AD-NNN` in `.specs/STATE.md`, and listed in `## Differences from the source`. |
| C367 | T1 | `.agent/skills/tlc-plan/SKILL.md` | The rules that change what a user sees run in a layer the repo's tests reach. Filtering, searching, sorting and counting are rules. |
| C368 | T1 | `.agent/skills/tlc-plan/SKILL.md` | Only what is hard to reverse is decided here, with its literal shape. Placement, names and types inside the conventions are the builder's and are settled in the diff. |
| C369 | T1 | `.agent/skills/tlc-plan/SKILL.md` | `validate_plan.py` exits 0 before the plan is presented, and approval is the one stop for a human. The approval is written under the plan's title as `**Approved**: <date> - user: "<their words>"` - never one the user did not give - and each answer goes into the plan in the turn it arrives: a compaction keeps the file, not the chat. After one, or in a new session, re-read this file and the plan reference, then continue from `plan.md`. The plan stays true through the build: `Landing`, `Surface` and the data are additive; the path and `Changes underneath` change in the commit that changes them. |
| C370 | T1 | `.agent/skills/tlc-plan/SKILL.md` | Read every source completely, then decide how many plans it becomes. Default to one. Every one-way |
| C371 | T1 | `.agent/skills/tlc-plan/SKILL.md` | door in the source is then reviewed together, where the interactions between them are visible; |
| C372 | T1 | `.agent/skills/tlc-plan/SKILL.md` | split six ways, the same doors arrive in six batches and nobody sees the whole. |
| C373 | T1 | `.agent/skills/tlc-plan/SKILL.md` | Split only for a reason you can defend from evidence: a piece cannot land before another without |
| C374 | T1 | `.agent/skills/tlc-plan/SKILL.md` | breaking production, a piece waits on an answer only someone else can give, or a piece belongs to |
| C375 | T1 | `.agent/skills/tlc-plan/SKILL.md` | another team. Each piece is then its own feature folder with its own plan. |
| C376 | T1 | `.agent/skills/tlc-plan/SKILL.md` | Say when it is big, and what makes it big: one-way doors first, a migration among them, then the |
| C377 | T1 | `.agent/skills/tlc-plan/SKILL.md` | number of slices. Show the seams that exist - order constraints first, marked as the kind that |
| C378 | T1 | `.agent/skills/tlc-plan/SKILL.md` | cannot be collapsed - and let the user pick where to cut. |
| C379 | T1 | `.agent/skills/tlc-plan/SKILL.md` | A slice inside a plan is one outcome someone can watch, never a layer. Preparation that proves |
| C380 | T1 | `.agent/skills/tlc-plan/SKILL.md` | nothing on its own - a nullable column, a client with no caller - is a commit, not a slice. |
| C381 | T1 | `.agent/skills/tlc-plan/SKILL.md` | The plan format, how to ask, the surface walk and EARS: [references/plan.md](references/plan.md). |
| C382 | T1 | `.agent/skills/tlc-plan/SKILL.md` | Its section headings are a schema **tlc-implement** and the validator read; prose follows the |
| C383 | T1 | `.agent/skills/tlc-plan/SKILL.md` | project's language, and identifiers are never translated. |
| C384 | T1 | `.agent/skills/tlc-plan/SKILL.md` | `.specs/STATE.md` holds the decisions a future feature has to conform to: |
| C385 | T1 | `.agent/skills/tlc-plan/SKILL.md` | Edit only the body of `## Decisions`. Where the repo already keeps ADRs or a decision log, append |
| C386 | T1 | `.agent/skills/tlc-plan/SKILL.md` | there instead. Every `active` entry constrains the plan: conform, or append one that supersedes it |
| C387 | T1 | `.agent/skills/tlc-plan/SKILL.md` | (the old row's status becomes `superseded by AD-NNN`) and say why. An answer that departs from a |
| C388 | T1 | `.agent/skills/tlc-plan/SKILL.md` | binding source is a decision: it says what the product shows instead, and its rationale quotes the |
| C389 | T1 | `.agent/skills/tlc-plan/SKILL.md` | question and the option chosen. |
| C390 | T1 | `.agent/skills/tlc-plan/SKILL.md` | Lessons are written by **tlc-implement** from real verification findings. Read the confirmed ones |
| C391 | T1 | `.agent/skills/tlc-plan/SKILL.md` | for the area before asking anything: |
| C392 | T1 | `.agent/skills/tlc-plan/SKILL.md` | Resolve `<skill-dir>` as the directory containing this `SKILL.md`. Pass `--root` when cwd is not |
| C393 | T1 | `.agent/skills/tlc-plan/SKILL.md` | the project root. Run a script rather than read it: its messages say what to change. On Windows, |
| C394 | T1 | `.agent/skills/tlc-plan/SKILL.md` | where `python3` may be the Microsoft Store alias, run `python` or `py -3`. |
| C395 | T1 | `.agent/skills/tlc-plan/SKILL.md` | Produce the artifact; do not narrate the phase. When you stop, lead with the verdict: the plan, the |
| C396 | T1 | `.agent/skills/tlc-plan/SKILL.md` | questions that block first with your recommendation, then the defaults you picked for the user to |
| C397 | T1 | `.agent/skills/tlc-plan/SKILL.md` | correct. Section headings stay in English. |
| C398 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | Feature planning and implementation with 4 adaptive phases (Specify, Design, Tasks, Execute). Auto-sizes depth by complexity. Asks every product decision before the spec is approved, writes testable requirements in EARS notation, atomic tasks with a gate and a commit each, and one check per criterion with the test that proves it. Captures that come with the request bind, and each screen is judged against them. Ships deterministic Python scripts so the gates are enforced by code, not memory; the  |
| C399 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | Plan and implement features with precision. Granular tasks. Clear dependencies. Right tools. Zero ceremony. |
| C400 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **Loading this skill's files.** Reference files live under `references/` in this skill's own directory (where this `SKILL.md` resides). Resolve them relative to the skill directory, never the workspace root. When a step tells you to read a reference, read it to the end before acting. |
| C401 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **Running this skill's scripts.** Every `scripts/*.py` lives under that same skill directory: run `python3 <skill-dir>/scripts/<name>.py ...`, never `python3 scripts/...` from the project root. Project data under `.specs/` is read and written relative to the project root (pass `--root` when the cwd is elsewhere). Run a script rather than read it: its messages say what to change. On Windows, where `python3` may be the Microsoft Store alias, run `python` or `py -3`. |
| C402 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **Execution contract - every task, non-negotiable (holds even if you do not open the reference files):** |
| C403 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **Ask, then stop for approval.** Every gray area that is the user's - scope, product behaviour, a departure from a binding source - is asked before the spec is presented; an assumption never stands in for one. Approving the spec and approving the tasks are the two stops for a human. When nobody is there to answer, end your turn with the questions. Each approval is written as `**Approved**: <date> - user: "<their words>"` in spec.md and tasks.md; one the user did not give is never written. Every answer goes into its file in the turn it arrives - the chat does not survive a compaction. |
| C404 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | Tests derive from the spec's acceptance criteria and assert spec-defined outcomes - they never mirror the implementation. |
| C405 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | The gate must pass before a task is done - the test runner decides, not self-assessment. One atomic commit per task, with `tasks.md` marked complete before it - and inside it when the repo tracks `.specs/`; where the repo ignores `.specs/`, the commit holds only the code and its tests, and never forces them in. Never batch tasks; never weaken, skip, or delete tests to make them pass. |
| C406 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **Every criterion has a check, and every check a proof.** tasks.md `## Checks` holds one claim per criterion with the project's own test command that selects its test - tests that run together share one `**Run <name>**:` line, and each check names the line its test prints (`Proof: run <name> \| <line>`). After the LAST task, `check_proofs.py` runs each group and lone proof once at `HEAD`, one at a time, with the build; then a fresh **Verifier** (author ≠ verifier) runs **always**, never prompted - it judges whether each check's test would fail if the claim were false, tries examples nobody named, and finds assertions looser than their criterion. Done means every finding is closed by a commit and `validate_verification.py` exits 0. |
| C407 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **A screen is held to its design.** A capture that comes with the request binds unless the user called it inspiration; its criterion cites the capture file. Each state a capture draws is saved as `captures/<capture>.running.png` from a browser window at the capture's size - an image resized afterwards shows another layout - and a fresh screens sub-agent retakes and judges it ([verify-screens.md](references/verify-screens.md)). |
| C408 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **Where rules run.** Every rule that changes what a user sees - including filtering, searching, sorting and counting - runs in a layer the repo's tests reach. |
| C409 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **Blast radius:** approving a spec or tasks authorizes local implementation and local commits only. `git push`, force-push, deploy, production DB changes, and other remote or destructive operations need an explicit go-ahead for that action. |
| C410 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **Deterministic gates run before human review - not from memory.** A non-zero exit means STOP and fix: |
| C411 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | Skip a script only when no code-execution tool is available; then perform the same checks by reading the artifact. |
| C412 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **Before Execute:** read [implement.md](references/implement.md) completely and run `validate_tasks.py <feature> --execute`, which also requires both approvals in the user's words; if a formal `tasks.md` packs into more than one task-budgeted batch (> ~8 tasks), present the sub-agent offer first (see Sub-Agent Delegation). |
| C413 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **The complexity determines the depth, not a fixed pipeline.** Before starting any feature, assess its scope and apply only what's needed: |
| C414 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **Specify and Execute are always required** - you always need to know WHAT and DO it |
| C415 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **Design is skipped** when the change is straightforward (no architectural decisions, no new patterns) |
| C416 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **Tasks is skipped** when there are ≤3 obvious steps (they become implicit in Execute); the checks then go in a `## Checks` section at the end of `spec.md` |
| C417 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **Discuss is triggered within Specify** when the agent detects gray areas that need user input, or when the feature has any implicit-requirement dimension present (persistence/state, external calls, auth, payments, concurrency, state transitions) |
| C418 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **Interactive UAT is triggered within Execute** only for user-facing features with complex behavior |
| C419 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **Safety valve:** Even when Tasks is skipped, Execute ALWAYS starts by listing atomic steps inline (see [implement.md](references/implement.md)). If that listing reveals >5 steps or complex dependencies, STOP and create a formal `tasks.md` - the Tasks phase was wrongly skipped. |
| C420 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **Create artifacts lazily.** Write each file only when its phase produces content - never scaffold empty `context.md`, `design.md`, or `tasks.md` up front. Absence is the correct state for a skipped phase. |
| C421 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | Specify → (Design) → (Tasks) → Execute (depth auto-sized) |
| C422 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **Resume work - a new session, or after a compaction:** |
| C423 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | Re-read this file, then the reference for the phase the files show. A summary keeps the task, not these rules. |
| C424 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | Read `.specs/STATE.md` Decisions and the feature's files - `spec.md` and `tasks.md` (their `**Approved**:` lines, marks and `## Handoff`), `proofs.md`, `verification.md`, `screens.md` - and reconcile them against git: evidence wins over a note. Where each file puts you: [memory.md](references/memory.md). |
| C425 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | After a compaction in the middle of a run, continue when the files and git agree; stop only on a conflict. In a new session, propose the reconciled next step before writing code. |
| C426 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | Load only what the current step needs: |
| C427 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | `.specs/STATE.md` - Decisions section (read at Specify and Design, re-read on resume); Handoff section (read on resume only) |
| C428 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | confirmed lessons - load at Specify and Design via `python3 <skill-dir>/scripts/lessons.py list --status confirmed` ([lessons.md](references/lessons.md)); confirmed only, never candidates |
| C429 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | spec.md, context.md, design.md, tasks.md - when the step works from them |
| C430 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | Never load several feature specs or several architecture docs at once. |
| C431 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **Trigger:** count total tasks. If the feature packs into more than one task-budgeted batch (> ~8 tasks) → offer sub-agents; if it fits a single batch (≤ ~8 tasks) → execute inline. |
| C432 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **Offer-then-confirm** - never auto-spawn. The user must accept before any batch worker is dispatched. |
| C433 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **One worker per task-budgeted batch (~7 tasks, whole phases):** Phases stay the semantic/dependency unit; a **batch** is the execution unit - one or more *consecutive whole phases* packed to ~7 tasks. Walk phases in order, accumulate whole phases into the current batch until it reaches the budget, then start the next - **never split a phase** across workers. Each worker executes all its tasks in order (implement → gate → atomic commit), then reports a compact summary (tasks done, commit hashes, test counts, deviations). Batches run sequentially. Workers never spawn further sub-agents. |
| C434 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **Verifier and screens sub-agent (always-on, never prompted):** after the final task, the orchestrator runs `check_proofs.py`, then dispatches both in parallel over the same `HEAD` - the Verifier with [validate.md](references/validate.md), the screens sub-agent with [verify-screens.md](references/verify-screens.md) when a criterion cites a capture. Each dispatch - batch workers included - is written on the `**Dispatched:**` line of tasks.md `## Handoff` before it is sent, so a compacted orchestrator waits instead of sending a second. Every finding is fixed in one pass; round 2 is `check_proofs.py` again and the screens sub-agent on the rows that differed, with `**Round**: 2` in screens.md. No second Verifier and no third round; what still fails goes to the user. Then the gate, then lessons |
| C435 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **Model tier per role** (only if the harness supports choosing a model per sub-agent): mechanical batches on a faster tier, core-domain batches and Design on a high-reasoning tier, the Verifier mid-to-high. Rubric in [sub-agents.md](references/sub-agents.md). |
| C436 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **Standalone fallback:** without sub-agents, run `validate.md` and `verify-screens.md` each in a new session after the final commit and write `self-verified` in the report; the gate warns. |
| C437 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **Feature-level (auto-sized):** |
| C438 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | Facts you look up, decisions you ask. Look in the codebase and its conventions first, then the project docs and `.specs/STATE.md`, then library documentation, then the web. Never invent an API, a pattern or a behaviour: "I could not find documentation for this" beats a plausible fabrication, and anything you could not confirm is said to be uncertain. |
| C439 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | Test runners: none is built in. `check_proofs.py` runs the commands tasks.md names as the project runs them, one at a time, with no timeout; a run's own parallelism is whatever the project configured ([tasks.md](references/tasks.md)). |
| C440 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **Do the work; do not narrate the machinery.** Produce the right artifact for the phase instead of announcing the phase. The user judges the output. |
| C441 | T1 | `.agent/skills/tlc-spec-driven/SKILL.md` | **Write generated artifacts in a plain, decided voice.** Specs, decisions, reports, commit messages and chat summaries follow the writing rules in [coding-principles.md](references/coding-principles.md): lead with the verdict, state decisions definitively, cut filler and hedging. Section headings stay in English; prose follows the project; identifiers are never translated. |
| C442 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices". Focuses on visual design and interaction patterns. Do NOT use for performance audits (use core-web-vitals), SEO (use seo), or comprehensive site audits (use web-quality-audit). |
| C443 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Review files for compliance with Web Interface Guidelines. |
| C444 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Read the guidelines from `#[[file:references/guideline.md]]` |
| C445 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Read the specified files (or prompt user for files/pattern) |
| C446 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Check against all rules in the guidelines |
| C447 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Output findings in the terse `file:line` format |
| C448 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | All rules and output format instructions are in: |
| C449 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | The guidelines cover: |
| C450 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Accessibility (ARIA, semantic HTML, keyboard navigation) |
| C451 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Focus states and keyboard interaction |
| C452 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Forms (autocomplete, validation, labels) |
| C453 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Animation (reduced motion, performance) |
| C454 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Typography (proper characters, number formatting) |
| C455 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Content handling (overflow, empty states) |
| C456 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Images (dimensions, lazy loading) |
| C457 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Performance (virtualization, DOM reads) |
| C458 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Navigation & state (URL sync, deep linking) |
| C459 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Touch & interaction (tap delays, safe areas) |
| C460 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Common anti-patterns to flag |
| C461 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | When a user provides a file or pattern argument: |
| C462 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Read the guidelines from `references/guideline.md` |
| C463 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Read the specified files |
| C464 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Apply all rules from the guidelines |
| C465 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Output findings using the format specified in the guidelines |
| C466 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | If no files specified, ask the user which files to review. |
| C467 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Follow the format in the guidelines: |
| C468 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Group findings by file |
| C469 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Use `file:line` format (VS Code clickable) |
| C470 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Terse, high signal-to-noise |
| C471 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | State issue + location |
| C472 | T1 | `.agent/skills/web-design-guidelines/SKILL.md` | Skip explanation unless fix is non-obvious |
| C473 | T2 | `.agent/skills/codenavi/references/coding-principles.md` | Harness-referenced document `.agent/skills/codenavi/references/coding-principles.md` is an on-demand load target when linked from always-on rules or skills. |
| C474 | T2 | `.agent/skills/codenavi/references/notebook-spec.md` | Harness-referenced document `.agent/skills/codenavi/references/notebook-spec.md` is an on-demand load target when linked from always-on rules or skills. |
| C475 | T2 | `.agent/skills/harness-eval/references/GLOSSARY.md` | Harness-referenced document `.agent/skills/harness-eval/references/GLOSSARY.md` is an on-demand load target when linked from always-on rules or skills. |
| C476 | T2 | `.agent/skills/harness-eval/references/PROTOCOL.md` | Harness-referenced document `.agent/skills/harness-eval/references/PROTOCOL.md` is an on-demand load target when linked from always-on rules or skills. |
| C477 | T2 | `.agent/skills/harness-eval/references/claims.schema.json` | Harness-referenced document `.agent/skills/harness-eval/references/claims.schema.json` is an on-demand load target when linked from always-on rules or skills. |
| C478 | T2 | `.agent/skills/harness-eval/references/judge-prompts.md` | Harness-referenced document `.agent/skills/harness-eval/references/judge-prompts.md` is an on-demand load target when linked from always-on rules or skills. |
| C479 | T2 | `.agent/skills/tlc-implement/references/build.md` | Harness-referenced document `.agent/skills/tlc-implement/references/build.md` is an on-demand load target when linked from always-on rules or skills. |
| C480 | T2 | `.agent/skills/tlc-implement/references/checks.md` | Harness-referenced document `.agent/skills/tlc-implement/references/checks.md` is an on-demand load target when linked from always-on rules or skills. |
| C481 | T2 | `.agent/skills/tlc-implement/references/memory.md` | Harness-referenced document `.agent/skills/tlc-implement/references/memory.md` is an on-demand load target when linked from always-on rules or skills. |
| C482 | T2 | `.agent/skills/tlc-implement/references/verify-screens.md` | Harness-referenced document `.agent/skills/tlc-implement/references/verify-screens.md` is an on-demand load target when linked from always-on rules or skills. |
| C483 | T2 | `.agent/skills/tlc-implement/references/verify.md` | Harness-referenced document `.agent/skills/tlc-implement/references/verify.md` is an on-demand load target when linked from always-on rules or skills. |
| C484 | T2 | `.agent/skills/tlc-plan/references/plan.md` | Harness-referenced document `.agent/skills/tlc-plan/references/plan.md` is an on-demand load target when linked from always-on rules or skills. |
| C485 | T2 | `.agent/skills/tlc-spec-driven/references/coding-principles.md` | Harness-referenced document `.agent/skills/tlc-spec-driven/references/coding-principles.md` is an on-demand load target when linked from always-on rules or skills. |
| C486 | T2 | `.agent/skills/tlc-spec-driven/references/design.md` | Harness-referenced document `.agent/skills/tlc-spec-driven/references/design.md` is an on-demand load target when linked from always-on rules or skills. |
| C487 | T2 | `.agent/skills/tlc-spec-driven/references/discuss.md` | Harness-referenced document `.agent/skills/tlc-spec-driven/references/discuss.md` is an on-demand load target when linked from always-on rules or skills. |
| C488 | T2 | `.agent/skills/tlc-spec-driven/references/implement.md` | Harness-referenced document `.agent/skills/tlc-spec-driven/references/implement.md` is an on-demand load target when linked from always-on rules or skills. |
| C489 | T2 | `.agent/skills/tlc-spec-driven/references/lessons.md` | Harness-referenced document `.agent/skills/tlc-spec-driven/references/lessons.md` is an on-demand load target when linked from always-on rules or skills. |
| C490 | T2 | `.agent/skills/tlc-spec-driven/references/memory.md` | Harness-referenced document `.agent/skills/tlc-spec-driven/references/memory.md` is an on-demand load target when linked from always-on rules or skills. |
| C491 | T2 | `.agent/skills/tlc-spec-driven/references/specify.md` | Harness-referenced document `.agent/skills/tlc-spec-driven/references/specify.md` is an on-demand load target when linked from always-on rules or skills. |
| C492 | T2 | `.agent/skills/tlc-spec-driven/references/sub-agents.md` | Harness-referenced document `.agent/skills/tlc-spec-driven/references/sub-agents.md` is an on-demand load target when linked from always-on rules or skills. |
| C493 | T2 | `.agent/skills/tlc-spec-driven/references/tasks.md` | Harness-referenced document `.agent/skills/tlc-spec-driven/references/tasks.md` is an on-demand load target when linked from always-on rules or skills. |
| C494 | T2 | `.agent/skills/tlc-spec-driven/references/validate.md` | Harness-referenced document `.agent/skills/tlc-spec-driven/references/validate.md` is an on-demand load target when linked from always-on rules or skills. |
| C495 | T2 | `.agent/skills/tlc-spec-driven/references/verify-screens.md` | Harness-referenced document `.agent/skills/tlc-spec-driven/references/verify-screens.md` is an on-demand load target when linked from always-on rules or skills. |
| C496 | T2 | `.agent/skills/web-design-guidelines/references/guideline.md` | Harness-referenced document `.agent/skills/web-design-guidelines/references/guideline.md` is an on-demand load target when linked from always-on rules or skills. |
| C497 | T2 | `.notebook/INDEX.md` | Harness-referenced document `.notebook/INDEX.md` is an on-demand load target when linked from always-on rules or skills. |
| C498 | T2 | `.specs/STATE.md` | Harness-referenced document `.specs/STATE.md` is an on-demand load target when linked from always-on rules or skills. |
| P001 | T0 | `AGENTS.md` | Run the project script `dev` when you need that workflow. |
| P002 | T0 | `AGENTS.md` | Run the project script `build` when you need that workflow. |
| P003 | T1 | `.agents/skills/workflow-tips/SKILL.md` | Prefer clear variable names and small functions when writing code. |
| P004 | T1 | `.agents/skills/workflow-tips/SKILL.md` | Keep layers thin and delegate work to the appropriate lower layer. |
| P005 | T0 | `AGENTS.md` | Never commit secrets, API keys, or credentials into the repository; use environment configuration outside version control. |
| P006 | T0 | `AGENTS.md` | Known caveat: commands that pass locally can still fail in CI when they depend on machine-local env vars or secrets that are not present in the pipeline; prefer the project's documented CI entrypoint when validating. |

## Output

Write scores as a table: `| ID | Cost | Class | Evidence | Confidence | Trim suggestion |`

