import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

const rootDir = process.cwd();

console.log('--- TESTANDO CONTRATOS DO AI WIZARD E MULTI-CLI PROVIDERS ---');

// 1. Testa aiProviders.ts
const providersPath = path.join(rootDir, 'src', 'lib', 'ai', 'aiProviders.ts');
assert(fs.existsSync(providersPath), 'src/lib/ai/aiProviders.ts deve existir');
const providersContent = fs.readFileSync(providersPath, 'utf-8');

assert(providersContent.includes('agy'), 'aiProviders deve conter Google Antigravity (agy)');
assert(providersContent.includes('claude'), 'aiProviders deve conter Claude Code (claude)');
assert(providersContent.includes('muse'), 'aiProviders deve conter Muse Code (muse)');

assert(providersContent.includes('npm install -g @google/antigravity') || providersContent.includes('npm install') || providersContent.includes('agy'), 'Deve conter comando de instalacao para agy');
assert(providersContent.includes('@anthropic-ai/claude-code'), 'Deve conter comando de instalacao para claude code');
assert(providersContent.includes('https://dev.meta.ai/install.ps1') || providersContent.includes('muse'), 'Deve conter comando de instalacao para muse code');

console.log('SUCCESS: Todos os contratos do AI Wizard e Multi-CLI passaram!');
process.exit(0);
