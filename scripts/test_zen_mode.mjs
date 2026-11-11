import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

console.log('🧪 Iniciando Testes Automatizados do Modo Zen / Sem Distrações (ZEN-01..ZEN-04)...\n');

const root = process.cwd();

// 1. Validação de Estado e Ocultação de Barras no App.svelte (ZEN-01 & ZEN-02)
const appPath = join(root, 'src', 'App.svelte');
const appContent = readFileSync(appPath, 'utf8');

assert(
  appContent.includes('let zenMode = false;'),
  'App.svelte deve inicializar o estado zenMode como false'
);

assert(
  appContent.includes('function toggleZenMode('),
  'App.svelte deve conter a função toggleZenMode para alternar o Modo Zen'
);

assert(
  appContent.includes('class:zen-mode-active={zenMode}'),
  'App.svelte deve aplicar a classe zen-mode-active ao contêiner principal'
);

assert(
  appContent.includes('.app-layout.zen-mode-active :global(.project-sidebar)') &&
  appContent.includes('.app-layout.zen-mode-active :global(.sidebar)') &&
  appContent.includes('.app-layout.zen-mode-active :global(.topbar)') &&
  appContent.includes('.app-layout.zen-mode-active :global(.tabbar)') &&
  appContent.includes('.app-layout.zen-mode-active :global(.status-bar)') &&
  appContent.includes('.app-layout.zen-mode-active :global(.terminal-panel)'),
  'CSS deve ocultar todas as barras circundantes no Modo Zen com display: none !important'
);

console.log('✓ PASSOU: Estado zenMode e ocultação total de barras circundantes (ZEN-01, ZEN-02)');

// 2. Validação do Botão de Ação na TopBar e Atalhos de Teclado (ZEN-01 & ZEN-04)
const topBarPath = join(root, 'src', 'lib', 'components', 'TopBar.svelte');
const topBarContent = readFileSync(topBarPath, 'utf8');

assert(
  topBarContent.includes('export let zenMode: boolean = false;') &&
  topBarContent.includes('export let onToggleZenMode: (() => void) | undefined = undefined;'),
  'TopBar.svelte deve declarar as props zenMode e onToggleZenMode'
);

assert(
  topBarContent.includes('title="Modo Zen / Foco Sem Distrações (F11 ou Ctrl+Shift+Enter)"') &&
  topBarContent.includes('<Maximize2 size={16} />'),
  'TopBar.svelte deve conter o botão com ícone Maximize2 no grupo de ações'
);

assert(
  appContent.includes("e.key === 'F11'") &&
  appContent.includes("(e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Enter'"),
  'App.svelte deve escutar os atalhos F11 e Ctrl+Shift+Enter para alternar o Modo Zen'
);

assert(
  appContent.includes("e.key === 'Escape' && zenMode"),
  'App.svelte deve restaurar o layout anterior ao pressionar Escape (ZEN-04)'
);

console.log('✓ PASSOU: Botão de ação na TopBar e atalhos globais F11 / Ctrl+Shift+Enter / Escape (ZEN-01, ZEN-04)');

// 3. Validação da Pílula Flutuante Discreta e Contagem de Palavras (ZEN-03)
assert(
  appContent.includes('class="zen-floating-pill"'),
  'App.svelte deve renderizar a pílula flutuante zen-floating-pill quando o Modo Zen está ativo'
);

assert(
  appContent.includes('class="zen-word-count"') &&
  appContent.includes('{stats.words} palavras'),
  'zen-floating-pill deve exibir a contagem de palavras atualizada'
);

assert(
  appContent.includes('class="zen-exit-btn"') &&
  appContent.includes('on:click={() => (zenMode = false)}'),
  'zen-floating-pill deve conter botão zen-exit-btn para desativar o Modo Zen'
);

console.log('✓ PASSOU: Pílula flutuante com indicador de palavras e botão de saída rápida (ZEN-03)');

console.log('\n🎉 TODOS OS TESTES DO MODO ZEN PASSARAM COM SUCESSO!\n');

