<script lang="ts">
  import { ChevronDown, ChevronUp, Copy, Check, Tag } from 'lucide-svelte';
  import { parseFrontmatterSummary } from '../utils/frontmatter';

  export let frontmatter: string | null = null;

  let isExpanded = false;
  let copied = false;

  $: summary = parseFrontmatterSummary(frontmatter);
  $: summaryEntries = Object.entries(summary).slice(0, 4); // Exibe até 4 metadados principais no modo colapsado

  async function copyFrontmatter() {
    if (!frontmatter) return;
    try {
      await navigator.clipboard.writeText(frontmatter);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch (err) {
      console.warn('Erro ao copiar frontmatter:', err);
    }
  }

  function toggleExpand() {
    isExpanded = !isExpanded;
  }
</script>

{#if frontmatter}
  <div class="frontmatter-container" class:expanded={isExpanded}>
    <div class="frontmatter-header">
      <div class="header-left">
        <button
          type="button"
          class="badge-toggle"
          on:click={toggleExpand}
          title={isExpanded ? 'Recolher metadados' : 'Expandir YAML completo'}
        >
          <Tag size={13} class="icon-tag" />
          <span class="badge-label">Frontmatter YAML</span>
          {#if isExpanded}
            <ChevronUp size={13} class="chevron" />
          {:else}
            <ChevronDown size={13} class="chevron" />
          {/if}
        </button>

        {#if !isExpanded && summaryEntries.length > 0}
          <div class="summary-chips">
            {#each summaryEntries as [key, val]}
              <span class="chip" title={`${key}: ${val}`}>
                <span class="chip-key">{key}:</span>
                <span class="chip-val">{val}</span>
              </span>
            {/each}
          </div>
        {/if}
      </div>

      <div class="header-right">
        <button
          type="button"
          class="action-btn"
          on:click={copyFrontmatter}
          title="Copiar bloco YAML"
        >
          {#if copied}
            <Check size={12} style="color: #a6e3a1;" />
            <span>Copiado</span>
          {:else}
            <Copy size={12} />
            <span>Copiar YAML</span>
          {/if}
        </button>
      </div>
    </div>

    {#if isExpanded}
      <div class="frontmatter-body">
        <pre><code>{frontmatter}</code></pre>
      </div>
    {/if}
  </div>
{/if}

<style>
  .frontmatter-container {
    background: var(--sidebar-bg, #181825);
    border-bottom: 1px solid var(--border-color, #313244);
    font-family: inherit;
    font-size: 11.5px;
    color: var(--text-color, #cdd6f4);
    transition: background-color 0.15s ease;
    user-select: none;
    flex-shrink: 0;
  }

  .frontmatter-container.expanded {
    background: var(--bg-color, #1e1e2e);
    border-bottom: 1px solid var(--border-color, #313244);
  }

  .frontmatter-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 14px;
    min-height: 28px;
    gap: 12px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    overflow: hidden;
    flex: 1;
  }

  .badge-toggle {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(203, 166, 247, 0.12);
    color: var(--primary-color, #cba6f7);
    border: 1px solid rgba(203, 166, 247, 0.25);
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
  }

  .badge-toggle:hover {
    background: rgba(203, 166, 247, 0.2);
    border-color: rgba(203, 166, 247, 0.4);
  }

  .summary-chips {
    display: flex;
    align-items: center;
    gap: 6px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 1px 6px;
    border-radius: 3px;
    font-size: 11px;
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chip-key {
    color: var(--text-muted, #a6adc8);
    font-weight: 500;
  }

  .chip-val {
    color: var(--text-color, #cdd6f4);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: transparent;
    color: var(--text-muted, #a6adc8);
    border: 1px solid transparent;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10.5px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.06);
    color: var(--text-color, #cdd6f4);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .frontmatter-body {
    padding: 8px 14px 10px 14px;
    background: rgba(0, 0, 0, 0.2);
    border-top: 1px dashed rgba(255, 255, 255, 0.07);
    user-select: text;
    max-height: 200px;
    overflow-y: auto;
  }

  .frontmatter-body pre {
    margin: 0;
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 11px;
    line-height: 1.5;
    color: var(--text-color, #cdd6f4);
    white-space: pre-wrap;
    word-break: break-all;
  }
</style>
