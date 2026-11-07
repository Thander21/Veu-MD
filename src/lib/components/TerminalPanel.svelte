<script context="module" lang="ts">
  export interface CommandBlock {
    id: string;
    command: string;
    cwd: string;
    timestamp: string;
    outputRaw: string;
    outputHtml: string;
    status: 'running' | 'completed' | 'interrupted';
    copied?: boolean;
    inserted?: boolean;
  }

  export interface TermTab {
    id: string;
    projectId: string;
    title: string;
    shell: string;
    cwd: string;
    blocks: CommandBlock[];
    activeInput: string;
    history: string[];
    historyIndex: number;
    isRunning: boolean;
    unlisten?: () => void;
  }
</script>

<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import {
    Plus,
    X,
    TerminalSquare,
    Minimize2,
    Maximize2,
    Columns,
    Rows,
    Copy,
    Check,
    Eraser,
    CornerDownLeft,
    Square
  } from 'lucide-svelte';
  import { invoke } from '@tauri-apps/api/core';
  import { listen, type UnlistenFn } from '@tauri-apps/api/event';
  import { stripAnsi, ansiToHtml } from '../utils/ansiParser';

  export let projectId: string = 'default';
  export let visible: boolean = false;
  export let currentFolderPath: string = '';
  export let hasActiveFile: boolean = true;
  export let orientation: 'horizontal' | 'vertical' = 'horizontal';
  export let isMaximized: boolean = false;
  export let onClose: () => void;
  export let onInsertText: ((text: string) => void) | undefined = undefined;

  // Monitora presença de arquivo ativo
  let prevHasActiveFile = hasActiveFile;
  $: if (prevHasActiveFile !== hasActiveFile) {
    if (!hasActiveFile) {
      isMaximized = true;
    } else {
      isMaximized = false;
    }
    prevHasActiveFile = hasActiveFile;
  }

  // Sessões ativas de Terminal Veu indexadas por projeto
  let allTabs: TermTab[] = [];
  let projectActiveTermId: Record<string, string> = {};

  $: effectiveProjectId = projectId || 'default';
  $: currentTabs = allTabs.filter((t) => t.projectId === effectiveProjectId);
  $: activeTab = currentTabs.find((t) => t.id === activeTermId) || currentTabs[0];
  $: activeTermId = projectActiveTermId[effectiveProjectId] || (currentTabs[0]?.id || '');

  let timelineContainers: Record<string, HTMLDivElement> = {};
  let activeInputEl: HTMLInputElement | null = null;

  let panelHeight = 260;
  let panelWidth = 480;
  let isResizing = false;

  function getActiveTab(): TermTab | undefined {
    return activeTab;
  }

  function scrollToBottom(tabId?: string) {
    const id = tabId || activeTermId;
    if (!id) return;
    tick().then(() => {
      const container = timelineContainers[id];
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }

  export async function createTerminalSession(
    shell = 'powershell.exe',
    cwd = currentFolderPath
  ) {
    const pId = effectiveProjectId;
    const id = `term-${pId}-${Date.now()}`;
    const newTab: TermTab = {
      id,
      projectId: pId,
      title: shell.includes('powershell') ? 'PowerShell' : shell.includes('cmd') ? 'CMD' : 'Bash',
      shell,
      cwd: cwd || '',
      blocks: [],
      activeInput: '',
      history: [],
      historyIndex: -1,
      isRunning: false
    };

    allTabs = [...allTabs, newTab];
    projectActiveTermId[pId] = id;
    projectActiveTermId = { ...projectActiveTermId };

    try {
      await invoke('spawn_terminal', {
        termId: id,
        cwd: cwd || null,
        shell: shell || null
      });

      newTab.unlisten = await listen(`term-output-${id}`, (event: any) => {
        const payload = event.payload as string;
        if (!payload) return;

        handleTerminalOutput(id, payload);
      });
    } catch (err) {
      const errorBlock: CommandBlock = {
        id: `err-${Date.now()}`,
        command: 'inicialização',
        cwd: cwd || '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        outputRaw: `Erro ao iniciar Terminal Veu: ${err}`,
        outputHtml: `<span class="ansi-red">Erro ao iniciar Terminal Veu: ${err}</span>`,
        status: 'completed'
      };
      newTab.blocks = [errorBlock];
      allTabs = [...allTabs];
    }

    tick().then(() => {
      focusActiveInput();
      scrollToBottom(id);
    });
  }

  function handleTerminalOutput(tabId: string, chunk: string) {
    const tab = allTabs.find((t) => t.id === tabId);
    if (!tab) return;

    // Localiza o bloco atualmente em execução
    const runningBlock = tab.blocks.find((b) => b.status === 'running');
    if (!runningBlock) {
      // Se não há bloco rodando (ex: banner inicial do PowerShell ao abrir a janela),
      // não polui a tela com o banner cru, apenas garante o prompt pronto
      return;
    }

    runningBlock.outputRaw += chunk;

    // Verifica se a saída indica conclusão do comando (retorno do prompt do shell)
    const cleanRaw = stripAnsi(runningBlock.outputRaw).trimEnd();
    const isPrompt = /(?:PS\s+[a-zA-Z]:[^\n\r>]*>|\w+@[^:]+:[^$#\n\r]*[$#]|^[a-zA-Z]:[^\n\r>]*>)\s*$/.test(
      cleanRaw
    );

    if (isPrompt) {
      // Remove o prompt final da saída para apresentação editorial limpa
      let formattedText = cleanRaw
        .replace(/(?:PS\s+[a-zA-Z]:[^\n\r>]*>|\w+@[^:]+:[^$#\n\r]*[$#]|^[a-zA-Z]:[^\n\r>]*>)\s*$/, '')
        .trimEnd();

      // Remove o echo inicial do comando se presente
      const firstLineBreak = formattedText.indexOf('\n');
      if (firstLineBreak > -1) {
        const firstLine = formattedText.substring(0, firstLineBreak).trim();
        if (firstLine === runningBlock.command.trim()) {
          formattedText = formattedText.substring(firstLineBreak + 1).trimStart();
        }
      }

      runningBlock.outputRaw = formattedText;
      runningBlock.outputHtml = ansiToHtml(formattedText);
      runningBlock.status = 'completed';
      tab.isRunning = false;
      allTabs = [...allTabs];

      tick().then(() => {
        focusActiveInput();
        scrollToBottom(tabId);
      });
    } else {
      runningBlock.outputHtml = ansiToHtml(runningBlock.outputRaw);
      allTabs = [...allTabs];
      scrollToBottom(tabId);
    }
  }

  export function submitCommand(tab: TermTab) {
    const rawCmd = tab.activeInput;
    if (!rawCmd || !rawCmd.trim()) return;

    const command = rawCmd.trim();

    // Adiciona ao histórico se for diferente do último
    if (tab.history.length === 0 || tab.history[tab.history.length - 1] !== command) {
      tab.history = [...tab.history, command];
    }
    tab.historyIndex = -1;
    tab.activeInput = '';

    const newBlock: CommandBlock = {
      id: `cmd-${Date.now()}`,
      command,
      cwd: tab.cwd || currentFolderPath,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      outputRaw: '',
      outputHtml: '',
      status: 'running'
    };

    tab.blocks = [...tab.blocks, newBlock];
    tab.isRunning = true;
    allTabs = [...allTabs];

    // Envia o comando para o processo nativo PTY
    invoke('write_terminal', { termId: tab.id, data: `${command}\r\n` }).catch((err) => {
      newBlock.outputRaw = `Erro ao executar comando: ${err}`;
      newBlock.outputHtml = `<span class="ansi-red">Erro ao executar comando: ${err}</span>`;
      newBlock.status = 'completed';
      tab.isRunning = false;
      allTabs = [...allTabs];
    });

    scrollToBottom(tab.id);
  }

  export function stopCommand(tab: TermTab) {
    invoke('write_terminal', { termId: tab.id, data: '\x03' }).catch(() => {});

    const runningBlock = tab.blocks.find((b) => b.status === 'running');
    if (runningBlock) {
      runningBlock.status = 'interrupted';
      if (!runningBlock.outputRaw) {
        runningBlock.outputRaw = '^C (Interrompido pelo usuário)';
        runningBlock.outputHtml = '<span class="ansi-yellow">^C (Interrompido pelo usuário)</span>';
      }
    }

    tab.isRunning = false;
    allTabs = [...allTabs];

    tick().then(() => {
      focusActiveInput();
      scrollToBottom(tab.id);
    });
  }

  function handleInputKeydown(e: KeyboardEvent, tab: TermTab) {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitCommand(tab);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (tab.history.length > 0) {
        if (tab.historyIndex === -1) {
          tab.historyIndex = tab.history.length - 1;
        } else if (tab.historyIndex > 0) {
          tab.historyIndex--;
        }
        tab.activeInput = tab.history[tab.historyIndex] || '';
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (tab.historyIndex !== -1) {
        if (tab.historyIndex < tab.history.length - 1) {
          tab.historyIndex++;
          tab.activeInput = tab.history[tab.historyIndex] || '';
        } else {
          tab.historyIndex = -1;
          tab.activeInput = '';
        }
      }
    }
  }

  function handlePanelKeydown(e: KeyboardEvent) {
    if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
      const tab = getActiveTab();
      if (tab && tab.isRunning) {
        e.preventDefault();
        stopCommand(tab);
      }
    }
  }

  function focusActiveInput() {
    tick().then(() => {
      if (activeInputEl) {
        activeInputEl.focus();
      }
    });
  }

  export async function copyBlockOutput(block: CommandBlock) {
    const text = block.outputRaw || stripAnsi(block.outputHtml);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      block.copied = true;
      allTabs = [...allTabs];
      setTimeout(() => {
        block.copied = false;
        allTabs = [...allTabs];
      }, 1500);
    } catch {
      // fallback
    }
  }

  export function insertBlockToEditor(block: CommandBlock) {
    const text = block.outputRaw || stripAnsi(block.outputHtml);
    if (!text || !onInsertText) return;
    onInsertText(text);
    block.inserted = true;
    allTabs = [...allTabs];
    setTimeout(() => {
      block.inserted = false;
      allTabs = [...allTabs];
    }, 1500);
  }

  export function handleClearTerminal() {
    const tab = getActiveTab();
    if (!tab) return;
    tab.blocks = [];
    allTabs = [...allTabs];
    focusActiveInput();
  }

  function closeTerminal(id: string) {
    const tab = allTabs.find((t) => t.id === id);
    if (tab) {
      if (tab.unlisten) tab.unlisten();
      invoke('kill_terminal', { termId: id }).catch(() => {});
      delete timelineContainers[id];
    }

    allTabs = allTabs.filter((t) => t.id !== id);
    if (activeTermId === id) {
      const remaining = allTabs.filter((t) => t.projectId === effectiveProjectId);
      projectActiveTermId[effectiveProjectId] = remaining[0]?.id || '';
      projectActiveTermId = { ...projectActiveTermId };
    }

    const remainingCurrent = allTabs.filter((t) => t.projectId === effectiveProjectId);
    if (remainingCurrent.length === 0) {
      onClose();
    } else {
      focusActiveInput();
    }
  }

  function switchTab(id: string) {
    projectActiveTermId[effectiveProjectId] = id;
    projectActiveTermId = { ...projectActiveTermId };
    tick().then(() => {
      focusActiveInput();
      scrollToBottom(id);
    });
  }

  function toggleOrientation() {
    orientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';
  }

  function toggleMaximize() {
    isMaximized = !isMaximized;
  }

  function startResize(e: MouseEvent) {
    isResizing = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const initialH = panelHeight;
    const initialW = panelWidth;

    function onMouseMove(moveEvent: MouseEvent) {
      if (!isResizing) return;
      if (orientation === 'horizontal') {
        const delta = startY - moveEvent.clientY;
        panelHeight = Math.max(120, Math.min(window.innerHeight - 100, initialH + delta));
      } else {
        const delta = startX - moveEvent.clientX;
        panelWidth = Math.max(260, Math.min(window.innerWidth - 100, initialW + delta));
      }
    }

    function onMouseUp() {
      isResizing = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  $: if (visible && currentTabs.length === 0) {
    createTerminalSession('powershell.exe', currentFolderPath);
  }

  $: if (visible) {
    focusActiveInput();
  }

  onDestroy(() => {
    // Mantém as abas vivas no Map global se o painel apenas fechar sua visibilidade,
    // garantindo continuidade de servidores e compilações em background.
  });
</script>

{#if visible}
  <!-- Alça de Redimensionamento -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="resize-handle handle-{orientation}"
    on:mousedown={startResize}
    role="separator"
    aria-label="Redimensionar Terminal Veu"
  ></div>

  <!-- Painel do Terminal Veu -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="terminal-panel orientation-{orientation}"
    class:maximized={isMaximized}
    style={isMaximized
      ? 'flex: 1; width: 100%; height: 100%;'
      : orientation === 'horizontal'
        ? `height: ${panelHeight}px;`
        : `width: ${panelWidth}px;`}
    on:keydown={handlePanelKeydown}
    role="region"
    aria-label="Terminal Veu Integrado"
  >
    <!-- Barra Superior do Terminal Veu -->
    <div class="terminal-bar">
      <div class="term-tabs">
        <div class="veu-badge" title="Terminal Veu — Leve, Sequencial e Formatado">
          <TerminalSquare size={13} class="icon-accent" />
          <span class="badge-title">Terminal Veu</span>
        </div>

        {#each currentTabs as t (t.id)}
          <div
            class="term-tab"
            class:active={t.id === activeTermId}
            on:click={() => switchTab(t.id)}
            role="button"
            tabindex="0"
            on:keydown={(e) => e.key === 'Enter' && switchTab(t.id)}
          >
            <span class="tab-title">{t.title}</span>
            {#if t.isRunning}
              <span class="tab-running-dot" title="Processo em execução"></span>
            {/if}
            <button
              class="close-tab"
              title="Encerrar sessão"
              on:click|stopPropagation={() => closeTerminal(t.id)}
            >
              <X size={11} />
            </button>
          </div>
        {/each}

        <button
          class="add-term-btn"
          title="Nova sessão do Terminal Veu"
          on:click={() => createTerminalSession('powershell.exe', currentFolderPath)}
        >
          <Plus size={13} />
        </button>
      </div>

      <!-- Ações da Barra -->
      <div class="term-actions">
        <!-- Limpar Linha do Tempo -->
        <button
          class="action-btn"
          title="Limpar histórico da tela"
          on:click={handleClearTerminal}
        >
          <Eraser size={13} />
        </button>

        <div class="action-divider"></div>

        <!-- Alternar Orientação -->
        <button
          class="action-btn"
          title={orientation === 'horizontal'
            ? 'Mover para lateral (Dividir Vertical)'
            : 'Mover para rodapé (Dividir Horizontal)'}
          on:click={toggleOrientation}
        >
          {#if orientation === 'horizontal'}
            <Columns size={13} />
          {:else}
            <Rows size={13} />
          {/if}
        </button>

        <!-- Maximizar / Restaurar -->
        <button
          class="action-btn"
          title={isMaximized ? 'Restaurar Painel' : 'Maximizar Terminal'}
          on:click={toggleMaximize}
        >
          {#if isMaximized}
            <Minimize2 size={13} />
          {:else}
            <Maximize2 size={13} />
          {/if}
        </button>

        <!-- Fechar Terminal -->
        <button class="action-btn close-btn" title="Fechar Terminal" on:click={onClose}>
          <X size={13} />
        </button>
      </div>
    </div>

    <!-- Área de Exibição dos Terminais Veu Persistentes por Projeto -->
    <div class="terminal-content">
      {#each currentTabs as t (t.id)}
        <div
          class="term-wrapper"
          class:hidden={t.id !== activeTermId}
          bind:this={timelineContainers[t.id]}
          on:click={focusActiveInput}
          role="presentation"
        >
          <!-- Contexto Inicial da Sessão -->
          <div class="session-header">
            <span class="session-path">{t.cwd || currentFolderPath || 'Pasta ativa'}</span>
            <span class="session-hint">Terminal Veu ativo • Digite comandos e pressione Enter</span>
          </div>

          <!-- Linha do Tempo de Blocos de Comando e Saída -->
          {#each t.blocks as block (block.id)}
            <div class="command-block" class:is-running={block.status === 'running'}>
              <div class="command-header">
                <div class="command-info">
                  <span class="prompt-glyph">›</span>
                  <span class="command-name">{block.command}</span>
                </div>
                <div class="command-meta">
                  <span class="command-time">{block.timestamp}</span>

                  {#if block.status === 'running'}
                    <span class="running-tag">
                      <span class="pulse-indicator"></span> Rodando
                    </span>
                    <button
                      class="stop-btn"
                      title="Interromper execução (Ctrl+C)"
                      on:click|stopPropagation={() => stopCommand(t)}
                    >
                      <Square size={10} fill="currentColor" /> Parar
                    </button>
                  {:else}
                    <div class="block-actions">
                      <button
                        class="block-btn"
                        class:btn-active={block.copied}
                        title="Copiar saída do comando"
                        on:click|stopPropagation={() => copyBlockOutput(block)}
                      >
                        {#if block.copied}
                          <Check size={11} /> Copiado
                        {:else}
                          <Copy size={11} /> Copiar
                        {/if}
                      </button>

                      {#if onInsertText}
                        <button
                          class="block-btn"
                          class:btn-active={block.inserted}
                          title="Inserir saída no editor"
                          on:click|stopPropagation={() => insertBlockToEditor(block)}
                        >
                          {#if block.inserted}
                            <Check size={11} /> Inserido
                          {:else}
                            <CornerDownLeft size={11} /> No Editor
                          {/if}
                        </button>
                      {/if}
                    </div>
                  {/if}
                </div>
              </div>

              <!-- Retorno Formatado do Comando -->
              {#if block.outputHtml}
                <div class="command-output">
                  {@html block.outputHtml}
                </div>
              {:else if block.status === 'running'}
                <div class="command-output running-placeholder">
                  <span class="spinner-dot"></span> Aguardando saída do processo...
                </div>
              {/if}
            </div>
          {/each}

          <!-- Linha de Entrada Interativa ao Final do Fluxo (quando idle) -->
          {#if !t.isRunning}
            <div class="active-prompt-row">
              <span class="prompt-glyph active">›</span>
              <input
                type="text"
                class="active-prompt-input"
                bind:value={t.activeInput}
                bind:this={activeInputEl}
                placeholder="Digite um comando (ex: git status, npm test, dir)..."
                on:keydown={(e) => handleInputKeydown(e, t)}
                spellcheck="false"
                autocomplete="off"
              />
              {#if t.activeInput.trim().length > 0}
                <button
                  class="submit-btn"
                  title="Executar comando (Enter)"
                  on:click={() => submitCommand(t)}
                >
                  <CornerDownLeft size={12} />
                </button>
              {/if}
            </div>
          {:else}
            <!-- Barra de Processo Ativo (previne concorrência e confusão) -->
            <div class="process-running-bar">
              <div class="running-info">
                <span class="pulse-indicator"></span>
                <span>Executando comando no Terminal Veu...</span>
              </div>
              <button
                class="stop-running-btn"
                title="Interromper processo (Ctrl+C)"
                on:click={() => stopCommand(t)}
              >
                <Square size={11} fill="currentColor" /> Parar Processo (Ctrl+C)
              </button>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .resize-handle {
    background-color: var(--veu-border-color);
    transition: background-color 0.2s;
    flex-shrink: 0;
    z-index: 26;
  }

  .resize-handle.handle-horizontal {
    height: 4px;
    width: 100%;
    cursor: row-resize;
  }

  .resize-handle.handle-vertical {
    width: 4px;
    height: 100%;
    cursor: col-resize;
  }

  .resize-handle:hover {
    background-color: var(--veu-h1-color);
  }

  .terminal-panel {
    display: flex;
    flex-direction: column;
    background-color: var(--veu-bg-app);
    color: var(--veu-text-color);
    z-index: 25;
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }

  .terminal-panel.orientation-horizontal:not(.maximized) {
    border-top: 1px solid var(--veu-border-color);
  }

  .terminal-panel.orientation-vertical:not(.maximized) {
    border-left: 1px solid var(--veu-border-color);
  }

  .terminal-panel.maximized {
    border: none;
  }

  .terminal-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 32px;
    background-color: var(--veu-bg-sidebar);
    border-bottom: 1px solid var(--veu-border-color);
    padding: 0 8px;
    user-select: none;
    flex-shrink: 0;
  }

  .term-tabs {
    display: flex;
    align-items: center;
    gap: 4px;
    overflow-x: auto;
  }

  .veu-badge {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(192, 132, 252, 0.12);
    color: var(--veu-h2-color);
    font-size: 11px;
    font-weight: 600;
    margin-right: 4px;
  }

  .term-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 11px;
    background: transparent;
    color: var(--veu-text-color);
    opacity: 0.7;
    cursor: pointer;
    transition: background-color 0.15s, opacity 0.15s;
  }

  .term-tab:hover {
    opacity: 1;
    background-color: rgba(127, 127, 127, 0.12);
  }

  .term-tab.active {
    background-color: var(--veu-active-item-bg);
    color: var(--veu-h2-color);
    opacity: 1;
    font-weight: 500;
  }

  .tab-running-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #facc15;
    animation: pulse 1.4s infinite;
  }

  .close-tab {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 2px;
    display: flex;
    align-items: center;
    opacity: 0.6;
    border-radius: 2px;
  }

  .close-tab:hover {
    opacity: 1;
    background-color: rgba(127, 127, 127, 0.2);
  }

  .add-term-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    background: transparent;
    border: none;
    color: var(--veu-text-color);
    border-radius: 3px;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.15s, background-color 0.15s;
  }

  .add-term-btn:hover {
    background-color: var(--veu-active-item-bg);
    opacity: 1;
  }

  .term-actions {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .action-btn {
    background: none;
    border: none;
    color: var(--veu-text-color);
    cursor: pointer;
    padding: 4px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
    transition: opacity 0.15s, background-color 0.15s, color 0.15s;
  }

  .action-btn:hover {
    opacity: 1;
    color: var(--veu-h2-color);
    background-color: var(--veu-active-item-bg);
  }

  .action-divider {
    width: 1px;
    height: 14px;
    background-color: var(--veu-border-color);
    margin: 0 3px;
    opacity: 0.5;
  }

  .action-btn.close-btn:hover {
    color: #ef4444;
  }

  .terminal-content {
    flex: 1;
    position: relative;
    overflow: hidden;
    background-color: var(--veu-bg-app);
  }

  .term-wrapper {
    position: absolute;
    inset: 0;
    overflow-y: auto;
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    cursor: text;
  }

  .term-wrapper.hidden {
    display: none;
  }

  .session-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 8px;
    font-size: 11px;
    color: var(--veu-text-color);
    opacity: 0.6;
    border-bottom: 1px dashed var(--veu-border-color);
    margin-bottom: 4px;
    user-select: none;
  }

  .session-path {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 10.5px;
  }

  .command-block {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 8px 10px;
    border-radius: 6px;
    background-color: rgba(127, 127, 127, 0.05);
    border: 1px solid rgba(127, 127, 127, 0.1);
    transition: border-color 0.15s, background-color 0.15s;
  }

  .command-block.is-running {
    border-color: rgba(244, 114, 182, 0.35);
    background-color: rgba(244, 114, 182, 0.04);
  }

  .command-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
  }

  .command-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
  }

  .prompt-glyph {
    color: var(--veu-h1-color);
    font-weight: 700;
    font-size: 13px;
    user-select: none;
  }

  .prompt-glyph.active {
    color: var(--veu-h2-color);
  }

  .command-name {
    font-weight: 600;
    color: var(--veu-text-color);
  }

  .command-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    user-select: none;
  }

  .command-time {
    font-size: 10.5px;
    opacity: 0.5;
  }

  .running-tag {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 10.5px;
    color: #facc15;
    font-weight: 500;
  }

  .pulse-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #facc15;
    animation: pulse 1.2s infinite;
  }

  .stop-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 10.5px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .stop-btn:hover {
    background: rgba(239, 68, 68, 0.28);
  }

  .block-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .block-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: transparent;
    border: 1px solid var(--veu-border-color);
    color: var(--veu-text-color);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10.5px;
    cursor: pointer;
    opacity: 0.75;
    transition: opacity 0.15s, background-color 0.15s, color 0.15s;
  }

  .block-btn:hover {
    opacity: 1;
    background-color: var(--veu-active-item-bg);
    color: var(--veu-h2-color);
  }

  .block-btn.btn-active {
    background-color: rgba(74, 222, 128, 0.15);
    border-color: rgba(74, 222, 128, 0.4);
    color: #4ade80;
    opacity: 1;
  }

  .command-output {
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 12px;
    line-height: 1.45;
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--veu-text-color);
    opacity: 0.95;
    padding-top: 3px;
    user-select: text;
  }

  .command-output.running-placeholder {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11.5px;
    opacity: 0.6;
    font-style: italic;
  }

  .spinner-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--veu-h1-color);
    animation: pulse 1s infinite;
  }

  .active-prompt-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 6px;
    background-color: rgba(127, 127, 127, 0.08);
    border: 1px solid var(--veu-border-color);
    margin-top: 2px;
  }

  .active-prompt-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 12.5px;
    color: var(--veu-text-color);
    padding: 0;
  }

  .active-prompt-input::placeholder {
    color: var(--veu-text-color);
    opacity: 0.4;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 12px;
  }

  .submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: var(--veu-h2-color);
    color: var(--veu-bg-app);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .submit-btn:hover {
    opacity: 0.85;
  }

  .process-running-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-radius: 6px;
    background-color: rgba(244, 114, 182, 0.08);
    border: 1px dashed rgba(244, 114, 182, 0.35);
    font-size: 12px;
    margin-top: 2px;
    user-select: none;
  }

  .running-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--veu-text-color);
    font-weight: 500;
  }

  .stop-running-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    background: #ef4444;
    color: #ffffff;
    border: none;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 11.5px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .stop-running-btn:hover {
    opacity: 0.9;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.35;
      transform: scale(0.85);
    }
  }

  /* Classes Semânticas de Estilo ANSI do Terminal Veu */
  :global(.ansi-bold) {
    font-weight: 600;
  }
  :global(.ansi-dim) {
    opacity: 0.6;
  }
  :global(.ansi-italic) {
    font-style: italic;
  }
  :global(.ansi-underline) {
    text-decoration: underline;
  }

  :global(.ansi-red) {
    color: #f87171;
  }
  :global(.ansi-green) {
    color: #4ade80;
  }
  :global(.ansi-yellow) {
    color: #facc15;
  }
  :global(.ansi-blue) {
    color: #60a5fa;
  }
  :global(.ansi-magenta) {
    color: #c084fc;
  }
  :global(.ansi-cyan) {
    color: #22d3ee;
  }
  :global(.ansi-white) {
    color: #f8fafc;
  }
  :global(.ansi-black) {
    color: #64748b;
  }

  :global(.ansi-bright-red) {
    color: #fca5a5;
  }
  :global(.ansi-bright-green) {
    color: #86efac;
  }
  :global(.ansi-bright-yellow) {
    color: #fde047;
  }
  :global(.ansi-bright-blue) {
    color: #93c5fd;
  }
  :global(.ansi-bright-magenta) {
    color: #e9d5ff;
  }
  :global(.ansi-bright-cyan) {
    color: #67e8f9;
  }
  :global(.ansi-bright-white) {
    color: #ffffff;
  }
  :global(.ansi-bright-black) {
    color: #94a3b8;
  }
</style>
