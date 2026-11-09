/**
 * Terminal Veu - Gestão de Timeline, Ring-Buffer de Blocos e Contratos IPC
 */
import { invoke } from '@tauri-apps/api/core';
import type { IpcCommandMap } from '../../types/ipc';

export const DEFAULT_MAX_TERMINAL_BLOCKS = 500;

export interface CommandBlock {
  id: string;
  command: string;
  cwd: string;
  timestamp: string;
  outputRaw: string;
  outputHtml: string;
  status: 'running' | 'completed' | 'interrupted';
  copied?: boolean;
  inserted?: boolean;
}

/**
 * Insere um novo bloco na timeline aplicando política de Ring-Buffer (FIFO).
 * Mantém no máximo `maxLimit` blocos, descartando os mais antigos e preservando
 * blocos em execução ativa (`status === 'running'`).
 */
export function appendBlockWithRingBuffer(
  blocks: CommandBlock[],
  newBlock: CommandBlock,
  maxLimit: number = DEFAULT_MAX_TERMINAL_BLOCKS
): CommandBlock[] {
  const nextBlocks = [...blocks, newBlock];
  if (nextBlocks.length <= maxLimit) {
    return nextBlocks;
  }

  const excess = nextBlocks.length - maxLimit;
  // Encontra os primeiros blocos que já finalizaram para evicção FIFO
  let evictedCount = 0;
  const filtered: CommandBlock[] = [];

  for (let i = 0; i < nextBlocks.length; i++) {
    const block = nextBlocks[i];
    // Se ainda precisamos evictar e o bloco não está em execução ativa
    if (evictedCount < excess && block.status !== 'running' && i < nextBlocks.length - 1) {
      evictedCount++;
      continue;
    }
    filtered.push(block);
  }

  // Fallback de segurança: se todos forem antigos ou running, força corte estrito da ponta
  if (filtered.length > maxLimit) {
    return filtered.slice(filtered.length - maxLimit);
  }

  return filtered;
}

// --- Funções Tipadas de Invocação IPC do Terminal (pty_cmd.rs) ---

export async function spawnTerminalIpc(
  termId: string,
  cwd?: string,
  shell?: string
): Promise<void> {
  const args: IpcCommandMap['spawn_terminal']['args'] = {
    termId,
    cwd,
    shell
  };
  return invoke('spawn_terminal', args);
}

export async function writeTerminalIpc(termId: string, data: string): Promise<void> {
  const args: IpcCommandMap['write_terminal']['args'] = {
    termId,
    data
  };
  return invoke('write_terminal', args);
}

export async function resizeTerminalIpc(
  termId: string,
  cols: number,
  rows: number
): Promise<void> {
  const args: IpcCommandMap['resize_terminal']['args'] = {
    termId,
    cols,
    rows
  };
  return invoke('resize_terminal', args);
}

export async function killTerminalIpc(termId: string): Promise<void> {
  const args: IpcCommandMap['kill_terminal']['args'] = {
    termId
  };
  return invoke('kill_terminal', args);
}
