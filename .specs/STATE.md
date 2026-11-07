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

---

## Handoff

- **Feature**: veu-md-advanced / .specs/features/veu-md-advanced/
- **Phase / Task**: Phase 4: Execute / T05: Exportação Fiel ao Tema Ativo (PDF & Copiar HTML)
- **Completed**:
  - AD-001..AD-012
  - Backlog Técnico Anti-Bloat documentado em `Docs/BACKLOG_TECNICO.md`
  - context.md registrado com decisões 1 a 5 aprovadas
  - spec.md atualizado com requisitos EARS (18 critérios, 0 erros no validador)
  - tasks.md configurado com portões determinísticos e checks comprováveis (0 erros no validador)
  - Portão `validate_tasks.py veu-md-advanced --execute` verificado com sucesso
  - T01: Terminal Multi-Projeto Persistente implementado e commitado (82db697)
  - T02: Ergonomia, Seleção com Mouse e Ações Rápidas no Terminal implementado e commitado (1c69092)
  - T03: Smart Paste de IA & Normalização Estrutural de Markdown implementado e commitado (833609e)
  - T04: Quick Open (Ctrl+P) Fuzzy Finder no Projeto Ativo implementado e commitado (68d8b04)
- **In-progress**: T05: Exportação Fiel ao Tema Ativo (PDF Print & Copiar HTML)
- **Next step**: Implementar botão e atalho de exportação para PDF via @media print estilizado e ação 'Copiar como HTML formatado'.
- **Blockers**: none
- **Uncommitted files**: none
- **Branch**: master

