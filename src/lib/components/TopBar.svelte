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
    Palette,
    TerminalSquare,
    PanelLeft,
    Save,
    Printer,
    Copy,
    Check,
    FolderX,
    Wand2,
    Search
  } from 'lucide-svelte';
  import type { EditorView } from 'prosemirror-view';
  import { toggleMark, setBlockType } from 'prosemirror-commands';
  import { wrapInList } from 'prosemirror-schema-list';
  import { undo, redo } from 'prosemirror-history';
  import {
    veuSchema,
    addRowAfter,
    addColumnAfter,
    deleteRow,
    deleteColumn,
    deleteTable,
    isInTable
  } from '../editor/proseMirrorSetup';

  export let editorView: EditorView | null = null;
  export let onOpenFolder: () => void;
  export let onCloseFolder: () => void = () => {};
  export let onSave: () => void;
  export let onPrint: () => void = () => {};
  export let onCopyHtml: (() => void) | undefined = undefined;
  export let onQuickOpen: () => void = () => {};
  export let onWizard: () => void = () => {};
  export let onToggleSidebar: () => void;
  export let onToggleThemeSettings: () => void;
  export let onToggleTerminal: () => void;
  export let sidebarOpen: boolean = true;
  export let themeSettingsOpen: boolean = false;
  export let aiAssistantOpen: boolean = false;
  export let terminalOpen: boolean = false;
  export let hasFolder: boolean = false;

  let currentHeading = 'p';
  let copiedHtmlNotice = false;
  let copyHtmlTimeout: any = null;

  function triggerCopyHtml() {
    if (onCopyHtml) {
      onCopyHtml();
      copiedHtmlNotice = true;
      if (copyHtmlTimeout) clearTimeout(copyHtmlTimeout);
      copyHtmlTimeout = setTimeout(() => {
        copiedHtmlNotice = false;
      }, 1500);
    }
  }

  let inTable = false;
  $: if (editorView) {
    try {
      inTable = isInTable(editorView.state);
    } catch {
      inTable = false;
    }
  }

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

  function applyTaskList() {
    if (!editorView) return;
    wrapInList(veuSchema.nodes.bullet_list)(editorView.state, editorView.dispatch);
    editorView.dispatch(editorView.state.tr.insertText('[ ] '));
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

  function handleAddRow() {
    if (editorView) {
      addRowAfter(editorView.state, editorView.dispatch);
      editorView.focus();
    }
  }

  function handleAddColumn() {
    if (editorView) {
      addColumnAfter(editorView.state, editorView.dispatch);
      editorView.focus();
    }
  }

  function handleDeleteRow() {
    if (editorView) {
      deleteRow(editorView.state, editorView.dispatch);
      editorView.focus();
    }
  }

  function handleDeleteColumn() {
    if (editorView) {
      deleteColumn(editorView.state, editorView.dispatch);
      editorView.focus();
    }
  }

  function handleDeleteTable() {
    if (editorView) {
      deleteTable(editorView.state, editorView.dispatch);
      editorView.focus();
    }
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
  <!-- Marca Oficial do App: Ícone e Nome V.E.U. MD -->
  <div class="app-brand" title="V.E.U. MD — Editor Markdown de Alta Performance">
    <img src="/veu-logo.svg" alt="V.E.U. MD" class="brand-logo-img" />
    <span class="brand-title">
      <span class="brand-acronym">V.E.U.</span>
      <span class="brand-suffix">MD</span>
    </span>
  </div>

  <div class="divider"></div>

  <!-- Grupo Esquerdo: Arquivo e Janela -->
  <div class="group">
    <button class="btn icon-btn" class:active={sidebarOpen} title="Alternar Painel Lateral (Pastas / Sumário)" on:click={onToggleSidebar}>
      <PanelLeft size={17} />
    </button>
    <button class="btn" title={hasFolder ? "Trocar Pasta Aberta" : "Abrir Pasta no Computador"} on:click={onOpenFolder}>
      <FolderOpen size={16} />
      <span>{hasFolder ? 'Trocar Pasta' : 'Abrir Pasta'}</span>
    </button>
    {#if hasFolder}
      <button class="btn icon-btn close-btn" title="Fechar Pasta Atual" on:click={onCloseFolder}>
        <FolderX size={16} />
      </button>
    {/if}
    <button
      class="btn icon-btn wizard-btn"
      class:btn-active={aiAssistantOpen}
      title="Assistente IA • Antigravity / agy (Ctrl+L)"
      on:click={onWizard}
    >
      <Wand2 size={16} />
    </button>
    <button
      class="btn icon-btn"
      title="Localizador Rápido no Projeto (Ctrl+P)"
      on:click={onQuickOpen}
    >
      <Search size={16} />
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
    <button class="btn icon-btn" title="Lista de Tarefas (Checklist)" on:click={applyTaskList}>
      <ListTodo size={16} />
    </button>
    <button
      class="btn icon-btn"
      class:active={inTable}
      title={inTable ? "Ações da Tabela" : "Inserir Tabela"}
      on:click={insertTable}
    >
      <Table size={16} />
    </button>

    {#if inTable}
      <div class="table-actions-inline">
        <button class="table-mini-btn" title="Adicionar Linha Abaixo" on:click={handleAddRow}>
          + Linha
        </button>
        <button class="table-mini-btn" title="Adicionar Coluna à Direita" on:click={handleAddColumn}>
          + Coluna
        </button>
        <button class="table-mini-btn" title="Excluir Linha" on:click={handleDeleteRow}>
          - Linha
        </button>
        <button class="table-mini-btn" title="Excluir Coluna" on:click={handleDeleteColumn}>
          - Coluna
        </button>
        <button class="table-mini-btn danger" title="Remover Tabela Inteira" on:click={handleDeleteTable}>
          Excluir
        </button>
      </div>
    {/if}

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

    <div class="sub-divider"></div>

    <button
      class="btn icon-btn"
      class:disabled={!hasFolder}
      disabled={!hasFolder}
      title={hasFolder ? "Salvar Arquivo (Ctrl+S)" : "Selecione uma pasta para salvar arquivos"}
      on:click={onSave}
    >
      <Save size={16} />
    </button>
    <button
      class="btn icon-btn"
      title="Exportar PDF / Imprimir (Ctrl+Shift+P)"
      on:click={onPrint}
    >
      <Printer size={16} />
    </button>
    <button
      class="btn icon-btn"
      class:feedback-active={copiedHtmlNotice}
      title={copiedHtmlNotice ? "HTML Formatado Copiado!" : "Copiar como HTML formatado (para Docs, Word e e-mail)"}
      on:click={triggerCopyHtml}
    >
      {#if copiedHtmlNotice}
        <Check size={16} style="color: var(--veu-h2-color);" />
      {:else}
        <Copy size={16} />
      {/if}
    </button>
    {#if onCopyHtml}
      <button
        class="btn icon-btn"
        title={copiedHtmlNotice ? "Copiado com sucesso!" : "Copiar como HTML formatado (Rich Text)"}
        on:click={triggerCopyHtml}
      >
        {#if copiedHtmlNotice}
          <Check size={16} color="var(--veu-h1-color)" />
        {:else}
          <Copy size={16} />
        {/if}
      </button>
    {/if}
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

  .app-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 2px 8px 2px 2px;
    user-select: none;
    flex-shrink: 0;
    cursor: default;
  }

  .brand-logo-img {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    object-fit: contain;
    filter: drop-shadow(0 2px 5px rgba(192, 132, 252, 0.35));
    transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .brand-logo-img:hover {
    transform: scale(1.08);
  }

  .brand-title {
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.8px;
    line-height: 1;
  }

  .brand-acronym {
    color: var(--veu-text-color);
  }

  .brand-suffix {
    color: var(--veu-h1-color);
    background: rgba(244, 114, 182, 0.14);
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 11px;
    font-weight: 700;
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

  .btn:disabled,
  .btn.disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .btn:disabled:hover,
  .btn.disabled:hover {
    background-color: transparent;
  }

  .btn.close-btn:hover {
    color: #ef4444;
  }

  .btn.wizard-btn:hover {
    color: var(--veu-h1-color);
  }

  .btn.active,
  .btn.feedback-active {
    background-color: var(--veu-active-item-bg);
    color: var(--veu-h1-color);
  }

  .table-actions-inline {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    background-color: var(--veu-active-item-bg);
    padding: 2px 4px;
    border-radius: 4px;
    border: 1px solid var(--veu-border-color);
  }

  .table-mini-btn {
    background: transparent;
    border: none;
    color: var(--veu-text-color);
    font-size: 11px;
    padding: 2px 5px;
    border-radius: 3px;
    cursor: pointer;
    white-space: nowrap;
    opacity: 0.8;
    transition: opacity 0.12s, background-color 0.12s, color 0.12s;
  }

  .table-mini-btn:hover {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.12);
    color: var(--veu-h2-color);
  }

  .table-mini-btn.danger:hover {
    color: #ef4444;
    background-color: rgba(239, 68, 68, 0.15);
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

