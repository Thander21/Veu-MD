import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

console.log('🧪 Iniciando Testes Automatizados de Split View / Edição Lado a Lado (SPLIT-01..SPLIT-04)...\n');

const root = process.cwd();

// 1. Validação de Estados e Layout de Particionamento (SPLIT-01)
const appPath = join(root, 'src', 'App.svelte');
const appContent = readFileSync(appPath, 'utf8');

assert(
  appContent.includes('let splitActive = false;'),
  'App.svelte deve inicializar o estado splitActive como false'
);
assert(
  appContent.includes("splitOrientation: 'vertical' | 'horizontal' = 'vertical'"),
  'App.svelte deve suportar orientação vertical e horizontal'
);
assert(
  appContent.includes('secondaryTabId: string | null = null;'),
  'App.svelte deve conter o ponteiro secondaryTabId para o documento secundário'
);
assert(
  appContent.includes('class="pane-container primary-pane"') && appContent.includes('class="pane-container secondary-pane"'),
  'App.svelte deve renderizar os contêineres primary-pane e secondary-pane'
);

const topBarPath = join(root, 'src', 'lib', 'components', 'TopBar.svelte');
const topBarContent = readFileSync(topBarPath, 'utf8');
assert(
  topBarContent.includes('splitActive') && topBarContent.includes('onToggleSplit'),
  'TopBar.svelte deve declarar props splitActive e onToggleSplit'
);
assert(
  topBarContent.includes('Dividir Editor Lado a Lado (Ctrl+\\)'),
  'TopBar.svelte deve conter o botão de ação para dividir o editor'
);
console.log('✓ PASSOU: Estados reativos e contêineres duplos com botão na TopBar (SPLIT-01)');

// 2. Validação da Alça de Redimensionamento (SPLIT-02)
assert(
  appContent.includes('class="split-resizer"'),
  'App.svelte deve renderizar a alça split-resizer'
);
assert(
  appContent.includes('on:mousedown={startResizeSplit}'),
  'split-resizer deve acionar o manipulador startResizeSplit ao clicar'
);
assert(
  appContent.includes('Math.max(20, Math.min(80, startRatio + percentDelta))'),
  'startResizeSplit deve limitar a proporção entre 20% e 80% para evitar colapso de painel'
);
console.log('✓ PASSOU: Alça interativa split-resizer e limites de redimensionamento proporcional (SPLIT-02)');

// 3. Validação de Edição e Auto-Save Isolado (SPLIT-03)
assert(
  appContent.includes('function handleSecondaryEditorContentChange('),
  'App.svelte deve conter função dedicada para tratar alterações no editor secundário'
);
assert(
  appContent.includes('autoSaveTimeouts.set(tabId, timeout)'),
  'handleSecondaryEditorContentChange deve gerenciar o auto-save isolado pelo ID da aba secundária'
);
assert(
  appContent.includes('saveTab(t)'),
  'handleSecondaryEditorContentChange deve disparar o salvamento determinístico do documento secundário'
);
console.log('✓ PASSOU: Edição independente e persistência assíncrona por tab ID (SPLIT-03)');

// 4. Validação de Atalho e Restauração de Painel Único (SPLIT-04)
assert(
  appContent.includes("e.key === '\\\\'") && appContent.includes('toggleSplitView()'),
  'App.svelte deve capturar o atalho Ctrl + \\ para alternar a divisão'
);
assert(
  appContent.includes('on:click={() => (splitActive = false)}'),
  'Cabeçalho do painel secundário deve permitir fechar o split com retorno ao painel único'
);
console.log('✓ PASSOU: Atalho canônico Ctrl+\\ e restauração fluida de painel único (SPLIT-04)');

console.log('\n🎉 TODOS OS TESTES DE SPLIT VIEW PASSARAM COM SUCESSO!\n');
