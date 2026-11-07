# Specification: Sidebar Layout de Ponta a Ponta, Redimensionamento e Splash Screen

**Approved**: 2026-11-07 - user: "aprovado"

Sources: user "postos de correção veu quando abre fica com tela branca por usn segundos, por no fundo o logo grande antes de abrir permitir aumentar a area da barra lateral esquerda barra lateral esquerda é compelta ate em cima onde tem o icone paar recolher temos que ajustar, tire a logo e o nome deixe o igone de reolher do lado esquerdo e do lado direito trocar pasta (ronemia pra trocar projeto) icone de wizard(desativado) icone da lupa tudo isso faz parte da barra lateral e esconde junto, quanod escondida fica so o icone de expanção e a barra fina de projetos"

## Problem Statement

Atualmente, ao inicializar o aplicativo no Windows através do WebView2 do Tauri v2, o usuário vivencia uma tela branca momentânea de alguns segundos antes da interface gráfica carregar. Além disso, a barra lateral de arquivos possui largura estática (260px) que impede a leitura confortável de nomes e estruturas profundas de diretórios, e a disposição dos controles no topo apresenta sobreposição conceitual: a logo e os botões de escopo de projeto ("Trocar Pasta", "Wizard", "Lupa") residem na TopBar acima de toda a janela, enquanto deveriam pertencer visual e funcionalmente à própria barra lateral de arquivos de ponta a ponta, permitindo que a TopBar se concentre exclusivamente nas ferramentas de formatação do documento.

## Out of Scope

- Implementação de novas funcionalidades para o ícone de Wizard (permanece estilizado como desativado nesta iteração).
- Criação de novos atalhos de teclado além dos já suportados no aplicativo (`Ctrl+P`, `Ctrl+'`, `Ctrl+S`, `Ctrl+L`).
- Migração de abas de arquivos para fora do contêiner central.

## Assumptions & Open Questions

| Item | Question / Assumption | Chosen default | Rationale |
| :--- | :--- | :--- | :--- |
| A01 | Onde posicionar o botão de alternância (expandir/recolher)? | Botão fixo no topo da barra fina de projetos (48px) e botão de recolher no cabeçalho do sidebar. | Alinhado com o usuário: permite alternar a visibilidade mesmo com a barra lateral recolhida. |
| A02 | Comportamento do ícone de Wizard no cabeçalho da barra lateral? | Estilo desativado (opacidade 0.4, cursor not-allowed, tooltip explicativo). | Respeita o requisito explícito do usuário de ícone desativado. |
| A03 | Limites de redimensionamento da barra lateral de arquivos? | Mínimo 180px, máximo 600px, padrão 260px, persistido no localStorage. | Evita quebra de layout em telas menores e acomoda caminhos longos de arquivos. |
| A04 | Apresentação do splash screen no boot? | Fundo escuro Crepúsculo com o logo oficial `veu-logo.svg` pulsando suavemente. | Elimina a tela branca do WebView2 e reforça a identidade visual Obsidian do app. |
| A05 | Exibição do nome do arquivo ativo na TopBar? | Manter o nome do arquivo ativo apenas na TabBar já existente. | Decisão do usuário para evitar poluição e preservar espaço para ferramentas de formatação. |

Open questions: none

## User Stories

### US-01: Inicialização Limpa Sem Flash Branco
As a usuário do Veu MD,  
I want que o aplicativo abra imediatamente com fundo escuro e o logotipo oficial grande centralizado,  
So that eu não seja ofuscado por uma tela branca durante o carregamento dos componentes.

### US-02: Barra Lateral de Arquivos de Ponta a Ponta
As a redator ou desenvolvedor,  
I want que a barra lateral de arquivos ocupe toda a altura da janela com suas ações contextuais no topo,  
So that o contexto de projetos e arquivos fique unificado e a barra de formatação fique limpa.

### US-03: Redimensionamento Flexível da Barra Lateral
As a usuário trabalhando com projetos de estruturas de pastas profundas,  
I want poder arrastar a borda da barra lateral para expandir ou contrair sua largura,  
So that eu possa visualizar nomes longos de arquivos sem cortes.

## Requirement Traceability

| ID | Title | EARS Expression |
| :--- | :--- | :--- |
| SPLASH-01 | Splash Screen Escuro com Logo | WHEN o aplicativo inicializar THE SYSTEM SHALL exibir imediatamente um fundo escuro com o logotipo grande centralizado e esvanecer suavemente para a interface quando os componentes estiverem montados. |
| SIDEBAR-01 | Barra Lateral de Arquivos de Ponta a Ponta | WHILE a barra lateral de arquivos estiver visível THE SYSTEM SHALL estendê-la do topo ao rodapé da janela contendo no seu cabeçalho o botão de recolher à esquerda e as ações 'Trocar Projeto', Wizard desativado e Lupa à direita. |
| SIDEBAR-02 | Ocultação Completa da Barra Lateral | WHEN a barra lateral de arquivos for recolhida THE SYSTEM SHALL ocultar a barra de arquivos e seu cabeçalho mantendo visível apenas a barra fina de projetos com o botão de alternância no topo. |
| SIDEBAR-03 | Redimensionamento Interativo com Persistência | WHEN o usuário arrastar a alça de redimensionamento da barra lateral THE SYSTEM SHALL redimensionar a largura entre 180px e 600px e salvar o valor em localStorage. |
| TOPBAR-01 | TopBar Estritamente sobre o Editor | WHILE o documento estiver aberto THE SYSTEM SHALL renderizar a TopBar acima do editor contendo apenas ferramentas de formatação estilo Word, Temas e Terminal, sem a logo ou o nome do aplicativo. |
