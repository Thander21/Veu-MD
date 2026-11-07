# Feature Spec: Veu MD Phase 2 — Refinamento de Layout, Identidade Visual & Ergonomia de Interface

**Approved**: 2026-11-07 - user: "vamos trablahar um pouco no layout entao pontos a ajustar... analise os pontos crie a spec e inicie o processo"

## Problem Statement

A interface atual do **Veu MD** possui elementos desalinhados com o fluxo de trabalho natural do usuário:
1. No topo esquerdo (`TopBar`), ações de arquivo do editor ativo ("Salvar" e "Imprimir") estão aglomeradas junto ao seletor de pastas de projetos ("Trocar Pasta"), enquanto os botões "Novo Arquivo" e "Nova Pasta" encontram-se redundantes com as ações já existentes na barra lateral do Explorer.
2. Na barra do Explorer (`Sidebar`), há um botão redundante de "Abrir no Terminal", que já se encontra acessível no canto superior direito (`TopBar`) e no rodapé direito (`StatusBar`), poluindo visualmente a barra de ações de arquivos.
3. Na barra de atividades de projetos (`ProjectSidebar`), os avatares de projeto utilizam um botão de fechar (`X`) sobreposto no topo que causa cliques acidentais e poluição estética, além de não destacar claramente em vermelho a destruição/fechamento do projeto.
4. O painel de temas (`ThemeSettings`) utiliza botões avulsos para troca de tema em vez de um seletor suspenso (Dropdown) fluido, não comuta automaticamente para o modo "Personalizado" quando o usuário edita uma cor ou medida, e ainda não inclui o tema oficial **"Veu MD"** com as cores extraídas do conceito da marca (`#0e0b16`, `#f472b6`, `#c084fc`, `#7c3aed`).

O sistema necessita de uma reorganização cirúrgica na interface para garantir ergonomia, identidade visual canônica e navegação limpa sem sobrecarga.

## Out of Scope

- Edição de configurações de temas secundários de terceiros ou marketplace de temas online.
- Alteração no protocolo de serialização Markdown ou no motor do ProseMirror.
- Mudanças no backend PTY Rust ou ciclo de vida de terminais virtuais.
- Modificação na árvore de parsing de arquivos no sistema operacional.

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| :--- | :--- | :--- | :--- |
| Localização de Salvar e Imprimir | Final da barra de formatação após Undo/Redo | Desacopla ações do documento do seletor de pastas de projetos e unifica as operações de edição e saída. | yes (user approved) |
| Ícones Substitutos no Topo Esquerdo | Varinha mágica (Wizard IA) + Localizador Rápido | Substitui os botões redundantes por gatilhos de alto valor que não existem na barra inferior. | yes (user approved) |
| Limpeza do Terminal Duplicado | Remoção do botão de terminal na barra da Sidebar | Mantém apenas os dois pontos canônicos existentes: TopBar direito e StatusBar rodapé. | yes (user approved) |
| Fechamento e Ícones de Projetos | Fechar projeto destacado em vermelho sem sobrepor avatar | Elimina cliques acidentais no avatar de projetos e confere feedback visual seguro de encerramento. | yes (user approved) |
| Tema Oficial e Dropdown no ThemeSettings | Dropdown com opção Personalizado automática + Tema Veu MD | Agrupa temas em seleção limpa e comuta dinamicamente para Personalizado ao editar qualquer valor. | yes (user approved) |

**Open questions:** none - all resolved or logged above (required before the spec is confirmed).

## User Stories

### P1: Reorganização da Barra Superior (TopBar) e Gatilho Wizard

**User Story**: Como redator utilizando o editor, quero que as ações de documento ("Salvar" e "Imprimir") estejam agrupadas junto às ferramentas de formatação após desfazer/refazer, e que o topo esquerdo ofereça acesso ao assistente (Wizard) e busca em vez de duplicar botões da barra lateral.

**Why P1**: Reduz confusão conceitual entre gerenciamento de pastas de projetos e ações sobre o documento ativo.

**Acceptance Criteria**:

1. WHEN the user views the left group of the `TopBar`, the system SHALL display the project folder toggle, folder open button, folder close button, an AI Wizard wand button (`Wand2`), and a Quick Open search button without displaying file creation, save, or print buttons.
2. WHEN the user clicks the AI Wizard button, the system SHALL display an informative notification on the status bar indicating that the AI assistant is in development.
3. WHEN the user views the formatting group of the `TopBar`, the system SHALL display the Save button (`Save`) and Print button (`Printer`) positioned at the end of the group following the undo and redo buttons separated by a divider.
4. IF no file or folder is active, the system SHALL display the Save button in a disabled state.

**Independent Test**: Observar a barra superior, verificar a presença da varinha mágica e busca à esquerda, e confirmar que os botões de Salvar e Imprimir estão ao lado de Desfazer/Refazer.

---

### P1: Limpeza de Ações Redundantes de Terminal no Explorer

**User Story**: Como usuário gerenciando arquivos locais na barra lateral, quero uma barra de ferramentas enxuta e focada exclusivamente no gerenciamento de arquivos e pastas, sem ícones repetidos de terminal.

**Why P1**: Remove poluição visual e evita dispersão de gatilhos redundantes de terminal na interface.

**Acceptance Criteria**:

1. WHEN the user opens the file explorer in the `Sidebar`, the system SHALL display file creation, folder creation, tree refresh, and folder close actions without displaying an integrated terminal trigger button.
2. WHILE the user navigates the application, the system SHALL keep terminal toggles available exclusively on the top-right header and bottom-right status bar.

**Independent Test**: Abrir a barra lateral de arquivos e certificar-se de que a barra de ferramentas exibe apenas Novo Arquivo, Nova Pasta, Atualizar e Fechar Pasta.

---

### P1: Ergonomia de Projetos e Ação de Fechar com Destaque Vermelho

**User Story**: Como usuário alternando entre múltiplos projetos, quero clicar nos avatares de projeto com segurança sem acionar acidentalmente o fechamento, e quero identificar com clareza a ação de fechar através de destaque em vermelho.

**Why P1**: Previne perda acidental de contexto de trabalho e aprimora a clareza visual da barra de atividades.

**Acceptance Criteria**:

1. WHEN the user views project entries in the `ProjectSidebar`, the system SHALL present refined project identifiers free of overlapping corner close badges.
2. WHEN the user hovers over the dedicated close project action, the system SHALL highlight the button in red (`#ef4444`) with high visual contrast.
3. WHEN the user clicks the close project action, the system SHALL close the corresponding project tab without triggering project selection.
4. WHEN the user views the recent projects popover, the system SHALL display the remove button highlighted in red upon hover.

**Independent Test**: Passar o mouse sobre o botão de fechar projeto, verificar o tom vermelho vivo e confirmar que clicar nele encerra o projeto sem selecionar seu conteúdo antes.

---

### P1: Tema Oficial "Veu MD", Dropdown e Personalização Automática

**User Story**: Como usuário personalizando a experiência de leitura, quero selecionar o tema oficial **"Veu MD"** baseado no conceito da marca, escolher temas através de um seletor Dropdown limpo e ter a comutação automática para "Personalizado" sempre que ajustar qualquer cor ou fonte.

**Why P1**: Entrega a identidade visual oficial da marca e elimina o atrito manual de alternância de estado de customização.

**Acceptance Criteria**:

1. WHEN the user opens the `ThemeSettings` drawer, the system SHALL display a dropdown `<select>` containing all presets including "Veu MD (Oficial)" and a "Personalizado" option.
2. WHEN the user selects the "Veu MD (Oficial)" preset, the system SHALL apply the official twilight obsidian palette (`#0e0b16` app, `#140d24` sidebar, `#1a122c` editor, `#f472b6` H1/links, `#c084fc` H2, `#a78bfa` H3).
3. WHEN the user modifies any color, dimension, or font value in the settings drawer, the system SHALL automatically switch the theme dropdown selection to "Personalizado".
4. WHEN the user views the top of the project activity bar, the system SHALL render the official Veu MD flat concept glyph logo.

**Independent Test**: Abrir Temas, selecionar "Veu MD (Oficial)", alterar a cor de um título e verificar a comutação instantânea do dropdown para "Personalizado" mantendo as cores aplicadas no editor.

---

## Requirement Traceability

| Requirement ID | Story | Criterion ID | Status |
| :--- | :--- | :--- | :--- |
| REF-01 | P1: Reorganização da Barra Superior (TopBar) e Gatilho Wizard | AC-REF-001 | planned |
| REF-02 | P1: Reorganização da Barra Superior (TopBar) e Gatilho Wizard | AC-REF-002 | planned |
| REF-03 | P1: Reorganização da Barra Superior (TopBar) e Gatilho Wizard | AC-REF-003 | planned |
| REF-04 | P1: Reorganização da Barra Superior (TopBar) e Gatilho Wizard | AC-REF-004 | planned |
| REF-05 | P1: Limpeza de Ações Redundantes de Terminal no Explorer | AC-REF-005 | planned |
| REF-06 | P1: Limpeza de Ações Redundantes de Terminal no Explorer | AC-REF-006 | planned |
| REF-07 | P1: Ergonomia de Projetos e Ação de Fechar com Destaque Vermelho | AC-REF-007 | planned |
| REF-08 | P1: Ergonomia de Projetos e Ação de Fechar com Destaque Vermelho | AC-REF-008 | planned |
| REF-09 | P1: Ergonomia de Projetos e Ação de Fechar com Destaque Vermelho | AC-REF-009 | planned |
| REF-10 | P1: Ergonomia de Projetos e Ação de Fechar com Destaque Vermelho | AC-REF-010 | planned |
| REF-11 | P1: Tema Oficial "Veu MD", Dropdown e Personalização Automática | AC-REF-011 | planned |
| REF-12 | P1: Tema Oficial "Veu MD", Dropdown e Personalização Automática | AC-REF-012 | planned |
| REF-13 | P1: Tema Oficial "Veu MD", Dropdown e Personalização Automática | AC-REF-013 | planned |
| REF-14 | P1: Tema Oficial "Veu MD", Dropdown e Personalização Automática | AC-REF-014 | planned |
