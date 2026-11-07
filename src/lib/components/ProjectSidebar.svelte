<script lang="ts">
  import {
    Plus,
    X,
    History,
    Folder,
    FolderGit2,
    Check,
    Trash2,
    ExternalLink,
    PanelLeft
  } from 'lucide-svelte';
  import type { ProjectWorkspace, RecentProject } from '../types';

  export let projects: ProjectWorkspace[] = [];
  export let activeProjectId: string | null = null;
  export let recentProjects: RecentProject[] = [];
  export let sidebarOpen: boolean = true;
  export let onSelectProject: (id: string) => void;
  export let onCloseProject: (id: string) => void;
  export let onOpenNewProject: () => void;
  export let onSelectRecent: (recent: RecentProject) => void;
  export let onRemoveRecent: (folderPath: string) => void;
  export let onClearRecent: () => void = () => {};
  export let onToggleSidebar: () => void = () => {};

  let recentMenuOpen = false;

  function getProjectInitials(name: string): string {
    if (!name) return 'PR';
    const clean = name.trim().replace(/^[^a-zA-Z0-9]+/, '');
    const parts = clean.split(/[\s-_]+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase() || 'PR';
  }


  function toggleRecentMenu() {
    recentMenuOpen = !recentMenuOpen;
  }

  function closeRecentMenu() {
    recentMenuOpen = false;
  }

  function handleSelectRecentItem(recent: RecentProject) {
    onSelectRecent(recent);
    recentMenuOpen = false;
  }

  function isProjectCurrentlyOpen(folderPath: string): boolean {
    return projects.some((p) => p.folderPath.toLowerCase() === folderPath.toLowerCase());
  }

  function formatRelativeDate(timestamp: number): string {
    if (!timestamp) return '';
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 2) return 'agora há pouco';
    if (diffMins < 60) return `há ${diffMins} min`;
    if (diffHours < 24) return `há ${diffHours}h`;
    if (diffDays === 1) return 'ontem';
    return `há ${diffDays} dias`;
  }
</script>

<aside class="project-activity-bar" aria-label="Abas de Projetos">
  <!-- Topo Fixo: Botão de Alternância da Barra Lateral de Arquivos -->
  <div class="top-controls">
    <button
      class="action-btn toggle-sidebar-btn"
      class:active={sidebarOpen}
      title={sidebarOpen ? "Recolher Barra Lateral de Arquivos" : "Expandir Barra Lateral de Arquivos"}
      on:click={onToggleSidebar}
      aria-label="Alternar Barra Lateral"
    >
      <PanelLeft size={18} />
    </button>
  </div>

  <!-- Lista de abas de projetos abertos -->
  <div class="projects-list">
    {#each projects as project (project.id)}
      {@const isActive = project.id === activeProjectId}
      {@const initials = getProjectInitials(project.name)}
      <div
        class="project-tab-item"
        class:active={isActive}
        title="{project.name}&#10;{project.folderPath}&#10;(Botão direito para fechar)"
      >
        <button
          class="project-avatar-btn"
          on:click={() => onSelectProject(project.id)}
          on:contextmenu|preventDefault={() => onCloseProject(project.id)}
          aria-label="Alternar para o projeto {project.name}"
        >
          <span class="avatar-badge">
            <span class="badge-text">{initials}</span>
          </span>
        </button>

        <!-- Indicador lateral ativo -->
        {#if isActive}
          <div class="active-indicator"></div>
        {/if}
      </div>
    {/each}

    <!-- Botão de Adicionar / Abrir Novo Projeto -->
    <button
      class="action-btn add-btn"
      title="Abrir pasta de outro projeto (+)"
      on:click={onOpenNewProject}
      aria-label="Abrir outro projeto"
    >
      <Plus size={18} />
    </button>
  </div>

  <!-- Base: Projetos Recentes -->
  <div class="bottom-actions">
    <div class="recent-anchor">
      <button
        class="action-btn recent-btn"
        class:active={recentMenuOpen}
        title="Projetos Recentes (Troca Rápida)"
        on:click={toggleRecentMenu}
        aria-label="Projetos Recentes"
      >
        <History size={18} />
        {#if recentProjects.length > 0}
          <span class="recent-dot"></span>
        {/if}
      </button>

      <!-- Menu Popover Flutuante de Projetos Recentes -->
      {#if recentMenuOpen}
        <!-- Backdrop para fechar ao clicar fora -->
        <div class="popover-backdrop" on:click={closeRecentMenu} role="presentation"></div>

        <div class="recent-popover" role="dialog" aria-label="Projetos Recentes">
          <div class="popover-header">
            <div class="header-title">
              <History size={15} />
              <span>Projetos Recentes</span>
            </div>
            <button class="popover-close-btn" on:click={closeRecentMenu} title="Fechar">
              <X size={14} />
            </button>
          </div>

          <div class="recent-list-scroll">
            {#if recentProjects.length === 0}
              <div class="empty-state">
                <Folder size={24} opacity={0.4} />
                <p>Nenhum projeto recente salvo.</p>
                <span>Abra pastas de projetos para ter acesso rápido aqui.</span>
              </div>
            {:else}
              {#each recentProjects as item (item.folderPath)}
                {@const isOpened = isProjectCurrentlyOpen(item.folderPath)}
                <div class="recent-item" class:is-opened={isOpened}>
                  <button
                    class="recent-main-click"
                    on:click={() => handleSelectRecentItem(item)}
                    title="{item.name}&#10;{item.folderPath}"
                  >
                    <div class="recent-icon">
                      <Folder size={16} />
                    </div>
                    <div class="recent-info">
                      <div class="recent-name-row">
                        <span class="recent-name">{item.name}</span>
                        {#if isOpened}
                          <span class="opened-badge">Aberto</span>
                        {/if}
                      </div>
                      <span class="recent-path">{item.folderPath}</span>
                      {#if item.lastOpenedAt}
                        <span class="recent-time">{formatRelativeDate(item.lastOpenedAt)}</span>
                      {/if}
                    </div>
                  </button>

                  <button
                    class="remove-recent-btn"
                    title="Fechar / Remover projeto do histórico"
                    on:click|stopPropagation={() => onRemoveRecent(item.folderPath)}
                  >
                    <X size={14} />
                  </button>
                </div>
              {/each}
            {/if}
          </div>

          {#if recentProjects.length > 0}
            <div class="popover-footer">
              <button class="clear-all-btn" on:click={onClearRecent}>
                Limpar Histórico de Recentes
              </button>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</aside>

<style>
  .project-activity-bar {
    width: 48px;
    height: 100%;
    background-color: var(--veu-bg-sidebar);
    border-right: 1px solid var(--veu-border-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    box-sizing: border-box;
    user-select: none;
    z-index: 15;
    flex-shrink: 0;
  }

  .top-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin-bottom: 6px;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .toggle-sidebar-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    color: var(--veu-text-color);
    opacity: 0.75;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .toggle-sidebar-btn:hover {
    opacity: 1;
    background-color: var(--veu-active-item-bg);
    color: var(--veu-h1-color);
  }

  .toggle-sidebar-btn.active {
    color: var(--veu-h1-color);
    background-color: rgba(244, 114, 182, 0.12);
  }

  .projects-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 2px 0;
  }

  .projects-list::-webkit-scrollbar {
    width: 0px;
    display: none;
  }

  .project-tab-item {
    position: relative;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .project-avatar-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: transparent;
    border: 2px solid transparent;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.15s ease, border-color 0.15s ease;
  }

  .project-avatar-btn:hover {
    transform: scale(1.05);
  }

  .avatar-badge {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--veu-active-item-bg), var(--veu-bg-editor));
    border: 1px solid var(--veu-border-color);
    color: var(--veu-text-color);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: all 0.15s ease;
  }

  .project-tab-item.active .avatar-badge {
    border-color: var(--veu-h1-color);
    color: var(--veu-h1-color);
    box-shadow: 0 0 0 1px var(--veu-h1-color), 0 2px 6px rgba(0, 0, 0, 0.3);
  }

  .project-tab-item:hover .avatar-badge {
    border-color: var(--veu-h2-color);
  }

  .active-indicator {
    position: absolute;
    left: 0;
    top: 6px;
    bottom: 6px;
    width: 3px;
    border-radius: 0 3px 3px 0;
    background-color: var(--veu-h1-color);
  }

  .action-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px dashed var(--veu-border-color);
    background: transparent;
    color: var(--veu-text-color);
    opacity: 0.7;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .action-btn:hover {
    opacity: 1;
    background-color: var(--veu-active-item-bg);
    border-color: var(--veu-h1-color);
    color: var(--veu-h1-color);
  }

  .bottom-actions {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  .recent-anchor {
    position: relative;
  }

  .recent-btn {
    border: 1px solid transparent;
    position: relative;
  }

  .recent-btn.active {
    background-color: var(--veu-active-item-bg);
    color: var(--veu-h1-color);
    opacity: 1;
  }

  .recent-dot {
    position: absolute;
    top: 7px;
    right: 7px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--veu-h1-color);
  }

  /* Popover flutuante de Projetos Recentes */
  .popover-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 99;
  }

  .recent-popover {
    position: absolute;
    left: 54px;
    bottom: 0;
    width: 300px;
    max-height: 420px;
    background-color: var(--veu-bg-editor);
    border: 1px solid var(--veu-border-color);
    border-radius: 10px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.45);
    z-index: 100;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: fadeIn 0.15s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateX(-6px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .popover-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-bottom: 1px solid var(--veu-border-color);
    background-color: var(--veu-bg-sidebar);
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    font-weight: 600;
    color: var(--veu-text-color);
  }

  .popover-close-btn {
    background: transparent;
    border: none;
    color: var(--veu-text-color);
    opacity: 0.6;
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 2px;
    border-radius: 4px;
  }

  .popover-close-btn:hover {
    opacity: 1;
    background-color: var(--veu-active-item-bg);
  }

  .recent-list-scroll {
    overflow-y: auto;
    max-height: 300px;
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .recent-item {
    display: flex;
    align-items: center;
    border-radius: 6px;
    padding: 6px 8px;
    transition: background-color 0.15s ease;
    gap: 6px;
  }

  .recent-item:hover {
    background-color: var(--veu-active-item-bg);
  }

  .recent-main-click {
    flex: 1;
    background: transparent;
    border: none;
    display: flex;
    align-items: flex-start;
    gap: 9px;
    text-align: left;
    cursor: pointer;
    padding: 0;
    color: inherit;
    min-width: 0;
  }

  .recent-icon {
    margin-top: 2px;
    color: var(--veu-h1-color);
    flex-shrink: 0;
  }

  .recent-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    flex: 1;
  }

  .recent-name-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .recent-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--veu-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .opened-badge {
    font-size: 10px;
    padding: 1px 5px;
    border-radius: 4px;
    background-color: var(--veu-active-item-bg);
    border: 1px solid var(--veu-border-color);
    color: var(--veu-h1-color);
    font-weight: 500;
  }

  .recent-path {
    font-size: 11px;
    color: var(--veu-text-color);
    opacity: 0.6;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .recent-time {
    font-size: 10px;
    color: var(--veu-text-color);
    opacity: 0.45;
  }

  .remove-recent-btn {
    background: transparent;
    border: none;
    color: var(--veu-text-color);
    opacity: 0;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.15s ease, color 0.15s ease;
  }

  .recent-item:hover .remove-recent-btn {
    opacity: 0.6;
  }

  .remove-recent-btn:hover {
    opacity: 1 !important;
    color: #ef4444;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    text-align: center;
    gap: 6px;
    color: var(--veu-text-color);
  }

  .empty-state p {
    margin: 0;
    font-size: 13px;
    font-weight: 500;
  }

  .empty-state span {
    font-size: 11px;
    opacity: 0.6;
  }

  .popover-footer {
    border-top: 1px solid var(--veu-border-color);
    padding: 6px 12px;
    display: flex;
    justify-content: flex-end;
    background-color: var(--veu-bg-sidebar);
  }

  .clear-all-btn {
    background: transparent;
    border: none;
    font-size: 11px;
    color: var(--veu-text-color);
    opacity: 0.6;
    cursor: pointer;
    padding: 2px 6px;
  }

  .clear-all-btn:hover {
    opacity: 1;
    color: #ef4444;
  }
</style>
