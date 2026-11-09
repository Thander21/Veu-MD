import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('--- TESTANDO CONTRATOS DO TERMINAL VEU LAB ---');

// 1. Testa ansiParser.ts: normalização de retorno de carro (\r) e limpeza ANSI
const ansiParserPath = path.join(rootDir, 'src', 'lib', 'utils', 'ansiParser.ts');
assert(fs.existsSync(ansiParserPath), 'ansiParser.ts deve existir');
const ansiParserContent = fs.readFileSync(ansiParserPath, 'utf-8');

assert(
  ansiParserContent.includes('normalizeCarriageReturns') || ansiParserContent.includes('\\r'),
  'ansiParser.ts deve conter rotina para tratar retornos de carro (\\r) de ConPTY'
);
assert(ansiParserContent.includes('ansiToHtml'), 'ansiParser.ts deve exportar ansiToHtml');
assert(ansiParserContent.includes('stripAnsi'), 'ansiParser.ts deve exportar stripAnsi');

// 2. Testa TerminalPanel.svelte: motor xterm padrão e convivência dual-engine
const termPanelPath = path.join(rootDir, 'src', 'lib', 'components', 'TerminalPanel.svelte');
assert(fs.existsSync(termPanelPath), 'TerminalPanel.svelte deve existir');
const termPanelContent = fs.readFileSync(termPanelPath, 'utf-8');

assert(
  termPanelContent.includes("terminalEngine: 'xterm' | 'veu' = 'xterm'"),
  'TerminalPanel deve iniciar xterm como motor padrão'
);
assert(
  termPanelContent.includes('TerminalVeuPanel'),
  'TerminalPanel deve carregar e montar TerminalVeuPanel'
);
assert(
  termPanelContent.includes('switchEngine'),
  'TerminalPanel deve conter switchEngine para alternar entre xterm e VeuLab'
);
assert(
  termPanelContent.includes('{#each allTabs as t (t.id)}'),
  'TerminalPanel deve manter containers de todos os projetos montados no DOM (allTabs)'
);
assert(
  termPanelContent.includes('convertEol: false'),
  'TerminalPanel deve desabilitar convertEol para compatibilidade com ConPTY e CLIs interativos'
);
assert(
  termPanelContent.includes("backend: 'conpty'"),
  'TerminalPanel deve configurar backend conpty para Windows'
);
assert(
  termPanelContent.includes('resizeTerminalIpc(id, term.cols, term.rows)'),
  'TerminalPanel deve sincronizar dimensões com ConPTY imediatamente após spawn'
);

// 3. Testa TerminalVeuPanel.svelte: cold start imediato, ciclo de vida e visibilidade de cursor
const veuPanelPath = path.join(rootDir, 'src', 'lib', 'components', 'TerminalVeuPanel.svelte');
assert(fs.existsSync(veuPanelPath), 'TerminalVeuPanel.svelte deve existir');
const veuPanelContent = fs.readFileSync(veuPanelPath, 'utf-8');

assert(
  veuPanelContent.includes('{#each allTabs as t (t.id)}'),
  'TerminalVeuPanel deve manter timelines de todos os projetos no DOM (allTabs)'
);
assert(
  veuPanelContent.includes('caret-color: var(--veu-h1-color'),
  'TerminalVeuPanel deve definir cor e visibilidade do cursor de digitação'
);
assert(
  veuPanelContent.includes('z-index: 2'),
  'TerminalVeuPanel deve posicionar o textarea acima do overlay de ghost suggestion'
);
assert(
  !veuPanelContent.includes('if (tab.blocks.length === 0) return;'),
  'TerminalVeuPanel não deve descartar a saída de inicialização do shell quando blocks estiver vazio'
);
assert(
  veuPanelContent.includes('stopCommand') || veuPanelContent.includes('\\x03'),
  'TerminalVeuPanel deve conter ação de interrupção (Ctrl+C)'
);
assert(
  veuPanelContent.includes('copyBlockOutput'),
  'TerminalVeuPanel deve conter ação de copiar saída'
);

// 4. Testa App.svelte: persistência multi-projeto e atalhos
const appPath = path.join(rootDir, 'src', 'App.svelte');
const appContent = fs.readFileSync(appPath, 'utf-8');
assert(
  appContent.includes('TerminalPanel') || appContent.includes('terminalOpen'),
  'App.svelte deve gerenciar o estado do terminal integrado'
);

console.log('SUCCESS: Todos os contratos do Terminal Veu Lab passaram!');
process.exit(0);

