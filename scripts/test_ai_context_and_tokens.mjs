import assert from 'node:assert';
import {
  estimateTokens,
  normalizeContextPath,
  formatFileContext,
  wrapContext,
  collectTextFilePaths,
  buildContextPayload
} from '../src/lib/utils/aiContext.ts';

console.log('--- TESTANDO AI CONTEXT DROPPER E TOKEN COUNTER (TOK-01..TOK-02, CTX-01..CTX-02) ---');

// 1. TOK-01: Estimativa ponderada de tokens (~4 caracteres por token)
const sampleText = 'Este é um texto de exemplo para o contador de tokens do Veu MD.';
const estimated = estimateTokens(sampleText);
assert.strictEqual(estimated, Math.ceil(sampleText.length / 4), 'Deve estimar tokens como Math.ceil(chars / 4)');
assert(estimated > 0, 'Texto nao vazio deve ter estimativa maior que zero');

// 2. TOK-02: Documento vazio retorna estritamente zero tokens
assert.strictEqual(estimateTokens(''), 0, 'String vazia deve retornar 0 tokens');
assert.strictEqual(estimateTokens(null), 0, 'null deve retornar 0 tokens');
assert.strictEqual(estimateTokens(undefined), 0, 'undefined deve retornar 0 tokens');

// 3. CTX-01: Formatador de arquivo unico em XML de contexto
const singleXml = formatFileContext('docs\\manual.md', '# Manual de Uso\n\nInstrucoes aqui.');
assert(singleXml.includes('<file path="docs/manual.md">'), 'Deve normalizar barras do Windows para barras normais');
assert(singleXml.includes('# Manual de Uso'), 'Deve conter o conteudo do arquivo');
assert(singleXml.endsWith('</file>'), 'Deve fechar a tag file');

const wrapped = wrapContext(singleXml);
assert(wrapped.startsWith('<context>\n'), 'Payload deve iniciar com tag <context>');
assert(wrapped.endsWith('\n</context>'), 'Payload deve finalizar com tag </context>');

// 4. CTX-02: Coleta recursiva de arquivos de texto e descarte de binarios/pastas restritas
const mockTree = {
  name: 'meu_projeto',
  path: '/workspace/meu_projeto',
  is_dir: true,
  children: [
    {
      name: 'README.md',
      path: '/workspace/meu_projeto/README.md',
      is_dir: false,
      extension: 'md'
    },
    {
      name: 'notes.txt',
      path: '/workspace/meu_projeto/notes.txt',
      is_dir: false,
      extension: 'txt'
    },
    {
      name: 'diagram.png',
      path: '/workspace/meu_projeto/diagram.png',
      is_dir: false,
      extension: 'png'
    },
    {
      name: 'docs',
      path: '/workspace/meu_projeto/docs',
      is_dir: true,
      children: [
        {
          name: 'guia.markdown',
          path: '/workspace/meu_projeto/docs/guia.markdown',
          is_dir: false,
          extension: 'markdown'
        }
      ]
    },
    {
      name: 'node_modules',
      path: '/workspace/meu_projeto/node_modules',
      is_dir: true,
      children: [
        {
          name: 'package.json',
          path: '/workspace/meu_projeto/node_modules/package.json',
          is_dir: false
        }
      ]
    },
    {
      name: '.git',
      path: '/workspace/meu_projeto/.git',
      is_dir: true,
      children: [
        {
          name: 'config',
          path: '/workspace/meu_projeto/.git/config',
          is_dir: false
        }
      ]
    }
  ]
};

const collected = collectTextFilePaths(mockTree);
assert.strictEqual(collected.length, 3, 'Deve coletar exatamente 3 arquivos (.md, .txt, .markdown)');
assert(collected.includes('/workspace/meu_projeto/README.md'), 'Deve incluir README.md');
assert(collected.includes('/workspace/meu_projeto/notes.txt'), 'Deve incluir notes.txt');
assert(collected.includes('/workspace/meu_projeto/docs/guia.markdown'), 'Deve incluir guia.markdown da subpasta');
assert(!collected.some((p) => p.includes('node_modules') || p.includes('.git')), 'Nao deve incluir node_modules ou .git');

// 5. CTX-02: Construcao de payload multi-arquivos com caminhos relativos
const filesToPack = [
  { path: '/workspace/meu_projeto/README.md', content: '# Veu MD' },
  { path: '/workspace/meu_projeto/docs/guia.markdown', content: 'Guia de Inicio' }
];

const multiPayload = buildContextPayload(filesToPack, '/workspace/meu_projeto');
assert(multiPayload.includes('<file path="README.md">'), 'Deve converter para caminho relativo contra baseDir');
assert(multiPayload.includes('<file path="docs/guia.markdown">'), 'Deve converter subpasta para caminho relativo');
assert(multiPayload.includes('# Veu MD') && multiPayload.includes('Guia de Inicio'), 'Deve incluir conteudos');
assert(multiPayload.startsWith('<context>\n') && multiPayload.endsWith('\n</context>'), 'Deve envelopar com tag raiz <context>');

console.log('✓ PASSOU: Todos os testes de AI Context Dropper e Token Counter foram aprovados com sucesso!');
