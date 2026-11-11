import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

console.log('🧪 Iniciando Testes Automatizados de Wiki-Links & Backlinks (WIKI-01..WIKI-04)...\n');

const root = process.cwd();

// 1. Validação do Schema ProseMirror, InputRule e Serialização (WIKI-01)
const setupPath = join(root, 'src', 'lib', 'editor', 'proseMirrorSetup.ts');
const setupContent = readFileSync(setupPath, 'utf8');

assert(
  setupContent.includes('wiki_link: {') &&
  setupContent.includes("attrs: {\n        target: {},\n        alias: { default: null }\n      }"),
  'proseMirrorSetup.ts deve declarar a marca wiki_link com atributos target e alias'
);

assert(
  setupContent.includes("class: 'veu-wiki-link'") &&
  setupContent.includes("'data-wiki-link': 'true'") &&
  setupContent.includes("'data-wiki-target': node.attrs.target"),
  'toDOM de wiki_link deve renderizar âncora rica com data-wiki-link e data-wiki-target'
);

assert(
  setupContent.includes('export function convertWikiLinksInDoc('),
  'proseMirrorSetup.ts deve exportar convertWikiLinksInDoc para converter notas existentes sem colchetes brutos'
);

assert(
  setupContent.includes('const wikiRule = new InputRule(/') &&
  setupContent.includes('rules.push(wikiRule);'),
  'proseMirrorSetup.ts deve registrar InputRule que converte [[nota]] e [[nota|alias]] ao digitar'
);

assert(
  setupContent.includes('wiki_link: {\n      open(_state, mark) {\n        return mark.attrs.alias && mark.attrs.alias !== mark.attrs.target\n          ? `[[${mark.attrs.target}|`\n          : \'[[\';'),
  'veuMarkdownSerializer deve serializar wiki_link de volta para Markdown canônico [[target]] ou [[target|alias]]'
);

console.log('✓ PASSOU: Schema ProseMirror, InputRule interativa e serializador GFM de Wiki-Links (WIKI-01)');

// 2. Validação de Navegação com Ctrl+Clique no Editor (WIKI-02 & WIKI-03)
const editorPath = join(root, 'src', 'lib', 'components', 'Editor.svelte');
const editorContent = readFileSync(editorPath, 'utf8');

assert(
  editorContent.includes('export let onOpenWikiLink: ((target: string) => void) | undefined = undefined;'),
  'Editor.svelte deve declarar a prop onOpenWikiLink'
);

assert(
  editorContent.includes('handleClick(view, pos, event)') &&
  editorContent.includes('event.ctrlKey || event.metaKey') &&
  editorContent.includes("target?.closest('a[data-wiki-link]')"),
  'Editor.svelte deve capturar cliques com Ctrl em a[data-wiki-link] e despachar onOpenWikiLink'
);

assert(
  editorContent.includes(':global(.veu-wiki-link)'),
  'Editor.svelte deve estilizar .veu-wiki-link com cores semânticas e indicação de clique'
);

const appPath = join(root, 'src', 'App.svelte');
const appContent = readFileSync(appPath, 'utf8');

assert(
  appContent.includes('async function handleOpenWikiLink(targetName: string)'),
  'App.svelte deve conter a função handleOpenWikiLink'
);

assert(
  appContent.includes('function findNodeInTree(') &&
  appContent.includes('await openFile(foundNode.path, foundNode.name);'),
  'handleOpenWikiLink deve buscar o arquivo correspondente na árvore do projeto e abrir no editor'
);

assert(
  appContent.includes('confirm(`A nota "${cleanTarget}.md" não existe no projeto. Deseja criá-la agora?`)') &&
  appContent.includes('await fsService.writeTextFile(newPath, initialContent);'),
  'handleOpenWikiLink deve oferecer criação sob demanda de notas inexistentes (WIKI-03)'
);

console.log('✓ PASSOU: Navegação com Ctrl+Clique e criação sob demanda de notas (WIKI-02, WIKI-03)');

// 3. Validação do Scanner de Backlinks e Seção na Sidebar (WIKI-04)
const scannerPath = join(root, 'src', 'lib', 'utils', 'backlinkScanner.ts');
const scannerContent = readFileSync(scannerPath, 'utf8');

assert(
  scannerContent.includes('export async function scanBacklinksForFile('),
  'backlinkScanner.ts deve exportar a função scanBacklinksForFile'
);

assert(
  scannerContent.includes('fsService.searchInFiles(currentFolderPath, noteName'),
  'scanBacklinksForFile deve utilizar fsService.searchInFiles para busca ultra-rápida no workspace'
);

assert(
  scannerContent.includes('if (normMatch === normCurrent) continue;'),
  'scanBacklinksForFile deve ignorar auto-referências no próprio arquivo ativo'
);

const sidebarPath = join(root, 'src', 'lib', 'components', 'Sidebar.svelte');
const sidebarContent = readFileSync(sidebarPath, 'utf8');

assert(
  sidebarContent.includes('export let backlinks: BacklinkItem[] = [];'),
  'Sidebar.svelte deve declarar a prop backlinks'
);

assert(
  sidebarContent.includes('class="outline-header backlinks-section-title"') &&
  sidebarContent.includes('Backlinks ({backlinks.length})'),
  'Sidebar.svelte deve renderizar o cabeçalho de Backlinks na aba Sumário'
);

assert(
  sidebarContent.includes('class="backlink-card"') &&
  sidebarContent.includes('on:click={() => onOpenFile(b.filePath, b.fileName)}'),
  'Sidebar.svelte deve permitir clicar em um item de backlink para abrir a nota que referencia'
);

console.log('✓ PASSOU: Scanner nativo de referências reversas e seção interativa de Backlinks (WIKI-04)');

console.log('\n🎉 TODOS OS TESTES DE WIKI-LINKS E BACKLINKS PASSARAM COM SUCESSO!\n');
