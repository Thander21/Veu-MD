import { Schema, Slice, DOMSerializer, Node as ProseMirrorNode } from 'prosemirror-model';
import { defaultMarkdownParser, defaultMarkdownSerializer, MarkdownParser, MarkdownSerializer } from 'prosemirror-markdown';
import { schema as baseSchema } from 'prosemirror-schema-basic';
import { convertFileSrc } from '@tauri-apps/api/core';
import { addListNodes, splitListItem, liftListItem, sinkListItem } from 'prosemirror-schema-list';
import {
  tableNodes,
  tableEditing,
  columnResizing,
  goToNextCell,
  addRowAfter,
  addColumnAfter,
  deleteRow,
  deleteColumn,
  deleteTable,
  isInTable
} from 'prosemirror-tables';
import { EditorState, Plugin, PluginKey } from 'prosemirror-state';
import { EditorView, Decoration, DecorationSet } from 'prosemirror-view';
import { history, undo, redo } from 'prosemirror-history';
import { Transform } from 'prosemirror-transform';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap, toggleMark } from 'prosemirror-commands';
import { inputRules, wrappingInputRule, textblockTypeInputRule, InputRule } from 'prosemirror-inputrules';

// 1. Estendendo o Schema com Tabelas, Listas e Marcas (Highlight, Strikethrough, Underline)
const baseNodes = addListNodes(baseSchema.spec.nodes, 'paragraph block*', 'block');
const allNodes = baseNodes.append(
  tableNodes({
    tableGroup: 'block',
    cellContent: 'inline*',
    cellAttributes: {}
  })
);

export const veuSchema = new Schema({
  nodes: allNodes,
  marks: baseSchema.spec.marks.append({
    strikethrough: {
      parseDOM: [{ tag: 's' }, { tag: 'del' }, { style: 'text-decoration=line-through' }],
      toDOM: () => ['s', 0]
    },
    underline: {
      parseDOM: [{ tag: 'u' }, { style: 'text-decoration=underline' }],
      toDOM: () => ['u', 0]
    },
    highlight: {
      parseDOM: [{ tag: 'mark' }],
      toDOM: () => ['mark', 0]
    },
    wiki_link: {
      attrs: {
        target: {},
        alias: { default: null }
      },
      inclusive: false,
      parseDOM: [
        {
          tag: 'a[data-wiki-link]',
          getAttrs(dom: HTMLElement) {
            return {
              target: dom.getAttribute('data-wiki-target') || '',
              alias: dom.getAttribute('data-wiki-alias') || null
            };
          }
        }
      ],
      toDOM(node) {
        return [
          'a',
          {
            class: 'veu-wiki-link',
            'data-wiki-link': 'true',
            'data-wiki-target': node.attrs.target,
            'data-wiki-alias': node.attrs.alias || '',
            href: `#wiki:${encodeURIComponent(node.attrs.target)}`,
            title: `Wiki-Link: [[${node.attrs.target}]] (Ctrl + Clique para abrir)`
          },
          0
        ];
      }
    }
  })
});

// 2. Parser Markdown GFM completo (reconhece tabelas e strikethrough)
const tokenizer = defaultMarkdownParser.tokenizer;
tokenizer.enable(['table', 'strikethrough']);

export const veuMarkdownParser = new MarkdownParser(veuSchema, tokenizer, {
  ...defaultMarkdownParser.tokens,
  s: { mark: 'strikethrough' },
  table: { block: 'table' },
  thead: { ignore: true },
  tbody: { ignore: true },
  tr: { block: 'table_row' },
  th: { block: 'table_header' },
  td: { block: 'table_cell' }
});

// 3. Serializador Markdown customizado (Gera Markdown puro .md no disco com tabelas GFM)
export const veuMarkdownSerializer = new MarkdownSerializer(
  {
    ...defaultMarkdownSerializer.nodes,
    table(state, node) {
      state.renderContent(node);
      state.closeBlock(node);
    },
    table_row(state, node) {
      state.write('|');
      let isHeader = false;
      node.forEach((cell, _, i) => {
        if (cell.type.name === 'table_header') {
          isHeader = true;
        }
        state.render(cell, node, i);
        state.write('|');
      });
      state.write('\n');
      if (isHeader) {
        state.write('|');
        node.forEach(() => {
          state.write(' --- |');
        });
        state.write('\n');
      }
    },
    table_cell(state, node) {
      state.write(' ');
      state.renderInline(node);
      state.write(' ');
    },
    table_header(state, node) {
      state.write(' ');
      state.renderInline(node);
      state.write(' ');
    },
    image(state, node) {
      const src = node.attrs.src || '';
      state.write(
        "![" +
          state.esc(node.attrs.alt || "") +
          "](" +
          state.esc(src) +
          ")"
      );
    }
  },
  {
    ...defaultMarkdownSerializer.marks,
    strikethrough: { open: '~~', close: '~~', mixable: true, expelEnclosingWhitespace: true },
    underline: { open: '<u>', close: '</u>', mixable: true, expelEnclosingWhitespace: true },
    highlight: { open: '==', close: '==', mixable: true, expelEnclosingWhitespace: true },
    wiki_link: {
      open(_state, mark) {
        return mark.attrs.alias && mark.attrs.alias !== mark.attrs.target
          ? `[[${mark.attrs.target}|`
          : '[[';
      },
      close(_state, _mark) {
        return ']]';
      }
    }
  }
);

let activeDocumentDir: string = '';

export function setActiveDocumentDir(dir: string) {
  activeDocumentDir = dir;
}

export function getActiveDocumentDir(): string {
  return activeDocumentDir;
}

export function resolveImageSrc(src: string, docDir = activeDocumentDir): string {
  if (!src) return '';
  if (
    src.startsWith('data:') ||
    src.startsWith('http://') ||
    src.startsWith('https://') ||
    src.startsWith('blob:') ||
    src.startsWith('asset:')
  ) {
    return src;
  }
  if (docDir) {
    const cleanSrc = src.replace(/^\.\//, '');
    const sep = docDir.includes('/') ? '/' : '\\';
    const absolutePath = `${docDir}${sep}${cleanSrc}`;
    try {
      return convertFileSrc(absolutePath);
    } catch {
      return src;
    }
  }
  return src;
}

export function createImageNodeView(node: ProseMirrorNode) {
  const dom = document.createElement('img');
  const rawSrc = node.attrs.src || '';
  dom.src = resolveImageSrc(rawSrc);
  if (node.attrs.alt) dom.alt = node.attrs.alt;
  if (node.attrs.title) dom.title = node.attrs.title;
  dom.className = 'veu-editor-image';

  return {
    dom,
    update(updatedNode: ProseMirrorNode) {
      if (updatedNode.type.name !== 'image') return false;
      const newSrc = updatedNode.attrs.src || '';
      dom.src = resolveImageSrc(newSrc);
      if (updatedNode.attrs.alt) dom.alt = updatedNode.attrs.alt;
      if (updatedNode.attrs.title) dom.title = updatedNode.attrs.title;
      return true;
    }
  };
}

// 4. Regras de Entrada Inteligentes (Digitar # cria H1 na hora sem mostrar a tag)
export function buildInputRules(schema: Schema) {
  const rules = [];

  // Títulos H1-H6 ao digitar "# " até "###### "
  for (let level = 1; level <= 6; level++) {
    rules.push(
      textblockTypeInputRule(
        new RegExp(`^(#{${level}})\\s$`),
        schema.nodes.heading,
        () => ({ level })
      )
    );
  }

  // Citação ao digitar "> "
  if (schema.nodes.blockquote) {
    rules.push(wrappingInputRule(/^\s*>\s$/, schema.nodes.blockquote));
  }

  // Lista com marcadores ao digitar "- " ou "* "
  if (schema.nodes.bullet_list) {
    rules.push(wrappingInputRule(/^\s*([-*])\s$/, schema.nodes.bullet_list));
  }

  // Lista ordenada ao digitar "1. "
  if (schema.nodes.ordered_list) {
    rules.push(
      wrappingInputRule(
        /^(\d+)\.\s$/,
        schema.nodes.ordered_list,
        (match) => ({ order: +match[1] }),
        (match, node) => node.childCount + node.attrs.order === +match[1]
      )
    );
  }

  // Bloco de código ao digitar "``` "
  if (schema.nodes.code_block) {
    rules.push(textblockTypeInputRule(/^```$/, schema.nodes.code_block));
  }

  // Wiki-Link ao digitar "[[nota]]" ou "[[nota|alias]]" (WIKI-01)
  if (schema.marks.wiki_link) {
    const wikiRule = new InputRule(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/, (state, match, start, end) => {
      const rawTarget = match[1]?.trim();
      if (!rawTarget) return null;
      const rawAlias = match[2]?.trim() || null;
      const displayText = rawAlias || rawTarget;
      const markType = schema.marks.wiki_link;
      if (!markType) return null;

      return state.tr.replaceWith(
        start,
        end,
        schema.text(displayText, [markType.create({ target: rawTarget, alias: rawAlias })])
      );
    });
    rules.push(wikiRule);
  }

  return inputRules({ rules });
}

// 5. Plugin de Notificação de Seleção (Para Barra Flutuante e Barra de Status)
export const selectionPluginKey = new PluginKey('veuSelectionPlugin');

export function createSelectionPlugin(onSelectionChange: (view: EditorView) => void) {
  return new Plugin({
    key: selectionPluginKey,
    view() {
      return {
        update(view, prevState) {
          if (!prevState || !prevState.selection.eq(view.state.selection) || !prevState.doc.eq(view.state.doc)) {
            onSelectionChange(view);
          }
        }
      };
    }
  });
}

// 6. Plugin de Checklists Interativas (renderiza checkbox clicável no estilo Word sem perder sintaxe GFM)
export const taskListPlugin = new Plugin({
  props: {
    decorations(state) {
      const decos: Decoration[] = [];
      state.doc.descendants((node, pos) => {
        if (node.isText && node.text) {
          const match = node.text.match(/^\[([ xX])\] /);
          if (match) {
            const checked = match[1].toLowerCase() === 'x';
            const widget = document.createElement('input');
            widget.type = 'checkbox';
            widget.checked = checked;
            widget.className = 'veu-task-checkbox';
            widget.onmousedown = (e) => e.preventDefault();
            widget.onclick = (e) => {
              e.preventDefault();
              e.stopPropagation();
              const view = (window as any).__veuActiveEditorView as EditorView | undefined;
              if (view) {
                const newChar = checked ? ' ' : 'x';
                const tr = view.state.tr.replaceWith(
                  pos,
                  pos + 4,
                  state.schema.text(`[${newChar}] `)
                );
                view.dispatch(tr);
              }
            };

            decos.push(
              Decoration.widget(pos, widget, { side: -1 }),
              Decoration.inline(pos, pos + 4, {
                class: 'veu-hidden-task-syntax'
              })
            );
          }
        }
      });
      return DecorationSet.create(state.doc, decos);
    }
  }
});

// Exporta comandos de tabela para a barra superior e menus
export { addRowAfter, addColumnAfter, deleteRow, deleteColumn, deleteTable, isInTable };

// Converte strings [[alvo]] e [[alvo|alias]] em marcas wiki_link no documento inicial
export function convertWikiLinksInDoc(initialDoc: ProseMirrorNode, schema: Schema): ProseMirrorNode {
  const markType = schema.marks.wiki_link;
  if (!markType) return initialDoc;

  let tr = new Transform(initialDoc);
  let hasReplacements = true;

  while (hasReplacements) {
    hasReplacements = false;
    let foundMatch: { pos: number; end: number; target: string; alias: string | null; text: string } | null = null;

    tr.doc.descendants((node, pos) => {
      if (foundMatch) return false;
      if (node.isText && node.text) {
        if (node.marks.some((m) => m.type === markType)) return;
        const match = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/.exec(node.text);
        if (match) {
          const rawTarget = match[1]?.trim();
          const rawAlias = match[2]?.trim() || null;
          const matchStart = pos + match.index;
          const matchEnd = matchStart + match[0].length;
          foundMatch = {
            pos: matchStart,
            end: matchEnd,
            target: rawTarget,
            alias: rawAlias,
            text: rawAlias || rawTarget
          };
          return false;
        }
      }
    });

    if (foundMatch) {
      hasReplacements = true;
      const { pos, end, target, alias, text } = foundMatch;
      const replacementNode = schema.text(text, [markType.create({ target, alias })]);
      tr.replaceWith(pos, end, replacementNode);
    }
  }

  return tr.doc;
}

// 7. Inicializador do Editor
export function createEditorState(
  initialMarkdown: string,
  onSelectionChange: (view: EditorView) => void
): EditorState {
  let doc;
  try {
    doc = veuMarkdownParser.parse(initialMarkdown) || veuSchema.node('doc', null, [veuSchema.node('paragraph')]);
    doc = convertWikiLinksInDoc(doc, veuSchema);
  } catch (e) {
    console.error('Erro ao converter markdown:', e);
    doc = veuSchema.node('doc', null, [veuSchema.node('paragraph')]);
  }

  const customKeymap = {
    'Mod-z': undo,
    'Mod-y': redo,
    'Shift-Mod-z': redo,
    'Mod-b': toggleMark(veuSchema.marks.strong),
    'Mod-i': toggleMark(veuSchema.marks.em),
    'Mod-`': toggleMark(veuSchema.marks.code),
    'Enter': splitListItem(veuSchema.nodes.list_item),
    'Tab': (state: EditorState, dispatch?: any) => {
      if (goToNextCell(1)(state, dispatch)) return true;
      if (isInTable(state) && addRowAfter(state, dispatch)) {
        goToNextCell(1)(state, dispatch);
        return true;
      }
      if (sinkListItem(veuSchema.nodes.list_item)(state, dispatch)) return true;
      return false;
    },
    'Shift-Tab': (state: EditorState, dispatch?: any) => {
      if (goToNextCell(-1)(state, dispatch)) return true;
      if (liftListItem(veuSchema.nodes.list_item)(state, dispatch)) return true;
      return false;
    }
  };

  return EditorState.create({
    schema: veuSchema,
    doc,
    plugins: [
      history(),
      tableEditing(),
      columnResizing(),
      keymap(customKeymap),
      keymap(baseKeymap),
      buildInputRules(veuSchema),
      createSelectionPlugin(onSelectionChange),
      taskListPlugin
    ]
  });
}

// 8. Smart Paste de IA (AC-ADV-009, AC-ADV-010)
export function sanitizeAiGreetings(text: string): string {
  const greetingPatterns = [
    /^(Com certeza|Claro|Certamente|Com prazer|Sem problemas)[!.,]?\s*(aqui está|segue|veja|aqui estão)?.*?:?\s*\n+/i,
    /^(Aqui está|Aqui estão|Segue|Seguem|Veja abaixo|Abaixo está)[!.,]?\s*(o resumo|o texto|o código|a lista|a tabela|o conteúdo|a versão formatada)?.*?:?\s*\n+/i,
    /^(Sure|Certainly|Of course|Here is|Here are|Here's)[!.,]?\s*(the summary|the text|the code|the content)?.*?:?\s*\n+/i,
    /^(Hello|Hi|Olá|Oi)[!.,]?\s*(Aqui está|Here is)?.*?:?\s*\n+/i
  ];

  const closingPatterns = [
    /\n+\s*(Espero que (isso|esta resposta) ajude|Espero ter ajudado|Qualquer dúvida (estou à disposição|é só falar)|Se precisar de mais alguma coisa).*$/i,
    /\n+\s*(Hope this helps|Let me know if you need anything else|Feel free to ask).*$/i
  ];

  let cleaned = text;
  for (const pattern of greetingPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  for (const pattern of closingPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  return cleaned.trim();
}

export function handleSmartPaste(
  view: EditorView,
  event: ClipboardEvent,
  sanitizeAi: boolean = true
): boolean {
  const clipboardData = event.clipboardData;
  if (!clipboardData) return false;

  // Prioriza imagens se houver
  const items = clipboardData.items;
  if (items) {
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        return false;
      }
    }
  }

  let text = clipboardData.getData('text/plain') || '';
  if (!text || text.trim().length === 0) return false;

  if (sanitizeAi) {
    text = sanitizeAiGreetings(text);
  }

  // Detecta estruturas Markdown ricas (tabelas, blocos de código, títulos, listas, checklists e marcas inline)
  const hasMarkdownStructures =
    /(?:^|\n)(?:#{1,6}\s|>\s|[-*+]\s|\|\s*.+?\s*\||```|\[[ xX]\]|\d+\.\s)/.test(text) ||
    /(\*\*|__)[^\s].+?\1/.test(text) ||
    /~~[^\s].+?~~/.test(text) ||
    /`[^`\n]+`/.test(text) ||
    /\[.+?\]\(.+?\)/.test(text);

  if (hasMarkdownStructures) {
    try {
      const parsedDoc = veuMarkdownParser.parse(text);
      if (parsedDoc && parsedDoc.content.size > 0) {
        event.preventDefault();
        const { state, dispatch } = view;
        const slice = new Slice(parsedDoc.content, 0, 0);
        const tr = state.tr.replaceSelection(slice);
        dispatch(tr.scrollIntoView());
        return true;
      }
    } catch {
      // Deixa o comportamento nativo assumir caso o parser falhe
    }
  }

  return false;
}

// 9. Exportação Fiel: Serialização HTML e Cópia Formatada (AC-ADV-017, AC-ADV-018)
export function serializeDocToHtml(doc: ProseMirrorNode): string {
  const serializer = DOMSerializer.fromSchema(veuSchema);
  const container = document.createElement('div');
  container.appendChild(serializer.serializeFragment(doc.content));
  return container.innerHTML;
}

export async function copyFormattedHtml(html: string, plainText: string): Promise<boolean> {
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      const htmlBlob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob
        })
      ]);
      return true;
    } catch {
      // Fallback para document.execCommand caso a API de ClipboardItem seja restrita
    }
  }

  const listener = (e: ClipboardEvent) => {
    e.preventDefault();
    e.clipboardData?.setData('text/html', html);
    e.clipboardData?.setData('text/plain', plainText);
  };
  document.addEventListener('copy', listener, { once: true });
  document.execCommand('copy');
  return true;
}
