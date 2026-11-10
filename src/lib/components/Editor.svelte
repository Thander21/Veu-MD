<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { EditorView } from 'prosemirror-view';
  import {
    createEditorState,
    veuMarkdownSerializer,
    handleSmartPaste,
    createImageNodeView
  } from '../editor/proseMirrorSetup';
  import FloatingMenu from './FloatingMenu.svelte';
  import SlashMenu from './SlashMenu.svelte';
  import { estimateTokens } from '../utils/aiContext';
  import type { HeadingItem } from '../types';

  export let content: string = '';
  export let isMarkdown: boolean = true;
  export let onChange: (newContent: string) => void;
  export let onHeadingsChange: (headings: HeadingItem[]) => void;
  export let onStatsChange: (stats: { words: number; chars: number; tokens: number; readTime: string }) => void;
  export let onEditorReady: (view: EditorView) => void;
  export let onPasteImage: ((base64: string) => void) | undefined = undefined;
  export let smartPasteSanitizeAi: boolean = true;

  let editorContainer: HTMLDivElement;
  let editorView: EditorView | null = null;

  // Estados dos menus flutuantes
  let floatingVisible = false;
  let floatingCoords = { top: 0, left: 0 };

  let slashVisible = false;
  let slashTrigger: '#' | '/' = '/';
  let slashCoords = { top: 0, left: 0 };

  function handleSelection(view: EditorView) {
    const { state } = view;
    const { from, to, empty } = state.selection;

    // 1. Menu Flutuante ao selecionar texto
    if (!empty && to - from > 1) {
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);
      floatingCoords = {
        top: start.top,
        left: (start.left + end.left) / 2
      };
      floatingVisible = true;
    } else {
      floatingVisible = false;
    }

    // 2. Extrai Sumário (Headings H1..H6)
    const headings: HeadingItem[] = [];
    state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        headings.push({
          id: `h-${pos}`,
          text: node.textContent,
          level: node.attrs.level,
          pos
        });
      }
    });
    onHeadingsChange(headings);

    // 3. Estatísticas de Texto (Palavras / Caracteres / Tokens)
    const text = state.doc.textContent;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const tokens = chars === 0 ? 0 : estimateTokens(text);
    const readMinutes = Math.max(1, Math.ceil(words / 200));
    onStatsChange({
      words,
      chars,
      tokens,
      readTime: `${readMinutes} min de leitura`
    });
  }

  export function jumpToPos(pos: number) {
    if (!editorView) return;
    const dom = editorView.nodeDOM(pos);
    if (dom instanceof HTMLElement) {
      dom.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  export function setEditorContent(newContent: string) {
    if (!editorView) return;
    const newState = createEditorState(newContent, handleSelection);
    editorView.updateState(newState);
    onChange(newContent);
  }

  function initEditor() {
    if (editorView) {
      editorView.destroy();
    }

    const state = createEditorState(content, handleSelection);

    editorView = new EditorView(editorContainer, {
      state,
      nodeViews: {
        image: (node) => createImageNodeView(node)
      },
      dispatchTransaction(transaction) {
        const newState = editorView!.state.apply(transaction);
        editorView!.updateState(newState);

        if (transaction.docChanged) {
          // Serializa de volta para Markdown limpo (.md)
          const newMarkdown = isMarkdown
            ? veuMarkdownSerializer.serialize(newState.doc)
            : newState.doc.textContent;
          onChange(newMarkdown);
        }
      },
      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const blob = item.getAsFile();
            if (!blob) return true;

            const reader = new FileReader();
            reader.onload = (e) => {
              const base64Data = e.target?.result as string;
              if (onPasteImage) {
                onPasteImage(base64Data);
              }
            };
            reader.readAsDataURL(blob);
            return true;
          }
        }

        // 2. Smart Paste para estruturas Markdown e texto de IA (AC-ADV-009, AC-ADV-010)
        if (handleSmartPaste(view, event, smartPasteSanitizeAi)) {
          return true;
        }

        return false;
      },
      handleKeyDown(view, event) {
        // Detecta atalho de sugestão '#' ou '/' no início da linha
        if (event.key === '#' || event.key === '/') {
          const { $from } = view.state.selection;
          if ($from.parentOffset === 0) {
            const coords = view.coordsAtPos($from.pos);
            slashTrigger = event.key as '#' | '/';
            slashCoords = { top: coords.top, left: coords.left };
            slashVisible = true;
          }
        } else if (slashVisible && (event.key === 'Escape' || event.key === 'Space')) {
          slashVisible = false;
        }
        return false;
      }
    });

    (window as any).__veuActiveEditorView = editorView;
    onEditorReady(editorView);
    handleSelection(editorView);
  }

  onMount(() => {
    initEditor();
  });

  onDestroy(() => {
    if (editorView) {
      editorView.destroy();
    }
  });

  // Atualiza conteúdo se aba mudou
  $: if (editorView && content !== veuMarkdownSerializer.serialize(editorView.state.doc)) {
    // Apenas recria se a troca de aba trouxer outro arquivo
    // Evita loop com o dispatchTransaction interno
  }
</script>

<div class="editor-scroll-area">
  <div class="editor-page" style="max-width: var(--veu-max-width);">
    <div bind:this={editorContainer} class="editor-mount"></div>
  </div>
</div>

<FloatingMenu
  {editorView}
  visible={floatingVisible}
  coords={floatingCoords}
/>

<SlashMenu
  {editorView}
  visible={slashVisible}
  trigger={slashTrigger}
  coords={slashCoords}
  onClose={() => (slashVisible = false)}
/>

<style>
  .editor-scroll-area {
    flex: 1;
    overflow-y: auto;
    background-color: var(--veu-bg-editor);
    display: flex;
    justify-content: center;
    padding: 30px 20px 80px 20px;
  }

  .editor-page {
    width: 100%;
    min-height: 100%;
  }

  .editor-mount {
    min-height: 500px;
  }
</style>

