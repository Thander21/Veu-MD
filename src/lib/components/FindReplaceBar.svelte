<script lang="ts">
  import { ChevronUp, ChevronDown, X, Replace, ReplaceAll } from 'lucide-svelte';
  import type { EditorView } from 'prosemirror-view';
  import { TextSelection } from 'prosemirror-state';

  export let visible: boolean = false;
  export let showReplace: boolean = false;
  export let editorView: EditorView | null = null;
  export let onClose: () => void;

  let query = '';
  let replaceText = '';
  let matches: { from: number; to: number }[] = [];
  let currentIndex = -1;
  let searchInputEl: HTMLInputElement | null = null;

  $: if (visible && searchInputEl) {
    setTimeout(() => searchInputEl?.focus(), 60);
  }

  $: {
    if (visible && query && editorView) {
      findMatches();
    } else {
      matches = [];
      currentIndex = -1;
    }
  }

  function findMatches() {
    if (!editorView || !query) {
      matches = [];
      currentIndex = -1;
      return;
    }

    const { state } = editorView;
    const found: { from: number; to: number }[] = [];
    const lowerQuery = query.toLowerCase();

    state.doc.descendants((node, pos) => {
      if (node.isText && node.text) {
        const text = node.text.toLowerCase();
        let idx = 0;
        while ((idx = text.indexOf(lowerQuery, idx)) !== -1) {
          found.push({ from: pos + idx, to: pos + idx + query.length });
          idx += query.length;
        }
      }
    });

    matches = found;
    if (matches.length > 0) {
      if (currentIndex === -1 || currentIndex >= matches.length) {
        currentIndex = 0;
      }
      highlightMatch(currentIndex);
    } else {
      currentIndex = -1;
    }
  }

  function highlightMatch(index: number) {
    if (!editorView || index < 0 || index >= matches.length) return;
    const m = matches[index];
    const { tr } = editorView.state;
    editorView.dispatch(
      tr.setSelection(TextSelection.create(editorView.state.doc, m.from, m.to)).scrollIntoView()
    );
  }

  function nextMatch() {
    if (matches.length === 0) return;
    currentIndex = (currentIndex + 1) % matches.length;
    highlightMatch(currentIndex);
  }

  function prevMatch() {
    if (matches.length === 0) return;
    currentIndex = (currentIndex - 1 + matches.length) % matches.length;
    highlightMatch(currentIndex);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      if (e.shiftKey) {
        prevMatch();
      } else {
        nextMatch();
      }
    }
  }

  function replaceCurrent() {
    if (!editorView || currentIndex < 0 || currentIndex >= matches.length) return;
    const m = matches[currentIndex];
    const { tr } = editorView.state;
    editorView.dispatch(tr.insertText(replaceText, m.from, m.to));
    findMatches();
  }

  function replaceAll() {
    if (!editorView || matches.length === 0) return;
    let tr = editorView.state.tr;
    for (let i = matches.length - 1; i >= 0; i--) {
      const m = matches[i];
      tr = tr.insertText(replaceText, m.from, m.to);
    }
    editorView.dispatch(tr);
    findMatches();
  }
</script>

{#if visible}
  <div class="find-replace-container" role="dialog" aria-label="Localizar e Substituir">
    <div class="find-row">
      <input
        type="text"
        class="find-input"
        placeholder="Localizar no documento..."
        bind:value={query}
        bind:this={searchInputEl}
        on:keydown={handleKeydown}
      />

      <span class="count-badge">
        {#if query}
          {#if matches.length > 0}
            {currentIndex + 1}/{matches.length}
          {:else}
            0/0
          {/if}
        {:else}
          -
        {/if}
      </span>

      <button
        class="icon-btn"
        title="Ocorrência anterior (Shift+Enter)"
        disabled={matches.length === 0}
        on:click={prevMatch}
      >
        <ChevronUp size={15} />
      </button>

      <button
        class="icon-btn"
        title="Próxima ocorrência (Enter)"
        disabled={matches.length === 0}
        on:click={nextMatch}
      >
        <ChevronDown size={15} />
      </button>

      <button
        class="icon-btn"
        class:active={showReplace}
        title="Alternar Substituição"
        on:click={() => (showReplace = !showReplace)}
      >
        <Replace size={14} />
      </button>

      <button class="icon-btn close-btn" title="Fechar (Esc)" on:click={onClose}>
        <X size={15} />
      </button>
    </div>

    {#if showReplace}
      <div class="replace-row">
        <input
          type="text"
          class="find-input"
          placeholder="Substituir por..."
          bind:value={replaceText}
          on:keydown={(e) => e.key === 'Enter' && replaceCurrent()}
        />

        <button
          class="text-btn"
          title="Substituir atual"
          disabled={matches.length === 0}
          on:click={replaceCurrent}
        >
          <Replace size={13} />
          <span>Substituir</span>
        </button>

        <button
          class="text-btn"
          title="Substituir todas as ocorrências"
          disabled={matches.length === 0}
          on:click={replaceAll}
        >
          <ReplaceAll size={13} />
          <span>Todos</span>
        </button>
      </div>
    {/if}
  </div>
{/if}

<style>
  .find-replace-container {
    position: absolute;
    top: 12px;
    right: 24px;
    z-index: 50;
    display: flex;
    flex-direction: column;
    gap: 6px;
    background-color: var(--veu-bg-sidebar);
    border: 1px solid var(--veu-border-color);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    border-radius: 8px;
    padding: 8px 10px;
    width: 360px;
    user-select: none;
    animation: fadeIn 0.15s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .find-row,
  .replace-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .find-input {
    flex: 1;
    height: 28px;
    background-color: var(--veu-bg-editor);
    border: 1px solid var(--veu-border-color);
    border-radius: 4px;
    color: var(--veu-text-color);
    padding: 0 8px;
    font-size: 12px;
    outline: none;
    transition: border-color 0.15s;
  }

  .find-input:focus {
    border-color: var(--veu-h2-color);
  }

  .count-badge {
    font-size: 11px;
    color: var(--veu-text-color);
    opacity: 0.65;
    min-width: 36px;
    text-align: center;
  }

  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    background: transparent;
    border: none;
    color: var(--veu-text-color);
    border-radius: 4px;
    cursor: pointer;
    opacity: 0.7;
    transition: background-color 0.12s, opacity 0.12s, color 0.12s;
  }

  .icon-btn:hover:not(:disabled) {
    background-color: var(--veu-active-item-bg);
    opacity: 1;
    color: var(--veu-h2-color);
  }

  .icon-btn:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .icon-btn.active {
    background-color: var(--veu-active-item-bg);
    color: var(--veu-h2-color);
    opacity: 1;
  }

  .icon-btn.close-btn:hover {
    color: #ef4444;
  }

  .text-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    height: 26px;
    padding: 0 8px;
    background-color: var(--veu-active-item-bg);
    border: 1px solid var(--veu-border-color);
    border-radius: 4px;
    color: var(--veu-text-color);
    font-size: 11px;
    cursor: pointer;
    transition: background-color 0.12s, border-color 0.12s;
  }

  .text-btn:hover:not(:disabled) {
    border-color: var(--veu-h2-color);
    color: var(--veu-h2-color);
  }

  .text-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }
</style>
