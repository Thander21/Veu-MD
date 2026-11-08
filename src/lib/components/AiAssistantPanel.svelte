<script context="module" lang="ts">
  export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    isStreaming?: boolean;
    copied?: boolean;
    inserted?: boolean;
  }
</script>

<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import {
    BotMessageSquare,
    Wand2,
    X,
    Send,
    Square,
    Copy,
    Check,
    CornerDownLeft,
    Trash2,
    Sparkles,
    FileText,
    CheckCheck,
    Code2,
    Compass,
    Settings,
    Terminal,
    ArrowLeft,
    Zap
  } from 'lucide-svelte';
  import { invoke } from '@tauri-apps/api/core';
  import { listen } from '@tauri-apps/api/event';
  import {
    AI_PROVIDERS,
    type AiProvider,
    getSupportedAiProviders,
    DEFAULT_AI_PROVIDER_ID
  } from '../ai/aiProviders';
  import AiWizardView from './AiWizardView.svelte';
  import AiSettingsView from './AiSettingsView.svelte';

  export let visible: boolean = false;
  export let currentFolderPath: string = '';
  export let onClose: () => void;
  export let onInsertText: ((text: string) => void) | undefined = undefined;
  export let getEditorSelection: (() => string) | undefined = undefined;
  export let onRunTerminalCommand: ((command: string, customTitle?: string) => void) | undefined = undefined;

  let messages: ChatMessage[] = [];
  let currentInput: string = '';
  let isGenerating: boolean = false;
  let providers: AiProvider[] = getSupportedAiProviders();
  let defaultProviderId: string = 'agy';
  let activeCliTool: string = 'agy';
  let activeView: 'chat' | 'settings' | 'wizard' = 'chat';
  let isCheckingProviders: boolean = false;
  let activeReqId: string = '';
  let unlistenStream: (() => void) | null = null;
  let unlistenDone: (() => void) | null = null;

  let messagesContainerEl: HTMLDivElement | null = null;
  let inputEl: HTMLTextAreaElement | null = null;

  function scrollToBottom() {
    tick().then(() => {
      if (messagesContainerEl) {
        messagesContainerEl.scrollTop = messagesContainerEl.scrollHeight;
      }
    });
  }

  function resizeInput() {
    if (inputEl) {
      inputEl.style.height = 'auto';
      inputEl.style.height = `${Math.min(160, Math.max(38, inputEl.scrollHeight))}px`;
    }
  }

  export function submitPrompt(promptText: string) {
    if (!promptText || !promptText.trim() || isGenerating) return;

    const trimmed = promptText.trim();
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const assistantMsgId = `ast-${Date.now()}`;
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true
    };

    messages = [...messages, userMsg, assistantMsg];
    currentInput = '';
    isGenerating = true;
    resizeInput();
    scrollToBottom();

    const reqId = `ai-req-${Date.now()}`;
    activeReqId = reqId;

    // Escuta eventos de streaming e conclusão do processo Rust
    cleanupListeners();

    Promise.all([
      listen(`ai-stream-${reqId}`, (event: any) => {
        const chunk = event.payload as string;
        if (!chunk) return;

        const target = messages.find((m) => m.id === assistantMsgId);
        if (target) {
          target.content += chunk;
          messages = [...messages];
          scrollToBottom();
        }
      }),
      listen(`ai-done-${reqId}`, () => {
        const target = messages.find((m) => m.id === assistantMsgId);
        if (target) {
          target.isStreaming = false;
          if (!target.content.trim()) {
            target.content = 'Concluído com sucesso.';
          }
          messages = [...messages];
        }
        isGenerating = false;
        cleanupListeners();
        scrollToBottom();
      })
    ]).then(([unStream, unDone]) => {
      unlistenStream = unStream;
      unlistenDone = unDone;

      const hasHistory = messages.filter((m) => m.role === 'user').length > 1;

      invoke('run_ai_prompt', {
        reqId,
        cwd: currentFolderPath || null,
        cliTool: activeCliTool,
        prompt: trimmed,
        continueSession: hasHistory
      }).catch((err) => {
        const target = messages.find((m) => m.id === assistantMsgId);
        if (target) {
          target.content = `Erro ao invocar ${activeCliTool}: ${err}`;
          target.isStreaming = false;
          messages = [...messages];
        }
        isGenerating = false;
        cleanupListeners();
        scrollToBottom();
      });
    });
  }

  function cleanupListeners() {
    if (unlistenStream) {
      unlistenStream();
      unlistenStream = null;
    }
    if (unlistenDone) {
      unlistenDone();
      unlistenDone = null;
    }
  }

  function handleStop() {
    if (activeReqId) {
      invoke('cancel_ai_prompt', { reqId: activeReqId }).catch(() => {});
    }
    isGenerating = false;
    const target = messages.find((m) => m.isStreaming);
    if (target) {
      target.isStreaming = false;
      target.content += '\n\n*(Interrompido pelo usuário)*';
      messages = [...messages];
    }
    cleanupListeners();
  }

  function clearHistory() {
    if (isGenerating) handleStop();
    messages = [];
  }

  function copyText(msg: ChatMessage) {
    if (!msg.content) return;
    navigator.clipboard.writeText(msg.content);
    msg.copied = true;
    messages = [...messages];
    setTimeout(() => {
      msg.copied = false;
      messages = [...messages];
    }, 1500);
  }

  function insertToEditor(msg: ChatMessage) {
    if (!msg.content || !onInsertText) return;
    onInsertText(msg.content);
    msg.inserted = true;
    messages = [...messages];
    setTimeout(() => {
      msg.inserted = false;
      messages = [...messages];
    }, 1500);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        tick().then(resizeInput);
        return;
      }
      e.preventDefault();
      submitPrompt(currentInput);
    }
  }

  function attachSelection() {
    if (getEditorSelection) {
      const sel = getEditorSelection();
      if (sel) {
        currentInput = currentInput
          ? `${currentInput}\n\nTrecho selecionado:\n\`\`\`\n${sel}\n\`\`\``
          : `Sobre este trecho do texto:\n\`\`\`\n${sel}\n\`\`\``;
        tick().then(() => {
          resizeInput();
          inputEl?.focus();
        });
      }
    }
  }

  let prevVisible = false;
  $: if (visible && !prevVisible) {
    prevVisible = true;
    setTimeout(() => {
      inputEl?.focus();
    }, 60);
  } else if (!visible && prevVisible) {
    prevVisible = false;
  }

  let panelWidth = 360;
  let isResizing = false;

  onMount(() => {
    const saved = localStorage.getItem('veu_ai_sidebar_width');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 260 && parsed <= 800) {
        panelWidth = parsed;
      }
    }
    const savedDefault = localStorage.getItem('veu_ai_default_provider');
    if (savedDefault && AI_PROVIDERS[savedDefault]) {
      defaultProviderId = savedDefault;
      activeCliTool = savedDefault;
    }
    checkInstalledTools();
  });

  async function checkInstalledTools() {
    isCheckingProviders = true;
    try {
      const res: Record<string, boolean> = await invoke('check_ai_tools', {
        tools: ['agy', 'claude', 'muse']
      });
      providers = providers.map((p) => ({
        ...p,
        isInstalled: !!res[p.cli] || !!res[p.id]
      }));
    } catch (err) {
      console.error('Erro ao checar ferramentas de IA:', err);
    } finally {
      isCheckingProviders = false;
    }
  }

  function setDefaultProvider(id: string) {
    defaultProviderId = id;
    activeCliTool = id;
    localStorage.setItem('veu_ai_default_provider', id);
  }

  function handleInstallProvider(provider: AiProvider) {
    if (onRunTerminalCommand) {
      onRunTerminalCommand(provider.installCmd, `Instalar ${provider.name}`);
    }
  }

  function handleOpenTerminalSession(provider: AiProvider) {
    if (onRunTerminalCommand) {
      onRunTerminalCommand(provider.cli, provider.name);
    }
  }

  function handleStartCli(fullPermissions: boolean) {
    if (!onRunTerminalCommand) return;
    const provider = AI_PROVIDERS[activeCliTool] || AI_PROVIDERS.agy;
    const cmd = fullPermissions
      ? `${provider.cli} --dangerously-skip-permissions`
      : provider.cli;
    const title = fullPermissions
      ? `${provider.name} (Permissão Total)`
      : `${provider.name}`;
    onRunTerminalCommand(cmd, title);
  }

  function handleFinishWizard() {
    localStorage.setItem('veu_ai_wizard_seen', 'true');
    activeView = 'chat';
  }

  function startResizing(e: MouseEvent) {
    e.preventDefault();
    isResizing = true;
    const startX = e.clientX;
    const startW = panelWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizing) return;
      const delta = startX - moveEvent.clientX;
      panelWidth = Math.min(800, Math.max(260, startW + delta));
    };

    const onMouseUp = () => {
      if (isResizing) {
        isResizing = false;
        localStorage.setItem('veu_ai_sidebar_width', String(panelWidth));
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }

  function handleWindowKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && visible) {
      e.preventDefault();
      onClose();
    }
  }

  onDestroy(() => {
    if (isGenerating && activeReqId) {
      invoke('cancel_ai_prompt', { reqId: activeReqId }).catch(() => {});
    }
    cleanupListeners();
  });
</script>

<svelte:window on:keydown={handleWindowKeydown} />

{#if visible}
  <aside class="ai-drawer" style="width: {panelWidth}px;" aria-label="Chat IA Veu">
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="sidebar-resize-handle"
      on:mousedown={startResizing}
      role="separator"
      aria-label="Redimensionar Chat IA"
    ></div>

    <!-- Cabeçalho do Assistente -->
    <div class="drawer-header">
      {#if activeView === 'chat'}
        <div class="drawer-title">
          <button
            type="button"
            class="wand-icon-wrap retract-action-btn"
            title="Recolher Chat IA (Ctrl+L)"
            aria-label="Recolher Chat IA"
            on:click={onClose}
          >
            <BotMessageSquare size={16} class="icon-accent" />
          </button>
          <div class="title-meta">
            <span class="main-title">Chat IA</span>
            <div class="provider-select-wrap">
              <select
                class="provider-select"
                bind:value={activeCliTool}
                title="Alternar ferramenta de IA ativa"
              >
                {#each providers as p}
                  <option value={p.id}>
                    {p.name} {p.isInstalled ? '●' : '○'}
                  </option>
                {/each}
              </select>
            </div>
          </div>
        </div>

        <div class="header-actions">
          <button
            class="action-btn"
            title="Assistente de Boas-Vindas (Wizard)"
            on:click={() => (activeView = 'wizard')}
          >
            <Wand2 size={13} />
          </button>
          <button
            class="action-btn"
            title="Configurações do Assistente de IA"
            on:click={() => (activeView = 'settings')}
          >
            <Settings size={13} />
          </button>
          {#if messages.length > 0}
            <button class="action-btn" title="Limpar conversa" on:click={clearHistory}>
              <Trash2 size={13} />
            </button>
          {/if}
          <button class="action-btn close-btn" title="Fechar Assistente (Esc)" on:click={onClose}>
            <X size={15} />
          </button>
        </div>
      {:else}
        <div class="drawer-title">
          <button class="btn-back-header" on:click={() => (activeView = 'chat')}>
            <ArrowLeft size={14} />
            <span>Voltar ao Chat</span>
          </button>
        </div>
        <div class="header-actions">
          <button class="action-btn close-btn" title="Fechar Assistente (Esc)" on:click={onClose}>
            <X size={15} />
          </button>
        </div>
      {/if}
    </div>

    {#if activeView === 'wizard'}
      <AiWizardView
        {providers}
        selectedProviderId={defaultProviderId}
        isChecking={isCheckingProviders}
        onSelectDefault={setDefaultProvider}
        onInstallProvider={handleInstallProvider}
        onOpenTerminalSession={handleOpenTerminalSession}
        onRefreshStatus={checkInstalledTools}
        onFinishWizard={handleFinishWizard}
      />
    {:else if activeView === 'settings'}
      <AiSettingsView
        {providers}
        {defaultProviderId}
        {isCheckingProviders}
        onSelectDefault={setDefaultProvider}
        onRefreshStatus={checkInstalledTools}
        onOpenTerminalSession={handleOpenTerminalSession}
        onInstallProvider={handleInstallProvider}
        onOpenWizard={() => (activeView = 'wizard')}
      />
    {:else}
      <!-- Corpo das Mensagens -->
      <div class="drawer-body" bind:this={messagesContainerEl}>
        {#if messages.length === 0}
          <div class="empty-state">
            <div class="spark-circle">
              <Sparkles size={24} class="spark-icon" />
            </div>
            <h3 class="empty-title">
              {AI_PROVIDERS[activeCliTool]?.name || 'Agente de IA'}
            </h3>
            <p class="empty-desc">
              Inicie o CLI oficial diretamente no <strong>Terminal Veu</strong> ou envie sua solicitação no chat abaixo:
            </p>

            <div class="cli-launch-actions">
              <button
                class="cli-card-btn normal-btn"
                on:click={() => handleStartCli(false)}
                title="Iniciar {AI_PROVIDERS[activeCliTool]?.name || activeCliTool} no Terminal Veu"
              >
                <div class="cli-card-icon">
                  <Terminal size={16} />
                </div>
                <div class="cli-card-content">
                  <div class="cli-card-header">
                    <span class="cli-card-title">Iniciar Normal</span>
                    <span class="cli-badge default">Padrão</span>
                  </div>
                  <code class="cli-cmd">{activeCliTool}</code>
                  <span class="cli-card-hint">Sessão interativa com confirmações padrão</span>
                </div>
              </button>

              <button
                class="cli-card-btn full-perm-btn"
                on:click={() => handleStartCli(true)}
                title="Iniciar {AI_PROVIDERS[activeCliTool]?.name || activeCliTool} com Permissão Total no Terminal Veu"
              >
                <div class="cli-card-icon zap">
                  <Zap size={16} />
                </div>
                <div class="cli-card-content">
                  <div class="cli-card-header">
                    <span class="cli-card-title">Permissão Total</span>
                    <span class="cli-badge full">Auto-approve</span>
                  </div>
                  <code class="cli-cmd">{activeCliTool} --dangerously-skip-permissions</code>
                  <span class="cli-card-hint">Execução autônoma com ferramentas auto-aprovadas</span>
                </div>
              </button>
            </div>
          </div>
        {:else}
          <div class="messages-list">
            {#each messages as msg (msg.id)}
              <div class="message-row {msg.role}">
                <div class="message-bubble">
                  <div class="message-header">
                    <span class="message-sender">
                      {msg.role === 'user' ? 'Você' : activeCliTool.toUpperCase()}
                    </span>
                    <span class="message-time">{msg.timestamp}</span>
                  </div>

                  <div class="message-content">
                    {#if msg.role === 'assistant' && !msg.content && msg.isStreaming}
                      <div class="typing-indicator">
                        <span></span><span></span><span></span>
                      </div>
                    {:else}
                      <div class="content-text">{msg.content}</div>
                    {/if}
                  </div>

                  {#if msg.role === 'assistant' && msg.content && !msg.isStreaming}
                    <div class="message-actions">
                      <button
                        class="msg-btn"
                        class:btn-active={msg.copied}
                        title="Copiar resposta"
                        on:click={() => copyText(msg)}
                      >
                        {#if msg.copied}
                          <Check size={11} /> Copiado
                        {:else}
                          <Copy size={11} /> Copiar
                        {/if}
                      </button>

                      {#if onInsertText}
                        <button
                          class="msg-btn"
                          class:btn-active={msg.inserted}
                          title="Inserir no editor Markdown"
                          on:click={() => insertToEditor(msg)}
                        >
                          {#if msg.inserted}
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
            {/each}
          </div>
        {/if}
      </div>

      <!-- Rodapé: Entrada do Chat -->
      <div class="drawer-footer">
        <div class="input-container">
          <textarea
            bind:this={inputEl}
            bind:value={currentInput}
            rows="1"
            placeholder="Peça à IA para escrever, resumir ou revisar... (Enter envia)"
            on:keydown={handleKeydown}
            on:input={resizeInput}
            spellcheck="false"
          ></textarea>

          <div class="input-actions-bar">
            <button
              class="context-chip-btn"
              title="Anexar trecho selecionado no editor"
              on:click={attachSelection}
            >
              <FileText size={11} />
              <span>+ Seleção</span>
            </button>

            <div class="action-submit-wrap">
              {#if isGenerating}
                <button class="stop-btn" title="Interromper geração" on:click={handleStop}>
                  <Square size={11} fill="currentColor" /> Parar
                </button>
              {:else}
                <button
                  class="send-btn"
                  class:can-send={!!currentInput.trim()}
                  title="Enviar mensagem (Enter)"
                  on:click={() => submitPrompt(currentInput)}
                  disabled={!currentInput.trim()}
                >
                  <Send size={12} />
                </button>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/if}
  </aside>
{/if}

<style>
  .sidebar-resize-handle {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 6px;
    cursor: col-resize;
    background-color: transparent;
    transition: background-color 0.2s;
    z-index: 41;
  }

  .sidebar-resize-handle:hover {
    background-color: var(--veu-h1-color);
  }

  .ai-drawer {
    position: fixed;
    right: 0;
    top: 44px;
    bottom: 24px;
    max-width: 90vw;
    background-color: var(--veu-bg-sidebar);
    border-left: 1px solid var(--veu-border-color);
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.35);
    display: flex;
    flex-direction: column;
    z-index: 40;
    box-sizing: border-box;
    overflow: hidden;
  }

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-bottom: 1px solid var(--veu-border-color);
    background-color: rgba(0, 0, 0, 0.08);
  }

  .drawer-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .wand-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 6px;
    background: rgba(244, 114, 182, 0.12);
    color: var(--veu-h1-color);
    border: 1px solid rgba(244, 114, 182, 0.2);
    cursor: pointer;
    padding: 0;
    transition: all 0.15s ease;
  }

  .wand-icon-wrap:hover {
    background: rgba(244, 114, 182, 0.25);
    border-color: rgba(244, 114, 182, 0.45);
    transform: scale(1.06);
  }

  .wand-icon-wrap:active {
    transform: scale(0.95);
  }

  .title-meta {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .provider-select-wrap {
    display: inline-flex;
    align-items: center;
  }

  .provider-select {
    background-color: var(--veu-active-item-bg);
    border: 1px solid var(--veu-border-color);
    color: var(--veu-text-color);
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;
    padding: 2px 6px;
    cursor: pointer;
    outline: none;
  }

  .btn-back-header {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: none;
    color: var(--veu-text-color);
    font-size: 12px;
    cursor: pointer;
    opacity: 0.8;
    padding: 4px 6px;
    border-radius: 4px;
    transition: all 0.15s ease;
  }

  .btn-back-header:hover {
    opacity: 1;
    color: var(--veu-h1-color);
    background-color: var(--veu-active-item-bg);
  }

  .main-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--veu-text-color);
  }

  .agent-badge {
    font-size: 9px;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 4px;
    background: rgba(192, 132, 252, 0.2);
    color: var(--veu-h2-color);
    letter-spacing: 0.5px;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .action-btn {
    background: transparent;
    border: none;
    color: var(--veu-text-color);
    cursor: pointer;
    padding: 5px;
    border-radius: 4px;
    opacity: 0.7;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.15s, background-color 0.15s, color 0.15s;
  }

  .action-btn:hover {
    opacity: 1;
    background-color: var(--veu-active-item-bg);
  }

  .action-btn.close-btn:hover {
    color: #ef4444;
  }

  .drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 14px;
    display: flex;
    flex-direction: column;
  }

  /* Estado Inicial (Vazio) */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin: auto 0;
    padding: 16px 8px;
  }

  .spark-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(244, 114, 182, 0.15), rgba(192, 132, 252, 0.15));
    border: 1px solid rgba(244, 114, 182, 0.3);
    color: var(--veu-h1-color);
    margin-bottom: 14px;
  }

  .empty-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--veu-text-color);
    margin: 0 0 8px 0;
  }

  .empty-desc {
    font-size: 11.5px;
    line-height: 1.5;
    color: var(--veu-text-color);
    opacity: 0.7;
    margin: 0 0 20px 0;
    max-width: 280px;
  }

  .cli-launch-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }

  .cli-card-btn {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    background-color: rgba(127, 127, 127, 0.08);
    border: 1px solid var(--veu-border-color);
    color: var(--veu-text-color);
    text-align: left;
    cursor: pointer;
    transition: all 0.18s ease;
  }

  .cli-card-btn:hover {
    background-color: var(--veu-active-item-bg);
    border-color: var(--veu-h1-color);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .cli-card-btn.full-perm-btn:hover {
    border-color: #f5c2e7;
  }

  .cli-card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: rgba(116, 199, 236, 0.15);
    color: #74c7ec;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .cli-card-icon.zap {
    background: rgba(245, 194, 231, 0.15);
    color: #f5c2e7;
  }

  .cli-card-content {
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1;
    min-width: 0;
  }

  .cli-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
  }

  .cli-card-title {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--veu-text-color);
  }

  .cli-badge {
    font-size: 10px;
    font-weight: 600;
    padding: 1px 6px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .cli-badge.default {
    background: rgba(116, 199, 236, 0.2);
    color: #74c7ec;
  }

  .cli-badge.full {
    background: rgba(245, 194, 231, 0.2);
    color: #f5c2e7;
  }

  .cli-cmd {
    font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
    font-size: 11px;
    color: var(--veu-h1-color);
    background: rgba(0, 0, 0, 0.25);
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .cli-card-hint {
    font-size: 10.5px;
    color: var(--veu-text-color);
    opacity: 0.65;
    line-height: 1.35;
  }

  /* Lista de Mensagens */
  .messages-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .message-row {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .message-row.user {
    align-items: flex-end;
  }

  .message-row.assistant {
    align-items: flex-start;
  }

  .message-bubble {
    max-width: 92%;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 12.5px;
    line-height: 1.5;
    word-break: break-word;
    box-sizing: border-box;
  }

  .message-row.user .message-bubble {
    background: linear-gradient(135deg, rgba(244, 114, 182, 0.15), rgba(192, 132, 252, 0.18));
    border: 1px solid rgba(244, 114, 182, 0.35);
    color: var(--veu-text-color);
  }

  .message-row.assistant .message-bubble {
    background-color: rgba(127, 127, 127, 0.08);
    border: 1px solid var(--veu-border-color);
    color: var(--veu-text-color);
  }

  .message-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 4px;
    font-size: 10px;
    opacity: 0.65;
  }

  .message-sender {
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .content-text {
    white-space: pre-wrap;
    font-family: inherit;
  }

  .message-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    padding-top: 6px;
    border-top: 1px dashed var(--veu-border-color);
  }

  .msg-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: transparent;
    border: 1px solid var(--veu-border-color);
    color: var(--veu-text-color);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    cursor: pointer;
    opacity: 0.75;
    transition: opacity 0.15s, background-color 0.15s, color 0.15s;
  }

  .msg-btn:hover {
    opacity: 1;
    background-color: var(--veu-active-item-bg);
    color: var(--veu-h2-color);
  }

  .msg-btn.btn-active {
    background-color: rgba(74, 222, 128, 0.15);
    border-color: rgba(74, 222, 128, 0.4);
    color: #4ade80;
    opacity: 1;
  }

  .typing-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 0;
  }

  .typing-indicator span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--veu-h1-color);
    animation: typingBounce 1.2s infinite ease-in-out;
  }

  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }
  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typingBounce {
    0%,
    80%,
    100% {
      transform: scale(0.6);
      opacity: 0.4;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* Rodapé / Input */
  .drawer-footer {
    padding: 10px 12px;
    border-top: 1px solid var(--veu-border-color);
    background-color: rgba(0, 0, 0, 0.08);
  }

  .input-container {
    display: flex;
    flex-direction: column;
    background-color: var(--veu-bg-app);
    border: 1px solid var(--veu-border-color);
    border-radius: 8px;
    padding: 8px 10px 6px 10px;
    transition: border-color 0.15s;
  }

  .input-container:focus-within {
    border-color: var(--veu-h1-color);
  }

  textarea {
    width: 100%;
    min-height: 38px;
    background: transparent;
    border: none;
    outline: none;
    color: var(--veu-text-color);
    font-family: inherit;
    font-size: 12px;
    line-height: 1.45;
    resize: none;
    max-height: 160px;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }

  textarea::placeholder {
    color: var(--veu-text-color);
    opacity: 0.4;
    font-size: 11px;
  }

  .input-actions-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 6px;
    padding-top: 4px;
    border-top: 1px dashed rgba(127, 127, 127, 0.15);
  }

  .context-chip-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: transparent;
    border: none;
    color: var(--veu-text-color);
    font-size: 10px;
    opacity: 0.65;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 3px;
    transition: opacity 0.15s, color 0.15s;
  }

  .context-chip-btn:hover {
    opacity: 1;
    color: var(--veu-h1-color);
  }

  .action-submit-wrap {
    display: flex;
    align-items: center;
  }

  .send-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: none;
    background: var(--veu-active-item-bg);
    color: var(--veu-text-color);
    opacity: 0.4;
    cursor: not-allowed;
    transition: background 0.15s, color 0.15s, opacity 0.15s;
  }

  .send-btn.can-send {
    background: linear-gradient(135deg, var(--veu-h1-color), var(--veu-h2-color));
    color: #ffffff;
    opacity: 1;
    cursor: pointer;
  }

  .stop-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.35);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10.5px;
    font-weight: 600;
    cursor: pointer;
  }

  .stop-btn:hover {
    background: rgba(239, 68, 68, 0.3);
  }
</style>
