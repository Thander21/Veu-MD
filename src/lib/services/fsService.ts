import { invoke } from '@tauri-apps/api/core';
import type { FileNode } from '../types';

export const fsService = {
  async readDirTree(path: string): Promise<FileNode[]> {
    return await invoke('read_dir_tree', { path });
  },

  async readTextFile(path: string): Promise<string> {
    return await invoke('read_text_file', { path });
  },

  async readFileBase64(path: string): Promise<string> {
    return await invoke('read_file_base64', { path });
  },

  async writeTextFile(path: string, content: string): Promise<void> {
    await invoke('write_text_file', { path, content });
  },

  async createEntry(path: string, isDir: boolean): Promise<void> {
    await invoke('create_entry', { path, isDir });
  },

  async renameEntry(oldPath: string, newPath: string): Promise<void> {
    await invoke('rename_entry', { oldPath, newPath });
  },

  async deleteEntry(path: string): Promise<void> {
    await invoke('delete_entry', { path });
  },

  async saveImageAsset(baseDir: string, filename: string, base64Data: string): Promise<string> {
    return await invoke('save_image_asset', { baseDir, filename, base64Data });
  },

  async watchFile(path: string): Promise<void> {
    await invoke('watch_file', { path });
  },

  async unwatchFile(): Promise<void> {
    await invoke('unwatch_file');
  }
};
