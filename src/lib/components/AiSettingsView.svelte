<script lang="ts">
  import {
    RefreshCw,
    Terminal,
    Download,
    Wand2
  } from 'lucide-svelte';
  import type { AiProvider } from '../ai/aiProviders';

  export let providers: AiProvider[] = [];
  export let defaultProviderId: string = 'agy';
  export let isCheckingProviders: boolean = false;
  export let onSelectDefault: (id: string) => void;
  export let onRefreshStatus: () => void;
  export let onOpenTerminalSession: (provider: AiProvider) => void;
  export let onInstallProvider: (provider: AiProvider) => void;
  export let onOpenWizard: () => void;
</script>

<div class="settings-scroll-body">
  <div class="settings-card">
    <h4 class="settings-card-title">IA Padrão do Sistema</h4>
    <p class="settings-card-desc">
      Selecione qual ferramenta será utilizada por padrão para novos chats e atalhos.
    </p>
    <div class="provider-radio-list">
      {#each providers as p}
        <label class="provider-radio-row" class:is-default={p.id === defaultProviderId}>
          <input
            type="radio"
            name="defaultAiProvider"
            value={p.id}
            checked={p.id === defaultProviderId}
            on:change={() => onSelectDefault(p.id)}
          />
          <div class="radio-label-info">
            <div class="name-status-row">
              <span class="p-name">{p.name}</span>
              {#if p.isInstalled}
                <span class="p-badge ok">Instalado</span>
              {:else}
                <span class="p-badge missing">Não detectado</span>
              {/if}
            </div>
            <span class="p-plan">{p.planType}</span>
          </div>
        </label>
      {/each}
    </div>
  </div>

  <div class="settings-card">
    <div class="card-header-flex">
      <h4 class="settings-card-title">Ferramentas e Terminal</h4>
      <button
        class="refresh-icon-btn"
        disabled={isCheckingProviders}
        on:click={onRefreshStatus}
        title="Re-verificar instalação no PATH"
      >
        <RefreshCw size={12} class={isCheckingProviders ? 'spin' : ''} />
      </button>
    </div>

    <div class="tools-manage-list">
      {#each providers as p}
        <div class="tool-manage-item">
          <div class="tool-text">
            <span class="tool-title">{p.name}</span>
            <span class="tool-command">CLI: <code>{p.cli}</code></span>
          </div>
          <div class="tool-actions-flex">
            {#if p.isInstalled}
              <button
                class="btn-tool-terminal"
                on:click={() => onOpenTerminalSession(p)}
                title="Abrir sessão interativa com controle total no Terminal Veu"
              >
                <Terminal size={12} /> Terminal
              </button>
            {:else}
              <button
                class="btn-tool-install"
                on:click={() => onInstallProvider(p)}
                title="Instalar via Terminal Veu com controle total"
              >
                <Download size={12} /> Instalar
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div class="settings-card">
    <h4 class="settings-card-title">Assistente de Configuração</h4>
    <p class="settings-card-desc">
      Deseja revisar a visão geral e guia de instalação das 3 ferramentas?
    </p>
    <button class="btn-launch-wizard" on:click={onOpenWizard}>
      <Wand2 size={13} />
      <span>Abrir Wizard de Primeiro Uso</span>
    </button>
  </div>
</div>

<style>
  .settings-scroll-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .settings-card {
    background-color: var(--veu-bg-app);
    border: 1px solid var(--veu-border-color);
    border-radius: 8px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .card-header-flex {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .settings-card-title {
    font-size: 12.5px;
    font-weight: 600;
    margin: 0;
    color: var(--veu-text-color);
  }

  .settings-card-desc {
    font-size: 11px;
    line-height: 1.45;
    opacity: 0.75;
    margin: 0;
  }

  .provider-radio-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .provider-radio-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid var(--veu-border-color);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .provider-radio-row.is-default {
    border-color: var(--veu-h1-color);
    background-color: var(--veu-active-item-bg);
  }

  .radio-label-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
  }

  .name-status-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .p-name {
    font-size: 12px;
    font-weight: 600;
  }

  .p-plan {
    font-size: 10px;
    opacity: 0.65;
  }

  .p-badge {
    font-size: 9.5px;
    padding: 1px 5px;
    border-radius: 3px;
    font-weight: 500;
  }

  .p-badge.ok {
    background-color: rgba(74, 222, 128, 0.15);
    color: #4ade80;
  }

  .p-badge.missing {
    background-color: rgba(127, 127, 127, 0.15);
    color: var(--veu-text-color);
    opacity: 0.6;
  }

  .tools-manage-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tool-manage-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px;
    border-radius: 6px;
    background-color: rgba(127, 127, 127, 0.05);
  }

  .tool-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .tool-title {
    font-size: 11.5px;
    font-weight: 500;
  }

  .tool-command {
    font-size: 10px;
    opacity: 0.6;
  }

  .tool-command code {
    color: var(--veu-h2-color);
  }

  .tool-actions-flex {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .btn-tool-terminal, .btn-tool-install {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10.5px;
    font-weight: 500;
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid var(--veu-border-color);
    background-color: transparent;
    color: var(--veu-text-color);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-tool-terminal:hover {
    background-color: var(--veu-active-item-bg);
    color: var(--veu-h1-color);
  }

  .btn-tool-install {
    background-color: var(--veu-active-item-bg);
    border-color: var(--veu-h1-color);
    color: var(--veu-h1-color);
  }

  .btn-launch-wizard {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 7px 12px;
    border-radius: 5px;
    border: 1px solid var(--veu-border-color);
    background-color: var(--veu-active-item-bg);
    color: var(--veu-h1-color);
    font-size: 11.5px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-launch-wizard:hover {
    filter: brightness(1.15);
  }

  .refresh-icon-btn {
    background: transparent;
    border: none;
    color: var(--veu-text-color);
    cursor: pointer;
    opacity: 0.7;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 4px;
  }

  .refresh-icon-btn:hover:not(:disabled) {
    opacity: 1;
    color: var(--veu-h1-color);
  }

  :global(.spin) {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
