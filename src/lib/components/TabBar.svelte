<script lang="ts">
  import { X, FileText, FileCode2 } from 'lucide-svelte';
  import type { TabItem } from '../types';

  export let tabs: TabItem[] = [];
  export let activeTabId: string | null = null;
  export let onSelectTab: (id: string) => void;
  export let onCloseTab: (id: string) => void;
</script>

<div class="tabbar">
  {#each tabs as tab (tab.id)}
    <div
      class="tab"
      class:active={tab.id === activeTabId}
      role="button"
      tabindex="0"
      on:click={() => onSelectTab(tab.id)}
      on:keydown={(e) => e.key === 'Enter' && onSelectTab(tab.id)}
    >
      <span class="icon">
        {#if tab.isMarkdown}
          <FileText size={14} color="#60a5fa" />
        {:else}
          <FileCode2 size={14} color="#94a3b8" />
        {/if}
      </span>
      <span class="title" title={tab.path}>{tab.title}</span>

      {#if tab.isDirty}
        <span class="dirty-indicator" title="Não salvo"></span>
      {/if}

      <button
        class="close-btn"
        title="Fechar aba"
        on:click|stopPropagation={() => onCloseTab(tab.id)}
      >
        <X size={13} />
      </button>
    </div>
  {/each}
</div>

<style>
  .tabbar {
    display: flex;
    align-items: center;
    height: 35px;
    background-color: var(--veu-bg-app);
    border-bottom: 1px solid var(--veu-border-color);
    overflow-x: auto;
    user-select: none;
  }

  .tab {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 0 12px;
    height: 100%;
    background-color: transparent;
    color: rgba(200, 210, 230, 0.65);
    border-right: 1px solid var(--veu-border-color);
    font-size: 13px;
    cursor: pointer;
    transition: background-color 0.15s, color 0.15s;
    white-space: nowrap;
    max-width: 220px;
  }

  .tab:hover {
    background-color: rgba(255, 255, 255, 0.03);
    color: var(--veu-text-color);
  }

  .tab.active {
    background-color: var(--veu-bg-editor);
    color: var(--veu-text-color);
    border-top: 2px solid var(--veu-h1-color);
  }

  .icon {
    display: flex;
    align-items: center;
  }

  .title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .dirty-indicator {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background-color: var(--veu-h1-color);
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 3px;
    background: transparent;
    border: none;
    color: inherit;
    cursor: pointer;
    margin-left: 2px;
    opacity: 0.6;
  }

  .close-btn:hover {
    background-color: rgba(255, 255, 255, 0.12);
    opacity: 1;
  }
</style>

