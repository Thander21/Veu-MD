/**
 * Formatador de código leve e nativo para Veu MD
 * Suporta JSON, HTML, JavaScript/TypeScript, CSS e Markdown sem runtimes externos pesados
 */

export interface FormatResult {
  success: boolean;
  formattedText?: string;
  error?: string;
}

/**
 * Formata um arquivo baseado na extensão
 */
export function formatDocument(code: string, fileNameOrExt: string): FormatResult {
  if (!code || code.trim() === '') {
    return { success: true, formattedText: code };
  }

  const ext = fileNameOrExt.includes('.')
    ? (fileNameOrExt.split('.').pop() || '').toLowerCase()
    : fileNameOrExt.toLowerCase();

  try {
    switch (ext) {
      case 'json':
      case 'jsonc':
        return formatJson(code);

      case 'html':
      case 'htm':
        return formatHtml(code);

      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'mjs':
      case 'cjs':
      case 'css':
      case 'scss':
      case 'less':
        return formatCStyleCode(code);

      case 'md':
      case 'markdown':
      default:
        return formatGenericText(code);
    }
  } catch (err: any) {
    return {
      success: false,
      error: `Erro ao formatar (${ext}): ${err?.message || String(err)}`
    };
  }
}

/**
 * Formata JSON com indentação padrão de 2 espaços
 */
function formatJson(code: string): FormatResult {
  try {
    const parsed = JSON.parse(code);
    const formatted = JSON.stringify(parsed, null, 2);
    return { success: true, formattedText: formatted };
  } catch (err: any) {
    return {
      success: false,
      error: `JSON inválido: ${err?.message || 'Erro de sintaxe'}`
    };
  }
}

/**
 * Formata HTML com indentação hierárquica e tratamento de tags autocontidas
 */
function formatHtml(code: string): FormatResult {
  const voidTags = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr', '!doctype'
  ]);

  let formatted = '';
  let indent = 0;
  const tab = '  ';

  // Tokeniza tags e texto
  const tokens = code.replace(/>\s*</g, '><').match(/<[^>]+>|[^<]+/g) || [];

  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('<!--')) {
      // Comentário
      formatted += tab.repeat(indent) + trimmed + '\n';
    } else if (trimmed.startsWith('</')) {
      // Tag de fechamento
      indent = Math.max(0, indent - 1);
      formatted += tab.repeat(indent) + trimmed + '\n';
    } else if (trimmed.startsWith('<')) {
      // Tag de abertura
      const tagNameMatch = trimmed.match(/^<([a-zA-Z0-9\-!]+)/);
      const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : '';
      const isSelfClosing = trimmed.endsWith('/>') || voidTags.has(tagName);

      formatted += tab.repeat(indent) + trimmed + '\n';

      if (!isSelfClosing) {
        indent++;
      }
    } else {
      // Conteúdo de texto
      formatted += tab.repeat(indent) + trimmed + '\n';
    }
  }

  return { success: true, formattedText: formatted.trimEnd() + '\n' };
}

/**
 * Formata linguagens estilo C (JS, TS, CSS) com alinhamento de chaves
 */
function formatCStyleCode(code: string): FormatResult {
  const lines = code.split('\n');
  let indent = 0;
  const tab = '  ';
  const result: string[] = [];

  for (let rawLine of lines) {
    let line = rawLine.trim();

    if (line.length === 0) {
      if (result.length > 0 && result[result.length - 1] !== '') {
        result.push('');
      }
      continue;
    }

    // Conta chaves e colchetes de fechamento no início da linha
    const openBraces = (line.match(/[\{\[\(]/g) || []).length;
    const closeBraces = (line.match(/[\}\]\)]/g) || []).length;

    // Se a linha começa com fechamento, reduz indentação antes de imprimir
    if (/^[\}\]\)]/.test(line)) {
      indent = Math.max(0, indent - 1);
    }

    result.push(tab.repeat(indent) + line);

    // Ajusta indentação para a próxima linha
    const diff = openBraces - closeBraces;
    if (!/^[\}\]\)]/.test(line)) {
      indent = Math.max(0, indent + diff);
    } else if (diff > 0) {
      indent = Math.max(0, indent + diff);
    }
  }

  return { success: true, formattedText: result.join('\n') + '\n' };
}

/**
 * Formata texto genérico e Markdown removendo espaços desnecessários
 */
function formatGenericText(code: string): FormatResult {
  const lines = code.split('\n');
  const result: string[] = [];

  for (const line of lines) {
    result.push(line.trimEnd());
  }

  // Remove quebras triplas consecutivas
  let cleaned = result.join('\n');
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return { success: true, formattedText: cleaned.trimEnd() + '\n' };
}

