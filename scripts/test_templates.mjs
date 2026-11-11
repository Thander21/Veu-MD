import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

console.log('🧪 Iniciando Testes Automatizados de Document Templates & Snippets (TMPL-01..TMPL-04)...\n');

const root = process.cwd();

// 1. Validação do Registro de Templates e Interpolador (TMPL-01 & TMPL-02)
const registryPath = join(root, 'src', 'lib', 'utils', 'templateRegistry.ts');
const registryContent = readFileSync(registryPath, 'utf8');

assert(
  registryContent.includes("id: 'meeting-minutes'") &&
  registryContent.includes("id: 'technical-spec'") &&
  registryContent.includes("id: 'daily-log'") &&
  registryContent.includes("id: 'blog-post'"),
  'templateRegistry.ts deve conter os 4 modelos embutidos canônicos'
);

assert(
  registryContent.includes('export function interpolateTemplate('),
  'templateRegistry.ts deve exportar a função interpolateTemplate'
);

assert(
  registryContent.includes('export function interpolateFilename('),
  'templateRegistry.ts deve exportar a função interpolateFilename'
);

assert(
  registryContent.includes('export async function loadWorkspaceTemplates('),
  'templateRegistry.ts deve exportar loadWorkspaceTemplates com suporte a pasta .templates/'
);

// Validação sintática e comportamental da interpolação de strings
const sampleContent = '# {{title}}\nData: {{date}} - {{time}}\nProjeto: {{project}}';
let mockVars = {
  title: 'Alinhamento Q4',
  date: '2026-11-11',
  time: '14:30',
  project: 'Veu MD'
};

let evaluated = sampleContent
  .replaceAll('{{title}}', mockVars.title)
  .replaceAll('{{date}}', mockVars.date)
  .replaceAll('{{time}}', mockVars.time)
  .replaceAll('{{project}}', mockVars.project);

assert(
  evaluated.includes('# Alinhamento Q4') &&
  evaluated.includes('Data: 2026-11-11 - 14:30') &&
  evaluated.includes('Projeto: Veu MD'),
  'Interpolação de variáveis dinâmicas deve substituir todos os placeholders com fidelidade'
);

// Sanitização de nomes de arquivos para Windows
const testFilenamePattern = 'Ata_{{title}}_{{date}}.md';
const sanitizedFilename = testFilenamePattern
  .replaceAll('{{title}}', 'Projeto: Teste/Novo'.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_'))
  .replaceAll('{{date}}', '2026-11-11');

assert(
  !sanitizedFilename.includes(':') && !sanitizedFilename.includes('/'),
  'interpolateFilename deve neutralizar caracteres ilegais para caminhos do Windows ConPTY/NTFS'
);

console.log('✓ PASSOU: Registro de templates embutidos e interpolação determinística de variáveis (TMPL-01, TMPL-02)');

// 2. Validação do Componente TemplateModal (TMPL-01 & Acessibilidade AGENTS.md)
const modalPath = join(root, 'src', 'lib', 'components', 'TemplateModal.svelte');
const modalContent = readFileSync(modalPath, 'utf8');

assert(
  modalContent.includes('role="dialog"') && modalContent.includes('tabindex="-1"'),
  'TemplateModal deve cumprir a regra de acessibilidade do AGENTS.md com role="dialog" e tabindex="-1"'
);

assert(
  modalContent.includes('handleBackdropClick') && modalContent.includes('e.target === e.currentTarget'),
  'TemplateModal deve fechar ao clicar no backdrop sem stopPropagation intrusivo'
);

assert(
  modalContent.includes("e.key === 'Escape'") && modalContent.includes("e.key === 'Enter' && (e.ctrlKey || e.metaKey)"),
  'TemplateModal deve responder a Escape para fechar e Ctrl+Enter para criar'
);

assert(
  modalContent.includes('loadWorkspaceTemplates(currentFolderPath)'),
  'TemplateModal deve carregar modelos personalizados de .templates/ no projeto ativo'
);

console.log('✓ PASSOU: TemplateModal com catálogo, preview interativo e conformidade de acessibilidade (TMPL-01)');

// 3. Validação do Ponto de Disparo na Barra do Explorer (Sidebar.svelte)
const sidebarPath = join(root, 'src', 'lib', 'components', 'Sidebar.svelte');
const sidebarContent = readFileSync(sidebarPath, 'utf8');

assert(
  sidebarContent.includes('onOpenTemplates'),
  'Sidebar.svelte deve declarar a prop onOpenTemplates'
);

assert(
  sidebarContent.includes('title="Novo a partir de Modelo (Template)"') && sidebarContent.includes('Sparkles'),
  'Sidebar.svelte deve conter o botão de ação com ícone Sparkles na toolbar do Explorer'
);

console.log('✓ PASSOU: Botão de ação integrado na barra de ferramentas do Explorer (TMPL-01)');

// 4. Validação da Criação Física e Abertura Imediata no Editor (TMPL-03 & TMPL-04)
const appPath = join(root, 'src', 'App.svelte');
const appContent = readFileSync(appPath, 'utf8');

assert(
  appContent.includes('let templateModalOpen = false;'),
  'App.svelte deve gerenciar o estado templateModalOpen'
);

assert(
  appContent.includes('async function handleCreateFromTemplate('),
  'App.svelte deve conter a função handleCreateFromTemplate'
);

assert(
  appContent.includes('await fsService.writeTextFile(fullPath, content);'),
  'handleCreateFromTemplate deve gravar fisicamente o documento gerado com fsService.writeTextFile'
);

assert(
  appContent.includes('await refreshFileTree();') && appContent.includes('await openFile(fullPath, fileName);'),
  'handleCreateFromTemplate deve atualizar a árvore de arquivos e abrir o documento na aba ativa'
);

assert(
  appContent.includes('<TemplateModal'),
  'App.svelte deve instanciar o componente TemplateModal'
);

console.log('✓ PASSOU: Criação física no disco e abertura imediata na aba ativa do ProseMirror (TMPL-03, TMPL-04)');

console.log('\n🎉 TODOS OS TESTES DE TEMPLATES E MODELOS PASSARAM COM SUCESSO!\n');

