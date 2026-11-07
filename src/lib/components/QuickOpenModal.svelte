<script lang="ts">
  import { tick } from 'svelte';
  import { Search, FileText, X } from 'lucide-svelte';
  import type { FileNode } from '../types';

  export let visible: boolean = false;
  export let fileTree: FileNode[] = [];
  export let currentFolderPath: string = '';
  export let onOpenFile: (filePath: string, fileName: string) => void;
  export let onClose: () => void;

  interface FlattenedFile {
    name: string;
    path: string;
    relPath: string;
  }

  let query: string = '';
  let selectedIndex: number = 0;
  let inputEl: HTMLInputElement | null = null;

  // Extrai todos os arquivos editáveis (.md, .txt, .markdown, .log) em memória
  function flattenFiles(nodes: FileNode[], baseDir: string): FlattenedFile[] {
    const list: FlattenedFile[] = [];

    function traverse(items: FileNode[]) {
      for (const item of items) {
        if (item.is_dir && item.children) {
          traverse(item.children);
        } else if (!item.is_dir) {
          const ext = item.extension?.toLowerCase();
          if (ext === 'md' || ext === 'markdown' || ext === 'txt' || ext === 'log') {
            const relPath = baseDir && item.path.startsWith(baseDir)
              ? item.path.slice(baseDir.length).replace(/^[\\\/]/, '')
              : item.name;
            list.push({
              name: item.name,
              path: item.path,
              relPath
            });
          }
        }
      }
    }

    traverse(nodes);
    return list;
  }

  // Algoritmo de busca difusa (Fuzzy Match) leve em memória (< 2ms)
  function fuzzyMatch(term: string, target: string): boolean {
    if (!term) return true;
    const t = target.toLowerCase();
    const q = term.toLowerCase();
    let qIdx = 0;
    for (let tIdx = 0; tIdx < t.length && qIdx < q.length; tIdx++) {
      if (t[tIdx] === q[qIdx]) {
        qIdx++;
      }
    }
    return qIdx === q.length;
  }

  $: allFiles = flattenFiles(fileTree, currentFolderPath);

  $: filteredFiles = allFiles
    .filter((file) => fuzzyMatch(query, file.name) || fuzzyMatch(query, file.relPath))
    .slice(0, 20);

  $: if (filteredFiles.length > 0 && selectedIndex >= filteredFiles.length) {
    selectedIndex = 0;
  }

  $: if (visible) {
    query = '';
    selectedIndex = 0;
    tick().then(() => {
      inputEl?.focus();
    });
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredFiles.length > 0) {
        selectedIndex = (selectedIndex + 1) % filteredFiles.length;
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredFiles.length > 0) {
        selectedIndex = (selectedIndex - 1 + filteredFiles.length) % filteredFiles.length;
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredFiles[selectedIndex]) {
        selectFile(filteredFiles[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }

  function selectFile(file: FlattenedFile) {
    onOpenFile(file.path, file.name);
    onClose();
  }
</script>

{#if visible}
  <div class="modal-backdrop" role="presentation" on:click={onClose}>
    <div
      class="quick-open-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Localizador Rápido de Arquivos"
      tabindex="-1"
      on:click|stopPropagation
      on:keydown|stopPropagation
    >
      <div class="search-header">
        <span class="search-icon-wrap">
          <Search size={16} />
        </span>
        <input
          bind:this={inputEl}
          type="text"
          placeholder="Buscar arquivo no projeto... (setas para navegar, Enter para abrir)"
          bind:value={query}
          on:keydown={handleKeyDown}
        />
        <button class="close-btn" title="Fechar (Esc)" on:click={onClose}>
          <X size={14} />
        </button>
      </div>

      <div class="results-list">
        {#if filteredFiles.length === 0}
          <div class="empty-state">
            <span>Nenhum arquivo correspondente encontrado no projeto ativo.</span>
          </div>
        {:else}
          {#each filteredFiles as file, index (file.path)}
            <div
              class="result-item"
              class:selected={index === selectedIndex}
              role="option"
              aria-selected={index === selectedIndex}
              tabindex="0"
              on:mouseenter={() => (selectedIndex = index)}
              on:click={() => selectFile(file)}
              on:keydown={(e) => e.key === 'Enter' && selectFile(file)}
            >
              <span class="file-icon-wrap">
                <FileText size={15} />
              </span>
              <div class="file-details">
                <span class="file-name">{file.name}</span>
                <span class="file-path">{file.relPath}</span>
              </div>
            </div>
          {/each}
        {/if}
      </div>

      <div class="modal-footer">
        <span><strong>↑↓</strong> para navegar</span>
        <span><strong>Enter</strong> para abrir</span>
        <span><strong>Esc</strong> para fechar</span>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(2px);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 12vh;
  }

  .quick-open-modal {
    width: 580px;
    max-width: 90vw;
    background-color: var(--veu-bg-sidebar);
    color: var(--veu-text-color);
    border: 1px solid var(--veu-border-color);
    border-radius: 8px;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: dropIn 0.15s ease-out;
  }

  @keyframes dropIn {
    from {
      opacity: 0;
      transform: translateY(-8px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .search-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--veu-border-color);
    background-color: var(--veu-bg-app);
  }

  .search-icon-wrap {
    color: var(--veu-h2-color);
    opacity: 0.85;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .search-header input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--veu-text-color);
    font-size: 14px;
    font-family: inherit;
  }

  .close-btn {
    background: none;
    border: none;
    color: var(--veu-text-color);
    opacity: 0.6;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 4px;
    transition: opacity 0.15s, background-color 0.15s;
  }

  .close-btn:hover {
    opacity: 1;
    background-color: rgba(127, 127, 127, 0.15);
  }

  .results-list {
    max-height: 340px;
    overflow-y: auto;
    padding: 6px 0;
  }

  .empty-state {
    padding: 24px;
    text-align: center;
    font-size: 13px;
    opacity: 0.6;
  }

  .result-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 14px;
    cursor: pointer;
    transition: background-color 0.1s;
    user-select: none;
  }

  .result-item:hover,
  .result-item.selected {
    background-color: var(--veu-active-item-bg);
  }

  .file-icon-wrap {
    color: var(--veu-h2-color);
    opacity: 0.85;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  .file-details {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .file-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--veu-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-path {
    font-size: 11px;
    opacity: 0.55;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 14px;
    padding: 6px 14px;
    border-top: 1px solid var(--veu-border-color);
    font-size: 11px;
    opacity: 0.55;
    background-color: var(--veu-bg-sidebar);
  }

  .modal-footer strong {
    font-weight: 600;
  }
</style>
