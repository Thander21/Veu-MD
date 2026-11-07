import fs from 'node:fs';
import path from 'node:path';

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
}

const rootDir = process.cwd();

// 1. Testa index.html e splash screen
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
assert(indexHtml.includes('id="splash-screen"'), 'index.html deve conter contêiner #splash-screen');
assert(indexHtml.includes('veu-logo.svg'), 'index.html deve referenciar veu-logo.svg no splash screen');
assert(indexHtml.includes('#0e0b16') || indexHtml.includes('background-color'), 'index.html deve possuir cor de fundo escura inicial');

// 2. Testa tauri.conf.json
const tauriConf = fs.readFileSync(path.join(rootDir, 'src-tauri', 'tauri.conf.json'), 'utf-8');
assert(tauriConf.includes('backgroundColor') || tauriConf.includes('theme'), 'tauri.conf.json deve configurar fundo escuro ou tema escuro na janela');

// 3. Testa ProjectSidebar.svelte
const projectSidebar = fs.readFileSync(path.join(rootDir, 'src', 'lib', 'components', 'ProjectSidebar.svelte'), 'utf-8');
assert(projectSidebar.includes('toggle-sidebar-btn') || projectSidebar.includes('onToggleSidebar'), 'ProjectSidebar deve conter botão fixo de alternância da barra lateral');

// 4. Testa Sidebar.svelte
const sidebar = fs.readFileSync(path.join(rootDir, 'src', 'lib', 'components', 'Sidebar.svelte'), 'utf-8');
assert(sidebar.includes('sidebar-top-header') || sidebar.includes('Trocar Projeto'), 'Sidebar deve conter cabeçalho superior com Trocar Projeto');
assert(!sidebar.includes('wizard-btn') && !sidebar.includes('Wand2'), 'Sidebar não deve mais conter o botão de Wizard');
assert(sidebar.includes('resizer') || sidebar.includes('handleMouseDown') || sidebar.includes('resize'), 'Sidebar deve possuir alça interativa de redimensionamento');

// 5. Testa TopBar.svelte
const topBar = fs.readFileSync(path.join(rootDir, 'src', 'lib', 'components', 'TopBar.svelte'), 'utf-8');
assert(!topBar.includes('brand-logo-img'), 'TopBar não deve conter o logotipo da marca');
assert(!topBar.includes('brand-title'), 'TopBar não deve conter o título V.E.U. MD');
assert(topBar.includes('BotMessageSquare') && topBar.includes('Chat IA'), 'TopBar deve conter o botão de Chat IA com ícone BotMessageSquare ao lado do Terminal');

// 6. Testa AiAssistantPanel.svelte
const aiPanel = fs.readFileSync(path.join(rootDir, 'src', 'lib', 'components', 'AiAssistantPanel.svelte'), 'utf-8');
assert(aiPanel.includes('BotMessageSquare') && aiPanel.includes('Chat IA'), 'AiAssistantPanel deve exibir título e ícone Chat IA');

console.log('SUCCESS: Todos os contratos de layout, splash screen e barra lateral passaram!');
process.exit(0);

