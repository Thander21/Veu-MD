/**
 * Utilitário ultraleve para parser e higienização de sequências ANSI.
 * Converte códigos de estilo e cores ANSI em HTML semântico com classes CSS e estilos RGB,
 * e processa caracteres de controle de cursor, carriage return e limpeza de linha.
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
  47: 'ansi-bg-white',
  100: 'ansi-bg-bright-black',
  101: 'ansi-bg-bright-red',
  102: 'ansi-bg-bright-green',
  103: 'ansi-bg-bright-yellow',
  104: 'ansi-bg-bright-blue',
  105: 'ansi-bg-bright-magenta',
  106: 'ansi-bg-bright-cyan',
  107: 'ansi-bg-bright-white'
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
 * Converte índice de cor da paleta ANSI de 256 cores para representação CSS rgb/hex.
 */
function color256ToCss(code: number): string {
  if (code < 16) {
    const stdColors = [
      '#000000', '#cd0000', '#00cd00', '#cdcd00', '#0000ee', '#cd00cd', '#00cdcd', '#e5e5e5',
      '#7f7f7f', '#ff0000', '#00ff00', '#ffff00', '#5c5cff', '#ff00ff', '#00ffff', '#ffffff'
    ];
    return stdColors[code] || '#ffffff';
  }
  if (code >= 232) {
    const gray = 8 + (code - 232) * 10;
    return `rgb(${gray}, ${gray}, ${gray})`;
  }
  const c = code - 16;
  const steps = [0, 95, 135, 175, 215, 255];
  const r = steps[Math.floor(c / 36)] || 0;
  const g = steps[Math.floor((c % 36) / 6)] || 0;
  const b = steps[c % 6] || 0;
  return `rgb(${r}, ${g}, ${b})`;
}

export { resolveCarriageReturns as normalizeCarriageReturns };

/**
 * Processa carriage return (\r), sequências de limpeza de linha (\x1b[2K, \x1b[K)
 * e reposicionamento de cursor (\x1b[1A, \x1b[1B), simulando o comportamento de
 * sobreposição em terminais interativos (spinners, progresso, vite, cargo, npm).
 */
export function resolveCarriageReturns(raw: string): string {
  if (!raw) return '';

  // Limpa consultas de protocolo Kitty e cursor leakers (\x1b[>4;2m, \x1b[=5;1u, \x1b[0 q)
  let text = raw
    .replace(/\x1b\[[>=][0-9;]*[a-zA-Z]/g, '')
    .replace(/\x1b\[0\s*q/g, '')
    .replace(/\x1b\?25[hl]/g, '')
    .replace(/\r\n/g, '\n');

  if (
    !text.includes('\r') &&
    !text.includes('\x1b[') &&
    !text.includes('\x08')
  ) {
    return text;
  }

  // Emulação leve de matriz virtual de linhas para evitar sobreposição desordenada de spinners
  const lines: string[] = [''];
  let cursor = 0;

  // Quebra por tokens de controle (\n, \r, \x08, sequências CSI de cursor/limpeza)
  const tokens = text.split(/(\n|\r|\x08|\x1b\[[0-9;]*[A-Za-z])/g);

  for (const token of tokens) {
    if (!token) continue;

    if (token === '\n') {
      cursor++;
      if (cursor >= lines.length) {
        lines.push('');
      }
    } else if (token === '\r') {
      // Retorna ao início da linha atual
      lines[cursor] = '\r' + lines[cursor];
    } else if (token === '\x08') {
      if (lines[cursor].length > 0) {
        lines[cursor] = lines[cursor].slice(0, -1);
      }
    } else if (token.startsWith('\x1b[')) {
      const match = token.match(/^\x1b\[([0-9;]*)([A-Za-z])$/);
      if (match) {
        const count = parseInt(match[1], 10) || 1;
        const cmd = match[2];

        if (cmd === 'A') {
          // Cursor para cima (ex: spinners de múltiplas linhas)
          cursor = Math.max(0, cursor - count);
        } else if (cmd === 'B') {
          // Cursor para baixo
          cursor = cursor + count;
          while (lines.length <= cursor) {
            lines.push('');
          }
        } else if (cmd === 'K') {
          // Limpeza de linha (0K = do cursor ao fim, 2K = linha inteira)
          lines[cursor] = '';
        } else if (cmd === 'm') {
          // Mantém código SGR de cor e estilo
          lines[cursor] += token;
        }
      }
    } else {
      // Texto normal
      if (lines[cursor].startsWith('\r')) {
        const prev = lines[cursor].substring(1);
        lines[cursor] = token.length >= prev.length ? token : token + prev.slice(token.length);
      } else {
        lines[cursor] += token;
      }
    }
  }

  return lines.map((l) => l.replace(/^\r+/, '')).join('\n');
}

/**
 * Remove todas as sequências de escape ANSI e caracteres de controle, retornando texto puro.
 */
export function stripAnsi(text: string): string {
  if (!text) return '';
  const resolved = resolveCarriageReturns(text);
  return resolved
    // Remove OSC sequences (window title, etc): \x1b]...\x07
    .replace(/\x1b\][^\x07\x1b]*(\x07|\x1b\\)/g, '')
    // Remove sequências CSI privadas (como [?25h, [>4;2m, [=5;1u)
    .replace(/\x1b\[[?>=]?[0-9;]*[a-zA-Z]/g, '')
    // Remove todas as sequências CSI comuns
    .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '')
    // Remove caracteres nulos e de sino
    .replace(/[\x00\x07]/g, '');
}

/**
 * Converte texto recebido do terminal PTY contendo sequências ANSI em HTML formatado com alta fidelidade.
 * Suporta cores padrão, bright, 256-cores e Truecolor (24-bit RGB) para CLIs modernos como agy.
 */
export function ansiToHtml(rawText: string): string {
  if (!rawText) return '';

  const cleanCr = resolveCarriageReturns(rawText);

  // 1. Limpa sequências de janela OSC (ex: prompt title do PowerShell / bash)
  let text = cleanCr.replace(/\x1b\][^\x07\x1b]*(\x07|\x1b\\)/g, '');

  // 2. Limpa sequências CSI de controle de cursor e tela que não sejam SGR (m)
  text = text.replace(/\x1b\[[?>=]?[0-9;]*[a-zA-Z]/g, '');
  text = text.replace(/\x1b\[[0-9;]*[A-LN-Za-z]/g, '');

  // 3. Divide por sequências SGR: \x1b[...m
  const parts = text.split(/(\x1b\[[0-9;]*m)/g);

  let htmlResult = '';
  const activeClasses = new Set<string>();
  let customFgColor: string | null = null;
  let customBgColor: string | null = null;

  for (const part of parts) {
    if (!part) continue;

    const match = part.match(/^\x1b\[([0-9;]*)m$/);
    if (match) {
      const codeStr = match[1] || '0';
      const codes = codeStr.split(';').map((c) => parseInt(c, 10) || 0);

      let i = 0;
      while (i < codes.length) {
        const code = codes[i];

        if (code === 0) {
          // Reset geral
          activeClasses.clear();
          customFgColor = null;
          customBgColor = null;
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
        } else if (code === 38) {
          // Cores estendidas de primeiro plano: 38;5;n (256 cores) ou 38;2;r;g;b (Truecolor RGB)
          if (codes[i + 1] === 5 && codes[i + 2] !== undefined) {
            customFgColor = color256ToCss(codes[i + 2]);
            clearClassPrefix(activeClasses, 'ansi-');
            i += 2;
          } else if (codes[i + 1] === 2 && codes[i + 4] !== undefined) {
            customFgColor = `rgb(${codes[i + 2]}, ${codes[i + 3]}, ${codes[i + 4]})`;
            clearClassPrefix(activeClasses, 'ansi-');
            i += 4;
          }
        } else if (code === 48) {
          // Cores estendidas de fundo: 48;5;n (256 cores) ou 48;2;r;g;b (Truecolor RGB)
          if (codes[i + 1] === 5 && codes[i + 2] !== undefined) {
            customBgColor = color256ToCss(codes[i + 2]);
            clearClassPrefix(activeClasses, 'ansi-bg-');
            i += 2;
          } else if (codes[i + 1] === 2 && codes[i + 4] !== undefined) {
            customBgColor = `rgb(${codes[i + 2]}, ${codes[i + 3]}, ${codes[i + 4]})`;
            clearClassPrefix(activeClasses, 'ansi-bg-');
            i += 4;
          }
        } else if (code === 39) {
          // Reset cor do texto
          customFgColor = null;
          clearClassPrefix(activeClasses, 'ansi-');
        } else if (code === 49) {
          // Reset cor do fundo
          customBgColor = null;
          clearClassPrefix(activeClasses, 'ansi-bg-');
        } else if (ANSI_COLOR_MAP[code]) {
          customFgColor = null;
          clearClassPrefix(activeClasses, 'ansi-');
          activeClasses.add(ANSI_COLOR_MAP[code]);
        } else if (ANSI_BG_MAP[code]) {
          customBgColor = null;
          clearClassPrefix(activeClasses, 'ansi-bg-');
          activeClasses.add(ANSI_BG_MAP[code]);
        }
        i++;
      }
    } else {
      // Texto normal
      const safe = escapeHtml(part);
      const hasClasses = activeClasses.size > 0;
      const hasCustomStyles = !!customFgColor || !!customBgColor;

      if (hasClasses || hasCustomStyles) {
        let styleAttr = '';
        if (customFgColor || customBgColor) {
          const styles: string[] = [];
          if (customFgColor) styles.push(`color: ${customFgColor}`);
          if (customBgColor) styles.push(`background-color: ${customBgColor}`);
          styleAttr = ` style="${styles.join('; ')}"`;
        }

        const classAttr = hasClasses ? ` class="${Array.from(activeClasses).join(' ')}"` : '';
        htmlResult += `<span${classAttr}${styleAttr}>${safe}</span>`;
      } else {
        htmlResult += safe;
      }
    }
  }

  return htmlResult;
}

function clearClassPrefix(classes: Set<string>, prefix: string) {
  for (const cls of Array.from(classes)) {
    if (
      cls.startsWith(prefix) &&
      cls !== 'ansi-bold' &&
      cls !== 'ansi-italic' &&
      cls !== 'ansi-underline' &&
      cls !== 'ansi-dim'
    ) {
      if (prefix === 'ansi-' && cls.startsWith('ansi-bg-')) continue;
      classes.delete(cls);
    }
  }
}
