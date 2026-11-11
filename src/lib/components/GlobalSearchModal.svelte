<script lang="ts">
  import { tick } from 'svelte';
  import { Search, FileText, X, CaseSensitive, WholeWord, Loader2, ArrowRight } from 'lucide-svelte';
  import { fsService } from '../services/fsService';
  import type { SearchMatch } from '../../types/ipc';

  export let visible: boolean = false;
  export let currentFolderPath: string = '';
  export let onSelectResult: (filePath: string, fileName: string, line: number) => void;
  export let onClose: () => void;

  interface FileGroup {
    filePath: string;
    fileName: string;
    relativePath: string;
    matches: SearchMatch[];
  }

  let query: string = '';
  let matchCase: boolean = false;
  let matchWholeWord: boolean = false;
  let searching: boolean = false;
  let matches: SearchMatch[] = [];
  let fileGroups: FileGroup[] = [];
  let selectedFlatIndex: number = 0;
  let inputEl: HTMLInputElement | null = null;
  let debounceTimer: any = null;

  // Agrupa os resultados lineares por arquivo
  $: {
    const groupMap = new Map<string, FileGroup>();
    for (const m of matches) {
      let group = groupMap.get(m.file_path);
      if (!group) {
        group = {
          filePath: m.file_path,
          fileName: m.file_name,
          relativePath: m.relative_path,
          matches: []
        };
        groupMap.set(m.file_path, group);
      }
      group.matches.push(m);
    }
    fileGroups = Array.from(groupMap.values());
  }

  $: totalMatches = matches.length;
  $: totalFiles = fileGroups.length;

  // Flattened matches para navegação contínua por teclado (ArrowUp / ArrowDown)
  $: flatMatches = matches;

  $: if (flatMatches.length > 0 && selectedFlatIndex >= flatMatches.length) {
    selectedFlatIndex = 0;
  }

  $: if (visible) {
    query = '';
    matches = [];
    selectedFlatIndex = 0;
    tick().then(() => {
      inputEl?.focus();
    });
  }

  function handleQueryInput() {
    if (debounceTimer) clearTimeout(debounceTimer);
    const trimmed = query.trim();
    if (!trimmed || !currentFolderPath) {
      matches = [];
      searching = false;
      return;
    }

    searching = true;
    debounceTimer = setTimeout(async () => {
      try {
        const res = await fsService.searchInFiles(
          currentFolderPath,
          trimmed,
          matchCase,
          matchWholeWord,
          500
        );
        matches = res;
      } catch (err) {
        console.error('Erro ao pesquisar em arquivos:', err);
        matches = [];
      } finally {
        searching = false;
      }
    }, 200);
  }

  function toggleMatchCase() {
    matchCase = !matchCase;
    handleQueryInput();
  }

  function toggleMatchWholeWord() {
    matchWholeWord = !matchWholeWord;
    handleQueryInput();
  }

  function handleSelect(match: SearchMatch) {
    onSelectResult(match.file_path, match.file_name, match.line_number);
    onClose();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (flatMatches.length > 0) {
        selectedFlatIndex = (selectedFlatIndex + 1) % flatMatches.length;
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (flatMatches.length > 0) {
        selectedFlatIndex = (selectedFlatIndex - 1 + flatMatches.length) % flatMatches.length;
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatMatches.length > 0 && flatMatches[selectedFlatIndex]) {
        handleSelect(flatMatches[selectedFlatIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }

  function highlightMatch(lineText: string, start: number, end: number): string {
    if (start >= end || start > lineText.length) return escapeHtml(lineText);
    const before = escapeHtml(lineText.slice(0, start));
    const matched = escapeHtml(lineText.slice(start, end));
    const after = escapeHtml(lineText.slice(end));
    return `${before}<mark class="search-highlight">${matched}</mark>${after}`;
  }

  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
</script>

{#if visible}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="modal-backdrop"
    role="presentation"
    on:click={(e) => e.target === e.currentTarget && onClose()}
  >
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="search-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Busca Global no Workspace"
      tabindex="-1"
      on:keydown={handleKeyDown}
    >
      <!-- Cabeçalho com Campo de Busca e Filtros -->
      <div class="search-header">
        <div class="input-wrapper">
          {#if searching}
            <Loader2 size={16} class="search-icon spinning" />
          {:else}
            <Search size={16} class="search-icon" />
          {/if}
          <input
            bind:this={inputEl}
            type="text"
            class="search-input"
            placeholder="Pesquisar em todos os arquivos do projeto (Ctrl+Shift+F)..."
            bind:value={query}
            on:input={handleQueryInput}
          />
        </div>

        <div class="filter-actions">
          <button
            class="filter-btn"
            class:active={matchCase}
            title="Diferenciar Maiúsculas de Minúsculas (Match Case)"
            on:click={toggleMatchCase}
          >
            <CaseSensitive size={15} />
          </button>
          <button
            class="filter-btn"
            class:active={matchWholeWord}
            title="Palavra Inteira (Whole Word)"
            on:click={toggleMatchWholeWord}
          >
            <WholeWord size={15} />
          </button>
          <div class="divider"></div>
          <button class="close-btn" title="Fechar Busca (Esc)" on:click={onClose}>
            <X size={15} />
          </button>
        </div>
      </div>

      <!-- Barra de Resumo de Status -->
      {#if query.trim()}
        <div class="status-bar">
          {#if searching}
            <span>Pesquisando em {currentFolderPath}...</span>
          {:else if totalMatches > 0}
            <span class="match-count">
              <strong>{totalMatches}</strong> ocorrência{totalMatches === 1 ? '' : 's'} em <strong>{totalFiles}</strong> arquivo{totalFiles === 1 ? '' : 's'}
            </span>
          {:else}
            <span class="empty-status">Nenhuma ocorrência encontrada para "{query}".</span>
          {/if}
        </div>
      {/if}

      <!-- Lista de Resultados Agrupados por Arquivo -->
      <div class="results-container">
        {#if !query.trim()}
          <div class="initial-hint">
            <Search size={28} />
            <p>Digite um termo para pesquisar em todos os arquivos de texto e Markdown do workspace.</p>
            <span class="shortcut-tip">Use <kbd>↑</kbd> <kbd>↓</kbd> para navegar e <kbd>Enter</kbd> para abrir</span>
          </div>
        {:else if !searching && fileGroups.length === 0}
          <div class="no-results">
            <p>Nenhuma correspondência encontrada no projeto ativo.</p>
          </div>
        {:else}
          {#each fileGroups as group}
            <div class="file-group-card">
              <div class="file-group-header">
                <FileText size={14} class="file-icon" />
                <span class="file-rel-path">{group.relativePath}</span>
                <span class="group-count-badge">{group.matches.length}</span>
              </div>

              <div class="matches-list">
                {#each group.matches as m}
                  {@const matchIndex = flatMatches.indexOf(m)}
                  {@const isSelected = matchIndex === selectedFlatIndex}
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <div
                    class="match-item"
                    class:selected={isSelected}
                    role="button"
                    tabindex="0"
                    on:click={() => handleSelect(m)}
                  >
                    <span class="line-badge">{m.line_number}</span>
                    <span class="line-snippet">
                      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                      {@html highlightMatch(m.line_text, m.match_start, m.match_end)}
                    </span>
                    <ArrowRight size={12} class="arrow-indicator" />
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(3px);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 60px;
    z-index: 100;
    animation: fadeIn 0.12s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .search-modal {
    width: 640px;
    max-width: 90vw;
    max-height: 80vh;
    background-color: var(--veu-bg-sidebar);
    border: 1px solid var(--veu-border-color);
    border-radius: 10px;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: slideDown 0.12s ease-out;
    outline: none;
  }

  @keyframes slideDown {
    from {
      transform: translateY(-8px);
    }
    to {
      transform: translateY(0);
    }
  }

  .search-header {
    display: flex;
    align-items: center;
    padding: 10px 14px;
    border-bottom: 1px solid var(--veu-border-color);
    gap: 10px;
    background-color: var(--veu-bg-app);
  }

  .input-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  :global(.search-icon) {
    color: var(--veu-text-color);
    opacity: 0.6;
    flex-shrink: 0;
  }

  :global(.spinning) {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--veu-text-color);
    font-size: 14px;
    font-family: inherit;
  }

  .search-input::placeholder {
    color: var(--veu-text-color);
    opacity: 0.4;
  }

  .filter-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .filter-btn {
    background: transparent;
    border: 1px solid transparent;
    color: var(--veu-text-color);
    opacity: 0.6;
    padding: 4px 6px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .filter-btn:hover {
    opacity: 1;
    background-color: var(--veu-active-item-bg);
  }

  .filter-btn.active {
    opacity: 1;
    color: var(--veu-h1-color);
    background-color: rgba(203, 166, 247, 0.18);
    border-color: var(--veu-h1-color);
  }

  .divider {
    width: 1px;
    height: 16px;
    background-color: var(--veu-border-color);
    margin: 0 4px;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: var(--veu-text-color);
    opacity: 0.55;
    padding: 4px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .close-btn:hover {
    opacity: 1;
    color: #ef4444;
    background-color: rgba(239, 68, 68, 0.12);
  }

  .status-bar {
    padding: 6px 14px;
    font-size: 11.5px;
    background-color: var(--veu-bg-editor);
    border-bottom: 1px solid var(--veu-border-color);
    color: var(--veu-text-color);
    opacity: 0.85;
  }

  .match-count strong {
    color: var(--veu-h1-color);
  }

  .results-container {
    flex: 1;
    overflow-y: auto;
    max-height: 55vh;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .initial-hint,
  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
    color: var(--veu-text-color);
    opacity: 0.55;
    gap: 8px;
  }

  .shortcut-tip {
    font-size: 11px;
    margin-top: 4px;
  }

  kbd {
    background-color: var(--veu-active-item-bg);
    border: 1px solid var(--veu-border-color);
    border-radius: 3px;
    padding: 1px 4px;
    font-size: 10px;
  }

  .file-group-card {
    background-color: var(--veu-bg-app);
    border: 1px solid var(--veu-border-color);
    border-radius: 6px;
    overflow: hidden;
  }

  .file-group-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background-color: var(--veu-bg-editor);
    border-bottom: 1px solid var(--veu-border-color);
    font-size: 12px;
    font-weight: 600;
  }

  :global(.file-icon) {
    color: var(--veu-h1-color);
    flex-shrink: 0;
  }

  .file-rel-path {
    flex: 1;
    color: var(--veu-text-color);
    word-break: break-all;
  }

  .group-count-badge {
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 10px;
    background-color: var(--veu-active-item-bg);
    color: var(--veu-h1-color);
    font-weight: 700;
  }

  .matches-list {
    display: flex;
    flex-direction: column;
  }

  .match-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 11.5px;
    color: var(--veu-text-color);
    cursor: pointer;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    transition: background-color 0.12s ease;
  }

  .match-item:last-child {
    border-bottom: none;
  }

  .match-item:hover {
    background-color: var(--veu-active-item-bg);
  }

  .match-item.selected {
    background-color: rgba(203, 166, 247, 0.16);
    border-left: 3px solid var(--veu-h1-color);
  }

  .line-badge {
    color: var(--veu-h2-color);
    opacity: 0.8;
    font-weight: 600;
    min-width: 28px;
    text-align: right;
    flex-shrink: 0;
  }

  .line-snippet {
    flex: 1;
    white-space: pre-wrap;
    word-break: break-all;
    overflow: hidden;
  }

  :global(.search-highlight) {
    background-color: rgba(203, 166, 247, 0.4);
    color: #ffffff;
    font-weight: 700;
    padding: 1px 2px;
    border-radius: 2px;
  }

  :global(.arrow-indicator) {
    opacity: 0;
    color: var(--veu-h1-color);
    transition: opacity 0.12s ease;
  }

  .match-item:hover :global(.arrow-indicator),
  .match-item.selected :global(.arrow-indicator) {
    opacity: 0.8;
  }
</style>

