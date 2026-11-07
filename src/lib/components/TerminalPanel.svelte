<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Terminal } from '@xterm/xterm';
  import { FitAddon } from '@xterm/addon-fit';
  import '@xterm/xterm/css/xterm.css';
  import { Plus, X, TerminalSquare, Minimize2, Maximize2, Columns, Rows } from 'lucide-svelte';
  import { invoke } from '@tauri-apps/api/core';
  import { listen, type UnlistenFn } from '@tauri-apps/api/event';
  import { subscribeTheme, getTheme } from '../theme/themeStore';
  import type { ThemeConfig } from '../types';

  export let visible: boolean = false;
  export let currentFolderPath: string = '';
  export let hasActiveFile: boolean = true;
  export let orientation: 'horizontal' | 'vertical' = 'horizontal';
  export let isMaximized: boolean = false;
  export let onClose: () => void;

  interface TermTab {
    id: string;
    title: string;
    shell: string;
    termInstance?: Terminal;
    fitAddon?: FitAddon;
    unlisten?: UnlistenFn;
  }

  let tabs: TermTab[] = [];
  let activeTermId: string = '';
  let terminalContainers: Record<string, HTMLDivElement> = {};
  let terminalContentEl: HTMLDivElement | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let unsubscribeTheme: (() => void) | null = null;
  let currentThemeConfig: ThemeConfig = getTheme();

  let panelHeight = 240;
  let panelWidth = 460;
  let isResizing = false;

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
    tabs.forEach((t) => {
      if (t.termInstance) {
        t.termInstance.options.theme = termTheme;
      }
    });
  }

  function fitAll() {
    requestAnimationFrame(() => {
      setTimeout(() => {
        tabs.forEach((t) => {
          if (t.fitAddon && t.termInstance) {
            try {
              t.fitAddon.fit();
            } catch {
              // container ainda não dimensionado
            }
          }
        });
      }, 50);
    });
  }

  async function createTerminalSession(shell = 'powershell.exe', cwd = currentFolderPath) {
    const id = `term-${Date.now()}`;
    const newTab: TermTab = {
      id,
      title: shell.includes('powershell') ? 'PowerShell' : shell.includes('cmd') ? 'CMD' : 'Bash',
      shell
    };

    tabs = [...tabs, newTab];
    activeTermId = id;

    setTimeout(async () => {
      const container = terminalContainers[id];
      if (!container) return;

      const termTheme = getXtermTheme(currentThemeConfig || getTheme());

      const term = new Terminal({
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        fontSize: 13,
        lineHeight: 1.25,
        cursorBlink: true,
        theme: termTheme
      });

      const fit = new FitAddon();
      term.loadAddon(fit);
      term.open(container);
      fit.fit();

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
    const tab = tabs.find((t) => t.id === id);
    if (tab) {
      if (tab.unlisten) tab.unlisten();
      if (tab.termInstance) tab.termInstance.dispose();
      invoke('kill_terminal', { termId: id }).catch(() => {});
    }

    tabs = tabs.filter((t) => t.id !== id);
    if (activeTermId === id) {
      activeTermId = tabs[0]?.id || '';
    }
    if (tabs.length === 0) {
      onClose();
    } else {
      fitAll();
    }
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

  $: if (visible && tabs.length === 0) {
    createTerminalSession('powershell.exe', currentFolderPath);
  }

  $: if (visible) {
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
    tabs.forEach((t) => {
      if (t.unlisten) t.unlisten();
      if (t.termInstance) t.termInstance.dispose();
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
    <!-- Barra Superior de Abas do Terminal -->
    <div class="terminal-bar">
      <div class="term-tabs">
        {#each tabs as t (t.id)}
          <div
            class="term-tab"
            class:active={t.id === activeTermId}
            role="button"
            tabindex="0"
            on:click={() => {
              activeTermId = t.id;
              fitAll();
            }}
            on:keydown={(e) => {
              if (e.key === 'Enter') {
                activeTermId = t.id;
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

    <!-- Área de Exibição dos Terminais -->
    <div class="terminal-content" bind:this={terminalContentEl}>
      {#each tabs as t (t.id)}
        <div
          class="term-wrapper"
          class:hidden={t.id !== activeTermId}
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
