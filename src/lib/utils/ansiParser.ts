/**
 * Utilitário ultraleve para parser e higienização de sequências ANSI.
 * Converte códigos de estilo e cores ANSI em HTML semântico com classes CSS,
 * e remove caracteres brutos de controle de cursor.
 */

// Mapeamento de cores ANSI padrão (30-37 e 90-97)
const ANSI_COLOR_MAP: Record<number, string> = {
  30: 'ansi-black',
  31: 'ansi-red',
  32: 'ansi-green',
  33: 'ansi-yellow',
  34: 'ansi-blue',
  35: 'ansi-magenta',
  36: 'ansi-cyan',
  37: 'ansi-white',
  90: 'ansi-bright-black',
  91: 'ansi-bright-red',
  92: 'ansi-bright-green',
  93: 'ansi-bright-yellow',
  94: 'ansi-bright-blue',
  95: 'ansi-bright-magenta',
  96: 'ansi-bright-cyan',
  97: 'ansi-bright-white'
};

const ANSI_BG_MAP: Record<number, string> = {
  40: 'ansi-bg-black',
  41: 'ansi-bg-red',
  42: 'ansi-bg-green',
  43: 'ansi-bg-yellow',
  44: 'ansi-bg-blue',
  45: 'ansi-bg-magenta',
  46: 'ansi-bg-cyan',
  47: 'ansi-bg-white'
};

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Remove todas as sequências de escape ANSI e caracteres de controle, retornando texto puro.
 */
export function stripAnsi(text: string): string {
  if (!text) return '';
  return text
    // Remove OSC sequences (window title, etc): \x1b]...\x07
    .replace(/\x1b\][^\x07\x1b]*(\x07|\x1b\\)/g, '')
    // Remove todas as sequências CSI: \x1b[...[a-zA-Z]
    .replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, '')
    // Remove caracteres nulos e de sino
    .replace(/[\x00\x07]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}

/**
 * Converte texto recebido do terminal PTY contendo sequências ANSI em HTML formatado.
 */
export function ansiToHtml(rawText: string): string {
  if (!rawText) return '';

  // 1. Limpa sequências de janela OSC (ex: prompt title do PowerShell / bash)
  let text = rawText.replace(/\x1b\][^\x07\x1b]*(\x07|\x1b\\)/g, '');

  // 2. Limpa sequências CSI que não sejam SGR (m)
  text = text.replace(/\x1b\[[0-9;?]*[A-LN-Za-z]/g, '');

  // 3. Normaliza quebras de linha
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Divide por sequências SGR: \x1b[...m
  const parts = text.split(/(\x1b\[[0-9;]*m)/g);

  let htmlResult = '';
  const activeClasses = new Set<string>();

  for (const part of parts) {
    if (!part) continue;

    const match = part.match(/^\x1b\[([0-9;]*)m$/);
    if (match) {
      const codeStr = match[1] || '0';
      const codes = codeStr.split(';').map((c) => parseInt(c, 10) || 0);

      for (let i = 0; i < codes.length; i++) {
        const code = codes[i];
        if (code === 0) {
          activeClasses.clear();
        } else if (code === 1) {
          activeClasses.add('ansi-bold');
        } else if (code === 2) {
          activeClasses.add('ansi-dim');
        } else if (code === 3) {
          activeClasses.add('ansi-italic');
        } else if (code === 4) {
          activeClasses.add('ansi-underline');
        } else if (code === 22) {
          activeClasses.delete('ansi-bold');
          activeClasses.delete('ansi-dim');
        } else if (code === 23) {
          activeClasses.delete('ansi-italic');
        } else if (code === 24) {
          activeClasses.delete('ansi-underline');
        } else if (code === 39) {
          // Reset cor do texto
          for (const cls of Array.from(activeClasses)) {
            if (
              cls.startsWith('ansi-') &&
              !cls.startsWith('ansi-bg-') &&
              cls !== 'ansi-bold' &&
              cls !== 'ansi-italic' &&
              cls !== 'ansi-underline' &&
              cls !== 'ansi-dim'
            ) {
              activeClasses.delete(cls);
            }
          }
        } else if (code === 49) {
          // Reset fundo
          for (const cls of Array.from(activeClasses)) {
            if (cls.startsWith('ansi-bg-')) {
              activeClasses.delete(cls);
            }
          }
        } else if (ANSI_COLOR_MAP[code]) {
          // Remove cor de texto anterior
          for (const cls of Array.from(activeClasses)) {
            if (
              cls.startsWith('ansi-') &&
              !cls.startsWith('ansi-bg-') &&
              cls !== 'ansi-bold' &&
              cls !== 'ansi-italic' &&
              cls !== 'ansi-underline' &&
              cls !== 'ansi-dim'
            ) {
              activeClasses.delete(cls);
            }
          }
          activeClasses.add(ANSI_COLOR_MAP[code]);
        } else if (ANSI_BG_MAP[code]) {
          for (const cls of Array.from(activeClasses)) {
            if (cls.startsWith('ansi-bg-')) {
              activeClasses.delete(cls);
            }
          }
          activeClasses.add(ANSI_BG_MAP[code]);
        }
      }
    } else {
      // Texto normal
      const safe = escapeHtml(part);
      if (activeClasses.size > 0) {
        const classNames = Array.from(activeClasses).join(' ');
        htmlResult += `<span class="${classNames}">${safe}</span>`;
      } else {
        htmlResult += safe;
      }
    }
  }

  return htmlResult;
}
