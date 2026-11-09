# Architecture Analysis & Context: Resilience, Lifecycle & Concurrency

Este documento consolida a análise técnica e o diagnóstico das falhas arquiteturais identificadas no núcleo do **Veu MD**, com foco estrito em estabilidade, ciclo de vida de recursos e integridade de dados (sem adições funcionais de produto).

---

## 1. Diagnóstico dos Gaps Arquiteturais

### 1.1. Race Condition de Concorrência no Auto-Save Multi-Abas
* **Localização**: `src/App.svelte:handleEditorContentChange()` e `saveCurrentFile()`
* **Mecanismo da Falha**:
  O timer de auto-save (`autoSaveTimeout`) é uma variável escalar única compartilhada por toda a aplicação. Quando o usuário digita na Aba A, um timer de 1000ms é iniciado. Se o usuário comutar o foco para a Aba B em menos de 1000ms:
  - O listener `onSelectTab` altera o ponteiro global reativo `activeTabId` sem descarregar a escrita pendente da Aba A.
  - Ao expirar os 1000ms, a função `saveCurrentFile()` opera cegamente sobre a referência reativa `activeTab` (que agora é a Aba B).
  - O conteúdo da Aba B é sobrescrito no disco com os dados da Aba B, enquanto as edições em memória da Aba A jamais chegam ao disco.
* **Solução Arquitetural**:
  - Armazenar o timer de auto-save atrelado ao `tabId` ou passar a referência explícita do documento a ser persistido.
  - Na comutação de abas (`onSelectTab`), se a aba anterior possuir `isDirty === true`, descarregar o salvamento imediatamente de forma assíncrona antes de redirecionar o foco.

### 1.2. Descarte Silencioso de Modificações no Fechamento de Abas
* **Localização**: `src/App.svelte:closeTab()`
* **Mecanismo da Falha**:
  A função `closeTab(tabId)` filtra o array `tabs` sem validar se o documento possui edições pendentes (`tab.isDirty`). Se o usuário fechar a aba pelo `X` antes do debounce de 1 segundo expirar, as alterações são descartadas silenciosamente da memória sem chegar ao disco e sem prompt.
* **Solução Arquitetural**:
  - No `closeTab`, se `tab.isDirty === true`, efetuar o flush de escrita para o arquivo em disco se houver caminho associado (`tab.path`). Se não houver caminho de disco, solicitar confirmação antes do descarte.

### 1.3. Ciclo de Vida do Terminal Dual-Engine e Processos Órfãos
* **Localização**: `src/lib/components/TerminalPanel.svelte` e `src-tauri/src/commands/pty_cmd.rs`
* **Mecanismo da Falha**:
  - O alternador de motor usa `{#if terminalEngine === 'veu'} ... {:else} ... {/if}`. A transição para o motor `xterm` desmonta o `TerminalVeuPanel` do DOM, violando a regra de persistência do harness e descartando todo o histórico de blocos em memória.
  - Ao fechar o projeto com `xterm` selecionado, a referência `veuRef` é nula, e os processos PTY do Terminal Veu não recebem `kill_terminal`, ficando órfãos no Windows.
  - Quando o usuário encerra o shell digitando `exit` ou o processo atinge EOF, a thread de leitura do Rust encerra o loop, mas a sessão permanece registrada em `state.terminals` e nenhum evento `term-exit` é emitido para a interface.
* **Solução Arquitetural**:
  - Manter ambos os painéis montados no DOM e alternar a visualização estritamente via classes CSS `.hidden` (`display: none`).
  - No Rust (`pty_cmd.rs`), emitir `term-exit-{termId}` com o código de saída e remover a sessão de `state.terminals` ao término da leitura do PTY.

### 1.4. Resolução Arquitetural de Imagens Locais (Tauri Asset Protocol)
* **Localização**: `src/lib/editor/proseMirrorSetup.ts` e `src/lib/components/Editor.svelte`
* **Mecanismo da Falha**:
  Caminhos relativos de imagem em documentos Markdown (ex: `![diagrama](./assets/img.png)`) são renderizados no DOM do ProseMirror como `<img src="./assets/img.png">`. O WebView2 tenta resolver a imagem contra a origem local do servidor web (`http://127.0.0.1:1420`), resultando em erro 404 e ícone quebrado.
* **Solução Arquitetural**:
  - Implementar um `nodeView` ou resolvedor de URL no ProseMirror que utiliza `convertFileSrc` do `@tauri-apps/api/core` para mapear caminhos relativos para URLs canônicas seguras do protocolo de assets do Tauri (`asset://` ou `http://asset.localhost`), em consonância com a CSP já autorizada em `tauri.conf.json`.

### 1.5. Invariante de Segurança em Exclusão de Arquivos
* **Localização**: `src-tauri/src/commands/fs_cmd.rs:delete_entry()`
* **Mecanismo da Falha**:
  Diferente de `save_image_asset` e `save_custom_theme`, o comando `delete_entry` executa `fs::remove_dir_all(p)` sem validação de limites de diretório ou proteção contra raízes de sistema (`/`, `C:\`, `C:\Windows`).
* **Solução Arquitetural**:
  - Validar canonicamente que o caminho a ser excluído não seja uma raiz de volume ou pasta crítica do sistema operacional antes de invocar a remoção.

---

## 2. Decisões Arquiteturais Propostas (ADRs)

* **AD-022**: Isolamento de estado de auto-save por aba e flush atômico na comutação de foco.
* **AD-023**: Convivência dual-engine de terminal baseada em CSS display preservation sem desmontagem de componentes.
* **AD-024**: Ciclo de vida completo de encerramento de sessão PTY no Rust com remoção atômica e evento de exit.
* **AD-025**: Mapeamento transparente de assets relativos do ProseMirror para o protocolo de assets do Tauri v2.

