import assert from 'node:assert';
import { formatDocument } from '../src/lib/utils/codeFormatter.ts';

console.log('--- TESTANDO CODE FORMATTER E REQUISITOS ---');

// 1. JSON
const uglyJson = '{"name":"veu","version":"0.1.0","tags":[1,2,3]}';
const resJson = formatDocument(uglyJson, 'package.json');
assert(resJson.success, 'JSON deve formatar com sucesso');
assert(resJson.formattedText.includes('{\n  "name": "veu",'), 'JSON deve ter indentação de 2 espaços');

// 2. HTML
const uglyHtml = '<div><p><span>Hello</span></p></div>';
const resHtml = formatDocument(uglyHtml, 'index.html');
assert(resHtml.success, 'HTML deve formatar com sucesso');
assert(resHtml.formattedText.includes('<div>\n  <p>\n    <span>\n      Hello\n    </span>\n  </p>\n</div>'), 'HTML deve ser indentado hierarquicamente');

// 3. JavaScript / TypeScript
const uglyJs = 'function test(){\nconst a = 1;\nif(a){\nconsole.log(a);\n}\n}';
const resJs = formatDocument(uglyJs, 'app.ts');
assert(resJs.success, 'JS/TS deve formatar com sucesso');
assert(resJs.formattedText.includes('function test() {') || resJs.formattedText.includes('  const a = 1;'), 'JS/TS deve ter indentação de bloco');

// 4. Markdown
const uglyMd = '# Title   \n\n\n\nParagraph text   \n';
const resMd = formatDocument(uglyMd, 'README.md');
assert(resMd.success, 'Markdown deve formatar com sucesso');
assert(!resMd.formattedText.includes('\n\n\n'), 'Markdown não deve ter quebras triplas');

console.log('SUCCESS: Todos os testes do formatador passaram com sucesso!');

