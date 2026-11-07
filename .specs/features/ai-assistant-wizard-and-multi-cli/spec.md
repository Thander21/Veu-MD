# Feature Specification: AI Assistant Wizard and Multi-CLI Provider Switcher

## Problem Statement
Atualmente o painel do Assistente de IA (`AiAssistantPanel.svelte`) está configurado primordialmente para o runner de CLI `agy` (Google Antigravity), sem verificação antecipada de disponibilidade no ambiente do usuário e sem capacidade visual de alternar entre múltiplos provedores de CLI (como Claude Code, Aider, Ollama). 

Quando o usuário ainda não possui uma CLI instalada, ou deseja utilizar um assistente diferente ou alternar qual ferramenta é a padrão, falta um fluxo guiado (Wizard de boas-vindas) capaz de checar a presença das CLIs no PATH do sistema, oferecer instalação com 1 clique diretamente via Terminal Veu integrado e permitir alternância rápida entre múltiplos agentes instalados.

## Out of Scope
- Embutir modelos locais de IA de 500MB+ dentro do pacote do app (invariante de leveza e footprint de ~5MB do Veu MD).
- Instalar gerenciadores de pacotes não disponíveis no sistema do usuário (o terminal executa os comandos oficiais usando os gerenciadores já disponíveis: `npm`, `pip`, `winget`, `curl`).
- Runtimes secundários de WebView para login OAuth de terceiros.

## Assumptions & Open Questions
- **Assumptions**:
  - As ferramentas de IA operam através de CLIs interativas de terminal ou comandos JSON/stdio (`agy`, `claude`, `aider`, `ollama`).
  - O terminal integrado do Veu MD (`TerminalVeuPanel`) é o veículo ideal para executar os comandos de instalação interativos onde o usuário pode autorizar e autenticar.
  - O estado da IA padrão e das ferramentas ativas pode ser persistido localmente (`localStorage` e config JSON).

Open questions:
1. *Quais ferramentas de IA devem vir pré-listadas no catálogo do Wizard?* (Sugestão: Google Antigravity `agy`, Anthropic Claude Code `claude`, Aider `aider`, Ollama Local `ollama`).
2. *Como deve ser a alternância no dia a dia?* (Sugestão: um Dropdown compacto no cabeçalho do Chat IA permitindo alternar a IA ativa entre as instaladas).
3. *Fluxo de instalação*: O botão de instalação deve abrir uma nova aba no Terminal Veu com o comando pré-digitado ou executar imediatamente com confirmação?

## User Stories
- **US1**: Como usuário sem CLI instalada, ao abrir o Chat IA pela primeira vez, quero ver um Wizard interativo que verifica meu sistema e me guia na instalação da ferramenta desejada via terminal.
- **US2**: Como desenvolvedor com múltiplas CLIs instaladas (`agy`, `claude`, `aider`), quero poder definir qual é a IA padrão e alternar facilmente entre elas dentro do Chat IA.
- **US3**: Como usuário, quero poder reabrir a aba de configurações a qualquer momento para ajustar parâmetros, testar conexão ou instalar novas ferramentas.

## Requirement Traceability

### EARS Requirements
- **WIZARD-01**: The system shall detect whether supported AI CLI tools (`agy`, `claude`, `aider`, `ollama`) are installed in the user system PATH upon opening the AI Assistant panel.
- **WIZARD-02**: When no supported AI CLI is detected or when the user triggers the setup guide, the system shall display the onboarding Wizard step-by-step view in the AI Assistant panel.
- **WIZARD-03**: When the user clicks the install button for a selected CLI in the Wizard, the system shall send the canonical installation command to an active session in the integrated Terminal Veu.
- **PROVIDER-01**: When multiple AI CLI tools are installed, the system shall allow the user to select the default provider via a header dropdown and via the settings tab.
- **PROVIDER-02**: The system shall persist the chosen default AI CLI and user preferences in local settings across app restarts.
- **CONFIG-01**: The AI Assistant panel shall provide a dedicated Settings tab (`Aba de Configuração`) allowing users to switch models, manage providers, and re-launch the wizard.
