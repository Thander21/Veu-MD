<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Folder,
    FolderOpen,
    FileText,
    FileCode2,
    Image,
    File,
    ChevronRight,
    ChevronDown,
    FilePlus,
    FolderPlus,
    RefreshCw,
    Search,
    ListTree,
    FolderX,
    PanelLeftClose,
    X,
    Wand2
  } from 'lucide-svelte';
  import FileTreeNode from './FileTreeNode.svelte';
  import type { FileNode, HeadingItem } from '../types';

  export let fileTree: FileNode[] = [];
  export let currentFolderPath: string = '';
  export let headings: HeadingItem[] = [];
  export let onOpenFile: (path: string, name: string) => void;
  export let onOpenFolder: () => void = () => {};
  export let onCloseFolder: () => void = () => {};
  export let onCreateFile: () => void;
  export let onCreateFolder: () => void;
  export let onRefreshTree: () => void;
  export let onOpenTerminalInFolder: (path: string) => void;
  export let onJumpToHeading: (pos: number) => void;
  export let onDeleteEntry: (path: string, name: string, isDir: boolean) => void = () => {};
  export let onRenameEntry: (path: string, currentName: string) => void = () => {};
  export let onCreateInFolder: (folderPath: string, isDir: boolean) => void = () => {};
  export let onCollapse: (() => void) | undefined = undefined;
  export let onQuickOpen: (() => void) | undefined = undefined;

  let activeTab: 'explorer' | 'outline' = 'explorer';
  let searchQuery = '';
  let expandedFolders: Record<string, boolean> = {};

  // Redimensionamento interativo da barra lateral (180px a 600px)
  let sidebarWidth = 260;
  let isResizing = false;

  onMount(() => {
    const saved = localStorage.getItem('veu_sidebar_width');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 180 && parsed <= 600) {
        sidebarWidth = parsed;
      }
    }
  });

  function startResizing(e: MouseEvent) {
    e.preventDefault();
    isResizing = true;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing) return;
      // 48px corresponde à barra fina de projetos fixa à esquerda
      const newWidth = Math.min(600, Math.max(180, moveEvent.clientX - 48));
      sidebarWidth = newWidth;
    };

    const onMouseUp = () => {
      if (isResizing) {
        isResizing = false;
        localStorage.setItem('veu_sidebar_width', String(sidebarWidth));
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  function resetWidth() {
    sidebarWidth = 260;
    localStorage.setItem('veu_sidebar_width', '260');
  }

  function toggleFolder(path: string) {
    expandedFolders[path] = !expandedFolders[path];
  }

  function getFileIcon(ext?: string) {
    if (!ext) return File;
    const lower = ext.toLowerCase();
    if (lower === 'md' || lower === 'markdown') return FileText;
    if (lower === 'txt' || lower === 'log') return FileCode2;
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(lower)) return Image;
    return File;
  }

  function isEditable(ext?: string) {
    if (!ext) return false;
    const lower = ext.toLowerCase();
    return lower === 'md' || lower === 'markdown' || lower === 'txt' || lower === 'log';
  }

  function filterTree(nodes: FileNode[], query: string): FileNode[] {
    if (!query) return nodes;
    const q = query.toLowerCase();
    return nodes
      .map((node) => {
        if (node.is_dir) {
          const filteredChildren = node.children ? filterTree(node.children, q) : [];
          if (filteredChildren.length > 0 || node.name.toLowerCase().includes(q)) {
            return { ...node, children: filteredChildren };
          }
          return null;
        } else if (node.name.toLowerCase().includes(q)) {
          return node;
        }
        return null;
      })
      .filter(Boolean) as FileNode[];
  }

  $: displayedTree = filterTree(fileTree, searchQuery);
</script>

<aside class="sidebar" style="width: {sidebarWidth}px;">
  <!-- Cabeçalho de Ponta a Ponta do Sidebar -->
  <div class="sidebar-top-header">
    <div class="header-left">
      {#if onCollapse}
        <button
          class="header-action-btn collapse-header-btn"
          title="Recolher Barra Lateral (Alternar)"
          on:click={onCollapse}
          aria-label="Recolher Barra Lateral"
        >
          <PanelLeftClose size={16} />
        </button>
      {/if}
    </div>

    <div class="header-right">
      <button
        class="header-action-btn switch-project-btn"
        title={currentFolderPath ? "Trocar Projeto Aberto" : "Abrir Projeto"}
        on:click={onOpenFolder}
        aria-label="Trocar Projeto"
      >
        <FolderOpen size={14} />
        <span class="btn-text">Trocar Projeto</span>
      </button>

      <button
        class="header-action-btn wizard-btn disabled"
        disabled
        title="Assistente de Criação (Em breve)"
        aria-label="Assistente Wizard (Desativado)"
      >
        <Wand2 size={14} />
      </button>

      {#if onQuickOpen}
        <button
          class="header-action-btn search-quick-btn"
          title="Localizador Rápido no Projeto (Ctrl+P)"
          on:click={onQuickOpen}
          aria-label="Buscar Arquivos"
        >
          <Search size={14} />
        </button>
      {/if}
    </div>
  </div>

  <!-- Abas do Sidebar: Explorer vs Sumário -->
  <div class="sidebar-tabs">
    <button
      class="tab-btn"
      class:active={activeTab === 'explorer'}
      on:click={() => (activeTab = 'explorer')}
    >
      <Folder size={14} />
      <span>Arquivos</span>
    </button>
    <button
      class="tab-btn"
      class:active={activeTab === 'outline'}
      on:click={() => (activeTab = 'outline')}
    >
      <ListTree size={14} />
      <span>Sumário</span>
    </button>
  </div>

  {#if activeTab === 'explorer'}
    <!-- Barra de Ferramentas do Explorer -->
    <div class="toolbar">
      <div class="folder-title" title={currentFolderPath || 'Nenhuma Pasta Aberta'}>
        <span>{currentFolderPath ? currentFolderPath.split(/[\\/]/).pop() : 'Nenhuma Pasta'}</span>
      </div>
      <div class="actions">
        {#if currentFolderPath}
          <button class="action-btn" title="Novo Arquivo (.md)" on:click={onCreateFile}>
            <FilePlus size={14} />
          </button>
          <button class="action-btn" title="Nova Pasta" on:click={onCreateFolder}>
            <FolderPlus size={14} />
          </button>
          <button class="action-btn" title="Atualizar Árvore" on:click={onRefreshTree}>
            <RefreshCw size={13} />
          </button>
          <button class="action-btn close-folder-btn" title="Fechar Projeto" on:click={onCloseFolder}>
            <X size={14} />
          </button>
        {/if}
      </div>
    </div>

    {#if !currentFolderPath}
      <!-- Estado quando nenhuma pasta está aberta -->
      <div class="no-folder-panel">
        <div class="no-folder-icon-wrapper">
          <FolderOpen size={36} />
        </div>
        <div class="no-folder-title">Nenhuma pasta aberta</div>
        <p class="no-folder-desc">
          Para começar, selecione uma pasta para ler o diretório e criar ou editar documentos.
        </p>
        <button class="open-folder-cta" on:click={onOpenFolder}>
          <FolderOpen size={14} />
          <span>Selecionar Pasta</span>
        </button>
      </div>
    {:else}
      <!-- Campo de Busca -->
      <div class="search-box">
        <Search size={13} />
        <input type="text" placeholder="Filtrar arquivos..." bind:value={searchQuery} />
      </div>

      <!-- Lista em Árvore -->
      <div class="tree-container">
        {#if displayedTree.length === 0}
          <div class="empty-state">
            <span>Nenhum arquivo encontrado</span>
          </div>
        {:else}
          {#each displayedTree as item (item.path)}
            <FileTreeNode
              node={item}
              level={0}
              {expandedFolders}
              onToggleFolder={toggleFolder}
              {onOpenFile}
              {onDeleteEntry}
              {onRenameEntry}
              {onCreateInFolder}
              {onOpenTerminalInFolder}
            />
          {/each}
        {/if}
      </div>
  {/if}
{:else}
  <!-- Sumário do Documento Aberto -->
    <div class="outline-container">
      <div class="outline-header">Índice do Documento</div>
      {#if headings.length === 0}
        <div class="empty-state">Nenhum título (H1..H6) encontrado no documento.</div>
      {:else}
        {#each headings as h}
          <div
            class="outline-item"
            style="padding-left: {(h.level - 1) * 14 + 10}px;"
            role="button"
            tabindex="0"
            on:click={() => onJumpToHeading(h.pos)}
            on:keydown={(e) => e.key === 'Enter' && onJumpToHeading(h.pos)}
          >
            <span class="h-badge">H{h.level}</span>
            <span class="h-text">{h.text || 'Sem título'}</span>
          </div>
        {/each}
      {/if}
    </div>
  {/if}

  <!-- Alça de Redimensionamento Interativa (180px a 600px) -->
  <button
    type="button"
    class="sidebar-resizer"
    class:resizing={isResizing}
    on:mousedown={startResizing}
    on:dblclick={resetWidth}
    title="Arraste para redimensionar (Duplo clique para redefinir 260px)"
    aria-label="Redimensionar Barra Lateral"
    tabindex="0"
  ></button>
</aside>

<style>
  .sidebar {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--veu-bg-sidebar);
    border-right: 1px solid var(--veu-border-color);
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.15);
    user-select: none;
    font-size: 13px;
    flex-shrink: 0;
    z-index: 10;
  }

  .sidebar-resizer {
    position: absolute;
    top: 0;
    right: -3px;
    width: 6px;
    height: 100%;
    cursor: col-resize;
    z-index: 25;
    background: transparent;
    border: none;
    outline: none;
    padding: 0;
    transition: background-color 0.15s ease;
  }

  .sidebar-resizer:hover,
  .sidebar-resizer.resizing {
    background: var(--veu-h1-color);
  }

  .sidebar-top-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 44px;
    padding: 0 8px;
    border-bottom: 1px solid var(--veu-border-color);
    background-color: var(--veu-bg-sidebar);
    flex-shrink: 0;
    gap: 4px;
    box-sizing: border-box;
    user-select: none;
  }

  .header-left, .header-right {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .header-action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 28px;
    padding: 0 7px;
    border-radius: 5px;
    background: transparent;
    border: none;
    color: var(--veu-text-color);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    opacity: 0.8;
    transition: all 0.15s ease;
  }

  .header-action-btn:hover:not(:disabled) {
    opacity: 1;
    background-color: var(--veu-active-item-bg);
    color: var(--veu-h1-color);
  }

  .header-action-btn.disabled,
  .header-action-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .header-action-btn .btn-text {
    font-size: 11.5px;
    white-space: nowrap;
  }

  .collapse-header-btn {
    width: 28px;
    height: 28px;
    padding: 0;
  }

  .sidebar-tabs {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--veu-border-color);
  }

  .tab-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 34px;
    background: transparent;
    border: none;
    color: var(--veu-text-color);
    opacity: 0.65;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
  }

  .tab-btn.active {
    color: var(--veu-h1-color);
    opacity: 1;
    border-bottom: 2px solid var(--veu-h1-color);
    background-color: var(--veu-active-item-bg);
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
  }

  .folder-title {
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--veu-text-color);
    opacity: 0.85;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 140px;
  }

  .actions {
    display: flex;
    gap: 2px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: transparent;
    border: none;
    color: var(--veu-text-color);
    border-radius: 3px;
    cursor: pointer;
    opacity: 0.7;
  }

  .action-btn:hover {
    background-color: var(--veu-active-item-bg);
    opacity: 1;
  }

  .action-btn.close-folder-btn {
    color: #ef4444;
    opacity: 0.9;
  }

  .action-btn.close-folder-btn:hover {
    color: #ffffff;
    background-color: #ef4444;
    opacity: 1;
  }

  .no-folder-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 36px 16px;
    text-align: center;
    gap: 10px;
    flex: 1;
  }

  .no-folder-icon-wrapper {
    color: var(--veu-text-color);
    opacity: 0.45;
    margin-bottom: 2px;
  }

  .no-folder-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--veu-text-color);
  }

  .no-folder-desc {
    font-size: 11.5px;
    line-height: 1.5;
    color: var(--veu-text-color);
    opacity: 0.75;
    margin: 0;
  }

  .open-folder-cta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 4px;
    background-color: var(--veu-h1-color);
    color: #ffffff;
    border: none;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    margin-top: 6px;
    transition: opacity 0.15s;
  }

  .open-folder-cta:hover {
    opacity: 0.9;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 4px 10px 8px 10px;
    padding: 4px 8px;
    border-radius: 4px;
    background-color: var(--veu-bg-app);
    border: 1px solid var(--veu-border-color);
  }

  .search-box input {
    width: 100%;
    background: transparent;
    border: none;
    color: var(--veu-text-color);
    font-size: 12px;
    outline: none;
  }

  .tree-container, .outline-container {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0;
  }

  .empty-state {
    padding: 24px 16px;
    text-align: center;
    color: var(--veu-text-color);
    opacity: 0.5;
    font-size: 12px;
  }

  .outline-header {
    padding: 8px 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--veu-text-color);
    opacity: 0.7;
  }

  .outline-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 12px;
    color: var(--veu-text-color);
  }

  .outline-item:hover {
    background-color: var(--veu-active-item-bg);
    color: var(--veu-h1-color);
  }

  .h-badge {
    font-size: 10px;
    font-weight: 700;
    color: var(--veu-h1-color);
    background: var(--veu-active-item-bg);
    padding: 1px 4px;
    border-radius: 3px;
  }

  .h-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>

