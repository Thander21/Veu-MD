<script context="module" lang="ts">
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

  export interface TermTab {
    id: string;
    projectId: string;
    title: string;
    shell: string;
    cwd: string;
    blocks: CommandBlock[];
    activeInput: string;
    history: string[];
    historyIndex: number;
    isRunning: boolean;
    unlisten?: () => void;
  }

  export interface CommandSuggestion {
    cmd: string;
    category: 'histórico' | 'git' | 'npm' | 'tauri' | 'agy' | 'cargo' | 'sistema';
  }

  const DEFAULT_COMMANDS: CommandSuggestion[] = [
    // Git
    { cmd: 'git status', category: 'git' },
    { cmd: 'git add .', category: 'git' },
    { cmd: 'git commit -m ""', category: 'git' },
    { cmd: 'git push', category: 'git' },
    { cmd: 'git pull', category: 'git' },
    { cmd: 'git diff', category: 'git' },
    { cmd: 'git log --oneline -n 10', category: 'git' },
    { cmd: 'git branch', category: 'git' },
    { cmd: 'git checkout', category: 'git' },

    // NPM / Svelte / Vite / Tauri
    { cmd: 'npm run dev', category: 'npm' },
    { cmd: 'npm run build', category: 'npm' },
    { cmd: 'npm run check', category: 'npm' },
    { cmd: 'npm test', category: 'npm' },
    { cmd: 'npm install', category: 'npm' },
    { cmd: 'npm run tauri dev', category: 'tauri' },
    { cmd: 'npm run tauri build', category: 'tauri' },

    // Antigravity CLI (agy)
    { cmd: 'agy', category: 'agy' },
    { cmd: 'agy --help', category: 'agy' },
    { cmd: 'agy --continue', category: 'agy' },
    { cmd: 'agy models', category: 'agy' },
    { cmd: 'agy agents', category: 'agy' },
    { cmd: 'agy changelog', category: 'agy' },

    // Cargo / Rust
    { cmd: 'cargo check', category: 'cargo' },
    { cmd: 'cargo build', category: 'cargo' },
    { cmd: 'cargo test', category: 'cargo' },
    { cmd: 'cargo run', category: 'cargo' },

    // Shell / Sistema
    { cmd: 'dir', category: 'sistema' },
    { cmd: 'ls', category: 'sistema' },
    { cmd: 'cls', category: 'sistema' },
    { cmd: 'clear', category: 'sistema' },
    { cmd: 'cd ..', category: 'sistema' },
    { cmd: 'code .', category: 'sistema' }
  ];
</script>

<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import {
    Plus,
    X,
    TerminalSquare,
    Minimize2,
    Maximize2,
    Columns,
    Rows,
    Copy,
    Check,
    Eraser,
    CornerDownLeft,
    Square,
    FlaskConical
  } from 'lucide-svelte';
  import { invoke } from '@tauri-apps/api/core';
  import { listen } from '@tauri-apps/api/event';
  import { stripAnsi, ansiToHtml } from '../utils/ansiParser';

  export let projectId: string = 'default';
  export let visible: boolean = false;
  export let currentFolderPath: string = '';
  export let hasActiveFile: boolean = true;
  export let orientation: 'horizontal' | 'vertical' = 'horizontal';
  export let isMaximized: boolean = false;
  export let onClose: () => void;
  export let onInsertText: ((text: string) => void) | undefined = undefined;
  export let onOpenAiAssistant: ((command?: string) => void) | undefined = undefined;
  export let terminalEngine: 'xterm' | 'veu' = 'veu';
  export let onSwitchEngine: ((engine: 'xterm' | 'veu') => void) | undefined = undefined;

  // Monitora presença de arquivo ativo
  let prevHasActiveFile = hasActiveFile;
  $: if (prevHasActiveFile !== hasActiveFile) {
    if (!hasActiveFile) {
      isMaximized = true;
    } else {
      isMaximized = false;
    }
    prevHasActiveFile = hasActiveFile;
  }

  // Sessões ativas de Terminal Veu indexadas por projeto
  let allTabs: TermTab[] = [];
  let projectActiveTermId: Record<string, string> = {};

  $: effectiveProjectId = projectId || 'default';
  $: currentTabs = allTabs.filter((t) => t.projectId === effectiveProjectId);
  $: activeTab = currentTabs.find((t) => t.id === activeTermId) || currentTabs[0];
  $: activeTermId = projectActiveTermId[effectiveProjectId] || (currentTabs[0]?.id || '');

  let timelineContainers: Record<string, HTMLDivElement> = {};
  let activeInputEl: HTMLTextAreaElement | null = null;

  function resizeTextarea() {
    if (activeInputEl) {
      activeInputEl.style.height = 'auto';
      activeInputEl.style.height = `${Math.min(180, Math.max(22, activeInputEl.scrollHeight))}px`;
    }
  }

  function isAiInteractiveCommand(cmd: string): boolean {
    const trimmed = cmd.trim();
    // Intercepta chamadas a CLIs de IA (agy, gemini, claude, muse, ai)
    const match = trimmed.match(/^(?:npx\s+)?(agy|gemini|claude|muse|ai)(\s+.*)?$/i);
    if (!match) return false;

    const args = match[2] ? match[2].trim() : '';
    // Se for pura invocação interativa
    if (!args) return true;

    // Se tiver flags puramente informativas de sistema, deixa rodar no terminal para leitura rápida
    if (/(?:^|\s)(?:--help|-h|--version|-v|models|changelog)(?:\s|$)/i.test(args)) {
      return false;
    }

    return true;
  }

  // Autocomplete e sugestões de comandos predigitados
  let suggestions: CommandSuggestion[] = [];
  let ghostSuggestion: string = '';
  let selectedSuggestionIndex: number = -1;
  let showSuggestions: boolean = false;

  let panelHeight = 260;
  let panelWidth = 480;
  let isResizing = false;

  function getActiveTab(): TermTab | undefined {
    return activeTab;
  }

  function scrollToBottom(tabId?: string) {
    const id = tabId || activeTermId;
    if (!id) return;
    tick().then(() => {
      const container = timelineContainers[id];
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }

  let panelEl: HTMLDivElement | null = null;
  let resizeObserver: ResizeObserver | null = null;

  function syncPtySize(termId?: string) {
    const id = termId || activeTermId;
    if (!id) return;

    let w = 800;
    let h = 260;
    if (panelEl) {
      const rect = panelEl.getBoundingClientRect();
      w = rect.width || panelEl.clientWidth || w;
      h = rect.height || panelEl.clientHeight || h;
    } else if (orientation === 'vertical') {
      w = panelWidth;
      h = 500;
    } else {
      w = window.innerWidth;
      h = panelHeight;
    }

    const usableW = Math.max(160, w - 28);
    const usableH = Math.max(60, h - 36);

    const cols = Math.max(40, Math.min(320, Math.floor(usableW / 8.2)));
    const rows = Math.max(8, Math.min(160, Math.floor(usableH / 19)));
    invoke('resize_terminal', { termId: id, cols, rows }).catch(() => {});
  }

  export async function createTerminalSession(
    shell = 'powershell.exe',
    cwd = currentFolderPath
  ) {
    const pId = effectiveProjectId;
    const id = `term-${pId}-${Date.now()}`;
    const newTab: TermTab = {
      id,
      projectId: pId,
      title: shell.includes('powershell') ? 'PowerShell' : shell.includes('cmd') ? 'CMD' : 'Bash',
      shell,
      cwd: cwd || '',
      blocks: [],
      activeInput: '',
      history: [],
      historyIndex: -1,
      isRunning: false
    };

    allTabs = [...allTabs, newTab];
    projectActiveTermId[pId] = id;
    projectActiveTermId = { ...projectActiveTermId };

    try {
      await invoke('spawn_terminal', {
        termId: id,
        cwd: cwd || null,
        shell: shell || null
      });

      syncPtySize(id);

      newTab.unlisten = await listen(`term-output-${id}`, (event: any) => {
        const payload = event.payload as string;
        if (!payload) return;

        handleTerminalOutput(id, payload);
      });
    } catch (err) {
      const errorBlock: CommandBlock = {
        id: `err-${Date.now()}`,
        command: 'inicialização',
        cwd: cwd || '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        outputRaw: `Erro ao iniciar Terminal Veu: ${err}`,
        outputHtml: `<span class="ansi-red">Erro ao iniciar Terminal Veu: ${err}</span>`,
        status: 'completed'
      };
      newTab.blocks = [errorBlock];
      allTabs = [...allTabs];
    }

    tick().then(() => {
      focusActiveInput();
      scrollToBottom(id);
    });
  }

  function finishBlock(tab: TermTab, block: CommandBlock) {
    let cleanRaw = stripAnsi(block.outputRaw).trimEnd();
    cleanRaw = cleanRaw
      .replace(/(?:PS(?:\s+[a-zA-Z]:[^\n\r>]*|\s*>[^\n\r>]*|>|\s+[^>\r\n]+)>|\w+@[^:]+:[^$#\n\r]*[$#]|^[a-zA-Z]:[^\n\r>]*>|[a-zA-Z]:\\[^\n\r>]*>|\$\s*|>\s*)\s*$/, '')
      .trimEnd();

    // Remove eco redundante do comando no topo da saída se presente
    const firstLineBreak = cleanRaw.indexOf('\n');
    if (firstLineBreak > -1) {
      const firstLine = cleanRaw.substring(0, firstLineBreak).trim();
      if (firstLine === block.command.trim()) {
        cleanRaw = cleanRaw.substring(firstLineBreak + 1).trimStart();
      }
    }

    block.outputRaw = cleanRaw;
    block.outputHtml = ansiToHtml(cleanRaw);
    block.status = 'completed';
    tab.isRunning = false;
    allTabs = [...allTabs];

    tick().then(() => {
      focusActiveInput();
      scrollToBottom(tab.id);
    });
  }

  function handleTerminalOutput(tabId: string, chunk: string) {
    const tab = allTabs.find((t) => t.id === tabId);
    if (!tab) return;

    let targetBlock = tab.blocks.find((b) => b.status === 'running');
    if (!targetBlock) {
      if (tab.blocks.length > 0) {
        targetBlock = tab.blocks[tab.blocks.length - 1];
      } else {
        const welcomeBlock: CommandBlock = {
          id: `init-${Date.now()}`,
          command: 'sessão iniciada',
          cwd: tab.cwd || currentFolderPath,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          outputRaw: '',
          outputHtml: '',
          status: 'completed'
        };
        tab.blocks = [welcomeBlock];
        targetBlock = welcomeBlock;
      }
    }

    targetBlock.outputRaw += chunk;

    // Detecta se a saída indica retorno do prompt interativo do shell hospedeiro
    const cleanRaw = stripAnsi(targetBlock.outputRaw).trimEnd();
    const isShellPrompt = /(?:PS(?:\s+[a-zA-Z]:[^\n\r>]*|\s*>[^\n\r>]*|>|\s+[^>\r\n]+)>|\w+@[^:]+:[^$#\n\r]*[$#]|^[a-zA-Z]:[^\n\r>]*>|[a-zA-Z]:\\[^\n\r>]*>|\$\s*|>\s*)\s*$/.test(
      cleanRaw
    );

    if (isShellPrompt && targetBlock.status === 'running') {
      finishBlock(tab, targetBlock);
    } else {
      targetBlock.outputHtml = ansiToHtml(targetBlock.outputRaw);
      allTabs = [...allTabs];
      scrollToBottom(tabId);

      // Debounce para detectar silêncio do processo caso retorne prompt sem quebra final
      if (targetBlock.status === 'running') {
        if ((tab as any)._completionTimeout) {
          clearTimeout((tab as any)._completionTimeout);
        }
        (tab as any)._completionTimeout = setTimeout(() => {
          if (targetBlock && targetBlock.status === 'running') {
            const currentClean = stripAnsi(targetBlock.outputRaw).trimEnd();
            if (/[>%$#]\s*$/.test(currentClean)) {
              finishBlock(tab, targetBlock);
            }
          }
        }, 1000);
      }
    }
  }

  export function submitCommand(tab: TermTab) {
    const rawCmd = tab.activeInput;

    // Se o terminal estiver executando um processo interativo
    if (tab.isRunning) {
      const inputToSend = rawCmd;
      tab.activeInput = '';
      ghostSuggestion = '';
      showSuggestions = false;

      if (inputToSend.trim() && (tab.history.length === 0 || tab.history[tab.history.length - 1] !== inputToSend.trim())) {
        tab.history = [...tab.history, inputToSend.trim()];
      }

      invoke('write_terminal', { termId: tab.id, data: `${inputToSend}\r\n` }).catch((err) => {
        console.error('Erro ao enviar entrada para o processo:', err);
      });

      scrollToBottom(tab.id);
      return;
    }

    // Terminal ocioso: inicia nova execução de comando em bloco
    if (!rawCmd || !rawCmd.trim()) return;

    const command = rawCmd.trim();

    // Intercepta comandos de IA (agy, gemini, claude, muse, ai) para abrir no Assistente Lateral
    if (isAiInteractiveCommand(command) && onOpenAiAssistant) {
      if (tab.history.length === 0 || tab.history[tab.history.length - 1] !== command) {
        tab.history = [...tab.history, command];
      }
      tab.historyIndex = -1;
      tab.activeInput = '';
      ghostSuggestion = '';
      showSuggestions = false;

      const aiNoticeBlock: CommandBlock = {
        id: `ai-${Date.now()}`,
        command,
        cwd: tab.cwd || currentFolderPath,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        outputRaw: '✨ Sessão de IA detectada. Abrindo Assistente IA na barra lateral...',
        outputHtml: '<span class="ansi-magenta">✨ Sessão de IA detectada. Abrindo Assistente IA na barra lateral...</span>',
        status: 'completed'
      };

      tab.blocks = [...tab.blocks, aiNoticeBlock];
      allTabs = [...allTabs];

      onOpenAiAssistant(command);
      scrollToBottom(tab.id);
      return;
    }

    if (tab.history.length === 0 || tab.history[tab.history.length - 1] !== command) {
      tab.history = [...tab.history, command];
    }
    tab.historyIndex = -1;
    tab.activeInput = '';
    ghostSuggestion = '';
    showSuggestions = false;

    const newBlock: CommandBlock = {
      id: `cmd-${Date.now()}`,
      command,
      cwd: tab.cwd || currentFolderPath,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      outputRaw: '',
      outputHtml: '',
      status: 'running'
    };

    tab.blocks = [...tab.blocks, newBlock];
    tab.isRunning = true;
    allTabs = [...allTabs];

    invoke('write_terminal', { termId: tab.id, data: `${command}\r\n` }).catch((err) => {
      newBlock.outputRaw = `Erro ao executar comando: ${err}`;
      newBlock.outputHtml = `<span class="ansi-red">Erro ao executar comando: ${err}</span>`;
      newBlock.status = 'completed';
      tab.isRunning = false;
      allTabs = [...allTabs];
    });

    scrollToBottom(tab.id);
  }

  export function stopCommand(tab: TermTab) {
    // Envia SIGINT (^C) ao PTY
    invoke('write_terminal', { termId: tab.id, data: '\x03' }).catch(() => {});

    const runningBlock = tab.blocks.find((b) => b.status === 'running');
    if (runningBlock) {
      runningBlock.status = 'interrupted';
      if (!runningBlock.outputRaw) {
        runningBlock.outputRaw = '^C (Interrompido)';
        runningBlock.outputHtml = '<span class="ansi-yellow">^C (Interrompido)</span>';
      } else {
        runningBlock.outputRaw += '\n^C';
        runningBlock.outputHtml = ansiToHtml(runningBlock.outputRaw);
      }
    }

    tab.isRunning = false;
    allTabs = [...allTabs];

    tick().then(() => {
      focusActiveInput();
      scrollToBottom(tab.id);
    });
  }

  function updateSuggestions(input: string) {
    if (!input || !input.trim()) {
      suggestions = [];
      ghostSuggestion = '';
      showSuggestions = false;
      selectedSuggestionIndex = -1;
      return;
    }

    const query = input.trim().toLowerCase();
    const tab = getActiveTab();

    const historyItems: CommandSuggestion[] = (tab?.history || [])
      .slice()
      .reverse()
      .map((cmd) => ({
        cmd,
        category: 'histórico' as const
      }));

    const allPool: CommandSuggestion[] = [...historyItems, ...DEFAULT_COMMANDS];
    const seen = new Set<string>();
    const matches: CommandSuggestion[] = [];

    for (const item of allPool) {
      if (seen.has(item.cmd)) continue;
      seen.add(item.cmd);

      if (item.cmd.toLowerCase().startsWith(query) && item.cmd.toLowerCase() !== query) {
        matches.push(item);
      } else if (item.cmd.toLowerCase().includes(query) && item.cmd.toLowerCase() !== query) {
        matches.push(item);
      }

      if (matches.length >= 6) break;
    }

    suggestions = matches;
    selectedSuggestionIndex = matches.length > 0 ? 0 : -1;
    showSuggestions = matches.length > 0;

    // Atualiza ghost text (se houver correspondência de prefixo e linha única)
    if (!input.includes('\n')) {
      const prefixMatch = matches.find((m) => m.cmd.toLowerCase().startsWith(input.toLowerCase()));
      if (prefixMatch && prefixMatch.cmd.length > input.length) {
        ghostSuggestion = prefixMatch.cmd.substring(input.length);
      } else {
        ghostSuggestion = '';
      }
    } else {
      ghostSuggestion = '';
    }
  }

  function applySuggestion(cmd: string, tab: TermTab) {
    tab.activeInput = cmd;
    ghostSuggestion = '';
    showSuggestions = false;
    selectedSuggestionIndex = -1;
    tick().then(() => {
      resizeTextarea();
      focusActiveInput();
    });
  }

  function handleInputKeydown(e: KeyboardEvent, tab: TermTab) {
    if (e.key === 'Tab') {
      if (showSuggestions && suggestions.length > 0) {
        e.preventDefault();
        const sel = suggestions[selectedSuggestionIndex] || suggestions[0];
        if (sel) {
          applySuggestion(sel.cmd, tab);
        }
        return;
      } else if (ghostSuggestion) {
        e.preventDefault();
        tab.activeInput += ghostSuggestion;
        ghostSuggestion = '';
        showSuggestions = false;
        tick().then(resizeTextarea);
        return;
      }
    } else if (e.key === 'ArrowRight' && ghostSuggestion && activeInputEl) {
      if (activeInputEl.selectionStart === tab.activeInput.length) {
        e.preventDefault();
        tab.activeInput += ghostSuggestion;
        ghostSuggestion = '';
        showSuggestions = false;
        tick().then(resizeTextarea);
        return;
      }
    } else if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Shift+Enter insere quebra de linha natural
        tick().then(resizeTextarea);
        return;
      }

      e.preventDefault();
      if (showSuggestions && suggestions.length > 0 && selectedSuggestionIndex >= 0) {
        const sel = suggestions[selectedSuggestionIndex];
        if (sel && sel.cmd !== tab.activeInput) {
          applySuggestion(sel.cmd, tab);
          return;
        }
      }
      submitCommand(tab);
    } else if (e.key === 'ArrowUp') {
      if (showSuggestions && suggestions.length > 0) {
        e.preventDefault();
        selectedSuggestionIndex = (selectedSuggestionIndex - 1 + suggestions.length) % suggestions.length;
        return;
      }

      // Permite navegação vertical nativa no textarea se houver múltiplas linhas
      if (activeInputEl && tab.activeInput.includes('\n')) {
        const firstLineBreak = tab.activeInput.indexOf('\n');
        if (activeInputEl.selectionStart > firstLineBreak) {
          return;
        }
      }

      e.preventDefault();
      if (tab.history.length > 0) {
        if (tab.historyIndex === -1) {
          tab.historyIndex = tab.history.length - 1;
        } else if (tab.historyIndex > 0) {
          tab.historyIndex--;
        }
        tab.activeInput = tab.history[tab.historyIndex] || '';
        updateSuggestions(tab.activeInput);
        tick().then(resizeTextarea);
      }
    } else if (e.key === 'ArrowDown') {
      if (showSuggestions && suggestions.length > 0) {
        e.preventDefault();
        selectedSuggestionIndex = (selectedSuggestionIndex + 1) % suggestions.length;
        return;
      }

      if (activeInputEl && tab.activeInput.includes('\n')) {
        const lastLineBreak = tab.activeInput.lastIndexOf('\n');
        if (activeInputEl.selectionStart < lastLineBreak) {
          return;
        }
      }

      e.preventDefault();
      if (tab.historyIndex !== -1) {
        if (tab.historyIndex < tab.history.length - 1) {
          tab.historyIndex++;
          tab.activeInput = tab.history[tab.historyIndex] || '';
        } else {
          tab.historyIndex = -1;
          tab.activeInput = '';
        }
        updateSuggestions(tab.activeInput);
        tick().then(resizeTextarea);
      }
    } else if (e.key === 'Escape') {
      if (showSuggestions) {
        e.preventDefault();
        showSuggestions = false;
      }
    }
  }

  function handlePanelKeydown(e: KeyboardEvent) {
    const tab = getActiveTab();
    if (!tab) return;

    if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
      if (tab.isRunning) {
        e.preventDefault();
        stopCommand(tab);
      }
      return;
    }

    // Se o processo estiver executando e o usuário pressionar teclas, repassa diretamente ao PTY
    if (tab.isRunning && !e.ctrlKey && !e.altKey && !e.metaKey) {
      if (e.key === 'Enter') {
        invoke('write_terminal', { termId: tab.id, data: '\r\n' }).catch(() => {});
      } else if (e.key === 'Backspace') {
        invoke('write_terminal', { termId: tab.id, data: '\x08' }).catch(() => {});
      } else if (e.key === 'Escape') {
        invoke('write_terminal', { termId: tab.id, data: '\x1b' }).catch(() => {});
      } else if (e.key.length === 1) {
        invoke('write_terminal', { termId: tab.id, data: e.key }).catch(() => {});
      }
    }
  }

  function focusActiveInput() {
    tick().then(() => {
      if (activeInputEl) {
        activeInputEl.focus();
      }
    });
  }

  export async function copyBlockOutput(block: CommandBlock) {
    const text = block.outputRaw || stripAnsi(block.outputHtml);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      block.copied = true;
      allTabs = [...allTabs];
      setTimeout(() => {
        block.copied = false;
        allTabs = [...allTabs];
      }, 1500);
    } catch {
      // fallback
    }
  }

  export function insertBlockToEditor(block: CommandBlock) {
    const text = block.outputRaw || stripAnsi(block.outputHtml);
    if (!text || !onInsertText) return;
    onInsertText(text);
    block.inserted = true;
    allTabs = [...allTabs];
    setTimeout(() => {
      block.inserted = false;
      allTabs = [...allTabs];
    }, 1500);
  }

  export function handleClearTerminal() {
    const tab = getActiveTab();
    if (!tab) return;
    tab.blocks = [];
    allTabs = [...allTabs];
    focusActiveInput();
  }

  export function closeProjectTerminals(pId: string) {
    const tabsToClose = allTabs.filter((t) => t.projectId === pId);
    for (const t of tabsToClose) {
      if (t.unlisten) t.unlisten();
      invoke('kill_terminal', { termId: t.id }).catch(() => {});
      delete timelineContainers[t.id];
    }
    allTabs = allTabs.filter((t) => t.projectId !== pId);
    delete projectActiveTermId[pId];
    projectActiveTermId = { ...projectActiveTermId };
  }

  function closeTerminal(id: string) {
    const tab = allTabs.find((t) => t.id === id);
    if (tab) {
      if (tab.unlisten) tab.unlisten();
      invoke('kill_terminal', { termId: id }).catch(() => {});
      delete timelineContainers[id];
    }

    allTabs = allTabs.filter((t) => t.id !== id);
    if (activeTermId === id) {
      const remaining = allTabs.filter((t) => t.projectId === effectiveProjectId);
      projectActiveTermId[effectiveProjectId] = remaining[0]?.id || '';
      projectActiveTermId = { ...projectActiveTermId };
    }

    const remainingCurrent = allTabs.filter((t) => t.projectId === effectiveProjectId);
    if (remainingCurrent.length === 0) {
      onClose();
    } else {
      focusActiveInput();
    }
  }

  function switchTab(id: string) {
    projectActiveTermId[effectiveProjectId] = id;
    projectActiveTermId = { ...projectActiveTermId };
    tick().then(() => {
      syncPtySize(id);
      focusActiveInput();
      scrollToBottom(id);
    });
  }

  function toggleOrientation() {
    orientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';
    syncPtySize(activeTermId);
  }

  function toggleMaximize() {
    isMaximized = !isMaximized;
    syncPtySize(activeTermId);
  }

  function startResize(e: MouseEvent) {
    isResizing = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const initialH = panelHeight;
    const initialW = panelWidth;

    function onMouseMove(moveEvent: MouseEvent) {
      if (!isResizing) return;
      if (orientation === 'horizontal') {
        const delta = startY - moveEvent.clientY;
        panelHeight = Math.max(120, Math.min(window.innerHeight - 100, initialH + delta));
      } else {
        const delta = startX - moveEvent.clientX;
        panelWidth = Math.max(260, Math.min(window.innerWidth - 100, initialW + delta));
      }
    }

    function onMouseUp() {
      isResizing = false;
      syncPtySize(activeTermId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  $: if (visible && currentTabs.length === 0) {
    createTerminalSession('powershell.exe', currentFolderPath);
  }

  $: if (visible) {
    tick().then(() => {
      syncPtySize();
      focusActiveInput();
    });
  }

  onMount(() => {
    if (panelEl) {
      resizeObserver = new ResizeObserver(() => {
        syncPtySize();
      });
      resizeObserver.observe(panelEl);
    }
    syncPtySize();
  });

  onDestroy(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  });
</script>

{#if visible}
  <!-- Alça de Redimensionamento -->
  {#if !isMaximized && hasActiveFile}
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="resize-handle handle-{orientation}"
      on:mousedown={startResize}
      role="separator"
      aria-label="Redimensionar Terminal Veu"
    ></div>
  {/if}

  <!-- Painel do Terminal Veu -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    bind:this={panelEl}
    class="terminal-panel orientation-{orientation}"
    class:maximized={isMaximized || !hasActiveFile}
    style={(isMaximized || !hasActiveFile)
      ? 'flex: 1; width: 100%; height: 100%;'
      : orientation === 'horizontal'
        ? `height: ${panelHeight}px; width: 100%;`
        : `width: ${panelWidth}px; height: 100%;`}
    on:keydown={handlePanelKeydown}
    role="region"
    aria-label="Terminal Veu Integrado"
  >
    <!-- Barra Superior do Terminal Veu -->
    <div class="terminal-bar">
      <div class="term-tabs">
        <div class="veu-badge" title="Terminal Veu — Leve, Sequencial e Formatado">
          <TerminalSquare size={13} class="icon-accent" />
          <span class="badge-title">Terminal Veu</span>
        </div>

        {#each currentTabs as t (t.id)}
          <div
            class="term-tab"
            class:active={t.id === activeTermId}
            on:click={() => switchTab(t.id)}
            role="button"
            tabindex="0"
            on:keydown={(e) => e.key === 'Enter' && switchTab(t.id)}
          >
            <span class="tab-title">{t.title}</span>
            {#if t.isRunning}
              <span class="tab-running-dot" title="Processo em execução"></span>
            {/if}
            <button
              class="close-tab"
              title="Encerrar sessão"
              on:click|stopPropagation={() => closeTerminal(t.id)}
            >
              <X size={11} />
            </button>
          </div>
        {/each}

        <button
          class="add-term-btn"
          title="Nova sessão do Terminal Veu"
          on:click={() => createTerminalSession('powershell.exe', currentFolderPath)}
        >
          <Plus size={13} />
        </button>
      </div>

      <!-- Ações da Barra -->
      <div class="term-actions">
        {#if onSwitchEngine}
          <div class="engine-switch" title="Alternar mecanismo de renderização do terminal">
            <button
              class="engine-btn"
              class:active={terminalEngine === 'xterm'}
              title="xterm.js padrão de terminal com seleção e mouse"
              on:click={() => onSwitchEngine && onSwitchEngine('xterm')}
            >
              <span>xterm</span>
            </button>
            <button
              class="engine-btn lab-btn"
              class:active={terminalEngine === 'veu'}
              title="Terminal Veu (VeuLab) — Leve, sequencial e editorial"
              on:click={() => onSwitchEngine && onSwitchEngine('veu')}
            >
              <FlaskConical size={11} />
              <span>VeuLab</span>
            </button>
          </div>

          <div class="action-divider"></div>
        {/if}

        <!-- Limpar Linha do Tempo -->
        <button
          class="action-btn"
          title="Limpar histórico da tela"
          on:click={handleClearTerminal}
        >
          <Eraser size={13} />
        </button>

        <div class="action-divider"></div>

        <!-- Alternar Orientação -->
        <button
          class="action-btn"
          title={orientation === 'horizontal'
            ? 'Mover para lateral (Dividir Vertical)'
            : 'Mover para rodapé (Dividir Horizontal)'}
          on:click={toggleOrientation}
        >
          {#if orientation === 'horizontal'}
            <Columns size={13} />
          {:else}
            <Rows size={13} />
          {/if}
        </button>

        <!-- Maximizar / Restaurar -->
        <button
          class="action-btn"
          title={isMaximized ? 'Restaurar Painel' : 'Maximizar Terminal'}
          on:click={toggleMaximize}
        >
          {#if isMaximized}
            <Minimize2 size={13} />
          {:else}
            <Maximize2 size={13} />
          {/if}
        </button>

        <!-- Fechar Terminal -->
        <button class="action-btn close-btn" title="Fechar Terminal" on:click={onClose}>
          <X size={13} />
        </button>
      </div>
    </div>

    <!-- Área de Exibição dos Terminais Veu Persistentes por Projeto -->
    <div class="terminal-content">
      {#each currentTabs as t (t.id)}
        <div
          class="term-wrapper"
          class:hidden={t.id !== activeTermId}
          bind:this={timelineContainers[t.id]}
          on:click={focusActiveInput}
          role="presentation"
        >
          <!-- Contexto Inicial da Sessão -->
          <div class="session-header">
            <span class="session-path">{t.cwd || currentFolderPath || 'Pasta ativa'}</span>
            <span class="session-hint">Terminal Veu • Digite comandos inline no fluxo contínuo</span>
          </div>

          <!-- Linha do Tempo de Blocos de Comando e Saída -->
          {#each t.blocks as block (block.id)}
            <div class="command-block" class:is-running={block.status === 'running'}>
              <div class="command-header">
                <div class="command-info">
                  <span class="prompt-glyph">›</span>
                  <span class="command-name">{block.command}</span>
                </div>
                <div class="command-meta">
                  <span class="command-time">{block.timestamp}</span>

                  {#if block.status === 'running'}
                    <span class="running-tag">
                      <span class="pulse-indicator"></span> Rodando
                    </span>
                    <button
                      class="stop-btn"
                      title="Interromper execução (Ctrl+C)"
                      on:click|stopPropagation={() => stopCommand(t)}
                    >
                      <Square size={10} fill="currentColor" /> Parar
                    </button>
                  {:else}
                    <div class="block-actions">
                      <button
                        class="block-btn"
                        class:btn-active={block.copied}
                        title="Copiar saída do comando"
                        on:click|stopPropagation={() => copyBlockOutput(block)}
                      >
                        {#if block.copied}
                          <Check size={11} /> Copiado
                        {:else}
                          <Copy size={11} /> Copiar
                        {/if}
                      </button>

                      {#if onInsertText}
                        <button
                          class="block-btn"
                          class:btn-active={block.inserted}
                          title="Inserir saída no editor"
                          on:click|stopPropagation={() => insertBlockToEditor(block)}
                        >
                          {#if block.inserted}
                            <Check size={11} /> Inserido
                          {:else}
                            <CornerDownLeft size={11} /> No Editor
                          {/if}
                        </button>
                      {/if}
                    </div>
                  {/if}
                </div>
              </div>

              <!-- Retorno Formatado do Comando -->
              {#if block.outputHtml}
                <div class="command-output">
                  {@html block.outputHtml}
                </div>
              {:else if block.status === 'running'}
                <div class="command-output running-placeholder">
                  <span class="spinner-dot"></span> Aguardando saída do processo...
                </div>
              {/if}
            </div>
          {/each}

          <!-- Linha de Entrada Contínua no Próprio Fluxo (Sem caixa separada) -->
          {#if t.isRunning}
            <div class="prompt-stream-container running-status-bar">
              <div class="inline-prompt-row">
                <span class="inline-glyph running-pulse">●</span>
                <span class="running-info-label">Comando em execução...</span>
                <button
                  class="stop-btn"
                  title="Interromper execução (Ctrl+C)"
                  on:click={() => stopCommand(t)}
                >
                  <Square size={10} fill="currentColor" /> Parar (Ctrl+C)
                </button>
                <button
                  class="liberar-btn"
                  title="Liberar campo de digitação"
                  on:click={() => {
                    const r = t.blocks.find((b) => b.status === 'running');
                    if (r) finishBlock(t, r);
                    else t.isRunning = false;
                  }}
                >
                  Liberar Prompt
                </button>
              </div>
            </div>
          {:else}
            <div class="prompt-stream-container">
              <!-- Sugestões de comandos predigitados flutuantes -->
              {#if showSuggestions && suggestions.length > 0}
                <div class="suggestions-popover">
                  <div class="suggestions-header">
                    <span class="header-title">Sugestões de Comandos</span>
                    <span class="header-hint">Tab ou Enter seleciona • Esc fecha</span>
                  </div>
                  <div class="suggestions-list">
                    {#each suggestions as item, idx}
                      <button
                        type="button"
                        class="suggestion-item"
                        class:selected={idx === selectedSuggestionIndex}
                        on:click|stopPropagation={() => applySuggestion(item.cmd, t)}
                        on:mouseenter={() => (selectedSuggestionIndex = idx)}
                        role="option"
                        tabindex="-1"
                        aria-selected={idx === selectedSuggestionIndex}
                      >
                        <span class="suggestion-cmd">{item.cmd}</span>
                        <span class="suggestion-badge badge-{item.category}">{item.category}</span>
                      </button>
                    {/each}
                  </div>
                </div>
              {/if}

              <div class="inline-prompt-row">
                <span class="inline-glyph">›</span>

                <div class="inline-input-wrapper">
                  <!-- Ghost Text de Autocompletion (Linha Única) -->
                  {#if ghostSuggestion && !t.activeInput.includes('\n')}
                    <div class="ghost-overlay" aria-hidden="true">
                      <span class="ghost-invisible">{t.activeInput}</span><span class="ghost-visible">{ghostSuggestion}</span>
                    </div>
                  {/if}

                  <textarea
                    class="inline-terminal-input"
                    rows="1"
                    bind:value={t.activeInput}
                    bind:this={activeInputEl}
                    placeholder="Digite um comando... (Enter executa, Shift+Enter quebra linha)"
                    on:keydown={(e) => handleInputKeydown(e, t)}
                    on:input={() => {
                      updateSuggestions(t.activeInput);
                      resizeTextarea();
                    }}
                    spellcheck="false"
                    autocomplete="off"
                  ></textarea>
                </div>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .resize-handle {
    background-color: var(--veu-border-color);
    transition: background-color 0.2s;
    flex-shrink: 0;
    z-index: 26;
  }

  .resize-handle.handle-horizontal {
    height: 4px;
    width: 100%;
    cursor: row-resize;
  }

  .resize-handle.handle-vertical {
    width: 4px;
    height: 100%;
    cursor: col-resize;
  }

  .resize-handle:hover {
    background-color: var(--veu-h1-color);
  }

  .terminal-panel {
    display: flex;
    flex-direction: column;
    background-color: var(--veu-bg-app);
    color: var(--veu-text-color);
    z-index: 25;
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }

  .terminal-panel.orientation-horizontal:not(.maximized) {
    border-top: 1px solid var(--veu-border-color);
    width: 100%;
  }

  .terminal-panel.orientation-vertical:not(.maximized) {
    border-left: 1px solid var(--veu-border-color);
    height: 100%;
  }

  .terminal-panel.maximized {
    border: none;
    flex: 1 !important;
    width: 100% !important;
    height: 100% !important;
  }

  .terminal-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 32px;
    background-color: var(--veu-bg-sidebar);
    border-bottom: 1px solid var(--veu-border-color);
    padding: 0 8px;
    user-select: none;
    flex-shrink: 0;
  }

  .term-tabs {
    display: flex;
    align-items: center;
    gap: 4px;
    overflow-x: auto;
  }

  .veu-badge {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(192, 132, 252, 0.12);
    color: var(--veu-h2-color);
    font-size: 11px;
    font-weight: 600;
  }

  .term-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 11.5px;
    color: var(--veu-text-color);
    opacity: 0.7;
    background: transparent;
    cursor: pointer;
    transition: opacity 0.15s, background-color 0.15s;
    user-select: none;
  }

  .term-tab:hover {
    opacity: 1;
    background-color: var(--veu-active-item-bg);
  }

  .term-tab.active {
    opacity: 1;
    background-color: var(--veu-active-item-bg);
    color: var(--veu-h2-color);
    font-weight: 500;
  }

  .tab-running-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background-color: #facc15;
    animation: pulse 1.2s infinite;
  }

  .close-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--veu-text-color);
    cursor: pointer;
    padding: 2px;
    border-radius: 2px;
    opacity: 0.6;
    transition: opacity 0.15s, background-color 0.15s;
  }

  .close-tab:hover {
    opacity: 1;
    background-color: rgba(127, 127, 127, 0.2);
  }

  .add-term-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    background: transparent;
    border: none;
    color: var(--veu-text-color);
    border-radius: 3px;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.15s, background-color 0.15s;
  }

  .add-term-btn:hover {
    background-color: var(--veu-active-item-bg);
    opacity: 1;
  }

  .term-actions {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  .engine-switch {
    display: flex;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--veu-border-color);
    border-radius: 4px;
    padding: 1px;
    margin-right: 4px;
  }

  .engine-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: transparent;
    border: none;
    color: var(--veu-text-color);
    font-size: 10.5px;
    padding: 2px 6px;
    border-radius: 3px;
    cursor: pointer;
    opacity: 0.65;
    transition: all 0.15s ease;
  }

  .engine-btn:hover {
    opacity: 1;
    background-color: rgba(127, 127, 127, 0.15);
  }

  .engine-btn.active {
    background-color: var(--veu-active-item-bg);
    color: var(--veu-h2-color);
    opacity: 1;
    font-weight: 600;
  }

  .engine-btn.lab-btn.active {
    color: var(--veu-h1-color);
  }

  .action-btn {
    background: none;
    border: none;
    color: var(--veu-text-color);
    cursor: pointer;
    padding: 4px;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.7;
    transition: opacity 0.15s, background-color 0.15s, color 0.15s;
  }

  .action-btn:hover {
    opacity: 1;
    color: var(--veu-h2-color);
    background-color: var(--veu-active-item-bg);
  }

  .action-divider {
    width: 1px;
    height: 14px;
    background-color: var(--veu-border-color);
    margin: 0 3px;
    opacity: 0.5;
  }

  .action-btn.close-btn:hover {
    color: #ef4444;
  }

  .terminal-content {
    flex: 1;
    position: relative;
    overflow: hidden;
    background-color: var(--veu-bg-app);
  }

  .term-wrapper {
    position: absolute;
    inset: 0;
    overflow-y: auto;
    padding: 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    cursor: text;
  }

  .term-wrapper.hidden {
    display: none;
  }

  .session-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 8px;
    font-size: 11px;
    color: var(--veu-text-color);
    opacity: 0.6;
    border-bottom: 1px dashed var(--veu-border-color);
    margin-bottom: 2px;
    user-select: none;
  }

  .session-path {
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 10.5px;
  }

  .command-block {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 8px 10px;
    border-radius: 6px;
    background-color: rgba(127, 127, 127, 0.05);
    border: 1px solid rgba(127, 127, 127, 0.1);
    transition: border-color 0.15s, background-color 0.15s;
  }

  .command-block.is-running {
    border-color: rgba(244, 114, 182, 0.35);
    background-color: rgba(244, 114, 182, 0.04);
  }

  .command-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
  }

  .command-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  }

  .prompt-glyph {
    color: var(--veu-h1-color);
    font-weight: 700;
    font-size: 13px;
    user-select: none;
  }

  .command-name {
    font-weight: 600;
    color: var(--veu-text-color);
  }

  .command-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    user-select: none;
  }

  .command-time {
    font-size: 10.5px;
    opacity: 0.5;
  }

  .running-tag {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 10.5px;
    color: #facc15;
    font-weight: 500;
  }

  .pulse-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #facc15;
    animation: pulse 1.2s infinite;
  }

  .stop-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 10.5px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .stop-btn:hover {
    background: rgba(239, 68, 68, 0.28);
  }

  .liberar-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(127, 127, 127, 0.15);
    color: var(--veu-text-color);
    border: 1px solid var(--veu-border-color);
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 10.5px;
    cursor: pointer;
    transition: background-color 0.15s, color 0.15s;
    user-select: none;
  }

  .liberar-btn:hover {
    background: var(--veu-active-item-bg);
    color: var(--veu-h2-color);
  }

  .running-status-bar {
    border-top: 1px dashed var(--veu-border-color);
    padding-top: 4px;
  }

  .running-pulse {
    color: #facc15;
    animation: pulse 1s infinite;
  }

  .running-info-label {
    font-size: 11px;
    font-style: italic;
    opacity: 0.7;
    margin-right: 4px;
  }

  .block-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .block-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: transparent;
    border: 1px solid var(--veu-border-color);
    color: var(--veu-text-color);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10.5px;
    cursor: pointer;
    opacity: 0.75;
    transition: opacity 0.15s, background-color 0.15s, color 0.15s;
  }

  .block-btn:hover {
    opacity: 1;
    background-color: var(--veu-active-item-bg);
    color: var(--veu-h2-color);
  }

  .block-btn.btn-active {
    background-color: rgba(74, 222, 128, 0.15);
    border-color: rgba(74, 222, 128, 0.4);
    color: #4ade80;
    opacity: 1;
  }

  .command-output {
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 12px;
    line-height: 1.45;
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--veu-text-color);
    opacity: 0.95;
    padding-top: 2px;
    user-select: text;
  }

  .command-output.running-placeholder {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11.5px;
    opacity: 0.6;
    font-style: italic;
  }

  .spinner-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--veu-h1-color);
    animation: pulse 1s infinite;
  }

  /* Entrada Contínua no Fluxo do Terminal (Sem caixa separada) */
  .prompt-stream-container {
    position: relative;
    margin-top: 4px;
  }

  .inline-prompt-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 6px;
    background: transparent;
    border: none;
    box-sizing: border-box;
  }

  .inline-glyph {
    color: var(--veu-h1-color);
    font-weight: 700;
    font-size: 14px;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    user-select: none;
    line-height: 1;
  }

  .inline-glyph.running {
    color: #facc15;
  }

  .interactive-pill {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 1px 6px;
    border-radius: 3px;
    background: rgba(250, 204, 21, 0.15);
    color: #facc15;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    user-select: none;
  }

  .inline-input-wrapper {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
  }

  .ghost-overlay {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    pointer-events: none;
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 12.5px;
    line-height: 22px;
    white-space: pre;
    display: flex;
    align-items: center;
    user-select: none;
  }

  .ghost-invisible {
    visibility: hidden;
  }

  .ghost-visible {
    color: var(--veu-text-color);
    opacity: 0.35;
    font-style: italic;
  }

  .inline-terminal-input {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    color: var(--veu-text-color);
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 12.5px;
    line-height: 20px;
    padding: 0;
    margin: 0;
    caret-color: var(--veu-h1-color);
    resize: none;
    overflow-y: hidden;
    box-shadow: none;
    display: block;
  }

  .inline-terminal-input::placeholder {
    color: var(--veu-text-color);
    opacity: 0.35;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 11.5px;
    font-style: italic;
  }

  /* Popover de Sugestões de Comandos */
  .suggestions-popover {
    position: absolute;
    bottom: calc(100% + 4px);
    left: 8px;
    width: 320px;
    max-width: 90vw;
    background-color: var(--veu-bg-sidebar);
    border: 1px solid var(--veu-border-color);
    border-radius: 6px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    z-index: 50;
    overflow: hidden;
    animation: fadeIn 0.12s ease-out;
  }

  .suggestions-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 8px;
    background-color: rgba(127, 127, 127, 0.08);
    border-bottom: 1px solid var(--veu-border-color);
    font-size: 10px;
    color: var(--veu-text-color);
    opacity: 0.75;
    user-select: none;
  }

  .header-title {
    font-weight: 600;
  }

  .header-hint {
    font-size: 9.5px;
    opacity: 0.8;
  }

  .suggestions-list {
    max-height: 180px;
    overflow-y: auto;
    padding: 3px;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .suggestion-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background: transparent;
    border: none;
    text-align: left;
    padding: 5px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11.5px;
    transition: background-color 0.1s;
    user-select: none;
  }

  .suggestion-item:hover,
  .suggestion-item.selected {
    background-color: var(--veu-active-item-bg);
  }

  .suggestion-cmd {
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
    color: var(--veu-text-color);
    font-weight: 500;
  }

  .suggestion-badge {
    font-size: 9.5px;
    padding: 1px 5px;
    border-radius: 3px;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.3px;
  }

  .badge-histórico {
    background: rgba(192, 132, 252, 0.15);
    color: var(--veu-h2-color);
  }

  .badge-git {
    background: rgba(244, 114, 182, 0.15);
    color: #f472b6;
  }

  .badge-npm {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }

  .badge-tauri {
    background: rgba(56, 189, 248, 0.15);
    color: #38bdf8;
  }

  .badge-agy {
    background: rgba(168, 85, 247, 0.2);
    color: #c084fc;
  }

  .badge-cargo {
    background: rgba(249, 115, 22, 0.15);
    color: #f97316;
  }

  .badge-sistema {
    background: rgba(148, 163, 184, 0.15);
    color: #94a3b8;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.4;
      transform: scale(0.85);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
