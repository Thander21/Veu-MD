# Veu MD — Editor Markdown WYSIWYG Estilo Word

> **Veu MD** é um editor desktop e multiplataforma de Markdown (`.md`) e Texto Puro (`.txt`), leve, moderno e ultra-rápido. Ele combina a experiência visual rica de um processador de texto estilo Microsoft Word (sem exibir tags brutas de formatação na tela) com a fidelidade total de serialização em disco como Markdown GitHub Flavored Markdown (GFM) puro.

---

## 🚦 Status das Plataformas

| Plataforma | Status | Descrição |
| --- | --- | --- |
| 🌐 **Web** | ✅ **100% Funcional** | Execução completa via Vite + Svelte 5 no navegador. |
| 💻 **Desktop (Windows)** | ✅ **100% Funcional** | Executável nativo compilado com Tauri v2, terminal PTY contextual e watcher. |
| 📱 **Mobile (Android / APK)** | ⏳ **Em Validação** | Scaffold Android (`gen/android`) e alvos Rust configurados; validação do APK e testes no dispositivo em andamento. |

---

## 🌟 Principais Recursos

* **Edição 100% WYSIWYG Estilo Word:** Digitação limpa e sem ruído visual. Os caracteres de sintaxe (`#`, `**`, `*`, `>`, \`\`\`\`) **nunca** aparecem no documento durante a escrita ou leitura.

* **Fidelidade GFM no Disco:** O arquivo salvo em disco é `.md` puro padrão, perfeitamente legível no GitHub, VS Code, Obsidian ou qualquer outro leitor.

* **Barra Superior Completa + Barra Flutuante:** Formatação rica ao alcance de um clique ou seleção de texto (Títulos H1–H6, Negrito, Itálico, Sublinhado, Tachado, Marca-texto, Código inline, Blocos de código, Listas numeradas e com marcadores, Checklists interativas, Tabelas, Citações, Links e Imagens).

* **Atalhos Rápidos de Digitação (`#` e `/`):** Digitar `#` abre um seletor instantâneo de níveis de título; digitar `/` abre o menu completo de blocos.

* **Gerenciador de Abas & Auto-Save:** Suporte a múltiplos arquivos abertos simultaneamente, atalho clássico `Ctrl + S`, salvamento automático inteligente com debounce de 1000ms e restauração de sessão.

* **Explorer Lateral com Foco em Conteúdo:** Árvore de arquivos completa com ícones contextuais; foca a abertura e edição em arquivos de texto (`.md` e `.txt`). Inclui pesquisa em tempo real, criação e exclusão rápida de arquivos.

* **Sumário Dinâmico (Outline):** Painel com os títulos do documento aberto para navegação veloz.

* **Motor de Temas Acelerado por GPU:** Controle cirúrgico de cores e tipografia por tag via CSS Custom Properties no `:root`. Zero custo de re-renderização de CPU ao trocar de tema. Suporta presets claros/escuros e importação/exportação de temas em formato JSON.

* **Terminal Contextual Integrado (`Ctrl + '`):** Painel inferior retrátil com terminal PTY real (PowerShell, CMD, Git Bash), iniciando automaticamente no diretório aberto no Explorer.

* **Sincronização com o Disco (Watcher):** Detecção automática de alterações externas no sistema de arquivos.

* **Colar Imagens Inteligente (`Ctrl + V`):** Imagens do clipboard são gravadas automaticamente em pasta de assets e linkadas no documento.

---

## 🏗️ Arquitetura e Tecnologias

```
flowchart TD
    subgraph Frontend["Frontend (Svelte 5 + TypeScript + Vite) — Zero Virtual DOM"]
        UI["Abas, Sidebar, Menus e Painel de Temas"]
        Editor["Motor WYSIWYG: ProseMirror Core Direto"]
        Themes["Motor de Estilos GPU (:root CSS Custom Properties)"]
        TerminalUI["Terminal: @xterm/xterm WebGL"]

        UI --> Editor
        UI --> Themes
        UI --> TerminalUI
    end

    Frontend <-->|Tauri IPC / Channels de Alta Velocidade| RustBackend

    subgraph RustBackend["Backend Nativo em Rust (Tauri v2) — Pegada de RAM ~35MB"]
        FS["Gerenciador de Arquivos (.md e .txt)"]
        Watcher["File Watcher em tempo real (crate 'notify')"]
        PTY["Terminal Real PTY (crate 'portable-pty')"]
    end
```

---

## 📋 Pré-requisitos de Instalação

### Requisitos Comuns:

* **Node.js** (versão 18 ou superior) e **npm**

* **Rust Toolchain** (versão 1.77 ou superior): [rustup.rs](https://rustup.rs/) 

### Para compilação Desktop (Windows):

* **C++ Build Tools:** Visual Studio C++ Build Tools ou Visual Studio Community (com carga de trabalho "Desenvolvimento para desktop com C++").

* **Windows 10/11 SDK** (inclui `rc.exe` — o projeto conta com detecção automática de fallback no `build.rs`).

### Para compilação Mobile (Android) — \[Em Validação\]:

* **Android Studio** com SDK Platform (API 24+), Command-line Tools e NDK instalados (ex: NDK 27.x).

* **Java JDK / JBR** (JDK 17/21 ou o JBR embutido do Android Studio).

* Targets Rust Android adicionados via rustup:

  ```
  $env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
  rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
  ```

---

## 🚀 Instalação do Projeto

Clone o repositório e instale as dependências:

```
git clone https://github.com/seu-usuario/veu-md.git
cd veu-md
npm install
```

---

## 💻 Como Executar em Desenvolvimento

### 1. Versão Web (Navegador)

Ideal para prototipagem rápida de componentes, testes de estilização e validação de schema ProseMirror:

```
npm run dev
```

Acesse a URL exibida no terminal (por padrão `http://127.0.0.1:1420` ou `http://localhost:5173`).

### 2. Versão Desktop (Windows / macOS / Linux)

Inicia o aplicativo com a janela nativa Tauri v2, terminal PTY real e acesso local a arquivos:

```
# No PowerShell (garantindo o caminho do Cargo):
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; npm run tauri dev
```

*Caso seu ambiente já possua o Cargo no PATH global:*

```
npm run tauri dev
```

### 3. Versão Mobile (Android) — \[Em Validação\]

> **Nota:** O suporte Android está em processo de validação de compatibilidade e estabilidade. O scaffold nativo já foi gerado em `src-tauri/gen/android`.

Para executar em dispositivo físico conectado (com Depuração USB habilitada) ou no emulador Android Studio:

```
# 1. Configurar variáveis de ambiente essenciais na sessão do PowerShell:
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:NDK_HOME = "$env:ANDROID_HOME\ndk\27.0.12077973"

# 2. Executar no emulador ou aparelho (valide se está visível com 'adb devices'):
npx tauri android dev
```

*Para direcionar uma arquitetura específica:*

```
npx tauri android dev --target aarch64-linux-android
```

---

## 📦 Como Gerar as Builds de Produção (Release)

### 1. Build da Versão Web

Gera os arquivos estáticos otimizados (HTML, CSS, JS minificados) prontos para deploy:

```
npm run build
```

* **Saída:** pasta `dist/` na raiz do projeto.

* **Teste local:** `npm run preview`.

### 2. Build da Versão Desktop (.exe / .msi)

Compila o backend Rust em modo release e empacota o executável com instalador:

```
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"; npm run tauri build
```

* **Saída:**

  * Binário executável: `src-tauri/target/release/veu-md.exe`

  * Instaladores (MSI / NSIS): `src-tauri/target/release/bundle/`

### 3. Build da Versão Android (APK / AAB) — \[Em Validação\]

Gera os pacotes para validação e testes em dispositivos Android:

```
# 1. Configurar variáveis na sessão do PowerShell:
$env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:NDK_HOME = "$env:ANDROID_HOME\ndk\27.0.12077973"

# 2. Gerar APK Debug (recomendado para testes locais e validação inicial):
npx tauri android build --apk --debug

# 3. Gerar APK Release (otimizado):
npx tauri android build --apk

# 4. Gerar AAB (Android App Bundle para Google Play Store):
npx tauri android build --aab
```

* **Saída dos pacotes:**

  * APK Debug: `src-tauri/gen/android/app/build/outputs/apk/universal/debug/`

  * APK Release: `src-tauri/gen/android/app/build/outputs/apk/universal/release/`

  * AAB Release: `src-tauri/gen/android/app/build/outputs/bundle/release/`

---

## ⌨️ Principais Atalhos de Teclado

| Atalho | Ação |
| --- | --- |
| `Ctrl + S` | Salvar o arquivo aberto na aba ativa |
| `Ctrl + '` | Alternar exibição do terminal integrado |
| `Ctrl + B` | Alternar Negrito no texto selecionado |
| `Ctrl + I` | Alternar Itálico no texto selecionado |
| `Ctrl + U` | Alternar Sublinhado no texto selecionado |
| `Ctrl + K` | Inserir link Markdown |
| `Ctrl + V` | Colar texto ou colar imagem (salvando asset automaticamente) |
| `#` | Abrir menu rápido de títulos (H1..H6) |
| `/` | Abrir menu de comandos de blocos |
| `Tab` | Navegar para próxima célula de tabela (ou criar nova linha na última célula) |

---

## 📁 Estrutura do Repositório

```
├── .agent/               # Habilidades dos agentes SDD (Tech Lead's Club)
├── .agents/              # Lockfile de dependências de skills
├── .specs/               # Especificações, tasks determinísticas e proofs
├── Docs/                 # Documentação e guias de referência rápida
│   ├── c.md              # Cheat-sheet de comandos rápidos (Web, Desktop, Android)
│   └── PLANO_E_STACK...  # Especificação técnica e arquitetura de referência
├── src/                  # Frontend Svelte 5
│   ├── lib/              # Componentes de UI (Editor, TabBar, Sidebar, TopBar, etc.)
│   ├── prosemirror/      # Configuração de Schema, Serializador GFM e Input Rules
│   ├── stores/           # Gerenciadores de estado (Abas, Arquivos, Temas)
│   └── App.svelte        # Componente raiz da aplicação
├── src-tauri/            # Backend nativo Tauri v2 em Rust
│   ├── src/              # Código Rust (lib.rs, main.rs, PTY, watcher)
│   ├── build.rs          # Script de build com detecção automática do rc.exe
│   └── tauri.conf.json   # Metadados e configurações da janela e bundle
├── AGENTS.md             # Diretrizes e invariantes para agentes de desenvolvimento
└── package.json          # Scripts e dependências do ecossistema NPM
```

---

## 📄 Licença

Distribuído sob licença proprietária/MIT. Veja o arquivo de licença para mais detalhes.