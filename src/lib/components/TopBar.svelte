<script lang="ts">
  import {
    Bold,
    Italic,
    Strikethrough,
    Underline,
    Highlighter,
    Code,
    FileCode,
    Quote,
    List,
    ListOrdered,
    ListTodo,
    Table,
    Link,
    Minus,
    Undo,
    Redo,
    FolderOpen,
    FilePlus,
    Palette,
    TerminalSquare,
    PanelLeft,
    Save
  } from 'lucide-svelte';
  import type { EditorView } from 'prosemirror-view';
  import { toggleMark, setBlockType } from 'prosemirror-commands';
  import { wrapInList } from 'prosemirror-schema-list';
  import { undo, redo } from 'prosemirror-history';
  import { veuSchema } from '../editor/proseMirrorSetup';

  export let editorView: EditorView | null = null;
  export let onOpenFolder: () => void;
  export let onNewFile: () => void;
  export let onSave: () => void;
  export let onToggleSidebar: () => void;
  export let onToggleThemeSettings: () => void;
  export let onToggleTerminal: () => void;
  export let sidebarOpen: boolean = true;
  export let themeSettingsOpen: boolean = false;
  export let terminalOpen: boolean = false;

  let currentHeading = 'p';

  function applyMark(markType: any) {
    if (!editorView) return;
    toggleMark(markType)(editorView.state, editorView.dispatch);
    editorView.focus();
  }

  function applyHeading(level: number) {
    if (!editorView) return;
    if (level === 0) {
      setBlockType(veuSchema.nodes.paragraph)(editorView.state, editorView.dispatch);
    } else {
      setBlockType(veuSchema.nodes.heading, { level })(editorView.state, editorView.dispatch);
    }
    editorView.focus();
  }

  function applyQuote() {
    if (!editorView) return;
    setBlockType(veuSchema.nodes.blockquote)(editorView.state, editorView.dispatch);
    editorView.focus();
  }

  function applyCodeBlock() {
    if (!editorView) return;
    setBlockType(veuSchema.nodes.code_block)(editorView.state, editorView.dispatch);
    editorView.focus();
  }

  function applyBulletList() {
    if (!editorView) return;
    wrapInList(veuSchema.nodes.bullet_list)(editorView.state, editorView.dispatch);
    editorView.focus();
  }

  function applyOrderedList() {
    if (!editorView) return;
    wrapInList(veuSchema.nodes.ordered_list)(editorView.state, editorView.dispatch);
    editorView.focus();
  }

  function insertTable() {
    if (!editorView) return;
    const { schema } = editorView.state;
    const headerRow = schema.nodes.table_row.create(null, [
      schema.nodes.table_header.create(null, schema.text('Cabeçalho 1')),
      schema.nodes.table_header.create(null, schema.text('Cabeçalho 2'))
    ]);
    const bodyRow = schema.nodes.table_row.create(null, [
      schema.nodes.table_cell.create(null, schema.text('Item 1')),
      schema.nodes.table_cell.create(null, schema.text('Item 2'))
    ]);
    const table = schema.nodes.table.create(null, [headerRow, bodyRow]);
    editorView.dispatch(editorView.state.tr.replaceSelectionWith(table));
    editorView.focus();
  }

  function insertHorizontalRule() {
    if (!editorView) return;
    const hr = veuSchema.nodes.horizontal_rule.create();
    editorView.dispatch(editorView.state.tr.replaceSelectionWith(hr));
    editorView.focus();
  }

  function doUndo() {
    if (!editorView) return;
    undo(editorView.state, editorView.dispatch);
    editorView.focus();
  }

  function doRedo() {
    if (!editorView) return;
    redo(editorView.state, editorView.dispatch);
    editorView.focus();
  }
</script>

<header class="topbar">
  <!-- Grupo Esquerdo: Arquivo e Janela -->
  <div class="group">
    <button class="btn icon-btn" class:active={sidebarOpen} title="Alternar Painel Lateral (Pastas / Sumário)" on:click={onToggleSidebar}>
      <PanelLeft size={17} />
    </button>
    <button class="btn" title="Abrir Pasta no Computador" on:click={onOpenFolder}>
      <FolderOpen size={16} />
      <span>Abrir Pasta</span>
    </button>
    <button class="btn icon-btn" title="Novo Arquivo (.md)" on:click={onNewFile}>
      <FilePlus size={16} />
    </button>
    <button class="btn icon-btn" title="Salvar Arquivo (Ctrl+S)" on:click={onSave}>
      <Save size={16} />
    </button>
  </div>

  <div class="divider"></div>

  <!-- Grupo Central: Formatação Estilo Word -->
  <div class="group formatting-group">
    <select
      class="heading-select"
      bind:value={currentHeading}
      on:change={() => applyHeading(currentHeading === 'p' ? 0 : parseInt(currentHeading))}
      title="Estilo de Título / Parágrafo"
    >
      <option value="p">Normal (Parágrafo)</option>
      <option value="1">Título 1 (H1)</option>
      <option value="2">Título 2 (H2)</option>
      <option value="3">Título 3 (H3)</option>
      <option value="4">Título 4 (H4)</option>
      <option value="5">Título 5 (H5)</option>
      <option value="6">Título 6 (H6)</option>
    </select>

    <button class="btn icon-btn" title="Negrito (Ctrl+B)" on:click={() => applyMark(veuSchema.marks.strong)}>
      <Bold size={16} />
    </button>
    <button class="btn icon-btn" title="Itálico (Ctrl+I)" on:click={() => applyMark(veuSchema.marks.em)}>
      <Italic size={16} />
    </button>
    <button class="btn icon-btn" title="Tachado" on:click={() => applyMark(veuSchema.marks.strikethrough)}>
      <Strikethrough size={16} />
    </button>
    <button class="btn icon-btn" title="Sublinhado" on:click={() => applyMark(veuSchema.marks.underline)}>
      <Underline size={16} />
    </button>
    <button class="btn icon-btn" title="Marca-texto (Highlight)" on:click={() => applyMark(veuSchema.marks.highlight)}>
      <Highlighter size={16} />
    </button>
    <button class="btn icon-btn" title="Código Inline" on:click={() => applyMark(veuSchema.marks.code)}>
      <Code size={16} />
    </button>

    <div class="sub-divider"></div>

    <button class="btn icon-btn" title="Citação / Alerta" on:click={applyQuote}>
      <Quote size={16} />
    </button>
    <button class="btn icon-btn" title="Bloco de Código" on:click={applyCodeBlock}>
      <FileCode size={16} />
    </button>
    <button class="btn icon-btn" title="Lista com Marcadores" on:click={applyBulletList}>
      <List size={16} />
    </button>
    <button class="btn icon-btn" title="Lista Numerada" on:click={applyOrderedList}>
      <ListOrdered size={16} />
    </button>
    <button class="btn icon-btn" title="Inserir Tabela" on:click={insertTable}>
      <Table size={16} />
    </button>
    <button class="btn icon-btn" title="Linha Divisória" on:click={insertHorizontalRule}>
      <Minus size={16} />
    </button>

    <div class="sub-divider"></div>

    <button class="btn icon-btn" title="Desfazer (Ctrl+Z)" on:click={doUndo}>
      <Undo size={15} />
    </button>
    <button class="btn icon-btn" title="Refazer (Ctrl+Y)" on:click={doRedo}>
      <Redo size={15} />
    </button>
  </div>

  <!-- Grupo Direito: Temas & Terminal -->
  <div class="group right-group">
    <button
      class="btn icon-btn"
      class:active={themeSettingsOpen}
      title="Cores das Tags e Temas de Leitura"
      on:click={onToggleThemeSettings}
    >
      <Palette size={17} />
      <span>Temas & Cores</span>
    </button>

    <button
      class="btn icon-btn"
      class:active={terminalOpen}
      title="Terminal Integrado (Ctrl+')"
      on:click={onToggleTerminal}
    >
      <TerminalSquare size={17} />
      <span>Terminal</span>
    </button>
  </div>
</header>

<style>
  .topbar {
    display: flex;
    align-items: center;
    height: 44px;
    padding: 0 12px;
    background-color: var(--veu-bg-sidebar);
    border-bottom: 1px solid var(--veu-border-color);
    gap: 10px;
    user-select: none;
    z-index: 10;
  }

  .group {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .formatting-group {
    flex: 1;
    overflow-x: auto;
  }

  .right-group {
    margin-left: auto;
  }

  .divider {
    width: 1px;
    height: 22px;
    background-color: var(--veu-border-color);
    margin: 0 4px;
  }

  .sub-divider {
    width: 1px;
    height: 16px;
    background-color: var(--veu-border-color);
    margin: 0 3px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    height: 28px;
    border-radius: 4px;
    background: transparent;
    color: var(--veu-text-color);
    border: none;
    cursor: pointer;
    font-size: 13px;
    transition: background-color 0.15s, color 0.15s;
    white-space: nowrap;
  }

  .btn:hover {
    background-color: var(--veu-active-item-bg);
  }

  .btn.active {
    background-color: var(--veu-active-item-bg);
    color: var(--veu-h1-color);
  }

  .icon-btn {
    padding: 4px 6px;
  }

  .heading-select {
    height: 28px;
    padding: 2px 8px;
    border-radius: 4px;
    background-color: var(--veu-bg-app);
    color: var(--veu-text-color);
    border: 1px solid var(--veu-border-color);
    font-size: 13px;
    outline: none;
    cursor: pointer;
  }
</style>

