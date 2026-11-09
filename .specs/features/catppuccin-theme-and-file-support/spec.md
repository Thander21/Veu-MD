# Feature Spec: Catppuccin Mocha Official Theme, IDE Fonts and Multi-Format File Support

**Approved**: 2026-11-07 - user: "sim"

## Problem Statement

Atualmente, a identidade visual e o suporte a arquivos do **Veu MD** apresentam quatro limitações principais:
1. **Tema Oficial Desalinhado**: O tema oficial do Veu MD atualmente utiliza uma paleta violeta personalizada ("Crepúsculo Obsidian"), mas a identidade visual do app requer harmonização com o padrão da comunidade **Catppuccin Mocha**, aproximando as nuances de fundo (`#11111b`, `#181825`, `#1e1e2e`) e realces dos véus do logotipo (`#cba6f7`, `#f5c2e7`, `#74c7ec`), adotando a tipografia **Roboto** como fonte padrão deste tema.
2. **Nomenclatura Obsoleta do Tema Legado**: O tema anterior (`veu`) ainda possui o sufixo `(Padrão)` no título (`V.E.U. Crepúsculo (Padrão)`), devendo ser renomeado para simplesmente `Veu Crepúsculo`.
3. **Escassez de Fontes de IDE**: O seletor de tipografia nas configurações de tema disponibiliza apenas 3 opções, faltando fontes consagradas de programação e leitura em IDEs (como JetBrains Mono, Fira Code, Cascadia Code, Source Code Pro, Roboto e Inter).
4. **Restrição Rígida de Leitura no Explorer**: O Explorer restringe abertura a arquivos `.md` e `.txt`, deixando arquivos web e código (`.html`, `.json`, `.css`, `.js`, `.ts`, `.jsx`, `.tsx`, `.mjs`, etc.) e outros arquivos de texto puro bloqueados (`disabled`), sem ícones característicos de formato.

Esta especificação define o tema Catppuccin Mocha como oficial e padrão, a ampliação das fontes de IDE, a abertura e iconografia dedicada para arquivos web/código e o tratamento com ícone indefinido para demais arquivos de texto.

## Out of Scope

- Implementação de Language Server Protocol (LSP) completo ou realce de sintaxe pesado via WebAssembly/Tree-sitter no editor WYSIWYG.
- Edição de arquivos puramente binários (imagens `.png`/`.jpg`, compactados `.zip`, binários executáveis `.exe`/`.dll`).
- Alteração no serializador Markdown GFM canônico para arquivos `.md`.

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| :--- | :--- | :--- | :--- |
| Tema Oficial Padrão | Catppuccin Mocha (`veumd`) | Harmoniza com os véus do logotipo do app e estabelece padrão moderno. | yes (user requested) |
| Tipografia Padrão do Tema | Roboto (`'Roboto', sans-serif`) | Garante legibilidade limpa, neutra e moderna na leitura e escrita. | yes (user requested) |
| Renomeação de Tema | "Veu Crepúsculo" | Remove o termo "(Padrão)" do tema legado preservando sua paleta. | yes (user requested) |
| Tipografias de IDE | JetBrains Mono, Fira Code, Cascadia Code, Source Code Pro, Roboto, Inter | Disponibiliza as fontes mais utilizadas em desenvolvimento. | yes (user requested) |
| Arquivos Web/Código | Ícones dedicados e abertura como texto puro | Permite inspecionar e editar HTML, JSON, CSS, JS, TS e variantes no app. | yes (user requested) |
| Arquivos Texto Indefinidos | Ícone neutro de formato não mapeado e abertura liberada | Permite abrir configurações (`.env`, `.yaml`, `.toml`, etc.) e scripts. | yes (user requested) |

**Open questions:** none - all resolved or logged above (required before the spec is confirmed).

## User Stories

### P1: Tema Oficial Catppuccin Mocha e Renomeação do Tema Veu Crepúsculo

**User Story**: Como usuário do Veu MD, quero que o tema padrão oficial seja baseado na paleta Catppuccin Mocha com as cores próximas aos véus do logotipo e fonte Roboto, e que o tema Veu Crepúsculo seja exibido sem o rótulo de padrão.

**Why P1**: Define a identidade visual oficial primária da aplicação solicitada pelo usuário.

**Acceptance Criteria**:

1. WHEN the application initializes or resets theme settings, the system SHALL apply the Catppuccin Mocha palette as the official default theme (`veumd`).
2. WHEN the official Veu MD theme is active, the system SHALL configure the Roboto font family (`Roboto, system-ui, -apple-system, sans-serif`) as the default font.
3. WHEN the user inspects the theme presets in settings, the system SHALL display the legacy theme labeled as `Veu Crepúsculo` without the `(Padrão)` suffix.
4. WHEN the official theme is rendered, the system SHALL apply Catppuccin Mocha background layers (`#11111b`, `#181825`, `#1e1e2e`) and semantic tag colors (`#cba6f7`, `#f5c2e7`, `#74c7ec`, `#89b4fa`).

**Independent Test**: Carregar a aplicação sem tema persistido no `localStorage` e verificar a aplicação das variáveis CSS do Catppuccin Mocha e fonte Roboto; abrir o drawer de temas e conferir o nome `Veu Crepúsculo`.

---

### P1: Disponibilização de Fontes de IDE no Painel de Configurações

**User Story**: Como usuário personalizando meu ambiente de escrita, quero escolher entre as fontes mais populares de IDE (JetBrains Mono, Fira Code, Cascadia Code, Source Code Pro, Roboto, Inter) para leitura e edição.

**Why P1**: Proporciona conforto visual e ergonomia tipográfica alinhada às ferramentas de desenvolvimento modernas.

**Acceptance Criteria**:

1. WHEN the user opens the typography selector in theme settings, the system SHALL list Roboto, JetBrains Mono, Fira Code, Cascadia Code, Source Code Pro, Inter and Merriweather.
2. WHEN the user selects any IDE font option, the system SHALL immediately update `--veu-font-family` on the document root without reloading the application.
3. WHEN fonts require external web loading, the system SHALL declare font link fallbacks in `index.html` ensuring graceful rendering even in offline desktop mode.

**Independent Test**: Selecionar JetBrains Mono no painel e constatar a alteração imediata da propriedade CSS `--veu-font-family` no `:root`.

---

### P1: Suporte a Arquivos Conhecidos de Web e Código no Explorer

**User Story**: Como usuário navegando na árvore de arquivos de um projeto, quero identificar visualmente arquivos HTML, JSON, CSS, JavaScript, TypeScript e afins com ícones característicos e abri-los para leitura e edição.

**Why P1**: Permite que o Veu MD atue em projetos de software reais sem travar arquivos essenciais de desenvolvimento.

**Acceptance Criteria**:

1. WHEN the file tree renders HTML files (`.html`, `.htm`), the system SHALL display a dedicated code markup icon.
2. WHEN the file tree renders JSON files (`.json`, `.jsonc`), the system SHALL display a dedicated JSON data icon.
3. WHEN the file tree renders stylesheet files (`.css`, `.scss`, `.less`), the system SHALL display a dedicated styling code icon.
4. WHEN the file tree renders script files (`.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, `.cjs`), the system SHALL display a dedicated programming script icon.
5. WHEN the user clicks any recognized web or code file, the system SHALL open the document in an editor tab as plain text (`isMarkdown: false`).

**Independent Test**: Abrir pasta contendo `package.json`, `index.html`, `main.ts` e `style.css`, checando a presença dos ícones dedicados e abertura com sucesso de cada arquivo ao clicar.

---

### P1: Suporte a Arquivos de Texto Indefinidos com Ícone Não Mapeado

**User Story**: Como usuário visualizando arquivos de configuração ou scripts de outras linguagens (`.env`, `.yaml`, `.toml`, `.sql`, `.py`, `.rs`, `.sh`), quero poder abri-los para leitura e edição enquanto exibem um ícone neutro de formato indefinido.

**Why P1**: Garante que o usuário consiga ler e inspecionar qualquer arquivo textual do projeto sem bloqueios desnecessários, mantendo arquivos binários protegidos.

**Acceptance Criteria**:

1. WHEN the file tree renders non-binary text files whose format is not specifically mapped, the system SHALL display an undefined format icon (`FileQuestion` / `File`).
2. WHEN the user clicks an unmapped text file, the system SHALL open the file in the editor as plain text (`isMarkdown: false`).
3. WHEN the file tree encounters known binary formats (images, audio, video, archives, binaries), the system SHALL maintain the entry in a disabled state for text opening.

**Independent Test**: Abrir arquivo `.env` ou `.yaml` no Explorer e constatar que ele é aberto para edição e visualizado com ícone neutro de formato não mapeado, enquanto arquivos `.png` ou `.exe` permanecem inativos.

---

## Requirement Traceability

| Requirement ID | User Story | Priority | Status |
| :--- | :--- | :--- | :--- |
| THEME-01 | Paleta Oficial Catppuccin Mocha Padrão do Veu MD | P1 | Passed |
| THEME-02 | Tipografia Roboto como Padrão do Tema Oficial | P1 | Passed |
| THEME-03 | Renomeação do Tema Legado para Veu Crepúsculo | P1 | Passed |
| FONT-01 | Lista Expandida de Tipografias Populares de IDE | P1 | Passed |
| FONT-02 | Atualização Reativa Imediata de Família de Fonte | P1 | Passed |
| FILE-01 | Ícones e Abertura para Arquivos Conhecidos (HTML, JSON, CSS, JS, TS) | P1 | Passed |
| FILE-02 | Abertura como Texto Puro (isMarkdown: false) para Código | P1 | Passed |
| FILE-03 | Ícone Indefinido e Abertura para Demais Arquivos Texto | P1 | Passed |
| FILE-04 | Preservação de Bloqueio Seguro para Arquivos Binários | P1 | Passed |

