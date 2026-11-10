import type { FileNode } from '../types';

/**
 * Utilitários para estimativa leve de tokens e formatação de contexto XML para prompts de IA.
 * Zero-bloat: sem dependências de tokenizadores BPE pesados.
 */

// Extensões de texto elegíveis para inclusão no empacotador de contexto
const TEXT_EXTENSIONS = new Set(['md', 'markdown', 'txt']);

// Pastas ignoradas na coleta recursiva de contexto
const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.specs',
  '.system_generated',
  'dist',
  'target',
  'build',
  '.svelte-kit'
]);

/**
 * Calcula a estimativa aproximada de tokens para um determinado texto (~4 caracteres por token).
 * Retorna estritamente 0 quando o texto estiver vazio ou possuir zero caracteres.
 */
export function estimateTokens(text: string | null | undefined): number {
  if (!text || text.length === 0) {
    return 0;
  }
  return Math.ceil(text.length / 4);
}

/**
 * Normaliza caminhos de arquivo para separadores universais com barras normais (/).
 */
export function normalizeContextPath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

/**
 * Formata um arquivo individual no padrão de tag XML de contexto.
 */
export function formatFileContext(relPath: string, content: string): string {
  const normalized = normalizeContextPath(relPath);
  const cleanContent = content ? content.trimEnd() : '';
  return `<file path="${normalized}">\n${cleanContent}\n</file>`;
}

/**
 * Envelopa um ou múltiplos blocos de arquivos na tag raiz <context>.
 */
export function wrapContext(filesXml: string): string {
  const trimmed = filesXml ? filesXml.trim() : '';
  if (!trimmed) {
    return `<context>\n</context>`;
  }
  return `<context>\n${trimmed}\n</context>`;
}

/**
 * Coleta recursivamente os caminhos de arquivos de texto (.md, .txt) a partir de um FileNode.
 */
export function collectTextFilePaths(node: FileNode): string[] {
  const results: string[] = [];

  function traverse(current: FileNode) {
    if (current.is_dir) {
      if (IGNORED_DIRS.has(current.name)) {
        return;
      }
      if (current.children) {
        for (const child of current.children) {
          traverse(child);
        }
      }
    } else {
      const ext = (current.extension || current.name.split('.').pop() || '').toLowerCase();
      if (TEXT_EXTENSIONS.has(ext)) {
        results.push(current.path);
      }
    }
  }

  traverse(node);
  return results;
}

/**
 * Gera o payload final XML de contexto a partir de uma lista de arquivos com seus caminhos e conteúdos.
 */
export function buildContextPayload(
  files: Array<{ path: string; content: string }>,
  baseDir?: string
): string {
  if (!files || files.length === 0) {
    return wrapContext('');
  }

  const normalizedBase = baseDir ? normalizeContextPath(baseDir).replace(/\/+$/, '') : '';

  const blocks = files.map((f) => {
    let relPath = normalizeContextPath(f.path);
    if (normalizedBase && relPath.startsWith(normalizedBase)) {
      relPath = relPath.slice(normalizedBase.length).replace(/^\/+/, '');
    }
    return formatFileContext(relPath, f.content);
  });

  return wrapContext(blocks.join('\n\n'));
}

