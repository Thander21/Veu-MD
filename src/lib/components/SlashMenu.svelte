<script lang="ts">
  import {
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
    Table,
    FileCode,
    Quote,
    List,
    ListOrdered,
    Minus
  } from 'lucide-svelte';
  import type { EditorView } from 'prosemirror-view';
  import { setBlockType } from 'prosemirror-commands';
  import { wrapInList } from 'prosemirror-schema-list';
  import { veuSchema } from '../editor/proseMirrorSetup';

  export let editorView: EditorView | null = null;
  export let visible: boolean = false;
  export let trigger: '#' | '/' = '/';
  export let coords: { top: number; left: number } = { top: 0, left: 0 };
  export let onClose: () => void;

  function selectOption(action: () => void) {
    if (!editorView) return;
    action();
    onClose();
    editorView.focus();
  }

  function applyHeading(level: number) {
    if (!editorView) return;
    setBlockType(veuSchema.nodes.heading, { level })(editorView.state, editorView.dispatch);
  }

  function applyQuote() {
    if (!editorView) return;
    setBlockType(veuSchema.nodes.blockquote)(editorView.state, editorView.dispatch);
  }

  function applyCodeBlock() {
    if (!editorView) return;
    setBlockType(veuSchema.nodes.code_block)(editorView.state, editorView.dispatch);
  }

  function applyBulletList() {
    if (!editorView) return;
    wrapInList(veuSchema.nodes.bullet_list)(editorView.state, editorView.dispatch);
  }

  function applyOrderedList() {
    if (!editorView) return;
    wrapInList(veuSchema.nodes.ordered_list)(editorView.state, editorView.dispatch);
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
  }

  function insertHorizontalRule() {
    if (!editorView) return;
    const hr = veuSchema.nodes.horizontal_rule.create();
    editorView.dispatch(editorView.state.tr.replaceSelectionWith(hr));
  }
</script>

{#if visible}
  <div class="slash-menu" style="top: {coords.top + 24}px; left: {coords.left}px;">
    {#if trigger === '#'}
      <div class="menu-header">Títulos Rápidos (#)</div>
      <button class="item" on:click={() => selectOption(() => applyHeading(1))}>
        <Heading1 size={15} color="#60a5fa" />
        <span>Título 1 (H1)</span>
      </button>
      <button class="item" on:click={() => selectOption(() => applyHeading(2))}>
        <Heading2 size={15} color="#38bdf8" />
        <span>Título 2 (H2)</span>
      </button>
      <button class="item" on:click={() => selectOption(() => applyHeading(3))}>
        <Heading3 size={15} color="#818cf8" />
        <span>Título 3 (H3)</span>
      </button>
      <button class="item" on:click={() => selectOption(() => applyHeading(4))}>
        <Heading4 size={15} color="#a78bfa" />
        <span>Título 4 (H4)</span>
      </button>
      <button class="item" on:click={() => selectOption(() => applyHeading(5))}>
        <Heading5 size={15} color="#c084fc" />
        <span>Título 5 (H5)</span>
      </button>
      <button class="item" on:click={() => selectOption(() => applyHeading(6))}>
        <Heading6 size={15} color="#e879f9" />
        <span>Título 6 (H6)</span>
      </button>
    {:else}
      <div class="menu-header">Inserir Bloco (/)</div>
      <button class="item" on:click={() => selectOption(() => applyHeading(1))}>
        <Heading1 size={15} color="#60a5fa" />
        <span>Título Principal (H1)</span>
      </button>
      <button class="item" on:click={() => selectOption(() => applyHeading(2))}>
        <Heading2 size={15} color="#38bdf8" />
        <span>Subtítulo (H2)</span>
      </button>
      <button class="item" on:click={() => selectOption(applyQuote)}>
        <Quote size={15} color="#a78bfa" />
        <span>Citação / Alerta</span>
      </button>
      <button class="item" on:click={() => selectOption(applyCodeBlock)}>
        <FileCode size={15} color="#f43f5e" />
        <span>Bloco de Código</span>
      </button>
      <button class="item" on:click={() => selectOption(applyBulletList)}>
        <List size={15} color="#34d399" />
        <span>Lista com Marcadores</span>
      </button>
      <button class="item" on:click={() => selectOption(applyOrderedList)}>
        <ListOrdered size={15} color="#fbbf24" />
        <span>Lista Numerada</span>
      </button>
      <button class="item" on:click={() => selectOption(insertTable)}>
        <Table size={15} color="#38bdf8" />
        <span>Tabela GFM</span>
      </button>
      <button class="item" on:click={() => selectOption(insertHorizontalRule)}>
        <Minus size={15} color="#94a3b8" />
        <span>Linha Divisória</span>
      </button>
    {/if}
  </div>
{/if}

<style>
  .slash-menu {
    position: fixed;
    z-index: 60;
    width: 220px;
    background-color: #1e2026;
    border: 1px solid #334155;
    border-radius: 6px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.45);
    padding: 4px;
    animation: popIn 0.1s ease-out;
    max-height: 280px;
    overflow-y: auto;
  }

  @keyframes popIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .menu-header {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 6px 8px;
    color: rgba(200, 210, 230, 0.5);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    margin-bottom: 2px;
  }

  .item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 6px 8px;
    border-radius: 4px;
    background: transparent;
    border: none;
    color: #e2e8f0;
    font-size: 13px;
    cursor: pointer;
    text-align: left;
  }

  .item:hover {
    background-color: #2d3748;
    color: #38bdf8;
  }
</style>
