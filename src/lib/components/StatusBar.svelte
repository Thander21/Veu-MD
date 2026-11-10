<script lang="ts">
  import { TerminalSquare, FileText, Sparkles } from 'lucide-svelte';

  export let stats: { words: number; chars: number; tokens?: number; readTime: string } = {
    words: 0,
    chars: 0,
    tokens: 0,
    readTime: '1 min de leitura'
  };
  export let terminalOpen: boolean = false;
  export let notification: string = '';
  export let onToggleTerminal: () => void;
</script>

<footer class="statusbar">
  <div class="stats-group">
    <span class="stat-item">
      <FileText size={12} />
      <span>{stats.words} palavras</span>
    </span>
    <span class="dot">•</span>
    <span class="stat-item">{stats.chars} caracteres</span>
    <span class="dot">•</span>
    <span class="stat-item token-item" title="Estimativa de tokens para IA (~4 caracteres por token)">
      <Sparkles size={11} style="opacity: 0.8;" />
      <span>~{stats.tokens ?? 0} tokens</span>
    </span>
    <span class="dot">•</span>
    <span class="stat-item">{stats.readTime}</span>
    {#if notification}
      <span class="dot">•</span>
      <span class="stat-item notification">{notification}</span>
    {/if}
  </div>

  <div class="right-group">
    <span class="stat-item">UTF-8</span>
    <button
      class="term-btn"
      class:active={terminalOpen}
      title="Alternar Terminal (Ctrl+')"
      on:click={onToggleTerminal}
    >
      <TerminalSquare size={13} />
      <span>Terminal</span>
    </button>
  </div>
</footer>

<style>
  .statusbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 24px;
    background-color: var(--veu-bg-app);
    border-top: 1px solid var(--veu-border-color);
    padding: 0 12px;
    font-size: 11px;
    color: var(--veu-text-color);
    opacity: 0.8;
    user-select: none;
    z-index: 10;
  }

  .stat-item.notification {
    color: var(--veu-h1-color);
    font-weight: 500;
    opacity: 1;
  }

  .stats-group, .right-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .dot {
    opacity: 0.4;
  }

  .term-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    background: transparent;
    border: none;
    color: inherit;
    font-size: 11px;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 3px;
  }

  .term-btn:hover {
    background-color: var(--veu-active-item-bg);
    color: var(--veu-text-color);
  }

  .term-btn.active {
    color: var(--veu-h1-color);
  }
</style>

