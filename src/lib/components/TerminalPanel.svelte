<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Terminal } from '@xterm/xterm';
  import { FitAddon } from '@xterm/addon-fit';
  import '@xterm/xterm/css/xterm.css';
  import { Plus, X, TerminalSquare, Minimize2, Maximize2, Columns, Rows, Copy, Check, Eraser, CornerDownLeft } from 'lucide-svelte';
  import { invoke } from '@tauri-apps/api/core';
  import { listen, type UnlistenFn } from '@tauri-apps/api/event';
  import { subscribeTheme, getTheme } from '../theme/themeStore';
  import type { ThemeConfig } from '../types';

  export let projectId: string = 'default';
  export let visible: boolean = false;
  export let currentFolderPath: string = '';
  export let hasActiveFile: boolean = true;
  export let orientation: 'horizontal' | 'vertical' = 'horizontal';
  export let isMaximized: boolean = false;
  export let onClose: () => void;
  export let onInsertText: ((text: string) => void) | undefined = undefined;

  interface TermTab {
    id: string;
    projectId: string;
    title: string;
    shell: string;
    termInstance?: Terminal;
    fitAddon?: FitAddon;
    unlisten?: UnlistenFn;
  }

  // Todas as sessões ativas no app, indexadas por projeto
  let allTabs: TermTab[] = [];
  let projectActiveTermId: Record<string, string> = {};

  $: effectiveProjectId = projectId || 'default';
  $: currentTabs = allTabs.filter((t) => t.projectId === effectiveProjectId);
  $: activeTermId = projectActiveTermId[effectiveProjectId] || (currentTabs[0]?.id || '');

  let terminalContainers: Record<string, HTMLDivElement> = {};
  let terminalContentEl: HTMLDivElement | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let unsubscribeTheme: (() => void) | null = null;
  let currentThemeConfig: ThemeConfig = getTheme();

  let panelHeight = 240;
  let panelWidth = 460;
  let isResizing = false;

  let copiedFeedback = false;
  let insertedFeedback = false;
  let copyTimeout: any = null;
  let insertTimeout: any = null;

  function getActiveTab(): TermTab | undefined {
    return currentTabs.find((t) => t.id === activeTermId);
  }

  function getTerminalSelectionOrBuffer(tab?: TermTab): string {
    const t = tab || getActiveTab();
    if (!t || !t.termInstance) return '';

    if (t.termInstance.hasSelection()) {
      return t.termInstance.getSelection();
    }

    const buffer = t.termInstance.buffer.active;
    const lines: string[] = [];
    const startLine = Math.max(0, buffer.length - 30);
    for (let i = startLine; i < buffer.length; i++) {
      const line = buffer.getLine(i);
      if (line) {
        const text = line.translateToString(true);
        if (text.trim().length > 0) {
          lines.push(text);
        }
      }
    }
    return lines.join('\n');
  }

  async function handleCopySelection() {
    const text = getTerminalSelectionOrBuffer();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      copiedFeedback = true;
      if (copyTimeout) clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        copiedFeedback = false;
      }, 1500);
    } catch {
      // fallback
    }
  }

  function handleInsertToEditor() {
    const text = getTerminalSelectionOrBuffer();
    if (!text || !onInsertText) return;
    onInsertText(text);
    insertedFeedback = true;
    if (insertTimeout) clearTimeout(insertTimeout);
    insertTimeout = setTimeout(() => {
      insertedFeedback = false;
    }, 1500);
  }

  function handleClearTerminal() {
    const tab = getActiveTab();
    if (!tab || !tab.termInstance) return;
    tab.termInstance.clear();
    invoke('write_terminal', { termId: tab.id, data: '\x0c' }).catch(() => {});
  }

  // Monitora alterações na presença de arquivo aberto:
  // Se não houver arquivo aberto, expande o terminal automaticamente.
  // Se abrir um arquivo, divide automaticamente.
  let prevHasActiveFile = hasActiveFile;
  $: if (prevHasActiveFile !== hasActiveFile) {
    if (!hasActiveFile) {
      isMaximized = true;
    } else {
      isMaximized = false;
    }
    prevHasActiveFile = hasActiveFile;
    fitAll();
  }

  function getXtermTheme(theme: ThemeConfig) {
    const isDark = theme.isDark;
    const bg = theme.bgApp || (isDark ? '#131417' : '#ffffff');
    const fg = theme.textColor || (isDark ? '#e2e8f0' : '#0f172a');
    const accent = theme.link?.color || theme.h2?.color || (isDark ? '#38bdf8' : '#2563eb');
    const selBg = isDark ? 'rgba(56, 189, 248, 0.28)' : 'rgba(37, 99, 235, 0.22)';

    return {
      background: bg,
      foreground: fg,
      cursor: accent,
      cursorAccent: bg,
      selectionBackground: selBg,
      selectionForeground: isDark ? '#ffffff' : '#000000',
      black: isDark ? '#1e293b' : '#0f172a',
      red: isDark ? '#f87171' : '#dc2626',
      green: isDark ? '#4ade80' : '#16a34a',
      yellow: isDark ? '#facc15' : '#ca8a04',
      blue: isDark ? '#60a5fa' : '#2563eb',
      magenta: isDark ? '#c084fc' : '#9333ea',
      cyan: isDark ? '#22d3ee' : '#0891b2',
      white: isDark ? '#f8fafc' : '#f1f5f9',
      brightBlack: isDark ? '#475569' : '#64748b',
      brightRed: isDark ? '#fca5a5' : '#ef4444',
      brightGreen: isDark ? '#86efac' : '#22c55e',
      brightYellow: isDark ? '#fde047' : '#eab308',
      brightBlue: isDark ? '#93c5fd' : '#3b82f6',
      brightMagenta: isDark ? '#e9d5ff' : '#a855f7',
      brightCyan: isDark ? '#67e8f9' : '#06b6d4',
      brightWhite: isDark ? '#ffffff' : '#0f172a'
    };
  }

  function applyThemeToTerminals(theme: ThemeConfig) {
    currentThemeConfig = theme;
    const termTheme = getXtermTheme(theme);
    allTabs.forEach((t) => {
      if (t.termInstance) {
        t.termInstance.options.theme = termTheme;
      }
    });
  }

  function fitAll() {
    requestAnimationFrame(() => {
      setTimeout(() => {
        currentTabs.forEach((t) => {
          if (t.fitAddon && t.termInstance) {
            const container = terminalContainers[t.id];
            // AC-ADV-004: recalcula fit apenas quando dimensões são reais e maiores que zero
            if (container && container.clientWidth > 0 && container.clientHeight > 0) {
              try {
                t.fitAddon.fit();
              } catch {
                // container em transição de renderização
              }
            }
          }
        });
      }, 50);
    });
  }

  export async function createTerminalSession(shell = 'powershell.exe', cwd = currentFolderPath) {
    const pId = effectiveProjectId;
    const id = `term-${pId}-${Date.now()}`;
    const newTab: TermTab = {
      id,
      projectId: pId,
      title: shell.includes('powershell') ? 'PowerShell' : shell.includes('cmd') ? 'CMD' : 'Bash',
      shell
    };

    allTabs = [...allTabs, newTab];
    projectActiveTermId[pId] = id;
    projectActiveTermId = { ...projectActiveTermId };

    setTimeout(async () => {
      const container = terminalContainers[id];
      if (!container) return;

      const termTheme = getXtermTheme(currentThemeConfig || getTheme());

      const term = new Terminal({
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        fontSize: 13,
        lineHeight: 1.25,
        cursorBlink: true,
        theme: termTheme,
        allowProposedApi: true,
        rightClickSelectsWord: true,
        convertEol: true
      });

      const fit = new FitAddon();
      term.loadAddon(fit);
      term.open(container);
      if (container.clientWidth > 0 && container.clientHeight > 0) {
        try {
          fit.fit();
        } catch {
          // container ainda inicializando
        }
      }

      newTab.termInstance = term;
      newTab.fitAddon = fit;

      try {
        await invoke('spawn_terminal', {
          termId: id,
          cwd: cwd || null,
          shell: shell || null
        });

        newTab.unlisten = await listen(`term-output-${id}`, (event: any) => {
          term.write(event.payload);
        });

        term.onData((data) => {
          invoke('write_terminal', { termId: id, data });
        });

        term.onResize(({ cols, rows }) => {
          invoke('resize_terminal', { termId: id, cols, rows });
        });
      } catch (err) {
        term.writeln(`\r\n\x1b[31mErro ao iniciar terminal nativo: ${err}\x1b[0m\r\n`);
      }
    }, 50);
  }

  function closeTerminal(id: string) {
    const tab = allTabs.find((t) => t.id === id);
    if (tab) {
      if (tab.unlisten) tab.unlisten();
      if (tab.termInstance) tab.termInstance.dispose();
      invoke('kill_terminal', { termId: id }).catch(() => {});
      delete terminalContainers[id];
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
      fitAll();
    }
  }

  // Encerra imediatamente todos os terminais PTY associados a um projeto específico (Decision 2 / AC-ADV-003)
  export function closeProjectTerminals(targetProjectId: string) {
    const toClose = allTabs.filter((t) => t.projectId === targetProjectId);
    toClose.forEach((t) => {
      if (t.unlisten) t.unlisten();
      if (t.termInstance) t.termInstance.dispose();
      invoke('kill_terminal', { termId: t.id }).catch(() => {});
      delete terminalContainers[t.id];
    });
    allTabs = allTabs.filter((t) => t.projectId !== targetProjectId);
    delete projectActiveTermId[targetProjectId];
    projectActiveTermId = { ...projectActiveTermId };
  }

  function toggleMaximize() {
    isMaximized = !isMaximized;
    fitAll();
  }

  function toggleOrientation() {
    orientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';
    fitAll();
  }

  function startResize(e: MouseEvent) {
    if (isMaximized) return;
    isResizing = true;
    document.body.style.userSelect = 'none';
    const startY = e.clientY;
    const startX = e.clientX;
    const startHeight = panelHeight;
    const startWidth = panelWidth;

    function onMouseMove(ev: MouseEvent) {
      if (!isResizing) return;
      if (orientation === 'horizontal') {
        const delta = startY - ev.clientY;
        panelHeight = Math.max(120, Math.min(window.innerHeight - 150, startHeight + delta));
      } else {
        const delta = startX - ev.clientX;
        panelWidth = Math.max(220, Math.min(window.innerWidth - 260, startWidth + delta));
      }
      fitAll();
    }

    function onMouseUp() {
      isResizing = false;
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      fitAll();
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  // Cria a primeira sessão para o projeto atual se ainda não existir nenhuma
  $: if (visible && currentTabs.length === 0 && currentFolderPath) {
    createTerminalSession('powershell.exe', currentFolderPath);
  }

  // Ajusta o fit sempre que a visibilidade ou o projeto ativo alternar
  $: if (visible && activeTermId) {
    fitAll();
  }

  onMount(() => {
    unsubscribeTheme = subscribeTheme((theme) => {
      applyThemeToTerminals(theme);
    });

    if (terminalContentEl) {
      resizeObserver = new ResizeObserver(() => {
        fitAll();
      });
      resizeObserver.observe(terminalContentEl);
    }
  });

  onDestroy(() => {
    if (unsubscribeTheme) unsubscribeTheme();
    if (resizeObserver) resizeObserver.disconnect();
    // No encerramento da aplicação, encerra todos os PTYs restantes
    allTabs.forEach((t) => {
      if (t.unlisten) t.unlisten();
      if (t.termInstance) t.termInstance.dispose();
      invoke('kill_terminal', { termId: t.id }).catch(() => {});
    });
  });
</script>

{#if visible}
  <!-- Resizer Bar (oculto quando maximizado) -->
  {#if !isMaximized}
    <div
      class="resize-handle"
      class:handle-horizontal={orientation === 'horizontal'}
      class:handle-vertical={orientation === 'vertical'}
      role="presentation"
      on:mousedown={startResize}
    ></div>
  {/if}

  <div
    class="terminal-panel"
    class:maximized={isMaximized}
    class:orientation-horizontal={orientation === 'horizontal'}
    class:orientation-vertical={orientation === 'vertical'}
    style={isMaximized
      ? 'flex: 1; width: 100%; height: 100%;'
      : orientation === 'horizontal'
      ? `height: ${panelHeight}px; width: 100%;`
      : `width: ${panelWidth}px; height: 100%;`}
  >
    <!-- Barra Superior de Abas do Terminal do Projeto Ativo -->
    <div class="terminal-bar">
      <div class="term-tabs">
        {#each currentTabs as t (t.id)}
          <div
            class="term-tab"
            class:active={t.id === activeTermId}
            role="button"
            tabindex="0"
            on:click={() => {
              projectActiveTermId[effectiveProjectId] = t.id;
              projectActiveTermId = { ...projectActiveTermId };
              fitAll();
            }}
            on:keydown={(e) => {
              if (e.key === 'Enter') {
                projectActiveTermId[effectiveProjectId] = t.id;
                projectActiveTermId = { ...projectActiveTermId };
                fitAll();
              }
            }}
          >
            <TerminalSquare size={13} />
            <span>{t.title}</span>
            <button
              class="close-tab"
              title="Fechar aba do terminal"
              on:click|stopPropagation={() => closeTerminal(t.id)}
            >
              <X size={12} />
            </button>
          </div>
        {/each}

        <button
          class="add-term-btn"
          title="Nova Sessão do Terminal"
          on:click={() => createTerminalSession()}
        >
          <Plus size={14} />
        </button>
      </div>

      <div class="term-actions">
        <!-- Ações Rápidas de Usabilidade e Seleção (T02) -->
        <button
          class="action-btn"
          class:feedback-active={copiedFeedback}
          title={copiedFeedback ? 'Copiado para área de transferência!' : 'Copiar seleção ou texto do terminal'}
          on:click={handleCopySelection}
        >
          {#if copiedFeedback}
            <Check size={13} style="color: var(--veu-h2-color, #22c55e);" />
          {:else}
            <Copy size={13} />
          {/if}
        </button>

        {#if onInsertText}
          <button
            class="action-btn"
            class:feedback-active={insertedFeedback}
            title={insertedFeedback ? 'Inserido no documento!' : 'Inserir saída do terminal no cursor do editor'}
            on:click={handleInsertToEditor}
          >
            {#if insertedFeedback}
              <Check size={13} style="color: var(--veu-h2-color, #22c55e);" />
            {:else}
              <CornerDownLeft size={13} />
            {/if}
          </button>
        {/if}

        <button
          class="action-btn"
          title="Limpar tela do terminal"
          on:click={handleClearTerminal}
        >
          <Eraser size={13} />
        </button>

        <div class="action-divider"></div>

        <!-- Alternar Divisão (Lateral / Horizontal) -->
        <button
          class="action-btn"
          title={orientation === 'horizontal' ? 'Dividir na lateral' : 'Dividir na horizontal'}
          on:click={toggleOrientation}
        >
          {#if orientation === 'horizontal'}
            <Columns size={13} />
          {:else}
            <Rows size={13} />
          {/if}
        </button>

        <!-- Expandir / Restaurar -->
        <button
          class="action-btn"
          title={isMaximized ? 'Restaurar tamanho' : 'Expandir terminal'}
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

    <!-- Área de Exibição dos Terminais Persistentes (Preserva instâncias xterm em background via CSS) -->
    <div class="terminal-content" bind:this={terminalContentEl}>
      {#each allTabs as t (t.id)}
        <div
          class="term-wrapper"
          class:hidden={!(t.projectId === effectiveProjectId && t.id === activeTermId)}
          bind:this={terminalContainers[t.id]}
        ></div>
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

  .action-btn.feedback-active {
    background-color: var(--veu-active-item-bg);
    opacity: 1;
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
    padding: 4px 6px;
    overflow: hidden;
    background-color: var(--veu-bg-app);
  }

  .term-wrapper {
    position: absolute;
    inset: 4px 6px;
  }

  .term-wrapper.hidden {
    display: none;
  }
</style>
