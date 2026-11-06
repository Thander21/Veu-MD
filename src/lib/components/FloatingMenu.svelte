<script lang="ts">
  import { Bold, Italic, Strikethrough, Underline, Highlighter, Code, Heading1, Heading2, Quote } from 'lucide-svelte';
  import type { EditorView } from 'prosemirror-view';
  import { toggleMark, setBlockType } from 'prosemirror-commands';
  import { veuSchema } from '../editor/proseMirrorSetup';

  export let editorView: EditorView | null = null;
  export let visible: boolean = false;
  export let coords: { top: number; left: number } = { top: 0, left: 0 };

  function applyMark(markType: any) {
    if (!editorView) return;
    toggleMark(markType)(editorView.state, editorView.dispatch);
    editorView.focus();
  }

  function applyHeading(level: number) {
    if (!editorView) return;
    setBlockType(veuSchema.nodes.heading, { level })(editorView.state, editorView.dispatch);
    editorView.focus();
  }

  function applyQuote() {
    if (!editorView) return;
    setBlockType(veuSchema.nodes.blockquote)(editorView.state, editorView.dispatch);
    editorView.focus();
  }
</script>

{#if visible}
  <div class="floating-menu" style="top: {coords.top}px; left: {coords.left}px;">
    <button class="btn" title="Negrito" on:click={() => applyMark(veuSchema.marks.strong)}>
      <Bold size={14} />
    </button>
    <button class="btn" title="Itálico" on:click={() => applyMark(veuSchema.marks.em)}>
      <Italic size={14} />
    </button>
    <button class="btn" title="Tachado" on:click={() => applyMark(veuSchema.marks.strikethrough)}>
      <Strikethrough size={14} />
    </button>
    <button class="btn" title="Sublinhado" on:click={() => applyMark(veuSchema.marks.underline)}>
      <Underline size={14} />
    </button>
    <button class="btn" title="Marca-texto" on:click={() => applyMark(veuSchema.marks.highlight)}>
      <Highlighter size={14} />
    </button>
    <button class="btn" title="Código" on:click={() => applyMark(veuSchema.marks.code)}>
      <Code size={14} />
    </button>

    <div class="divider"></div>

    <button class="btn" title="Título 1" on:click={() => applyHeading(1)}>
      <Heading1 size={14} />
    </button>
    <button class="btn" title="Título 2" on:click={() => applyHeading(2)}>
      <Heading2 size={14} />
    </button>
    <button class="btn" title="Citação" on:click={applyQuote}>
      <Quote size={14} />
    </button>
  </div>
{/if}

<style>
  .floating-menu {
    position: fixed;
    z-index: 50;
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 3px 5px;
    background-color: #1e2026;
    border: 1px solid #334155;
    border-radius: 6px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    transform: translate(-50%, -100%);
    margin-top: -10px;
    animation: fadeIn 0.1s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translate(-50%, -90%);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -100%);
    }
  }

  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    background: transparent;
    border: none;
    color: #e2e8f0;
    border-radius: 4px;
    cursor: pointer;
  }

  .btn:hover {
    background-color: #2d3748;
    color: #38bdf8;
  }

  .divider {
    width: 1px;
    height: 16px;
    background-color: #334155;
    margin: 0 2px;
  }
</style>

