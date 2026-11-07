<script lang="ts">
  import {
    Folder,
    FolderOpen,
    FileText,
    FileCode,
    FileCode2,
    FileJson,
    FileQuestion,
    Image,
    File,
    ChevronRight,
    ChevronDown,
    FilePlus,
    FolderPlus,
    TerminalSquare,
    Pencil,
    Trash2
  } from 'lucide-svelte';
  import type { FileNode } from '../types';
  import VeuMdIcon from './VeuMdIcon.svelte';

  export let node: FileNode;
  export let level: number = 0;
  export let expandedFolders: Record<string, boolean> = {};
  export let onToggleFolder: (path: string) => void;
  export let onOpenFile: (path: string, name: string) => void;
  export let onDeleteEntry: (path: string, name: string, isDir: boolean) => void;
  export let onRenameEntry: (path: string, currentName: string) => void;
  export let onCreateInFolder: (folderPath: string, isDir: boolean) => void;
  export let onOpenTerminalInFolder: (path: string) => void;

  const BINARY_EXTENSIONS = new Set([
    'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico', 'tiff', 'psd',
    'zip', 'rar', '7z', 'tar', 'gz', 'bz2',
    'exe', 'dll', 'so', 'dylib', 'bin', 'iso', 'apk', 'msi',
    'pdf', 'docx', 'xlsx', 'pptx',
    'mp3', 'wav', 'ogg', 'flac', 'aac',
    'mp4', 'mkv', 'avi', 'mov', 'webm', 'flv',
    'woff', 'woff2', 'ttf', 'otf', 'eot'
  ]);

  function getFileIcon(ext?: string) {
    if (!ext) return FileQuestion;
    const lower = ext.toLowerCase();

    // 1. Markdown (.md, .markdown) — Ícone oficial Veu MD
    if (lower === 'md' || lower === 'markdown') return VeuMdIcon;

    // 2. HTML
    if (lower === 'html' || lower === 'htm') return FileCode;

    // 3. JSON
    if (lower === 'json' || lower === 'jsonc') return FileJson;

    // 4. Estilos (CSS, SCSS, LESS)
    if (['css', 'scss', 'sass', 'less'].includes(lower)) return FileCode;

    // 5. Scripts (JS, TS, JSX, TSX, MJS, CJS)
    if (['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs', 'mts', 'cts'].includes(lower)) return FileCode2;

    // 6. Imagens
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(lower)) return Image;

    // 7. Texto comum
    if (lower === 'txt' || lower === 'log') return FileText;

    // 8. Binários conhecidos (não editáveis)
    if (BINARY_EXTENSIONS.has(lower)) return File;

    // 9. Outros arquivos texto (formato indefinido / não mapeado)
    return FileQuestion;
  }

  function getFileIconColor(ext?: string): string {
    if (!ext) return 'var(--veu-text-color)';
    const lower = ext.toLowerCase();
    if (lower === 'md' || lower === 'markdown') return 'var(--veu-h1-color)';
    if (lower === 'html' || lower === 'htm') return '#f97316';
    if (lower === 'json' || lower === 'jsonc') return '#facc15';
    if (['css', 'scss', 'sass', 'less'].includes(lower)) return '#38bdf8';
    if (['js', 'jsx', 'mjs', 'cjs'].includes(lower)) return '#fde047';
    if (['ts', 'tsx', 'mts', 'cts'].includes(lower)) return '#60a5fa';
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(lower)) return '#c084fc';
    if (BINARY_EXTENSIONS.has(lower)) return 'rgba(127, 127, 127, 0.4)';
    return 'var(--veu-text-color)';
  }

  function isEditable(ext?: string): boolean {
    if (!ext) return true;
    const lower = ext.toLowerCase();
    return !BINARY_EXTENSIONS.has(lower);
  }
</script>

<div class="tree-node-wrapper">
  {#if node.is_dir}
    <div
      class="node folder"
      style="padding-left: {level * 14 + 8}px;"
      role="button"
      tabindex="0"
      on:click={() => onToggleFolder(node.path)}
      on:keydown={(e) => e.key === 'Enter' && onToggleFolder(node.path)}
    >
      <span class="chevron">
        {#if expandedFolders[node.path]}
          <ChevronDown size={14} />
        {:else}
          <ChevronRight size={14} />
        {/if}
      </span>
      <span class="folder-icon">
        {#if expandedFolders[node.path]}
          <FolderOpen size={15} color="#eab308" />
        {:else}
          <Folder size={15} color="#eab308" />
        {/if}
      </span>
      <span class="node-name" title={node.name}>{node.name}</span>

      <!-- Ações ao passar o mouse na pasta -->
      <span class="node-actions" role="toolbar" tabindex="-1" on:click|stopPropagation on:keydown|stopPropagation>
        <button
          class="item-act-btn"
          title="Novo arquivo nesta pasta"
          on:click={() => onCreateInFolder(node.path, false)}
        >
          <FilePlus size={12} />
        </button>
        <button
          class="item-act-btn"
          title="Nova subpasta"
          on:click={() => onCreateInFolder(node.path, true)}
        >
          <FolderPlus size={12} />
        </button>
        <button
          class="item-act-btn"
          title="Abrir terminal aqui"
          on:click={() => onOpenTerminalInFolder(node.path)}
        >
          <TerminalSquare size={12} />
        </button>
        <button
          class="item-act-btn"
          title="Renomear pasta"
          on:click={() => onRenameEntry(node.path, node.name)}
        >
          <Pencil size={12} />
        </button>
        <button
          class="item-act-btn danger"
          title="Excluir pasta"
          on:click={() => onDeleteEntry(node.path, node.name, true)}
        >
          <Trash2 size={12} />
        </button>
      </span>
    </div>

    <!-- Recursão para subitens -->
    {#if expandedFolders[node.path] && node.children}
      <div class="nested-tree">
        {#each node.children as child (child.path)}
          <svelte:self
            node={child}
            level={level + 1}
            {expandedFolders}
            {onToggleFolder}
            {onOpenFile}
            {onDeleteEntry}
            {onRenameEntry}
            {onCreateInFolder}
            {onOpenTerminalInFolder}
          />
        {/each}
      </div>
    {/if}
  {:else}
    <div
      class="node file"
      class:disabled={!isEditable(node.extension)}
      style="padding-left: {level * 14 + 22}px;"
      role="button"
      tabindex="0"
      on:click={() => isEditable(node.extension) && onOpenFile(node.path, node.name)}
      on:keydown={(e) => e.key === 'Enter' && isEditable(node.extension) && onOpenFile(node.path, node.name)}
    >
      <svelte:component
        this={getFileIcon(node.extension)}
        size={14}
        color={getFileIconColor(node.extension)}
      />
      <span class="node-name" title={node.name}>{node.name}</span>

      <!-- Ações ao passar o mouse no arquivo -->
      <span class="node-actions" role="toolbar" tabindex="-1" on:click|stopPropagation on:keydown|stopPropagation>
        <button
          class="item-act-btn"
          title="Renomear arquivo"
          on:click={() => onRenameEntry(node.path, node.name)}
        >
          <Pencil size={12} />
        </button>
        <button
          class="item-act-btn danger"
          title="Excluir arquivo"
          on:click={() => onDeleteEntry(node.path, node.name, false)}
        >
          <Trash2 size={12} />
        </button>
      </span>
    </div>
  {/if}
</div>

<style>
  .tree-node-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .node {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 27px;
    padding-right: 8px;
    font-size: 12px;
    color: var(--veu-text-color);
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.12s;
    user-select: none;
    position: relative;
  }

  .node:hover {
    background-color: var(--veu-active-item-bg);
  }

  .node.disabled {
    opacity: 0.45;
    cursor: default;
  }

  .chevron {
    display: flex;
    align-items: center;
    opacity: 0.6;
    width: 14px;
  }

  .folder-icon {
    display: flex;
    align-items: center;
  }

  .node-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .node-actions {
    display: none;
    align-items: center;
    gap: 2px;
    margin-left: auto;
  }

  .node:hover .node-actions {
    display: flex;
  }

  .item-act-btn {
    background: transparent;
    border: none;
    color: var(--veu-text-color);
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 3px;
    opacity: 0.7;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.12s, background-color 0.12s, color 0.12s;
  }

  .item-act-btn:hover {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.12);
  }

  .item-act-btn.danger:hover {
    color: #ef4444;
    background-color: rgba(239, 68, 68, 0.15);
  }

  .nested-tree {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
</style>
