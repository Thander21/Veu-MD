/**
 * Contratos e Tipagens Estritas de IPC para o Veu MD (TypeScript ↔ Rust)
 * Espelha rigorosamente os handlers registrados em src-tauri/src/lib.rs
 */

export interface FileNode {
  name: string;
  path: string;
  is_dir: boolean;
  extension?: string | null;
  children?: FileNode[] | null;
}

export interface IpcCommandMap {
  // --- File System Commands (fs_cmd.rs) ---
  read_dir_tree: {
    args: { path: string };
    return: FileNode[];
  };
  read_text_file: {
    args: { path: string };
    return: string;
  };
  read_file_base64: {
    args: { path: string };
    return: string;
  };
  write_text_file: {
    args: { path: string; content: string };
    return: void;
  };
  create_entry: {
    args: { path: string; isDir: boolean };
    return: void;
  };
  rename_entry: {
    args: { oldPath: string; newPath: string };
    return: void;
  };
  delete_entry: {
    args: { path: string };
    return: void;
  };
  save_image_asset: {
    args: { baseDir: string; filename: string; base64Data: string };
    return: string;
  };

  // --- Terminal PTY Commands (pty_cmd.rs) ---
  spawn_terminal: {
    args: { termId: string; cwd?: string; shell?: string };
    return: void;
  };
  write_terminal: {
    args: { termId: string; data: string };
    return: void;
  };
  resize_terminal: {
    args: { termId: string; cols: number; rows: number };
    return: void;
  };
  kill_terminal: {
    args: { termId: string };
    return: void;
  };

  // --- File Watcher Commands (watcher_cmd.rs) ---
  watch_file: {
    args: { path: string };
    return: void;
  };
  unwatch_file: {
    args?: Record<string, never>;
    return: void;
  };

  // --- Theme Commands (theme_cmd.rs) ---
  save_custom_theme: {
    args: { themeName: string; themeJson: string };
    return: void;
  };
  load_custom_themes: {
    args?: Record<string, never>;
    return: Record<string, string>;
  };

  // --- AI CLI Commands (ai_cmd.rs) ---
  check_ai_tools: {
    args: { tools: string[] };
    return: Record<string, boolean>;
  };
  run_ai_prompt: {
    args: {
      reqId: string;
      cwd?: string;
      cliTool?: string;
      prompt: string;
      continueSession: boolean;
    };
    return: void;
  };
  cancel_ai_prompt: {
    args: { reqId: string };
    return: void;
  };
}

export type IpcCommandName = keyof IpcCommandMap;

export interface IpcError {
  command: string;
  message: string;
  raw?: unknown;
}

/**
 * Converte erros brutos de IPC em mensagens legíveis e padronizadas.
 */
export function formatIpcError(command: string, error: unknown): IpcError {
  let message = 'Erro desconhecido na execução do comando';
  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = String((error as { message: unknown }).message);
  }
  return {
    command,
    message,
    raw: error
  };
}
