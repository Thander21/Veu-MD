import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

const rootDir = process.cwd();

console.log('--- TESTANDO CONTRATOS DO TEMA CATPPUCCIN MOCHA E SUPORTE A ARQUIVOS ---');

// 1. Testa defaultThemes.ts
const themesPath = path.join(rootDir, 'src', 'lib', 'theme', 'defaultThemes.ts');
assert(fs.existsSync(themesPath), 'defaultThemes.ts deve existir');
const themesContent = fs.readFileSync(themesPath, 'utf-8');

// 1.1 Tema oficial Veu MD deve ter Catppuccin Mocha e fonte Roboto
assert(themesContent.includes("id: 'veumd'"), 'Deve conter tema oficial veumd');
assert(themesContent.includes('#11111b') || themesContent.includes('#181825') || themesContent.includes('#1e1e2e'), 'veumd deve usar paleta Catppuccin Mocha (#11111b / #181825 / #1e1e2e)');
assert(themesContent.includes('#cba6f7') || themesContent.includes('#f5c2e7'), 'veumd deve usar cores dos veus Catppuccin (#cba6f7 / #f5c2e7)');
assert(themesContent.includes('Roboto'), 'veumd deve ter Roboto como fonte padrão');

// 1.2 Veu Crepúsculo renomeado sem "(Padrão)"
assert(themesContent.includes("name: 'Veu Crepúsculo'"), "Tema legado veu deve ser nomeado 'Veu Crepúsculo'");
assert(!themesContent.includes("V.E.U. Crepúsculo (Padrão)"), "Tema legado veu não deve mais conter o sufixo (Padrão)");

// 2. Testa ThemeSettings.svelte: Fontes de IDE
const themeSettingsPath = path.join(rootDir, 'src', 'lib', 'components', 'ThemeSettings.svelte');
assert(fs.existsSync(themeSettingsPath), 'ThemeSettings.svelte deve existir');
const themeSettingsContent = fs.readFileSync(themeSettingsPath, 'utf-8');

assert(themeSettingsContent.includes('Roboto'), 'ThemeSettings deve listar fonte Roboto');
assert(themeSettingsContent.includes('JetBrains Mono'), 'ThemeSettings deve listar fonte JetBrains Mono');
assert(themeSettingsContent.includes('Fira Code'), 'ThemeSettings deve listar fonte Fira Code');
assert(themeSettingsContent.includes('Cascadia Code'), 'ThemeSettings deve listar fonte Cascadia Code');
assert(themeSettingsContent.includes('Source Code Pro'), 'ThemeSettings deve listar fonte Source Code Pro');

// 3. Testa FileTreeNode.svelte e Sidebar.svelte: ícones e abertura de arquivos
const treeNodePath = path.join(rootDir, 'src', 'lib', 'components', 'FileTreeNode.svelte');
assert(fs.existsSync(treeNodePath), 'FileTreeNode.svelte deve existir');
const treeNodeContent = fs.readFileSync(treeNodePath, 'utf-8');

// Arquivos conhecidos
assert(treeNodeContent.includes('html') || treeNodeContent.includes('json') || treeNodeContent.includes('css'), 'FileTreeNode deve mapear arquivos conhecidos html/json/css');
assert(treeNodeContent.includes('ts') || treeNodeContent.includes('jsx') || treeNodeContent.includes('mjs'), 'FileTreeNode deve mapear js/ts e variantes');

console.log('SUCCESS: Todos os contratos do tema Catppuccin Mocha e arquivos conhecidos passaram!');
process.exit(0);

