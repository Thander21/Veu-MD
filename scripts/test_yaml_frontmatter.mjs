import assert from 'node:assert';
import { extractFrontmatter, attachFrontmatter, parseFrontmatterSummary } from '../src/lib/utils/frontmatter.ts';

console.log('--- TESTANDO YAML FRONTMATTER HANDLING (YAML-01..YAML-04) ---');

// 1. YAML-01: Isolamento de Frontmatter delimitado por triple-dash (LF)
const docLF = `---
title: "Documento de Teste"
tags: [arquitetura, veu]
date: 2026-11-10
---

# Titulo Principal

Este é o corpo do texto que deve permanecer limpo.
`;

const resLF = extractFrontmatter(docLF);
assert(resLF.frontmatter !== null, 'Frontmatter com quebras LF deve ser detectado');
assert(resLF.frontmatter.includes('title: "Documento de Teste"'), 'Deve extrair o titulo corretamente');
assert(!resLF.body.startsWith('---'), 'O corpo nao deve comecar com delimitadores ---');
assert(resLF.body.includes('# Titulo Principal'), 'O corpo deve conter o texto markdown');

// 2. YAML-01: Isolamento de Frontmatter com delimitadores CRLF (Windows)
const docCRLF = "---\r\ntitle: Post Windows\r\nauthor: Equipe Veu\r\n---\r\n\r\n# Conteudo CRLF\r\n";
const resCRLF = extractFrontmatter(docCRLF);
assert(resCRLF.frontmatter !== null, 'Frontmatter com quebras CRLF deve ser detectado');
assert(resCRLF.frontmatter.includes('author: Equipe Veu'), 'Deve extrair metadado author em CRLF');
assert(resCRLF.body.includes('# Conteudo CRLF'), 'Corpo deve reter markdown apos CRLF');

// 3. YAML-02: Resumo e parsing de metadados sem dependencias pesadas
const summary = parseFrontmatterSummary(resLF.frontmatter);
assert.strictEqual(summary.title, 'Documento de Teste', 'Deve limpar aspas e extrair titulo');
assert.strictEqual(summary.date, '2026-11-10', 'Deve extrair data');
assert(summary.tags.includes('arquitetura'), 'Deve reter tags');

// 4. YAML-03: Reanexacao fiel ao salvar no disco
const modifiedBody = '# Titulo Principal Editado\n\nNovo paragrafo salvo pelo usuario.';
const reconstructed = attachFrontmatter(modifiedBody, resLF.frontmatter);
assert(reconstructed.startsWith('---\n'), 'Documento reconstruido deve iniciar com ---');
assert(reconstructed.includes('title: "Documento de Teste"'), 'Documento reconstruido deve reter frontmatter original');
assert(reconstructed.includes('# Titulo Principal Editado'), 'Documento reconstruido deve conter corpo modificado');

// Roundtrip check: extrair o documento reconstruido deve produzir os mesmos metadados
const roundtrip = extractFrontmatter(reconstructed);
assert.strictEqual(roundtrip.frontmatter?.trim(), resLF.frontmatter?.trim(), 'Roundtrip deve preservar frontmatter byte-a-byte');
assert.strictEqual(roundtrip.body.trim(), modifiedBody.trim(), 'Roundtrip deve preservar o corpo modificado');

// 5. YAML-04: Documento comum sem frontmatter
const plainDoc = '# Apenas Texto\n\nNao ha metadados aqui.\n';
const resPlain = extractFrontmatter(plainDoc);
assert.strictEqual(resPlain.frontmatter, null, 'Arquivo sem frontmatter deve ter frontmatter nulo');
assert.strictEqual(resPlain.body, plainDoc, 'Corpo deve permanecer inalterado');

const savedPlain = attachFrontmatter(plainDoc, null);
assert.strictEqual(savedPlain, plainDoc, 'attachFrontmatter com nulo nao deve introduzir delimitadores');
assert(!savedPlain.includes('---'), 'Nenhum delimitador vazio deve ser gerado');

// 6. YAML-04: Linha divisoria (hr) no meio do texto NAO deve ser interpretada como frontmatter
const docWithHr = '# Topico 1\n\nTexto antes da linha.\n\n---\n\nTexto depois da divisao.';
const resHr = extractFrontmatter(docWithHr);
assert.strictEqual(resHr.frontmatter, null, 'Linha divisoria no meio nao deve virar frontmatter');
assert.strictEqual(resHr.body, docWithHr, 'Corpo com hr deve ser preservado integralmente');

// 7. Edge Cases: Frontmatter sem fechamento e documento vazio
const unclosedFm = '---\ntitle: Quebrado sem fim\ntexto corrido sem fechar';
const resUnclosed = extractFrontmatter(unclosedFm);
assert.strictEqual(resUnclosed.frontmatter, null, 'Frontmatter sem fechamento deve ser tratado com seguranca');

const emptyFmOnly = '---\ntitle: Apenas Metadados\n---';
const resEmptyBody = extractFrontmatter(emptyFmOnly);
assert(resEmptyBody.frontmatter !== null, 'Frontmatter sem corpo deve ser valido');
assert.strictEqual(resEmptyBody.body, '', 'Corpo deve ser vazio');

const reattachedEmpty = attachFrontmatter('', resEmptyBody.frontmatter);
assert(reattachedEmpty.startsWith('---\n') && reattachedEmpty.endsWith('---\n'), 'Reanexar com corpo vazio gera bloco valido');

console.log('✓ PASSOU: Todos os 7 testes de integridade e requisitos de Frontmatter YAML foram aprovados com sucesso!');
