# Project State & Memory

## Decisions

### AD-001
- **Decision**: Adotar Tauri v2 + Rust para o runtime desktop multiplataforma e shell de sistema.
- **Reason**: Proporciona binários leves (~15MB), inicialização instantânea e pegada de memória de ~35MB a 50MB, sem o overhead do Electron.
- **Trade-off**: Requer toolchain Rust (rustc/cargo) e MSVC C++ no ambiente de desenvolvimento.
- **Scope**: Backend desktop, empacotamento, distribuição.
- **Date**: 2026-11-06
- **Status**: active

### AD-002
- **Decision**: Utilizar Svelte 5 + TypeScript + Vite para a interface gráfica (UI).
- **Reason**: Compilação para DOM cirúrgico direto sem Virtual DOM (Zero VDOM), trazendo latência mínima e consumo mínimo de JS heap.
- **Trade-off**: Ecossistema de bibliotecas React preexistentes não é utilizável diretamente, exigindo componentes nativos em Svelte ou bibliotecas vanilla.
- **Scope**: Frontend, componentes visuais, abas, árvore de arquivos, temas.
- **Date**: 2026-11-06
- **Status**: active

### AD-003
- **Decision**: Utilizar ProseMirror Core direto para o motor de edição WYSIWYG estilo Word com serialização GFM pura.
- **Reason**: É o padrão da indústria (em produção desde 2015), 100% agnóstico de framework, permitindo ocultar tags na tela enquanto preserva integridade byte-a-byte do Markdown no disco.
- **Trade-off**: Requer configuração manual de esquemas e plugins em vez de usar um wrapper de alto nível fechado.
- **Scope**: Editor central, renderização de blocos e marks, importação/exportação Markdown.
- **Date**: 2026-11-06
- **Status**: active

### AD-004
- **Decision**: Integrar terminal com crate Rust `portable-pty` transmitindo saída para `xterm.js` WebGL no frontend.
- **Reason**: Fornece emulação de terminal nativa (PowerShell, CMD, Git Bash) contextualizada na pasta aberta com zero dependência de Node.js em runtime.
- **Trade-off**: Requer canal IPC de streaming em background entre threads Rust e o frontend.
- **Scope**: Painel inferior retrátil de terminal.
- **Date**: 2026-11-06
- **Status**: active

### AD-005
- **Decision**: Motor de cores por tag e temas baseado 100% em CSS Custom Properties (:root) aceleradas por GPU.
- **Reason**: Alterações de cores e tipografia no painel lateral são renderizadas em menos de 0,1ms pelo compositor gráfico, sem re-renderizar nós do editor ProseMirror.
- **Trade-off**: Todo elemento estilizável deve mapear para classes semânticas CSS fixas.
- **Scope**: Theming, painel de aparência, leitura e exportação.
- **Date**: 2026-11-06
- **Status**: active

### AD-006
- **Decision**: Adotar `tlc-spec-driven` do Tech Lead's Club como framework orquestrador de desenvolvimento dirigido por especificações (SDD).
- **Reason**: Fornece validação determinística via scripts Python com portões de qualidade (gates), rastreabilidade de requisitos EARS e verificação independente.
- **Trade-off**: Exige disciplina de especificações e tarefas atômicas antes da execução.
- **Scope**: Processo de engenharia, governança, testes e entrega.
- **Date**: 2026-11-06
- **Status**: active

### AD-007
- **Decision**: Fatiar o projeto em fases, concentrando a primeira especificação no MVP funcional e arquitetura limpa de ponta a ponta.
- **Reason**: Reduz complexidade inicial, permite validar a cadeia de integração ProseMirror + Tauri + Svelte 5 + PTY antes de refinar detalhes secundários.
- **Trade-off**: Recursos de visualização avançada de diff inline e exportações complexas ficam para a fase seguinte.
- **Scope**: Planejamento de entrega, roadmap, definição de escopo do MVP.
- **Date**: 2026-11-06
- **Status**: active

### AD-008
- **Decision**: Adotar salvamento automático com debounce de 1000ms após cessar digitação, mantendo atalho imediato `Ctrl + S`.
- **Reason**: Evita perda de dados do usuário e dispensa cliques contínuos de salvamento sem saturar I/O do disco.
- **Trade-off**: Dispara escritas assíncronas no disco em arquivos grandes se o debounce for muito curto; 1000ms é o ponto de equilíbrio ótimo.
- **Scope**: Editor, persistência de arquivos, ciclo de vida do documento.
- **Date**: 2026-11-06
- **Status**: active

### AD-009
- **Decision**: Criação obrigatória prévia de arquivos no workspace antes da edição e resolução de assets colados em `./assets/`.
- **Reason**: Garante que todo documento ativo possua caminho absoluto no sistema de arquivos, viabilizando persistência determinística e imediata de imagens coladas via clipboard (`Ctrl + V`).
- **Trade-off**: O usuário não inicia em um buffer puramente efêmero na memória sem pasta definida; ao clicar em novo arquivo, `novo_arquivo.md` é criado no diretório ativo.
- **Scope**: Gerenciamento de arquivos, explorer lateral, área de transferência.
- **Date**: 2026-11-06
- **Status**: active

### AD-010
- **Decision**: Sincronização externa básica no MVP recarregando o documento e emitindo notificação na status bar.
- **Reason**: Fornece consistência imediata com operações externas (ex: comandos git no terminal embutido) com implementação enxuta e confiável.
- **Trade-off**: Diff inline visual com cores de adição/remoção é postergado para a fase de refinamento.
- **Scope**: File watcher, status bar, sincronização com terminal.
- **Date**: 2026-11-06
- **Status**: active

### AD-011
- **Decision**: Manter sessões de terminal e processos PTY isolados por projeto (`Map<ProjectId, TerminalSession>`) com visibilidade alternada via CSS sem recriar nós do DOM.
- **Reason**: Evita que comandos de longa duração (compilações, servidores locais, scripts de IA) sejam interrompidos ao navegar entre múltiplos projetos abertos no workspace.
- **Trade-off**: Retém contêineres e buffers leves de xterm na memória para cada projeto aberto ativo, encerrando-os apenas ao fechar o projeto.
- **Scope**: Terminal nativo, gerenciamento multi-projeto, ciclo de vida de PTY.
- **Date**: 2026-11-07
- **Status**: active

### AD-012
- **Decision**: Aperfeiçoar o terminal integrado com seleção contínua de mouse, proteção de recalculo de `fitAddon` (apenas em containers com largura/altura > 0) e barra de ações rápidas ("Copiar Seleção", "Limpar", "Inserir no Cursor").
- **Reason**: O xterm clássico cru dificulta seleção de texto com mouse, quebra métricas de colunas quando redimensionado oculto e intimida usuários leigos.
- **Trade-off**: Adiciona pequenas camadas de botões e listeners de clipboard no componente Svelte, mantendo overhead < 1 MB de RAM.
- **Scope**: TerminalPanel.svelte, usabilidade, seleção e clipboard.
- **Date**: 2026-11-07
- **Status**: active

### AD-013
- **Decision**: Reorganizar semântica da TopBar, movendo Salvar, Imprimir e Copiar HTML para o grupo de formatação do editor e dedicando o topo esquerdo para o assistente IA Wizard (`Wand2`) e busca rápida (`Ctrl+P`).
- **Reason**: Desacopla ações de arquivo único do seletor de pastas de projetos e elimina botões redundantes com a barra lateral de arquivos.
- **Trade-off**: Usuários acostumados com "Salvar" no canto esquerdo encontram agora a ação no fluxo de formatação junto a desfazer/refazer.
- **Scope**: TopBar.svelte, App.svelte, ações do documento.
- **Date**: 2026-11-07
- **Status**: active

### AD-014
- **Decision**: Eliminar gatilho redundante de terminal da barra de ferramentas do Explorer (`Sidebar.svelte`).
- **Reason**: O terminal já é acessível tanto no topo direito (`TopBar`) quanto no rodapé (`StatusBar`), evitando poluição visual nas ações de pasta/arquivo.
- **Trade-off**: Usuários que preferiam clicar no terminal dentro da barra de arquivos usam os atalhos ou os botões dedicados de topo/rodapé.
- **Scope**: Sidebar.svelte, Explorer toolbar.
- **Date**: 2026-11-07
- **Status**: active

### AD-015
- **Decision**: Remover o botão de fechar sobreposto (`X`) no topo dos avatares de projeto em `ProjectSidebar.svelte`, padronizando o fechamento via clique com botão direito ou pelo botão vermelho `X` pós-nome no Explorer.
- **Reason**: O botão sobreposto anterior obstruía o clique no avatar e causava fechamentos acidentais de projetos ativos.
- **Trade-off**: O fechamento na activity bar agora ocorre via menu de contexto / botão direito ou na barra de título do Explorer.
- **Scope**: ProjectSidebar.svelte, Sidebar.svelte, ergonomia de projetos.
- **Date**: 2026-11-07
- **Status**: active

### AD-016
- **Decision**: Adotar o tema oficial "Veu MD" (`veumd`) inspirado na paleta Crepúsculo Editorial Obsidian (`#0e0b16`, `#f472b6`, `#c084fc`, `#7c3aed`), definindo-o como tema padrão e utilizando seletor dropdown com comutação automática para "Personalizado".
- **Reason**: Estabelece a identidade visual canônica da marca com zero atrito de configuração manual para usuários que alteram qualquer valor de cor ou layout.
- **Trade-off**: Altera o tema inicial de primeiro uso de `veu` para `veumd`.
- **Scope**: defaultThemes.ts, themeStore.ts, ThemeSettings.svelte.
- **Date**: 2026-11-07
- **Status**: active

### AD-017
- **Decision**: Substituir a emulação CRT de xterm.js pelo Terminal Veu com fluxo sequencial, linha do tempo de blocos de comando/saída formatada com parser ANSI nativo e prompt interativo editável ao final do fluxo com bloqueio de concorrência.
- **Reason**: Atende aos dois princípios centrais do produto (leveza e uso intuitivo) e elimina a rigidez de edição de texto do xterm, prevenindo confusão de comandos concorrentes e entregando leitura editorial limpa sem poluição de códigos ANSI.
- **Trade-off**: Programas de tela cheia baseados em ncurses/TUI (como vim puro ou htop) não são suportados, priorizando desenvolvedores e redatores que executam comandos sequenciais de compilação, testes, git, scripts e IA.
- **Scope**: TerminalPanel.svelte, ansiParser.ts, ergonomia de terminal.
- **Date**: 2026-11-07
- **Status**: active

### AD-018
- **Decision**: Redesenhar a interface do Veu MD com barra lateral esquerda de ponta a ponta (topo ao rodapé), redimensionável dinamicamente (180px a 600px), remoção de logo/título da TopBar, migração das ações de projeto ("Trocar Projeto", Wizard desativado, Lupa) para o cabeçalho do Sidebar e splash screen dark com logo Crepúsculo durante o boot para eliminar tela branca do WebView2.
- **Reason**: Remove ruídos visuais do topo, unifica o contexto de projeto diretamente sobre a árvore de arquivos, permite acomodar caminhos e nomes longos de arquivos através de redimensionamento e elimina o flash branco indesejado na abertura do aplicativo.
- **Trade-off**: A TopBar agora atua estritamente sobre a área do documento/editor central, e o cabeçalho do sidebar se oculta por completo quando recolhido.
- **Scope**: index.html, tauri.conf.json, App.svelte, Sidebar.svelte, ProjectSidebar.svelte, TopBar.svelte.
- **Date**: 2026-11-07
- **Status**: active

### AD-019
- **Decision**: Centralizar contratos e interfaces de comunicação IPC (TypeScript ↔ Rust) sob `src/types/ipc.ts`.
- **Reason**: Assegura tipagem estrita de argumentos e retornos em chamadas `invoke()`, prevenindo incompatibilidade de chaves em tempo de execução e eliminando tipos `any` soltos.
- **Trade-off**: Exige atualização do contrato TypeScript ao alterar ou adicionar comandos no Rust.
- **Scope**: src/types/ipc.ts, src-tauri/src/commands/, frontend stores e componentes.
- **Date**: 2026-11-09
- **Status**: active

### AD-020
- **Decision**: Implementar Ring-Buffer de retenção de blocos históricos na timeline do Terminal Veu com descarte FIFO após 500 blocos.
- **Reason**: Previne vazamento de memória e acúmulo desnecessário de centenas de nós DOM no WebView2 durante sessões longas de desenvolvimento, compilação ou streaming de logs.
- **Trade-off**: Histórico superior a 500 comandos/saídas não é retido indefinidamente em memória da UI.
- **Scope**: terminalStore.ts, TerminalPanel.svelte, gerenciamento de timeline.
- **Date**: 2026-11-09
- **Status**: active

### AD-021
- **Decision**: Estabelecer a adoção progressiva de Runes do Svelte 5 (`$state`, `$derived`) em novos módulos de estado e refatorações, mantendo retrocompatibilidade com stores existentes.
- **Reason**: Alinha o código-fonte ao padrão nativo do Svelte 5, reduzindo boilerplate de subscrição manual e otimizando a granularidade reativa.
- **Trade-off**: Convivência temporária de módulos com stores legados e módulos baseados em Runes durante o período de transição.
- **Scope**: src/stores/, reatividade frontend, Svelte 5.
- **Date**: 2026-11-09
- **Status**: active

### AD-022
- **Decision**: Isolar o timer de auto-save por aba (`Map<string, Timeout>`) e descarregar persistência síncrona na troca de abas e no fechamento.
- **Reason**: Elimina race condition onde alternar abas antes de 1000ms salvava a aba errada e perdia digitação.
- **Trade-off**: Requer gerenciar a limpeza de múltiplos timeouts em `onDestroy`.
- **Scope**: App.svelte, ciclo de vida de abas, auto-save.
- **Date**: 2026-11-09
- **Status**: active

### AD-023
- **Decision**: Preservar o Terminal Veu e o xterm.js simultaneamente no DOM via CSS display (`.hidden`), eliminando desmontagem condicional via `{#if}`.
- **Reason**: Mantém histórico de timeline e evita processos PTY órfãos no Windows ao fechar projetos com xterm selecionado.
- **Trade-off**: Retém contêineres leves no DOM mesmo quando ocultos.
- **Scope**: TerminalPanel.svelte, TerminalVeuPanel.svelte, dual-engine.
- **Date**: 2026-11-09
- **Status**: active

### AD-024
- **Decision**: Implementar ciclo de vida completo de encerramento de PTY no Rust com emissão de `term-exit-{id}` e remoção automática de `state.terminals` ao atingir EOF.
- **Reason**: Impede acúmulo de sessões finalizadas em memória e notifica a interface imediatamente sobre o término do shell.
- **Trade-off**: Exige clonagem do Arc de terminals para a thread de leitura.
- **Scope**: src-tauri/src/commands/pty_cmd.rs, PTY lifecycle.
- **Date**: 2026-11-09
- **Status**: active

### AD-025
- **Decision**: Mapear caminhos relativos de imagem no ProseMirror para o protocolo de assets do Tauri v2 via `convertFileSrc` e `createImageNodeView`.
- **Reason**: Evita erros 404 em documentos Markdown existentes que referenciam assets locais (`./assets/img.png`), preservando a fidelidade WYSIWYG.
- **Trade-off**: Imagens relativas requerem resolução contra o diretório do documento ativo.
- **Scope**: proseMirrorSetup.ts, Editor.svelte, App.svelte.
- **Date**: 2026-11-09
- **Status**: active

### AD-026
- **Decision**: Extração desacoplada de Frontmatter YAML no ciclo de carregamento e reconstituição fiel na persistência em disco.
- **Reason**: Protege documentos com metadados (Jekyll, Hugo, Astro, Obsidian) de terem delimitadores `---` corrompidos ou transformados em linhas divisórias no ProseMirror, preservando a integridade byte-a-byte no disco e a leitura limpa WYSIWYG.
- **Trade-off**: Requer manutenção de metadados em campo dedicado no estado da aba (`TabItem.frontmatter`).
- **Scope**: src/lib/utils/frontmatter.ts, src/lib/components/FrontmatterBanner.svelte, src/App.svelte, src/lib/types.ts.
- **Date**: 2026-11-10
- **Status**: active

### AD-027
- **Decision**: Contador determinístico de tokens na StatusBar e empacotador XML de contexto de projeto (Context Dropper) com coleta seletiva e zero-bloat.
- **Reason**: Permite estimar o consumo de contexto de LLMs (~4 caracteres por token) com custo zero de CPU/memória e sem embutir dicionários Tiktoken volumosos no binário, além de empacotar arquivos/pastas no formato XML canônico reconhecido por todos os modelos de IA.
- **Trade-off**: A contagem de tokens é uma aproximação heurística de alta fidelidade (margem de ±5%) e não uma tokenização BPE exata de um modelo específico.
- **Scope**: src/lib/utils/aiContext.ts, src/lib/components/StatusBar.svelte, src/lib/components/Editor.svelte, src/lib/components/FileTreeNode.svelte, src/App.svelte.
- **Date**: 2026-11-10
- **Status**: active

### AD-028
- **Decision**: Sincronização em nuvem local-first via protocolo aberto WebDAV em segundo plano desacoplado com fila offline-first e proteção de abas ativas.
- **Reason**: Proporciona sincronização de notas e documentos sem servidor proprietário contra Nextcloud/ownCloud/WebDAV, garantindo privacidade total, custo zero de infraestrutura e zero bloqueio de digitação ou salvamento em disco.
- **Trade-off**: Requer configuração de credenciais WebDAV pelo usuário nas configurações do app.
- **Scope**: src/lib/services/cloudSyncService.ts, src/lib/components/CloudSyncModal.svelte, src/lib/components/StatusBar.svelte, src/App.svelte, src-tauri/tauri.conf.json.
- **Date**: 2026-11-10
- **Status**: active

---

## Handoff

- **Feature**: zero-server-cloud-sync / .specs/features/zero-server-cloud-sync/
- **Phase / Task**: Phase 4: Verification / Complete & Verified (PASS)
- **Completed**:
  - AD-028
  - spec.md com critérios EARS validados (SYNC-01..SYNC-04)
  - tasks.md validado com portões determinísticos (T01..T04 concluídos)
  - T01: Cliente WebDAV, autenticação Basic e fila assíncrona tolerante a offline em TypeScript puro (`cloudSyncService.ts`)
  - T02: Integração de enfileiramento em background não-bloqueante no saveTab e proteção de dirty tabs (`App.svelte`)
  - T03: Modal de configurações WebDAV (`CloudSyncModal.svelte`) e indicador de estado de sync na StatusBar (`StatusBar.svelte`)
  - T04: Suíte automatizada com 5 grupos de testes (`test_cloud_sync.mjs`) integrada ao executor global npm test
  - proofs.md gerado com 5 pass, 0 fail no HEAD
  - verification.md verificado e aprovado com validate_verification
  - Rastreabilidade de requisitos SYNC-01..SYNC-04 atualizada e selada como passed
  - Todas as 15 features formais do repositório concluídas e 100% verificadas
- **In-progress**: none
- **Next step**: Ciclo completo de especificações e backlog concluído. Sistema pronto para compilação final, release ou novas demandas do usuário.
- **Blockers**: none
- **Uncommitted files**: none
- **Branch**: master

