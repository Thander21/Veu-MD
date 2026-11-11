import { fsService } from '../services/fsService';

export interface BacklinkItem {
  filePath: string;
  fileName: string;
  relativePath: string;
  snippet?: string;
  count: number;
}

export async function scanBacklinksForFile(
  currentFilePath: string,
  currentFolderPath: string
): Promise<BacklinkItem[]> {
  if (!currentFilePath || !currentFolderPath) return [];

  const fileNameWithExt = currentFilePath.split(/[\\/]/).pop() || '';
  const noteName = fileNameWithExt.replace(/\.(md|txt)$/i, '');
  if (!noteName) return [];

  try {
    const matches = await fsService.searchInFiles(currentFolderPath, noteName, false, false, 200);
    const groups = new Map<string, BacklinkItem>();
    const normCurrent = currentFilePath.toLowerCase().replace(/\\/g, '/');

    for (const m of matches) {
      const normMatch = m.file_path.toLowerCase().replace(/\\/g, '/');
      if (normMatch === normCurrent) continue;

      const lineText = m.line_text || '';
      const hasWikiLink = lineText.toLowerCase().includes(`[[${noteName.toLowerCase()}`);
      const hasMdLink = lineText.toLowerCase().includes(`${noteName.toLowerCase()}.md`);
      const hasPlainMention = lineText.toLowerCase().includes(noteName.toLowerCase());

      if (hasWikiLink || hasMdLink || hasPlainMention) {
        let item = groups.get(m.file_path);
        if (!item) {
          item = {
            filePath: m.file_path,
            fileName: m.file_name,
            relativePath: m.relative_path,
            snippet: m.line_text.trim(),
            count: 0
          };
          groups.set(m.file_path, item);
        }
        item.count += 1;
      }
    }

    return Array.from(groups.values());
  } catch (err) {
    console.warn('Erro ao varrer backlinks:', err);
    return [];
  }
}

