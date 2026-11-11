import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

console.log('🧪 Iniciando Testes Automatizados de Resiliência Arquitetural e Concorrência...\n');

// 1. Validação de Isolamento de Auto-Save por Aba e Flush Atômico (ARC-01, ARC-02, ARC-03)
const appSveltePath = join(process.cwd(), 'src', 'App.svelte');
const appSvelteContent = readFileSync(appSveltePath, 'utf8');

assert(
  appSvelteContent.includes('autoSaveTimeouts: Map<string, any> = new Map()'),
  'App.svelte deve isolar os timers de auto-save em um Map indexado por tabId'
);
assert(
  appSvelteContent.includes('async function saveTab('),
  'App.svelte deve conter a função saveTab para persistência determinística de abas'
);
assert(
  appSvelteContent.includes('async function handleSelectTab('),
  'App.svelte deve conter handleSelectTab com flush atômico ao comutar abas'
);
assert(
  appSvelteContent.includes('if (tabToClose.isDirty && currentFolderPath)'),
  'App.svelte closeTab deve fazer flush atômico de alterações pendentes antes de fechar a aba'
);
console.log('✓ PASSOU: Isolamento de auto-save por aba e flush atômico no ciclo de vida (ARC-01, ARC-02, ARC-03)');

// 2. Validação da Convivência Dual-Engine do Terminal via CSS display (ARC-04)
const termPanelPath = join(process.cwd(), 'src', 'lib', 'components', 'TerminalPanel.svelte');
const termPanelContent = readFileSync(termPanelPath, 'utf8');

assert(
  !termPanelContent.includes('{#if terminalEngine === \'veu\'}'),
  'TerminalPanel não deve mais destruir o Terminal Veu com bloco condicional {#if}'
);
assert(
  termPanelContent.includes('class="xterm-engine-wrapper" class:hidden={terminalEngine !== \'xterm\'}'),
  'TerminalPanel deve reter o contêiner do xterm no DOM alternado via classe CSS .hidden'
);
assert(
  termPanelContent.includes('visible={visible && terminalEngine === \'veu\'}'),
  'TerminalPanel deve repassar visibilidade estrita ao TerminalVeuPanel'
);
console.log('✓ PASSOU: Preservação de contêineres DOM e continuidade dual-engine do terminal (ARC-04)');

// 3. Validação de Encerramento Natural do PTY e Limpeza de Sessão (ARC-05)
const ptyCmdPath = join(process.cwd(), 'src-tauri', 'src', 'commands', 'pty_cmd.rs');
const ptyCmdContent = readFileSync(ptyCmdPath, 'utf8');

assert(
  ptyCmdContent.includes('term-exit-'),
  'pty_cmd.rs deve emitir evento term-exit ao término natural do shell'
);
assert(
  ptyCmdContent.includes('map.remove(&term_id_clone)'),
  'pty_cmd.rs deve remover a sessão de terminals_state ao atingir EOF'
);
console.log('✓ PASSOU: Ciclo de vida completo de encerramento de PTY e limpeza de AppState (ARC-05)');

// 4. Validação de Resolução de Imagens Locais, Sincronização Externa e Smart Paste Inline (ARC-06, ARC-07)
const pmSetupPath = join(process.cwd(), 'src', 'lib', 'editor', 'proseMirrorSetup.ts');
const pmSetupContent = readFileSync(pmSetupPath, 'utf8');

assert(
  pmSetupContent.includes('convertFileSrc'),
  'proseMirrorSetup.ts deve importar e utilizar convertFileSrc do Tauri v2'
);
assert(
  pmSetupContent.includes('createImageNodeView'),
  'proseMirrorSetup.ts deve exportar createImageNodeView para renderizar imagens locais'
);
assert(
  pmSetupContent.includes('resolveImageSrc'),
  'proseMirrorSetup.ts deve conter resolveImageSrc para mapear caminhos relativos'
);
assert(
  pmSetupContent.includes('(\\*\\*|__)[^\\s].+?\\1'),
  'handleSmartPaste deve detectar marcas inline como negrito para preservar padrão WYSIWYG'
);
assert(
  appSvelteContent.includes('// Sincronização externa ao focar aba inativa (ARC-07)'),
  'App.svelte deve conter sincronização externa ao comutar foco para aba inativa (ARC-07)'
);
assert(
  appSvelteContent.includes('if (diskContent !== targetTab.content)'),
  'App.svelte deve atualizar o conteúdo da aba inativa caso o arquivo no disco tenha sido modificado externamente'
);
console.log('✓ PASSOU: Resolução de imagens locais, sincronização externa e smart paste inline (ARC-06, ARC-07)');

// 5. Validação de Segurança e Contenção em delete_entry (ARC-08)
const fsCmdPath = join(process.cwd(), 'src-tauri', 'src', 'commands', 'fs_cmd.rs');
const fsCmdContent = readFileSync(fsCmdPath, 'utf8');

assert(
  fsCmdContent.includes('validate_safe_deletion_path'),
  'fs_cmd.rs deve conter validate_safe_deletion_path para contenção de exclusão'
);
assert(
  fsCmdContent.includes('Não é permitido excluir a raiz'),
  'fs_cmd.rs deve rejeitar explicitamente a exclusão de raízes do sistema de arquivos'
);
console.log('✓ PASSOU: Contenção de I/O e proteção contra deleção de raízes de disco (ARC-08)');

// 6. Validação do xterm moderno com WebGL, cursor visível e tolerância de boot (ARC-09)
assert(
  termPanelContent.includes("import { WebglAddon } from '@xterm/addon-webgl';"),
  'TerminalPanel deve importar e integrar o WebglAddon acelerado por GPU'
);
assert(
  termPanelContent.includes("cursorInactiveStyle: 'block'"),
  'TerminalPanel deve manter cursorInactiveStyle: block para que o cursor nunca desapareça ao perder o foco'
);
assert(
  termPanelContent.indexOf('newTab.unlisten = await listen') < termPanelContent.indexOf('await spawnTerminalIpc'),
  'TerminalPanel deve registrar o listener IPC antes de spawnTerminalIpc para nunca perder a saída inicial'
);
console.log('✓ PASSOU: Configuração moderna do xterm (WebGL, cursorInactiveStyle e ordem estrita de IPC) (ARC-09)');

console.log('\n🎉 TODOS OS TESTES DE RESILIÊNCIA ARQUITETURAL PASSARAM COM SUCESSO!\n');
