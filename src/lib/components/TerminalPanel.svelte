<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Terminal } from '@xterm/xterm';
  import { FitAddon } from '@xterm/addon-fit';
  import '@xterm/xterm/css/xterm.css';
  import { Plus, X, TerminalSquare, Minimize2 } from 'lucide-svelte';
  import { invoke } from '@tauri-apps/api/core';
  import { listen, type UnlistenFn } from '@tauri-apps/api/event';

  export let visible: boolean = false;
  export let currentFolderPath: string = '';
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
  let panelHeight = 220;
  let isResizing = false;

  async function createTerminalSession(shell = 'powershell.exe', cwd = currentFolderPath) {
    const id = `term-${Date.now()}`;
    const newTab: TermTab = {
      id,
      title: shell.includes('powershell') ? 'PowerShell' : shell.includes('cmd') ? 'CMD' : 'Bash',
      shell
    };

    tabs = [...tabs, newTab];
    activeTermId = id;

    // Aguarda renderização do elemento no DOM
    setTimeout(async () => {
      const container = terminalContainers[id];
      if (!container) return;

      const term = new Terminal({
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        fontSize: 13,
        lineHeight: 1.25,
        cursorBlink: true,
        theme: {
          background: '#131417',
          foreground: '#e2e8f0',
          cursor: '#38bdf8',
          selectionBackground: 'rgba(56, 189, 248, 0.3)'
        }
      });

      const fit = new FitAddon();
      term.loadAddon(fit);
      term.open(container);
      fit.fit();

      newTab.termInstance = term;
      newTab.fitAddon = fit;

      try {
        // Dispara o PTY nativo no backend Rust
        await invoke('spawn_terminal', {
          termId: id,
          cwd: cwd || null,
          shell: shell || null
        });

        // Escuta a saída do PTY enviada pelo Rust
        newTab.unlisten = await listen(`term-output-${id}`, (event: any) => {
          term.write(event.payload);
        });

        // Envia teclas digitadas no xterm.js para o Rust
        term.onData((data) => {
          invoke('write_terminal', { termId: id, data });
        });

        // Redimensionamento
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
    }
  }

  function startResize(e: MouseEvent) {
    isResizing = true;
    const startY = e.clientY;
    const startHeight = panelHeight;

    function onMouseMove(ev: MouseEvent) {
      if (!isResizing) return;
      const delta = startY - ev.clientY;
      panelHeight = Math.max(120, Math.min(500, startHeight + delta));
      tabs.forEach((t) => t.fitAddon?.fit());
    }

    function onMouseUp() {
      isResizing = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  $: if (visible && tabs.length === 0) {
    createTerminalSession('powershell.exe', currentFolderPath);
  }

  onDestroy(() => {
    tabs.forEach((t) => {
      if (t.unlisten) t.unlisten();
      if (t.termInstance) t.termInstance.dispose();
    });
  });
</script>

{#if visible}
  <!-- Resizer Bar -->
  <div class="resize-handle" role="presentation" on:mousedown={startResize}></div>

  <div class="terminal-panel" style="height: {panelHeight}px;">
    <!-- Barra Superior de Abas do Terminal -->
    <div class="terminal-bar">
      <div class="term-tabs">
        {#each tabs as t (t.id)}
          <div
            class="term-tab"
            class:active={t.id === activeTermId}
            role="button"
            tabindex="0"
            on:click={() => (activeTermId = t.id)}
            on:keydown={(e) => e.key === 'Enter' && (activeTermId = t.id)}
          >
            <TerminalSquare size={13} />
            <span>{t.title}</span>
            <button class="close-tab" on:click|stopPropagation={() => closeTerminal(t.id)}>
              <X size={12} />
            </button>
          </div>
        {/each}

        <button class="add-term-btn" title="Nova Sessão do Terminal" on:click={() => createTerminalSession()}>
          <Plus size={14} />
        </button>
      </div>

      <div class="term-actions">
        <button class="action-btn" title="Fechar Terminal" on:click={onClose}>
          <Minimize2 size={13} />
        </button>
      </div>
    </div>

    <!-- Área de Exibição dos Terminais -->
    <div class="terminal-content">
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
    height: 4px;
    background-color: var(--veu-border-color);
    cursor: row-resize;
    transition: background-color 0.2s;
  }

  .resize-handle:hover {
    background-color: var(--veu-h1-color);
  }

  .terminal-panel {
    display: flex;
    flex-direction: column;
    background-color: #131417;
    border-top: 1px solid var(--veu-border-color);
    z-index: 25;
  }

  .terminal-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 30px;
    background-color: #181a1f;
    border-bottom: 1px solid var(--veu-border-color);
    padding: 0 8px;
    user-select: none;
  }

  .term-tabs {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .term-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    background: transparent;
    color: rgba(200, 210, 230, 0.65);
    cursor: pointer;
  }

  .term-tab.active {
    background-color: #2d3748;
    color: #38bdf8;
  }

  .close-tab {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 1px;
    display: flex;
    align-items: center;
    opacity: 0.6;
  }

  .close-tab:hover {
    opacity: 1;
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
  }

  .add-term-btn:hover {
    background-color: rgba(255, 255, 255, 0.08);
    opacity: 1;
  }

  .action-btn {
    background: none;
    border: none;
    color: rgba(200, 210, 230, 0.6);
    cursor: pointer;
    padding: 4px;
    border-radius: 3px;
    display: flex;
    align-items: center;
  }

  .action-btn:hover {
    color: var(--veu-text-color);
    background-color: rgba(255, 255, 255, 0.08);
  }

  .terminal-content {
    flex: 1;
    position: relative;
    padding: 4px 6px;
    overflow: hidden;
  }

  .term-wrapper {
    position: absolute;
    inset: 4px 6px;
  }

  .term-wrapper.hidden {
    display: none;
  }
</style>
