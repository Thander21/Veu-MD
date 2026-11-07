<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { invoke } from '@tauri-apps/api/core';
  import { listen, type UnlistenFn } from '@tauri-apps/api/event';
  import { open } from '@tauri-apps/plugin-dialog';
  import TopBar from './lib/components/TopBar.svelte';
  import Sidebar from './lib/components/Sidebar.svelte';
  import TabBar from './lib/components/TabBar.svelte';
  import Editor from './lib/components/Editor.svelte';
  import ThemeSettings from './lib/components/ThemeSettings.svelte';
  import TerminalPanel from './lib/components/TerminalPanel.svelte';
  import StatusBar from './lib/components/StatusBar.svelte';
  import FindReplaceBar from './lib/components/FindReplaceBar.svelte';
  import { initTheme } from './lib/theme/themeStore';
  import type { FileNode, TabItem, HeadingItem } from './lib/types';
  import type { EditorView } from 'prosemirror-view';

  // Estados principais
  let currentFolderPath: string = '';
  let fileTree: FileNode[] = [];
  let tabs: TabItem[] = [];
  let activeTabId: string | null = null;
  let headings: HeadingItem[] = [];
  let stats = { words: 0, chars: 0, readTime: '1 min de leitura' };
  let statusNotification = '';

  // Painéis visíveis
  let sidebarOpen = true;
  let themeSettingsOpen = false;
  let terminalOpen = false;
  let terminalOrientation: 'horizontal' | 'vertical' = 'horizontal';
  let terminalMaximized: boolean = false;
  let findReplaceOpen = false;
  let findReplaceShowReplace = false;

  let activeEditorView: EditorView | null = null;
  let editorRef: any = null;

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

  onMount(async () => {
    initTheme();

    // Restaura a última pasta aberta salva
    const savedFolder = localStorage.getItem('veu_last_opened_folder');
    if (savedFolder) {
      try {
        const tree: FileNode[] = await invoke('read_dir_tree', { path: savedFolder });
        if (tree) {
          currentFolderPath = savedFolder;
          fileTree = tree;
        }
      } catch (err) {
        console.warn('Última pasta salva não pôde ser aberta:', err);
        localStorage.removeItem('veu_last_opened_folder');
      }
    }

    // Restaura abas salvas da sessão anterior
    let sessionRestored = false;
    const savedTabsJson = localStorage.getItem('veu_saved_tabs');
    const savedActivePath = localStorage.getItem('veu_active_tab_path');
    if (savedTabsJson) {
      try {
        const parsed = JSON.parse(savedTabsJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const loadedTabs: TabItem[] = [];
          for (const item of parsed) {
            try {
              const content: string = await invoke('read_text_file', { path: item.path });
              loadedTabs.push({
                id: `tab-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                title: item.title,
                path: item.path,
                content,
                isDirty: false,
                isMarkdown: item.isMarkdown
              });
            } catch {
              // arquivo não acessível, ignora
            }
          }
          if (loadedTabs.length > 0) {
            tabs = loadedTabs;
            const matchedActive = loadedTabs.find((t) => t.path === savedActivePath);
            activeTabId = matchedActive ? matchedActive.id : loadedTabs[0].id;
            sessionRestored = true;
          }
        }
      } catch (err) {
        console.warn('Erro ao restaurar abas salvas:', err);
      }
    }

    if (!sessionRestored) {
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

    // Escuta notificações de alterações externas de arquivo (File Watcher nativo)
    const unlistenWatcher = await listen('file-changed-externally', async (event: any) => {
      const changedPath = event.payload as string;
      const targetTab = tabs.find((t) => t.path === changedPath);
      if (!targetTab) return;

      try {
        const newContent: string = await invoke('read_text_file', { path: changedPath });
        if (newContent !== targetTab.content) {
          if (!targetTab.isDirty) {
            targetTab.content = newContent;
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
      // Ctrl + ' ou Ctrl + ` (Terminal)
      if ((e.ctrlKey || e.metaKey) && (e.key === "'" || e.key === '`')) {
        e.preventDefault();
        terminalOpen = !terminalOpen;
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
      // Ctrl + P (Exportar PDF / Imprimir)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        window.print();
      }
    });
  });

  onDestroy(() => {
    invoke('unwatch_file').catch(() => {});
  });

  $: activeTab = tabs.find((t) => t.id === activeTabId) || null;

  // Gerencia o arquivo sendo monitorado pelo File Watcher nativo
  let watchedPath: string = '';
  $: if (activeTab?.path && activeTab.path !== watchedPath) {
    watchedPath = activeTab.path;
    invoke('watch_file', { path: watchedPath }).catch(() => {});
  } else if (!activeTab?.path && watchedPath) {
    watchedPath = '';
    invoke('unwatch_file').catch(() => {});
  }

  // Persiste sessão das abas abertas no localStorage
  $: {
    const realTabs = tabs.filter((t) => t.path);
    if (realTabs.length > 0) {
      localStorage.setItem(
        'veu_saved_tabs',
        JSON.stringify(realTabs.map((t) => ({ path: t.path, title: t.title, isMarkdown: t.isMarkdown })))
      );
      if (activeTab?.path) {
        localStorage.setItem('veu_active_tab_path', activeTab.path);
      }
    } else {
      localStorage.removeItem('veu_saved_tabs');
      localStorage.removeItem('veu_active_tab_path');
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
        currentFolderPath = selected;
        localStorage.setItem('veu_last_opened_folder', selected);
        await refreshFileTree();
        statusNotification = `Pasta aberta: ${selected.split(/[\\/]/).pop()}`;
        setTimeout(() => (statusNotification = ''), 3000);
      }
    } catch (err) {
      console.error('Erro ao selecionar pasta:', err);
    }
  }

  function closeFolder() {
    currentFolderPath = '';
    fileTree = [];
    localStorage.removeItem('veu_last_opened_folder');

    // Volta para o documento de boas-vindas sem permissão de criar ou salvar
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
    statusNotification = 'Pasta fechada. Selecione uma pasta para começar.';
    setTimeout(() => (statusNotification = ''), 4000);
  }

  async function refreshFileTree() {
    if (!currentFolderPath) return;
    try {
      const tree: FileNode[] = await invoke('read_dir_tree', { path: currentFolderPath });
      fileTree = tree;
    } catch (err) {
      console.error('Erro ao ler árvore de diretórios:', err);
    }
  }

  async function openFile(filePath: string, fileName: string) {
    // Verifica se já está aberto em uma aba
    const existing = tabs.find((t) => t.path === filePath);
    if (existing) {
      activeTabId = existing.id;
      return;
    }

    try {
      const content: string = await invoke('read_text_file', { path: filePath });
      const newTab: TabItem = {
        id: `tab-${Date.now()}`,
        title: fileName,
        path: filePath,
        content,
        isDirty: false,
        isMarkdown: fileName.endsWith('.md') || fileName.endsWith('.markdown')
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
      await invoke('create_entry', { path: fullPath, isDir: false });
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
      await invoke('create_entry', { path: fullPath, isDir: true });
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
      await invoke('delete_entry', { path });
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
      await invoke('rename_entry', { oldPath, newPath });
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
      await invoke('create_entry', { path: fullPath, isDir });
      await refreshFileTree();
      if (!isDir && (name.endsWith('.md') || name.endsWith('.txt') || name.endsWith('.log'))) {
        await openFile(fullPath, name);
      }
    } catch (err) {
      alert(`Erro ao criar ${itemType}: ${err}`);
    }
  }

  let autoSaveTimeout: any = null;

  async function saveCurrentFile() {
    if (!currentFolderPath) {
      statusNotification = 'Selecione uma pasta para salvar arquivos.';
      setTimeout(() => (statusNotification = ''), 4000);
      return;
    }
    if (!activeTab) return;
    if (!activeTab.path && currentFolderPath) {
      const sep = currentFolderPath.includes('/') ? '/' : '\\';
      activeTab.path = `${currentFolderPath}${sep}${activeTab.title}`;
    }
    if (!activeTab.path) return;

    try {
      await invoke('write_text_file', {
        path: activeTab.path,
        content: activeTab.content
      });
      activeTab.isDirty = false;
      tabs = [...tabs];
    } catch (err) {
      console.error('Erro ao salvar:', err);
    }
  }

  function handleEditorContentChange(newMarkdown: string) {
    if (!activeTab) return;
    if (activeTab.content !== newMarkdown) {
      activeTab.content = newMarkdown;

      // Auto-save inteligente apenas quando há uma pasta aberta
      if (currentFolderPath) {
        activeTab.isDirty = true;
        tabs = [...tabs];

        if (autoSaveTimeout) {
          clearTimeout(autoSaveTimeout);
        }
        autoSaveTimeout = setTimeout(() => {
          saveCurrentFile();
        }, 1000);
      } else {
        tabs = [...tabs];
      }
    }
  }

  function closeTab(tabId: string) {
    tabs = tabs.filter((t) => t.id !== tabId);
    if (activeTabId === tabId) {
      activeTabId = tabs[tabs.length - 1]?.id || null;
    }
  }

  function handleOpenTerminalInFolder(folderPath: string) {
    terminalOpen = true;
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
      const relPath: string = await invoke('save_image_asset', {
        baseDir,
        filename,
        base64Data
      });

      if (activeEditorView) {
        const { schema, tr } = activeEditorView.state;
        const imageNode = schema.nodes.image.create({
          src: base64Data,
          alt: filename,
          title: relPath
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
  <!-- Barra Superior Estilo Word & Ações -->
  <TopBar
    editorView={activeEditorView}
    {sidebarOpen}
    {themeSettingsOpen}
    {terminalOpen}
    hasFolder={!!currentFolderPath}
    onOpenFolder={openFolderDialog}
    onCloseFolder={closeFolder}
    onNewFile={createNewFile}
    onSave={saveCurrentFile}
    onPrint={() => window.print()}
    onToggleSidebar={() => (sidebarOpen = !sidebarOpen)}
    onToggleThemeSettings={() => (themeSettingsOpen = !themeSettingsOpen)}
    onToggleTerminal={() => (terminalOpen = !terminalOpen)}
  />

  <!-- Corpo Principal: Sidebar + Abas + Editor -->
  <div class="workspace">
    {#if sidebarOpen}
      <Sidebar
        {fileTree}
        {currentFolderPath}
        {headings}
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
      />
    {/if}

    <main class="center-stage">
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
          onSelectTab={(id) => (activeTabId = id)}
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
              />
            {/key}
          {:else}
            <div class="no-tabs-state">
              <h2>Nenhum documento aberto</h2>
              <p>Abra um arquivo na aba lateral ou crie um novo documento no topo.</p>
            </div>
          {/if}
        </div>

        <!-- Terminal Integrado -->
        <TerminalPanel
          visible={terminalOpen}
          {currentFolderPath}
          hasActiveFile={!!activeTab}
          bind:orientation={terminalOrientation}
          bind:isMaximized={terminalMaximized}
          onClose={() => (terminalOpen = false)}
        />
      </div>
    </main>

    <!-- Painel Lateral Direito: Cores & Temas -->
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

