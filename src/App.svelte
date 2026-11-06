<script lang="ts">
  import { onMount } from 'svelte';
  import { invoke } from '@tauri-apps/api/core';
  import { open } from '@tauri-apps/plugin-dialog';
  import TopBar from './lib/components/TopBar.svelte';
  import Sidebar from './lib/components/Sidebar.svelte';
  import TabBar from './lib/components/TabBar.svelte';
  import Editor from './lib/components/Editor.svelte';
  import ThemeSettings from './lib/components/ThemeSettings.svelte';
  import TerminalPanel from './lib/components/TerminalPanel.svelte';
  import StatusBar from './lib/components/StatusBar.svelte';
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

    // Atalhos globais do teclado
    window.addEventListener('keydown', (e) => {
      // Ctrl + S (Salvar)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveCurrentFile();
      }
      // Ctrl + ' ou Ctrl + ` (Terminal)
      if ((e.ctrlKey || e.metaKey) && (e.key === "'" || e.key === '`')) {
        e.preventDefault();
        terminalOpen = !terminalOpen;
      }
    });
  });

  $: activeTab = tabs.find((t) => t.id === activeTabId) || null;

  // ================= Ações de Arquivo & Pastas =================

  async function openFolderDialog() {
    try {
      const selected = await open({
        directory: true,
        multiple: false
      });
      if (selected && typeof selected === 'string') {
        currentFolderPath = selected;
        await refreshFileTree();
      }
    } catch (err) {
      console.error('Erro ao selecionar pasta:', err);
    }
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
    let folder = currentFolderPath;
    if (!folder) {
      await openFolderDialog();
      folder = currentFolderPath;
      if (!folder) return;
    }

    const inputName = prompt('Nome do novo arquivo (padrão: novo_arquivo.md):');
    if (inputName === null) return;
    let fileName = inputName.trim();
    if (!fileName) {
      fileName = 'novo_arquivo.md';
    } else if (!fileName.includes('.')) {
      fileName = `${fileName}.md`;
    }

    const separator = folder.includes('/') ? '/' : '\\';
    const fullPath = `${folder}${separator}${fileName}`;
    try {
      await invoke('create_entry', { path: fullPath, isDir: false });
      await refreshFileTree();
      await openFile(fullPath, fileName);
    } catch (err) {
      alert(`Erro ao criar arquivo: ${err}`);
    }
  }

  async function createNewFolder() {
    if (!currentFolderPath) return;
    const folderName = prompt('Nome da nova pasta:');
    if (!folderName) return;

    const fullPath = `${currentFolderPath}\\${folderName}`;
    try {
      await invoke('create_entry', { path: fullPath, isDir: true });
      await refreshFileTree();
    } catch (err) {
      alert(`Erro ao criar pasta: ${err}`);
    }
  }

  let autoSaveTimeout: any = null;

  async function saveCurrentFile() {
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
      activeTab.isDirty = true;
      tabs = [...tabs];

      // Auto-save inteligente com debounce de 1000ms (AD-008, CORE-10)
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
      autoSaveTimeout = setTimeout(() => {
        saveCurrentFile();
      }, 1000);
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
  <!-- Barra Superior Estilo Word & Ações -->
  <TopBar
    editorView={activeEditorView}
    {sidebarOpen}
    {themeSettingsOpen}
    {terminalOpen}
    onOpenFolder={openFolderDialog}
    onNewFile={createNewFile}
    onSave={saveCurrentFile}
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
        onCreateFile={createNewFile}
        onCreateFolder={createNewFolder}
        onRefreshTree={refreshFileTree}
        onOpenTerminalInFolder={handleOpenTerminalInFolder}
        onJumpToHeading={handleJumpToHeading}
      />
    {/if}

    <main class="center-stage">
      <TabBar
        {tabs}
        {activeTabId}
        onSelectTab={(id) => (activeTabId = id)}
        onCloseTab={closeTab}
      />

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

      <!-- Painel Inferior de Terminal -->
      <TerminalPanel
        visible={terminalOpen}
        {currentFolderPath}
        onClose={() => (terminalOpen = false)}
      />
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
  }

  .no-tabs-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: rgba(200, 210, 230, 0.4);
    gap: 8px;
  }

  .no-tabs-state h2 {
    font-size: 1.15rem;
    font-weight: 500;
  }

  .no-tabs-state p {
    font-size: 0.88rem;
  }
</style>

