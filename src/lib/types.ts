export interface FileNode {
  name: string;
  path: string;
  is_dir: boolean;
  extension?: string;
  children?: FileNode[];
}

export interface TabItem {
  id: string;
  title: string;
  path: string;
  content: string;
  isDirty: boolean;
  isMarkdown: boolean;
}

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
  pos: number;
}

export interface TagStyle {
  color: string;
  backgroundColor?: string;
  fontSize?: string;
  fontWeight?: string;
  borderBottom?: string;
  borderLeft?: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  isDark: boolean;
  // Layout
  editorMaxWidth: string; // ex: "850px" or "100%"
  fontFamily: string; // Sans, Serif, Mono
  fontSize: string; // ex: "16px"
  lineHeight: string; // ex: "1.75"
  
  // Cores do App
  bgApp: string;
  bgSidebar: string;
  bgEditor: string;
  textColor: string;
  borderColor: string;
  activeItemBg: string;

  // Cores por Tag Markdown
  h1: TagStyle;
  h2: TagStyle;
  h3: TagStyle;
  h4: TagStyle;
  h5: TagStyle;
  h6: TagStyle;
  bold: TagStyle;
  italic: TagStyle;
  strikethrough: TagStyle;
  highlight: TagStyle;
  inlineCode: TagStyle;
  blockquote: TagStyle;
  codeBlock: TagStyle;
  link: TagStyle;
  listBullet: TagStyle;
  tableBorder: string;
  tableHeaderBg: string;
}

