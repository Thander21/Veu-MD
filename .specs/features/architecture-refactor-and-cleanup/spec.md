# Feature Specification: Architecture Refactoring, Cleanup, and Modularization

**Approved**: 2026-11-08 - user: "aprovado"

## Problem Statement
O Veu MD atingiu estabilidade em suas funcionalidades essenciais (edição WYSIWYG pura, temas Catppuccin, Terminal Veu nativo, visualização de imagens/SVG e assistente IA multi-provedores). No entanto, o rápido crescimento acumulou dívida técnica:
1. `App.svelte` tornou-se um "God Object" de mais de 1.100 linhas, acumulando gerenciamento de múltiplos workspaces, abas, sistema de arquivos, atalhos e integrações.
2. `TerminalPanel.svelte` precisa de organização estrutural limpa e estável para a convivência harmoniosa do motor nativo Terminal Veu (VeuLab) com o motor xterm atualizado mantido como fallback temporário.
3. Arquivos binários pesados não utilizados (`public/veu-app-icon.png` de 1.2 MB) e rascunhos de teste (`texto.md`) poluem o repositório e o diretório `dist/`.
4. O backend Rust (`src-tauri/src/lib.rs`) reúne todos os comandos de sistema de arquivos, PTY, IA e temas em um arquivo único de 607 linhas.
5. `src-tauri/tauri.conf.json` mantém `"csp": null`, operando sem Content Security Policy estrita.
6. Apenas 1 script de teste é disparado via `npm test`, deixando os demais 6 testes desarticulados.

Esta feature implementa a refatoração, limpeza e modularização completa em 3 fases estruturadas, sem quebrar nenhuma funcionalidade existente e preservando todos os invariantes do AGENTS.md.

## Out of Scope
- Alterar o design visual ou o comportamento do editor ProseMirror (a edição WYSIWYG permanece 100% idêntica).
- Modificar o protocolo ANSI semântico ou o funcionamento do Terminal Veu.
- Introduzir dependências pesadas externas (Prettier, Biome, runtime Node.js no backend).
- Quebrar compatibilidade com a compilação desktop Windows e Android.

## Assumptions & Open Questions
- **Assumptions**:
  - O motor xterm (v5.5.0) é mantido atualizado como motor secundário de convivência, enquanto o Terminal Veu opera como motor padrão ativo.
  - A extração do estado de workspaces de `App.svelte` para `projectStore.ts` preserva o isolamento de sessões, tabs ativas e dirty states entre projetos com store reativa clássica de alta performance.
  - O desmembramento de `src-tauri/src/lib.rs` em submódulos de domínio (`commands/fs_cmd.rs`, `commands/pty_cmd.rs`, etc.) acelera a compilação incremental e mantém todos os comandos Tauri inalterados para o frontend.
  - A configuração de CSP estrita permite esquemas `asset:`, `data:` e conexões locais para o WebSocket/PTY.

Open questions: none

## User Stories
- **US1**: Como desenvolvedor e usuário, quero que os arquivos de distribuição do Veu MD sejam limpos e enxutos, sem imagens redundantes de megabytes no pacote final.
- **US2**: Como desenvolvedor, quero que o backend Rust seja modularizado por domínio, facilitando manutenibilidade, leitura e compilação incremental.
- **US3**: Como desenvolvedor, quero que o componente principal `App.svelte` seja limpo e focado no layout, com o estado de projetos e sistema de arquivos isolados em stores e serviços testáveis.
- **US4**: Como desenvolvedor, quero rodar `npm test` e ter toda a suíte de validação executada com 100% de sucesso e feedback Fail-Fast.
- **US5**: Como usuário preocupado com segurança, quero que o aplicativo restrinja a execução de scripts e origens não autorizadas via CSP estrita.
- **US6**: Como desenvolvedor, quero poder alternar entre o Terminal Veu e o xterm atualizado com estabilidade enquanto a transição é homologada.

## Requirement Traceability

### EARS Requirements
- **CLEANUP-01**: The system shall support dual-engine terminal execution (Terminal Veu default and xterm fallback on the latest stable version) cleanly isolated without memory leaks.
- **CLEANUP-02**: The repository shall not include redundant heavy binary assets (`public/veu-app-icon.png`) or untracked scratch files in the distribution output.
- **TEST-01**: The project test command (`npm test`) shall execute all available automated verification suites in a unified test runner with Fail-Fast behavior.
- **RUST-MOD-01**: The Tauri backend shall organize commands into dedicated domain modules (`fs_cmd`, `pty_cmd`, `ai_cmd`, `theme_cmd`, `watcher_cmd`) with clear separation from initialization logic in `lib.rs`.
- **STORE-01**: The frontend shall isolate project workspace and tab lifecycle management into a dedicated reactive store (`projectStore.ts`).
- **AI-DECOMP-01**: The AI Assistant drawer shall isolate settings configuration into a dedicated subcomponent (`AiSettingsView.svelte`).
- **SECURITY-01**: The Tauri desktop configuration shall enforce a strict Content Security Policy (`CSP`) restricting unauthorized script and object execution.

