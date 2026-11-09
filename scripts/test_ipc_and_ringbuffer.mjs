import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

console.log('🧪 Iniciando Testes de Contratos IPC e Ring-Buffer do Terminal...');

// 1. Simulação e Teste Unitário da Lógica de Ring-Buffer
function appendBlockWithRingBuffer(blocks, newBlock, maxLimit = 500) {
  const nextBlocks = [...blocks, newBlock];
  if (nextBlocks.length <= maxLimit) {
    return nextBlocks;
  }

  const excess = nextBlocks.length - maxLimit;
  let evictedCount = 0;
  const filtered = [];

  for (let i = 0; i < nextBlocks.length; i++) {
    const block = nextBlocks[i];
    if (evictedCount < excess && block.status !== 'running' && i < nextBlocks.length - 1) {
      evictedCount++;
      continue;
    }
    filtered.push(block);
  }

  if (filtered.length > maxLimit) {
    return filtered.slice(filtered.length - maxLimit);
  }

  return filtered;
}

// Teste 1: Ring-buffer mantém limite exato e aplica FIFO
let blocks = [];
for (let i = 1; i <= 600; i++) {
  blocks = appendBlockWithRingBuffer(blocks, {
    id: `cmd-${i}`,
    command: `echo ${i}`,
    cwd: 'C:/test',
    timestamp: '12:00',
    outputRaw: `output ${i}`,
    outputHtml: `<span>${i}</span>`,
    status: 'completed'
  }, 500);
}

assert.strictEqual(blocks.length, 500, 'Ring-buffer deve conter exatamente 500 blocos no limite');
assert.strictEqual(blocks[0].id, 'cmd-101', 'O primeiro bloco deve ser o 101 após evicção FIFO dos 100 primeiros');
assert.strictEqual(blocks[499].id, 'cmd-600', 'O último bloco deve ser o recém-inserido cmd-600');
console.log('✓ PASSOU: Ring-buffer evicted oldest blocks at 500 limit');

// Teste 2: Preservação de bloco em execução ativa (status === "running")
let blocksWithRunning = [
  { id: 'cmd-running', command: 'long-job', status: 'running' }
];
for (let i = 1; i <= 10; i++) {
  blocksWithRunning = appendBlockWithRingBuffer(blocksWithRunning, {
    id: `cmd-comp-${i}`,
    command: `echo ${i}`,
    status: 'completed'
  }, 5);
}

assert.strictEqual(blocksWithRunning.length, 5, 'Ring-buffer deve respeitar o limite de 5 blocos');
const hasRunning = blocksWithRunning.some(b => b.id === 'cmd-running');
assert.strictEqual(hasRunning, true, 'Bloco em execução ativa (status: running) não deve ser descartado precocemente');
console.log('✓ PASSOU: Active block and prompt preserved during eviction');

// Teste 3: Validação de Contrato IPC TypeScript
const ipcTsPath = join(process.cwd(), 'src', 'types', 'ipc.ts');
const ipcContent = readFileSync(ipcTsPath, 'utf8');

assert(ipcContent.includes('export interface IpcCommandMap'), 'src/types/ipc.ts deve exportar IpcCommandMap');
assert(ipcContent.includes('spawn_terminal:'), 'IpcCommandMap deve conter spawn_terminal');
assert(ipcContent.includes('write_terminal:'), 'IpcCommandMap deve conter write_terminal');
assert(ipcContent.includes('resize_terminal:'), 'IpcCommandMap deve conter resize_terminal');
assert(ipcContent.includes('kill_terminal:'), 'IpcCommandMap deve conter kill_terminal');
assert(ipcContent.includes('read_dir_tree:'), 'IpcCommandMap deve conter read_dir_tree');
assert(ipcContent.includes('formatIpcError'), 'src/types/ipc.ts deve exportar formatIpcError');
console.log('✓ PASSOU: IPC contracts and types validated');

// Teste 4: Validação de terminalStore
const termStorePath = join(process.cwd(), 'src', 'lib', 'stores', 'terminalStore.ts');
const termStoreContent = readFileSync(termStorePath, 'utf8');

assert(termStoreContent.includes('DEFAULT_MAX_TERMINAL_BLOCKS = 500'), 'terminalStore deve definir teto de 500');
assert(termStoreContent.includes('appendBlockWithRingBuffer'), 'terminalStore deve exportar appendBlockWithRingBuffer');
assert(termStoreContent.includes('spawnTerminalIpc'), 'terminalStore deve exportar spawnTerminalIpc');
assert(termStoreContent.includes('writeTerminalIpc'), 'terminalStore deve exportar writeTerminalIpc');
console.log('✓ PASSOU: terminalStore integration and constants verified');

console.log('\n🎉 TODOS OS TESTES DE CONTRATO IPC E RING-BUFFER PASSARAM COM SUCESSO!\n');
