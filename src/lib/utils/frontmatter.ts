/**
 * Utilitários para extração, reconstituição e resumo de Frontmatter YAML em arquivos Markdown.
 * Zero dependências externas para preservar a meta de leveza do Veu MD.
 */

export interface FrontmatterResult {
  frontmatter: string | null;
  body: string;
}

// Regex canônica que captura delimitadores '---' estritamente no início do arquivo
const FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

/**
 * Isola o bloco YAML frontmatter do corpo do documento Markdown.
 * Caso o documento não possua frontmatter no topo, retorna o corpo integral e frontmatter nulo.
 */
export function extractFrontmatter(rawContent: string): FrontmatterResult {
  if (!rawContent || !rawContent.startsWith('---')) {
    return { frontmatter: null, body: rawContent || '' };
  }

  const match = rawContent.match(FRONTMATTER_REGEX);
  if (!match) {
    return { frontmatter: null, body: rawContent };
  }

  const frontmatter = match[1];
  const body = rawContent.slice(match[0].length);

  return {
    frontmatter,
    body
  };
}

/**
 * Reconstitui o documento Markdown prepending o frontmatter delimitado intacto.
 * Se frontmatter for nulo ou vazio, retorna o body puro sem introduzir delimitadores vazios.
 */
export function attachFrontmatter(body: string, frontmatter: string | null): string {
  if (!frontmatter || !frontmatter.trim()) {
    return body || '';
  }

  const trimmedFm = frontmatter.trim();
  const cleanBody = (body || '').replace(/^\r?\n+/, '');

  if (!cleanBody) {
    return `---\n${trimmedFm}\n---\n`;
  }

  return `---\n${trimmedFm}\n---\n\n${cleanBody}`;
}

/**
 * Extrai pares chave-valor escalares comuns (title, tags, date, author, description)
 * para exibição em badges visuais sem carregar bibliotecas pesadas de parsing YAML.
 */
export function parseFrontmatterSummary(frontmatter: string | null): Record<string, string> {
  const summary: Record<string, string> = {};
  if (!frontmatter) return summary;

  const lines = frontmatter.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^([a-zA-Z0-9_-]+)\s*:\s*(.*)$/);
    if (match) {
      const key = match[1].toLowerCase();
      let val = match[2].trim();
      // Remove aspas simples ou duplas envolventes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1).trim();
      }
      summary[key] = val;
    }
  }

  return summary;
}

