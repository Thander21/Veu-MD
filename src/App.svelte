<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { listen, type UnlistenFn } from '@tauri-apps/api/event';
  import { open } from '@tauri-apps/plugin-dialog';
  import TopBar from './lib/components/TopBar.svelte';
  import Sidebar from './lib/components/Sidebar.svelte';
  import ProjectSidebar from './lib/components/ProjectSidebar.svelte';
  import TabBar from './lib/components/TabBar.svelte';
  import Editor from './lib/components/Editor.svelte';
  import ImageViewer from './lib/components/ImageViewer.svelte';
  import FrontmatterBanner from './lib/components/FrontmatterBanner.svelte';
  import ThemeSettings from './lib/components/ThemeSettings.svelte';
  import AiAssistantPanel from './lib/components/AiAssistantPanel.svelte';
  import TerminalPanel from './lib/components/TerminalPanel.svelte';
  import StatusBar from './lib/components/StatusBar.svelte';
  import FindReplaceBar from './lib/components/FindReplaceBar.svelte';
  import QuickOpenModal from './lib/components/QuickOpenModal.svelte';
  import { formatDocument } from './lib/utils/codeFormatter';
  import { extractFrontmatter, attachFrontmatter } from './lib/utils/frontmatter';
  import { estimateTokens, collectTextFilePaths, buildContextPayload } from './lib/utils/aiContext';
  import { serializeDocToHtml, copyFormattedHtml, setActiveDocumentDir } from './lib/editor/proseMirrorSetup';
  import { initTheme, setTheme, getTheme, subscribeTheme } from './lib/theme/themeStore';
  import { fsService } from './lib/services/fsService';
  import { cloudSyncService } from './lib/services/cloudSyncService';
  import {
    loadProjectsFromStorage,
    saveProjectsToStorage as storeSaveProjects,
    loadRecentProjectsFromStorage,
    addOrUpdateRecent as storeAddRecent,
    removeRecentProject as storeRemoveRecent,
    clearRecentProjects as storeClearRecents
  } from './lib/stores/projectStore';
  import type { FileNode, TabItem, HeadingItem, ProjectWorkspace, RecentProject } from './lib/types';
  import type { EditorView } from 'prosemirror-view';

  // Estados de múltiplos projetos
  let openProjects: ProjectWorkspace[] = [];
  let activeProjectId: string | null = null;
  let recentProjects: RecentProject[] = [];

  // Estados principais do projeto ativo
  let currentFolderPath: string = '';
  let fileTree: FileNode[] = [];
  let tabs: TabItem[] = [];
  let activeTabId: string | null = null;
  let headings: HeadingItem[] = [];
  let stats = { words: 0, chars: 0, tokens: 0, readTime: '1 min de leitura' };
  let statusNotification = '';

  // Painéis visíveis
  let sidebarOpen = true;
  let themeSettingsOpen = false;
  let aiAssistantOpen = false;
  let terminalOpen = false;
  let terminalOrientation: 'horizontal' | 'vertical' = 'horizontal';
  let terminalMaximized: boolean = false;
  let findReplaceOpen = false;
  let findReplaceShowReplace = false;
  let smartPasteSanitizeAi = true;
  let quickOpenVisible = false;

  let activeEditorView: EditorView | null = null;
  let editorRef: any = null;
  let terminalPanelRef: TerminalPanel | null = null;
  let aiPanelRef: any = null;

  // Documento inicial padrão (Boas-vindas ao Veu MD)
  const defaultWelcomeDoc = `# Bem-vindo ao Veu MD

O **Veu MD** é um editor desktop de alta performance projetado para **leitura e escrita fluida** de arquivos Markdown e texto puro.

## Principais Recursos em Ação:

1. **Edição 100% Estilo Word:** Você edita já no visual final sem que as tags \`#\` ou \`**\` fiquem aparecendo na tela. Ao salvar, ele grava como **Markdown puro (.md)** no seu disco.
2. **Cores por Tag & Temas:** Abra o botão **"Temas & Cores"** no canto superior direito para trocar as cores de cada nível de título, negrito, citações e fontes em tempo real.
3. **Árvore Lateral de Pastas:** Clique em **"Abrir Pasta"** no topo para explorar seus arquivos locais com ícones dedicados para Markdown, texto puro e imagens.
4. **Terminal Integrado:** Pressione o botão **"Terminal"** ou use o atalho \`Ctrl + '\` para abrir o PowerShell/CMD direto na sua pasta atual.

> [!NOTE]
> Esta é uma citação de destaque estilizada com borda colorida e fundo suave.

### Tabela de Exemplo:

| Recurso | Status | Descrição |
| :--- | :--- | :--- |
| Live Preview Word-Style | Ativo | Zero tags visíveis na digitação |
| Árvore de Arquivos | Ativo | Ícones e organização de pastas |
| Terminal PTY | Ativo | PowerShell integrado no diretório |

Experimente digitar \`#\` ou \`/\` no início de uma nova linha para abrir o menu rápido de blocos!
`;

  let unsubscribeTheme: (() => void) | null = null;
  let unlistenWatcher: UnlistenFn | null = null;
  let isSwitchingProject: boolean = false;
  let storageSaveTimeout: any = null;

  // Persistência no LocalStorage com debounce
  function saveProjectsToStorage() {
    if (storageSaveTimeout) {
      clearTimeout(storageSaveTimeout);
      storageSaveTimeout = null;
    }
    storeSaveProjects(openProjects, activeProjectId);
  }

  function debouncedSaveProjects() {
    if (storageSaveTimeout) clearTimeout(storageSaveTimeout);
    storageSaveTimeout = setTimeout(() => {
      saveProjectsToStorage();
    }, 500);
  }

  function addOrUpdateRecent(folderPath: string, name: string) {
    storeAddRecent(folderPath, name);
    recentProjects = loadRecentProjectsFromStorage();
  }

  function removeRecent(folderPath: string) {
    storeRemoveRecent(folderPath);
    recentProjects = loadRecentProjectsFromStorage();
  }

  function clearRecent() {
    storeClearRecents();
    recentProjects = [];
  }

  // Alterna o foco para outro projeto aberto
  async function switchToProject(targetId: string, saveCurrent = true) {
    if (saveCurrent && activeProjectId) {
      if (activeTab?.isDirty) {
        await saveCurrentFile();
      }
      const currentProj = openProjects.find((p) => p.id === activeProjectId);
      if (currentProj) {
        currentProj.tabs = tabs;
        currentProj.activeTabId = activeTabId;
        currentProj.terminalOpen = terminalOpen;
        currentProj.terminalOrientation = terminalOrientation;
        currentProj.terminalMaximized = terminalMaximized;
        currentProj.theme = getTheme();
      }
    }

    const target = openProjects.find((p) => p.id === targetId);
    if (!target) return;

    isSwitchingProject = true;
    try {
      target.lastOpenedAt = Date.now();
      activeProjectId = target.id;
      sidebarOpen = true;
      currentFolderPath = target.folderPath;
      addOrUpdateRecent(target.folderPath, target.name);

      // 1. Aplica o último tema escolhido deste projeto
      if (target.theme) {
        setTheme(target.theme);
      }

      // 2. Aplica orientação e estado do terminal do projeto
      terminalOrientation = target.terminalOrientation || 'horizontal';
      terminalOpen = target.terminalOpen || false;
      terminalMaximized = target.terminalMaximized || false;

      // 3. Restaura as abas de arquivos do projeto
      if (target.tabs && target.tabs.length > 0) {
        const loadedTabs: TabItem[] = [];
        for (const item of target.tabs) {
          // Se a aba já existe na memória da sessão, preserva seu conteúdo e estado dirty
          if (item.content !== undefined && item.content !== null && item.content !== '') {
            loadedTabs.push(item);
          } else if (item.path) {
            try {
              const lower = (item.title || '').toLowerCase();
              const ext = lower.split('.').pop() || '';
              const isImg = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext);
              let content = '';
              if (isImg) {
                content = await fsService.readFileBase64(item.path);
              } else {
                content = await fsService.readTextFile(item.path);
              }
              let frontmatter: string | null = null;
              if (item.isMarkdown && !isImg) {
                const parsed = extractFrontmatter(content);
                frontmatter = parsed.frontmatter;
                content = parsed.body;
              }
              loadedTabs.push({
                id: item.id || `tab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                title: item.title,
                path: item.path,
                content,
                isDirty: false,
                isMarkdown: item.isMarkdown,
                isImage: isImg,
                frontmatter
              });
            } catch {
              // Arquivo movido ou inacessível, ignora
            }
          }
        }
        tabs = loadedTabs;
        activeTabId = target.activeTabId && tabs.some((t) => t.id === target.activeTabId)
          ? target.activeTabId
          : (tabs[0]?.id || null);
      } else {
        tabs = [];
        activeTabId = null;
      }

      await refreshFileTree();
      saveProjectsToStorage();

      statusNotification = `Projeto ativo: ${target.name}`;
      setTimeout(() => (statusNotification = ''), 3000);
    } finally {
      isSwitchingProject = false;
    }
  }

  // Abre uma pasta como nova aba de projeto na barra ultra-slim
  async function openProjectByPath(folderPath: string) {
    const normPath = folderPath.replace(/[/\\]+$/, '');
    const existing = openProjects.find(
      (p) => p.folderPath.toLowerCase() === normPath.toLowerCase()
    );
    if (existing) {
      await switchToProject(existing.id);
      return;
    }

    const name = normPath.split(/[\\/]/).filter(Boolean).pop() || normPath;

    // Snapshot do projeto atual antes de criar novo
    if (activeProjectId) {
      const currentProj = openProjects.find((p) => p.id === activeProjectId);
      if (currentProj) {
        currentProj.tabs = tabs;
        currentProj.activeTabId = activeTabId;
        currentProj.terminalOpen = terminalOpen;
        currentProj.terminalOrientation = terminalOrientation;
        currentProj.terminalMaximized = terminalMaximized;
        currentProj.theme = getTheme();
      }
    }

    const newProject: ProjectWorkspace = {
      id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      folderPath: normPath,
      theme: getTheme(),
      terminalOrientation: 'horizontal',
      terminalOpen: false,
      terminalMaximized: false,
      activeTabId: null,
      tabs: [],
      lastOpenedAt: Date.now()
    };

    openProjects = [...openProjects, newProject];
    addOrUpdateRecent(newProject.folderPath, newProject.name);
    await switchToProject(newProject.id, false);
  }

  // Fecha uma aba de projeto
  async function closeProject(projectId: string) {
    const idx = openProjects.findIndex((p) => p.id === projectId);
    if (idx === -1) return;

    // Encerra imediatamente as sessões PTY associadas a este projeto no backend Rust (Decision 2 / AC-ADV-003)
    if (terminalPanelRef) {
      terminalPanelRef.closeProjectTerminals(projectId);
    }

    const closingActive = projectId === activeProjectId;
    openProjects = openProjects.filter((p) => p.id !== projectId);

    if (closingActive) {
      if (openProjects.length > 0) {
        const nextIdx = Math.min(idx, openProjects.length - 1);
        await switchToProject(openProjects[nextIdx].id, false);
      } else {
        activeProjectId = null;
        currentFolderPath = '';
        fileTree = [];
        const welcomeTab: TabItem = {
          id: 'tab-welcome',
          title: 'Boas-vindas.md',
          path: '',
          content: defaultWelcomeDoc,
          isDirty: false,
          isMarkdown: true
        };
        tabs = [welcomeTab];
        activeTabId = welcomeTab.id;
        saveProjectsToStorage();
        statusNotification = 'Todos os projetos foram fechados.';
        setTimeout(() => (statusNotification = ''), 3000);
      }
    } else {
      saveProjectsToStorage();
    }
  }

  function cycleProject(direction: 'next' | 'prev') {
    if (openProjects.length <= 1) return;
    const currentIndex = openProjects.findIndex((p) => p.id === activeProjectId);
    if (currentIndex === -1) return;
    const nextIndex =
      direction === 'next'
        ? (currentIndex + 1) % openProjects.length
        : (currentIndex - 1 + openProjects.length) % openProjects.length;
    switchToProject(openProjects[nextIndex].id);
  }

  function handleSelectRecent(recent: RecentProject) {
    openProjectByPath(recent.folderPath);
  }

  onMount(async () => {
    initTheme();

    // 1. Carrega projetos recentes
    recentProjects = loadRecentProjectsFromStorage();

    // 2. Carrega lista de projetos abertos
    const stored = loadProjectsFromStorage();
    let projectsLoaded = false;
    if (stored.projects.length > 0) {
      openProjects = stored.projects;
      projectsLoaded = true;
      const targetId = stored.activeId || openProjects[0].id;
      await switchToProject(targetId, false);
    }

    // 3. Fallback de migração para versão anterior
    if (!projectsLoaded) {
      const legacyFolder = localStorage.getItem('veu_last_opened_folder');
      if (legacyFolder) {
        try {
          await openProjectByPath(legacyFolder);
          projectsLoaded = true;
        } catch (err) {
          console.warn('Erro ao migrar pasta legada:', err);
        }
      }
    }

    if (!projectsLoaded) {
      // Cria a aba inicial de boas-vindas
      const welcomeTab: TabItem = {
        id: 'tab-welcome',
        title: 'Boas-vindas.md',
        path: '',
        content: defaultWelcomeDoc,
        isDirty: false,
        isMarkdown: true
      };
      tabs = [welcomeTab];
      activeTabId = welcomeTab.id;
    }

    // Descarte suave do splash screen após carregamento dos componentes
    setTimeout(() => {
      const splash = document.getElementById('splash-screen');
      if (splash) {
        splash.classList.add('fade-out');
        setTimeout(() => splash.remove(), 400);
      }
    }, 150);

    // Escuta alterações de temas em tempo real e associa ao projeto ativo
    unsubscribeTheme = subscribeTheme((newTheme) => {
      if (activeProjectId) {
        const p = openProjects.find((x) => x.id === activeProjectId);
        if (p) {
          p.theme = newTheme;
          saveProjectsToStorage();
        }
      }
    });

    // Escuta notificações de alterações externas de arquivo (File Watcher nativo)
    unlistenWatcher = await listen('file-changed-externally', async (event: any) => {
      const changedPath = event.payload as string;
      const targetTab = tabs.find((t) => t.path === changedPath);
      if (!targetTab) return;

      try {
        const newRawContent: string = await fsService.readTextFile(changedPath);
        let updatedContent = newRawContent;
        let updatedFrontmatter: string | null = targetTab.frontmatter || null;
        if (targetTab.isMarkdown && !targetTab.isImage) {
          const parsed = extractFrontmatter(newRawContent);
          updatedFrontmatter = parsed.frontmatter;
          updatedContent = parsed.body;
        }
        if (updatedContent !== targetTab.content || updatedFrontmatter !== targetTab.frontmatter) {
          if (!targetTab.isDirty) {
            targetTab.content = updatedContent;
            targetTab.frontmatter = updatedFrontmatter;
            tabs = [...tabs];
            statusNotification = `Arquivo "${targetTab.title}" sincronizado com alteração externa.`;
            setTimeout(() => (statusNotification = ''), 4000);
          } else {
            statusNotification = `Alteração externa detectada em "${targetTab.title}". Suas edições locais foram preservadas.`;
            setTimeout(() => (statusNotification = ''), 5000);
          }
        }
      } catch (err) {
        console.warn('Erro ao ler arquivo sincronizado externamente:', err);
      }
    });

    // Atalhos globais do teclado
    window.addEventListener('keydown', (e) => {
      // Ctrl + S (Salvar)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!currentFolderPath) {
          statusNotification = 'Selecione uma pasta para salvar arquivos.';
          setTimeout(() => (statusNotification = ''), 4000);
          return;
        }
        saveCurrentFile();
      }
      // Shift + Alt + F (Formatar Documento)
      if (e.shiftKey && e.altKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        handleFormatDocument();
      }
      // Ctrl + ' ou Ctrl + ` (Terminal)
      if ((e.ctrlKey || e.metaKey) && (e.key === "'" || e.key === '`')) {
        e.preventDefault();
        terminalOpen = !terminalOpen;
      }
      // Ctrl + L ou Ctrl + Shift + I / Ctrl + Alt + I (Assistente IA / agy)
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') ||
        ((e.ctrlKey || e.metaKey) && (e.shiftKey || e.altKey) && e.key.toLowerCase() === 'i')
      ) {
        e.preventDefault();
        aiAssistantOpen = !aiAssistantOpen;
        if (aiAssistantOpen) themeSettingsOpen = false;
      }
      // Ctrl + F (Localizar)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        findReplaceOpen = true;
        findReplaceShowReplace = false;
      }
      // Ctrl + H (Substituir)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        findReplaceOpen = true;
        findReplaceShowReplace = true;
      }
      // Ctrl + P (Localizador Rápido de Arquivos - Quick Open AC-ADV-012)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        quickOpenVisible = !quickOpenVisible;
      }
      // Ctrl + Shift + P (Exportar PDF / Imprimir)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        window.print();
      }
      // Ctrl + Alt + ] ou Ctrl + Alt + Seta Direita (Próximo Projeto)
      if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === ']' || e.key === 'ArrowRight')) {
        e.preventDefault();
        cycleProject('next');
      }
      // Ctrl + Alt + [ ou Ctrl + Alt + Seta Esquerda (Projeto Anterior)
      if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === '[' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        cycleProject('prev');
      }
    });
  });

  onDestroy(() => {
    if (unsubscribeTheme) unsubscribeTheme();
    if (unlistenWatcher) unlistenWatcher();
    fsService.unwatchFile().catch(() => {});
    autoSaveTimeouts.forEach((t) => clearTimeout(t));
    autoSaveTimeouts.clear();
  });

  $: activeTab = tabs.find((t) => t.id === activeTabId) || null;

  $: if (activeTab?.path) {
    const p = activeTab.path;
    const lastSlash = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\'));
    const dir = lastSlash > 0 ? p.substring(0, lastSlash) : currentFolderPath;
    setActiveDocumentDir(dir);
  }

  // Gerencia o arquivo sendo monitorado pelo File Watcher nativo
  let watchedPath: string = '';
  $: if (activeTab?.path && activeTab.path !== watchedPath) {
    watchedPath = activeTab.path;
    fsService.watchFile(watchedPath).catch(() => {});
  } else if (!activeTab?.path && watchedPath) {
    watchedPath = '';
    fsService.unwatchFile().catch(() => {});
  }

  // Sincroniza estado de abas e terminal no projeto ativo
  $: if (activeProjectId && !isSwitchingProject) {
    const p = openProjects.find((x) => x.id === activeProjectId);
    if (p) {
      p.terminalOrientation = terminalOrientation;
      p.terminalOpen = terminalOpen;
      p.terminalMaximized = terminalMaximized;
      p.activeTabId = activeTabId;
      p.tabs = tabs;
      debouncedSaveProjects();
    }
  }

  // ================= Ações de Arquivo & Pastas =================

  async function openFolderDialog() {
    try {
      const selected = await open({
        directory: true,
        multiple: false
      });
      if (selected && typeof selected === 'string') {
        await openProjectByPath(selected);
      }
    } catch (err) {
      console.error('Erro ao selecionar pasta:', err);
    }
  }

  function closeFolder() {
    if (activeProjectId) {
      closeProject(activeProjectId);
    }
  }

  async function refreshFileTree() {
    if (!currentFolderPath) return;
    try {
      const tree: FileNode[] = await fsService.readDirTree(currentFolderPath);
      fileTree = tree;
    } catch (err) {
      console.error('Erro ao ler árvore de diretórios:', err);
    }
  }

  async function openFile(filePath: string, fileName: string) {
    // Verifica se já está aberto em uma aba
    const existing = tabs.find((t) => t.path === filePath);
    if (existing) {
      await handleSelectTab(existing.id);
      return;
    }

    try {
      const lower = fileName.toLowerCase();
      const ext = lower.split('.').pop() || '';
      const isImg = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico'].includes(ext);

      let content = '';
      if (isImg) {
        content = await fsService.readFileBase64(filePath);
      } else {
        content = await fsService.readTextFile(filePath);
      }

      if (activeTab && activeTab.isDirty && currentFolderPath) {
        await saveTab(activeTab);
      }

      const isMarkdown = fileName.endsWith('.md') || fileName.endsWith('.markdown');
      let frontmatter: string | null = null;
      if (isMarkdown && !isImg) {
        const parsed = extractFrontmatter(content);
        frontmatter = parsed.frontmatter;
        content = parsed.body;
      }

      const newTab: TabItem = {
        id: `tab-${Date.now()}`,
        title: fileName,
        path: filePath,
        content,
        isDirty: false,
        isMarkdown,
        isImage: isImg,
        frontmatter
      };

      tabs = [...tabs, newTab];
      activeTabId = newTab.id;
    } catch (err) {
      console.error('Erro ao abrir arquivo:', err);
    }
  }

  async function createNewFile() {
    if (!currentFolderPath) {
      statusNotification = 'Selecione uma pasta para criar novos arquivos.';
      setTimeout(() => (statusNotification = ''), 4000);
      return;
    }

    const inputName = prompt('Nome do novo arquivo (padrão: novo_arquivo.md):');
    if (inputName === null) return;
    let fileName = inputName.trim();
    if (!fileName) {
      fileName = 'novo_arquivo.md';
    } else if (!fileName.includes('.')) {
      fileName = `${fileName}.md`;
    }

    const separator = currentFolderPath.includes('/') ? '/' : '\\';
    const fullPath = `${currentFolderPath}${separator}${fileName}`;
    try {
      await fsService.createEntry(fullPath, false);
      await refreshFileTree();
      await openFile(fullPath, fileName);
    } catch (err) {
      alert(`Erro ao criar arquivo: ${err}`);
    }
  }

  async function createNewFolder() {
    if (!currentFolderPath) {
      statusNotification = 'Selecione uma pasta para criar pastas.';
      setTimeout(() => (statusNotification = ''), 4000);
      return;
    }
    const folderName = prompt('Nome da nova pasta:');
    if (!folderName) return;

    const separator = currentFolderPath.includes('/') ? '/' : '\\';
    const fullPath = `${currentFolderPath}${separator}${folderName}`;
    try {
      await fsService.createEntry(fullPath, true);
      await refreshFileTree();
    } catch (err) {
      alert(`Erro ao criar pasta: ${err}`);
    }
  }

  async function handleDeleteEntry(path: string, name: string, isDir: boolean) {
    const itemType = isDir ? 'a pasta' : 'o arquivo';
    const confirmed = confirm(`Tem certeza que deseja excluir ${itemType} "${name}"?`);
    if (!confirmed) return;

    try {
      await fsService.deleteEntry(path);
      const openTab = tabs.find((t) => t.path === path);
      if (openTab) {
        closeTab(openTab.id);
      }
      await refreshFileTree();
      statusNotification = `${isDir ? 'Pasta' : 'Arquivo'} "${name}" excluído.`;
      setTimeout(() => (statusNotification = ''), 3000);
    } catch (err) {
      alert(`Erro ao excluir: ${err}`);
    }
  }

  async function handleRenameEntry(oldPath: string, currentName: string) {
    const newName = prompt('Novo nome:', currentName);
    if (!newName || newName.trim() === '' || newName.trim() === currentName) return;

    const trimmedName = newName.trim();
    const parentDir = oldPath.substring(0, Math.max(oldPath.lastIndexOf('/'), oldPath.lastIndexOf('\\')));
    const sep = oldPath.includes('/') ? '/' : '\\';
    const newPath = `${parentDir}${sep}${trimmedName}`;

    try {
      await fsService.renameEntry(oldPath, newPath);
      const openTab = tabs.find((t) => t.path === oldPath);
      if (openTab) {
        openTab.path = newPath;
        openTab.title = trimmedName;
        tabs = [...tabs];
      }
      await refreshFileTree();
      statusNotification = `Renomeado para "${trimmedName}".`;
      setTimeout(() => (statusNotification = ''), 3000);
    } catch (err) {
      alert(`Erro ao renomear: ${err}`);
    }
  }

  async function handleCreateInFolder(folderPath: string, isDir: boolean) {
    const itemType = isDir ? 'pasta' : 'arquivo';
    const inputName = prompt(`Nome do novo ${itemType}:`, isDir ? 'nova_pasta' : 'novo_arquivo.md');
    if (inputName === null) return;
    let name = inputName.trim();
    if (!name) {
      name = isDir ? 'nova_pasta' : 'novo_arquivo.md';
    } else if (!isDir && !name.includes('.')) {
      name = `${name}.md`;
    }

    const sep = folderPath.includes('/') ? '/' : '\\';
    const fullPath = `${folderPath}${sep}${name}`;
    try {
      await fsService.createEntry(fullPath, isDir);
      await refreshFileTree();
      if (!isDir && (name.endsWith('.md') || name.endsWith('.txt') || name.endsWith('.log'))) {
        await openFile(fullPath, name);
      }
    } catch (err) {
      alert(`Erro ao criar ${itemType}: ${err}`);
    }
  }

  async function handleCopyContext(node: FileNode) {
    try {
      if (!node.is_dir) {
        const rawContent = await fsService.readTextFile(node.path);
        let relPath = node.name;
        if (currentFolderPath && node.path.startsWith(currentFolderPath)) {
          relPath = node.path.slice(currentFolderPath.length).replace(/^[\\/]+/, '');
        }
        const xml = buildContextPayload([{ path: relPath, content: rawContent }]);
        await navigator.clipboard.writeText(xml);
        const tokens = estimateTokens(rawContent);
        statusNotification = `Contexto copiado: "${node.name}" (~${tokens} tokens)`;
        setTimeout(() => (statusNotification = ''), 4000);
      } else {
        const filePaths = collectTextFilePaths(node);
        if (filePaths.length === 0) {
          statusNotification = `Nenhum arquivo de texto encontrado na pasta "${node.name}".`;
          setTimeout(() => (statusNotification = ''), 4000);
          return;
        }
        const files: Array<{ path: string; content: string }> = [];
        let totalChars = 0;
        for (const fp of filePaths) {
          try {
            const content = await fsService.readTextFile(fp);
            files.push({ path: fp, content });
            totalChars += content.length;
          } catch {
            // Ignora arquivos inacessíveis
          }
        }
        const xml = buildContextPayload(files, currentFolderPath || node.path);
        await navigator.clipboard.writeText(xml);
        const tokens = estimateTokens('a'.repeat(totalChars));
        statusNotification = `Contexto copiado: ${files.length} arquivo(s) de "${node.name}" (~${tokens} tokens)`;
        setTimeout(() => (statusNotification = ''), 4000);
      }
    } catch (err) {
      console.error('Erro ao copiar contexto de IA:', err);
      statusNotification = 'Erro ao copiar contexto de IA para a área de transferência.';
      setTimeout(() => (statusNotification = ''), 4000);
    }
  }

  let autoSaveTimeouts: Map<string, any> = new Map();

  async function saveTab(targetTab: TabItem | null | undefined) {
    if (!targetTab || targetTab.isImage) return;
    if (!currentFolderPath) {
      statusNotification = 'Selecione uma pasta para salvar arquivos.';
      setTimeout(() => (statusNotification = ''), 4000);
      return;
    }
    if (!targetTab.path && currentFolderPath) {
      const sep = currentFolderPath.includes('/') ? '/' : '\\';
      targetTab.path = `${currentFolderPath}${sep}${targetTab.title}`;
    }
    if (!targetTab.path) return;

    // Cancela timeout pendente dessa aba se existir
    if (autoSaveTimeouts.has(targetTab.id)) {
      clearTimeout(autoSaveTimeouts.get(targetTab.id));
      autoSaveTimeouts.delete(targetTab.id);
    }

    try {
      let contentToSave = targetTab.content;
      if (targetTab.isMarkdown && targetTab.frontmatter) {
        contentToSave = attachFrontmatter(targetTab.content, targetTab.frontmatter);
      }
      await fsService.writeTextFile(targetTab.path, contentToSave);
      targetTab.isDirty = false;
      tabs = [...tabs];

      // Sincronização em segundo plano não-bloqueante (Zero-Server Cloud Sync)
      if (targetTab.isMarkdown) {
        let relPath = targetTab.title;
        if (currentFolderPath && targetTab.path.startsWith(currentFolderPath)) {
          relPath = targetTab.path.slice(currentFolderPath.length).replace(/^[\\/]+/, '');
        }
        cloudSyncService.enqueueUpload(targetTab.path, relPath, contentToSave);
      }
    } catch (err) {
      console.error('Erro ao salvar aba:', err);
    }
  }

  async function saveCurrentFile() {
    await saveTab(activeTab);
  }

  function handleEditorContentChange(newMarkdown: string) {
    if (!activeTab) return;
    if (activeTab.content !== newMarkdown) {
      activeTab.content = newMarkdown;

      // Auto-save inteligente isolado por aba quando há uma pasta aberta
      if (currentFolderPath) {
        activeTab.isDirty = true;
        tabs = [...tabs];

        const tabId = activeTab.id;
        if (autoSaveTimeouts.has(tabId)) {
          clearTimeout(autoSaveTimeouts.get(tabId));
        }
        const timeout = setTimeout(() => {
          autoSaveTimeouts.delete(tabId);
          const t = tabs.find((x) => x.id === tabId);
          if (t && t.isDirty) {
            saveTab(t);
          }
        }, 1000);
        autoSaveTimeouts.set(tabId, timeout);
      } else {
        tabs = [...tabs];
      }
    }
  }

  async function closeTab(tabId: string) {
    const tabToClose = tabs.find((t) => t.id === tabId);
    if (tabToClose) {
      if (autoSaveTimeouts.has(tabId)) {
        clearTimeout(autoSaveTimeouts.get(tabId));
        autoSaveTimeouts.delete(tabId);
      }
      // Flush imediato de alterações não salvas antes de fechar a aba
      if (tabToClose.isDirty && currentFolderPath) {
        await saveTab(tabToClose);
      }
    }

    tabs = tabs.filter((t) => t.id !== tabId);
    if (activeTabId === tabId) {
      activeTabId = tabs[tabs.length - 1]?.id || null;
    }
  }

  async function handleSelectTab(targetId: string) {
    if (targetId === activeTabId) return;
    // Flush atômico da aba atual antes de alternar se houver alterações
    if (activeTab && activeTab.isDirty && currentFolderPath) {
      await saveTab(activeTab);
    }
    activeTabId = targetId;

    // Sincronização externa ao focar aba inativa (ARC-07)
    const targetTab = tabs.find((t) => t.id === targetId);
    if (targetTab && targetTab.path && !targetTab.isDirty && !targetTab.isImage) {
      try {
        const diskContent = await fsService.readTextFile(targetTab.path);
        if (diskContent !== targetTab.content) {
          targetTab.content = diskContent;
          tabs = [...tabs];
        }
      } catch {
        // Ignora silenciosamente se o arquivo não estiver disponível
      }
    }
  }

  function handleOpenTerminalInFolder(folderPath: string) {
    terminalOpen = true;
  }

  function handleInsertTerminalText(text: string) {
    if (!text) return;
    if (activeEditorView) {
      const { state, dispatch } = activeEditorView;
      const { from, to } = state.selection;
      dispatch(state.tr.replaceWith(from, to, state.schema.text(text)));
      activeEditorView.focus();
      statusNotification = 'Texto inserido no documento.';
      setTimeout(() => (statusNotification = ''), 3000);
    }
  }

  function getEditorSelectedText(): string {
    if (activeEditorView) {
      const { from, to } = activeEditorView.state.selection;
      if (from !== to) {
        return activeEditorView.state.doc.textBetween(from, to, '\n');
      }
    }
    return '';
  }

  function handleOpenAiAssistant(command?: string) {
    aiAssistantOpen = true;
    themeSettingsOpen = false;
    if (command) {
      const trimmed = command.replace(/^(?:npx\s+)?(?:agy|gemini|claude|muse|ai)\s*/i, '').trim();
      if (trimmed) {
        const trySubmit = (attempts = 0) => {
          if (aiPanelRef && typeof aiPanelRef.submitPrompt === 'function') {
            aiPanelRef.submitPrompt(trimmed);
          } else if (attempts < 10) {
            setTimeout(() => trySubmit(attempts + 1), 100);
          }
        };
        setTimeout(trySubmit, 80);
      }
    }
  }

  async function handleRunTerminalCommand(command: string, customTitle?: string) {
    terminalOpen = true;
    await tick();
    if (terminalPanelRef && typeof (terminalPanelRef as any).runCommandInTerminal === 'function') {
      await (terminalPanelRef as any).runCommandInTerminal(command, customTitle);
    }
  }

  async function handleCopyAsHtml() {
    if (!activeEditorView) return;
    const html = serializeDocToHtml(activeEditorView.state.doc);
    const plainText = activeTab?.content || activeEditorView.state.doc.textContent;
    await copyFormattedHtml(html, plainText);
    statusNotification = 'Documento copiado como HTML formatado para a área de transferência.';
    setTimeout(() => (statusNotification = ''), 3500);
  }

  function handleFormatDocument() {
    if (!activeTab) return;
    const res = formatDocument(activeTab.content, activeTab.title);
    if (!res.success) {
      statusNotification = res.error || 'Erro ao formatar arquivo.';
      setTimeout(() => (statusNotification = ''), 4000);
      return;
    }
    if (res.formattedText !== undefined && res.formattedText !== activeTab.content) {
      activeTab.content = res.formattedText;
      activeTab.isDirty = true;
      tabs = [...tabs];
      if (editorRef && typeof editorRef.setEditorContent === 'function') {
        editorRef.setEditorContent(res.formattedText);
      }
      statusNotification = `Arquivo formatado com sucesso! (${activeTab.title})`;
      setTimeout(() => (statusNotification = ''), 2500);
    } else {
      statusNotification = 'Arquivo já está perfeitamente formatado.';
      setTimeout(() => (statusNotification = ''), 2000);
    }
  }

  async function handlePasteImage(base64Data: string) {
    if (!currentFolderPath) {
      statusNotification = 'Selecione uma pasta antes de colar imagens.';
      setTimeout(() => (statusNotification = ''), 4000);
      return;
    }
    if (!activeTab || !activeTab.path) return;
    const path = activeTab.path;
    const lastSlash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
    const baseDir = lastSlash > 0 ? path.substring(0, lastSlash) : currentFolderPath;
    const filename = `img_${Date.now()}.png`;

    try {
      const relPath: string = await fsService.saveImageAsset(baseDir, filename, base64Data);

      if (activeEditorView) {
        const { schema, tr } = activeEditorView.state;
        const imageNode = schema.nodes.image.create({
          src: relPath,
          alt: filename,
          title: filename
        });
        activeEditorView.dispatch(tr.replaceSelectionWith(imageNode));
        statusNotification = `Imagem salva em ${relPath}`;
        setTimeout(() => (statusNotification = ''), 4000);
      }
    } catch (err) {
      console.error('Erro ao salvar imagem colada:', err);
    }
  }

  function handleJumpToHeading(pos: number) {
    if (editorRef) {
      editorRef.jumpToPos(pos);
    }
  }
</script>

<div class="app-layout">
  <!-- Layout Principal: Barra de Projetos + Barra Lateral de Arquivos de Ponta a Ponta + Palco Central -->
  <div class="workspace">
    <!-- Barra Lateral de Projetos Ultra-Slim (Abas de Projeto & Recentes & Botão Fixo de Alternância) -->
    <ProjectSidebar
      projects={openProjects}
      {activeProjectId}
      {recentProjects}
      {sidebarOpen}
      {aiAssistantOpen}
      onToggleAiAssistant={() => {
        aiAssistantOpen = !aiAssistantOpen;
        if (aiAssistantOpen) themeSettingsOpen = false;
      }}
      onSelectProject={switchToProject}
      onCloseProject={closeProject}
      onOpenNewProject={openFolderDialog}
      onSelectRecent={handleSelectRecent}
      onRemoveRecent={removeRecent}
      onClearRecent={clearRecent}
      onToggleSidebar={() => (sidebarOpen = !sidebarOpen)}
    />

    {#if sidebarOpen}
      <Sidebar
        {fileTree}
        {currentFolderPath}
        {headings}
        {terminalOpen}
        onToggleTerminal={() => (terminalOpen = !terminalOpen)}
        onOpenFile={openFile}
        onOpenFolder={openFolderDialog}
        onCloseFolder={closeFolder}
        onCreateFile={createNewFile}
        onCreateFolder={createNewFolder}
        onRefreshTree={refreshFileTree}
        onOpenTerminalInFolder={handleOpenTerminalInFolder}
        onJumpToHeading={handleJumpToHeading}
        onDeleteEntry={handleDeleteEntry}
        onRenameEntry={handleRenameEntry}
        onCreateInFolder={handleCreateInFolder}
        onCopyContext={handleCopyContext}
        onQuickOpen={() => (quickOpenVisible = true)}
      />
    {/if}

    <main class="center-stage">
      <!-- Barra Superior Estilo Word (estritamente sobre o documento) -->
      <TopBar
        editorView={activeEditorView}
        {themeSettingsOpen}
        {aiAssistantOpen}
        hasFolder={!!currentFolderPath}
        onSave={saveCurrentFile}
        onPrint={() => window.print()}
        onCopyHtml={handleCopyAsHtml}
        onFormatDocument={handleFormatDocument}
        onToggleAiAssistant={() => {
          aiAssistantOpen = !aiAssistantOpen;
          if (aiAssistantOpen) themeSettingsOpen = false;
        }}
        onToggleThemeSettings={() => {
          themeSettingsOpen = !themeSettingsOpen;
          if (themeSettingsOpen) aiAssistantOpen = false;
        }}
      />

      <FindReplaceBar
        bind:visible={findReplaceOpen}
        bind:showReplace={findReplaceShowReplace}
        editorView={activeEditorView}
        onClose={() => (findReplaceOpen = false)}
      />

      {#if tabs.length > 0}
        <TabBar
          {tabs}
          {activeTabId}
          onSelectTab={handleSelectTab}
          onCloseTab={closeTab}
        />
      {/if}

      <div
        class="stage-body"
        class:orientation-horizontal={terminalOrientation === 'horizontal' || terminalMaximized || !activeTab}
        class:orientation-vertical={terminalOrientation === 'vertical' && !terminalMaximized && !!activeTab}
      >
        <div
          class="editor-pane"
          class:hidden={terminalOpen && (terminalMaximized || !activeTab)}
        >
          {#if activeTab}
            {#if activeTab.isImage}
              <ImageViewer
                src={activeTab.content}
                title={activeTab.title}
                path={activeTab.path}
              />
            {:else}
              {#if activeTab.isMarkdown && activeTab.frontmatter}
                <FrontmatterBanner frontmatter={activeTab.frontmatter} />
              {/if}
              {#key activeTab.id}
                <Editor
                  bind:this={editorRef}
                  content={activeTab.content}
                  isMarkdown={activeTab.isMarkdown}
                  onChange={handleEditorContentChange}
                  onHeadingsChange={(h) => (headings = h)}
                  onStatsChange={(s) => (stats = s)}
                  onEditorReady={(view) => (activeEditorView = view)}
                  onPasteImage={handlePasteImage}
                  {smartPasteSanitizeAi}
                />
              {/key}
            {/if}
          {:else}
            <div class="no-tabs-state">
              <h2>Nenhum documento aberto</h2>
              <p>Abra um arquivo na aba lateral ou crie um novo documento no topo.</p>
            </div>
          {/if}
        </div>

        <!-- Terminal Integrado Contextualizado no Projeto (Persistente entre projetos) -->
        <TerminalPanel
          bind:this={terminalPanelRef}
          projectId={activeProjectId || 'default'}
          visible={terminalOpen}
          {currentFolderPath}
          hasActiveFile={!!activeTab}
          bind:orientation={terminalOrientation}
          bind:isMaximized={terminalMaximized}
          onInsertText={handleInsertTerminalText}
          onOpenAiAssistant={handleOpenAiAssistant}
          onClose={() => (terminalOpen = false)}
        />
      </div>
    </main>

    <!-- Painel Lateral Direito: Assistente IA (Antigravity CLI / agy / Muse / Gemini) -->
    {#if aiAssistantOpen}
      <AiAssistantPanel
        bind:this={aiPanelRef}
        visible={aiAssistantOpen}
        {currentFolderPath}
        onInsertText={handleInsertTerminalText}
        onRunTerminalCommand={handleRunTerminalCommand}
        getEditorSelection={getEditorSelectedText}
        onClose={() => (aiAssistantOpen = false)}
      />
    {/if}

    <!-- Painel Lateral Direito: Cores & Temas (Gaveta Fixa) -->
    <ThemeSettings
      visible={themeSettingsOpen}
      onClose={() => (themeSettingsOpen = false)}
    />
  </div>

  <!-- Barra de Status no Rodapé -->
  <StatusBar
    {stats}
    {terminalOpen}
    notification={statusNotification}
    onToggleTerminal={() => (terminalOpen = !terminalOpen)}
  />

  <!-- Modal Flutuante de Busca Rápida (Ctrl+P) -->
  <QuickOpenModal
    visible={quickOpenVisible}
    {fileTree}
    {currentFolderPath}
    onOpenFile={openFile}
    onClose={() => (quickOpenVisible = false)}
  />
</div>

<style>
  .app-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
    background-color: var(--veu-bg-app);
    color: var(--veu-text-color);
    overflow: hidden;
  }

  .workspace {
    flex: 1;
    display: flex;
    position: relative;
    overflow: hidden;
  }

  .center-stage {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    min-width: 0;
    min-height: 0;
  }

  .stage-body {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
  }

  .stage-body.orientation-horizontal {
    flex-direction: column;
  }

  .stage-body.orientation-vertical {
    flex-direction: row;
  }

  .editor-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    min-width: 0;
    min-height: 0;
  }

  .editor-pane.hidden {
    display: none !important;
  }

  .no-tabs-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--veu-text-color);
    opacity: 0.5;
    gap: 8px;
    height: 100%;
  }

  .no-tabs-state h2 {
    font-size: 1.15rem;
    font-weight: 500;
  }

  .no-tabs-state p {
    font-size: 0.88rem;
  }
</style>

