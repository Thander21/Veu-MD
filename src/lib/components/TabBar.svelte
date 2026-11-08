<script lang="ts">
  import { X, FileText, FileCode, FileCode2, FileJson, FileQuestion, Image } from 'lucide-svelte';
  import VeuMdIcon from './VeuMdIcon.svelte';
  import type { TabItem } from '../types';

  export let tabs: TabItem[] = [];
  export let activeTabId: string | null = null;
  export let onSelectTab: (id: string) => void;
  export let onCloseTab: (id: string) => void;

  function getTabIcon(tab: TabItem) {
    if (tab.isMarkdown) return VeuMdIcon;
    const lower = (tab.title || '').toLowerCase();
    const ext = lower.split('.').pop() || '';
    if (tab.isImage || ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext)) return Image;
    if (ext === 'html' || ext === 'htm') return FileCode;
    if (ext === 'json' || ext === 'jsonc') return FileJson;
    if (['css', 'scss', 'sass', 'less'].includes(ext)) return FileCode;
    if (['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs', 'mts', 'cts'].includes(ext)) return FileCode2;
    if (['txt', 'log'].includes(ext)) return FileText;
    return FileQuestion;
  }

  function getTabIconColor(tab: TabItem): string {
    if (tab.isMarkdown) return '#ab47bc';
    const lower = (tab.title || '').toLowerCase();
    const ext = lower.split('.').pop() || '';
    if (tab.isImage || ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext)) return '#a78bfa';
    if (ext === 'html' || ext === 'htm') return '#f97316';
    if (ext === 'json' || ext === 'jsonc') return '#facc15';
    if (['css', 'scss', 'sass', 'less'].includes(ext)) return '#38bdf8';
    if (['js', 'jsx', 'mjs', 'cjs'].includes(lower)) return '#fde047';
    if (['ts', 'tsx', 'mts', 'cts'].includes(lower)) return '#60a5fa';
    return 'var(--veu-text-color)';
  }
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
        <svelte:component
          this={getTabIcon(tab)}
          size={14}
          color={getTabIconColor(tab)}
        />
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
    color: var(--veu-text-color);
    opacity: 0.7;
    border-right: 1px solid var(--veu-border-color);
    font-size: 13px;
    cursor: pointer;
    transition: background-color 0.15s, color 0.15s, opacity 0.15s;
    white-space: nowrap;
    max-width: 220px;
  }

  .tab:hover {
    background-color: var(--veu-active-item-bg);
    opacity: 1;
    color: var(--veu-text-color);
  }

  .tab.active {
    background-color: var(--veu-bg-editor);
    color: var(--veu-text-color);
    opacity: 1;
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
    background-color: var(--veu-active-item-bg);
    opacity: 1;
  }
</style>

