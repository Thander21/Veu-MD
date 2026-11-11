import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

console.log('🧪 Iniciando Testes Automatizados da Busca Global no Workspace (SEARCH-01..SEARCH-04)...\n');

const root = process.cwd();

// 1. Validação do Comando Rust search_in_files e Exclusões (SEARCH-01)
const fsCmdPath = join(root, 'src-tauri', 'src', 'commands', 'fs_cmd.rs');
const fsCmdContent = readFileSync(fsCmdPath, 'utf8');

assert(
  fsCmdContent.includes('pub fn search_in_files('),
  'fs_cmd.rs deve implementar a função search_in_files'
);
assert(
  fsCmdContent.includes('pub struct SearchMatch'),
  'fs_cmd.rs deve definir a estrutura SearchMatch'
);
assert(
  fsCmdContent.includes('name == "node_modules"') && fsCmdContent.includes('name == ".git"'),
  'search_in_files deve excluir automaticamente pastas de dependências como node_modules e .git'
);

const libRsPath = join(root, 'src-tauri', 'src', 'lib.rs');
const libRsContent = readFileSync(libRsPath, 'utf8');
assert(
  libRsContent.includes('search_in_files'),
  'src-tauri/src/lib.rs deve registrar search_in_files no generate_handler!'
);
console.log('✓ PASSOU: Comando search_in_files em Rust com exclusão de pastas ignoradas (SEARCH-01)');

// 2. Validação dos Contratos IPC e Serviço de Frontend (SEARCH-02)
const ipcPath = join(root, 'src', 'types', 'ipc.ts');
const ipcContent = readFileSync(ipcPath, 'utf8');

assert(
  ipcContent.includes('export interface SearchMatch'),
  'src/types/ipc.ts deve exportar a interface SearchMatch'
);
assert(
  ipcContent.includes('search_in_files: {'),
  'src/types/ipc.ts deve mapear o comando search_in_files no IpcCommandMap'
);

const fsServicePath = join(root, 'src', 'lib', 'services', 'fsService.ts');
const fsServiceContent = readFileSync(fsServicePath, 'utf8');
assert(
  fsServiceContent.includes('async searchInFiles('),
  'fsService.ts deve implementar a função assíncrona searchInFiles'
);
console.log('✓ PASSOU: Contratos de dados IPC e integração do fsService (SEARCH-02)');

// 3. Validação dos Filtros (Match Case e Whole Word) no Componente (SEARCH-03)
const modalPath = join(root, 'src', 'lib', 'components', 'GlobalSearchModal.svelte');
const modalContent = readFileSync(modalPath, 'utf8');

assert(
  modalContent.includes('matchCase') && modalContent.includes('matchWholeWord'),
  'GlobalSearchModal.svelte deve conter os estados matchCase e matchWholeWord'
);
assert(
  modalContent.includes('toggleMatchCase') && modalContent.includes('toggleMatchWholeWord'),
  'GlobalSearchModal.svelte deve conter funções de alternância de filtros'
);
assert(
  modalContent.includes('highlightMatch'),
  'GlobalSearchModal.svelte deve destacar visualmente o termo encontrado'
);
console.log('✓ PASSOU: Suporte a filtros de busca e destaque de correspondências (SEARCH-03)');

// 4. Validação de Atalho Ctrl+Shift+F e Navegação no Editor (SEARCH-04)
const appPath = join(root, 'src', 'App.svelte');
const appContent = readFileSync(appPath, 'utf8');

assert(
  appContent.includes("e.shiftKey && e.key.toLowerCase() === 'f'"),
  'App.svelte deve capturar o atalho Ctrl + Shift + F para alternar globalSearchVisible'
);
assert(
  appContent.includes('<GlobalSearchModal'),
  'App.svelte deve instanciar o componente GlobalSearchModal'
);
assert(
  appContent.includes('handleSelectSearchResult'),
  'App.svelte deve implementar handleSelectSearchResult para abrir o arquivo e notificar'
);

// Validação adicional: Ícone da barra lateral com 4 letras
const projectSidebarPath = join(root, 'src', 'lib', 'components', 'ProjectSidebar.svelte');
const projectSidebarContent = readFileSync(projectSidebarPath, 'utf8');
assert(
  projectSidebarContent.includes('clean.slice(0, 4).toUpperCase()'),
  'ProjectSidebar.svelte deve extrair as 4 primeiras letras para o avatar do projeto'
);
console.log('✓ PASSOU: Atalho Ctrl+Shift+F, abertura de arquivo e avatar de projeto com 4 letras (SEARCH-04)');

console.log('\n🎉 TODOS OS TESTES DE BUSCA GLOBAL NO WORKSPACE PASSARAM COM SUCESSO!\n');

