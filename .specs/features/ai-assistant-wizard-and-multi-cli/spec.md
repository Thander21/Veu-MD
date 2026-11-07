# Feature Specification: AI Assistant Wizard and Multi-CLI Provider Switcher

**Approved**: 2026-11-07 - user: "aprovado"

## Problem Statement
Atualmente o painel do Assistente de IA (`AiAssistantPanel.svelte`) está configurado primordialmente para o runner de CLI `agy` (Google Antigravity), sem verificação antecipada de disponibilidade no ambiente do usuário e sem capacidade visual de alternar entre múltiplos provedores de CLI com planos mensais (como Claude Code e Muse Code).

Quando o usuário ainda não possui uma CLI instalada, ou deseja utilizar um assistente diferente ou alternar qual ferramenta é a padrão, é necessário um fluxo guiado (Wizard de boas-vindas) capaz de checar a presença das CLIs no PATH do sistema, oferecer instalação com 1 clique diretamente via Terminal Veu integrado e permitir alternância rápida entre múltiplos agentes instalados mantendo controle total sobre a execução.

## Out of Scope
- Embutir modelos locais de IA de 500MB+ dentro do pacote do app (invariante de leveza e footprint de ~5MB do Veu MD).
- Instalar gerenciadores de pacotes não disponíveis no sistema do usuário (o terminal executa os comandos oficiais usando os gerenciadores já disponíveis: `npm`, `powershell`/`irm`, `curl`).
- Runtimes secundários de WebView para login OAuth de terceiros (o login é realizado na sessão do Terminal Veu com controle total do usuário).

## Assumptions & Open Questions
- **Assumptions**:
  - As 3 ferramentas principais suportadas são: **Google Antigravity** (`agy`), **Anthropic Claude Code** (`claude`) e **Muse Code** (`muse`).
  - A instalação envia o comando canônico de instalação para uma sessão dedicada no Terminal Veu e inicia a execução automaticamente, deixando o processo visível com controle total do usuário.
  - Após a instalação, a ferramenta fica disponível para comandos normais no chat ou acesso interativo total via terminal.
  - A seleção da IA ativa e da IA padrão é salva em configurações locais (`localStorage`) e persiste entre reinicializações.

Open questions: none

## User Stories
- **US1**: Como usuário sem CLI instalada, ao abrir o Chat IA pela primeira vez, quero ver um Wizard interativo que verifica se `agy`, `claude` ou `muse` estão instalados no meu sistema e me guia na instalação da ferramenta desejada via terminal.
- **US2**: Como desenvolvedor com múltiplas CLIs instaladas (`agy`, `claude`, `muse`), quero poder definir qual é a IA padrão e alternar facilmente entre elas dentro do Chat IA por um dropdown compacto.
- **US3**: Como usuário, quero poder abrir a aba de configurações a qualquer momento para ajustar parâmetros, testar conexão ou instalar novas ferramentas.
- **US4**: Como desenvolvedor, quero poder alternar entre o modo de chat conversacional e o modo de acesso total no terminal para qualquer uma das 3 IAs.

## Requirement Traceability

### EARS Requirements
- **WIZARD-01**: The system shall detect whether supported AI CLI tools (`agy`, `claude`, `muse`) are present in the system PATH upon opening the AI Assistant panel.
- **WIZARD-02**: When no supported AI CLI is detected or when the user invokes the configuration wizard, the system shall display the onboarding Wizard step-by-step view in the AI Assistant panel.
- **WIZARD-03**: When the user clicks the install button for a selected CLI in the Wizard, the system shall create a dedicated terminal session in Terminal Veu and automatically initiate the installation command.
- **PROVIDER-01**: When multiple AI CLI tools are installed, the system shall allow the user to select the default provider via a header dropdown and via the settings tab.
- **PROVIDER-02**: The system shall persist the chosen default AI CLI and user preferences in local settings across app restarts.
- **CONFIG-01**: The AI Assistant panel shall provide a dedicated Settings tab allowing users to switch models, manage providers, test availability, and re-launch the wizard.
- **TERMINAL-01**: When a provider is installed, the system shall provide an action to open a full interactive session of that CLI directly in the integrated Terminal Veu.
