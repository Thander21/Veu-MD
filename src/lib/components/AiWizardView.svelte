<script lang="ts">
  import {
    Sparkles,
    Terminal,
    CheckCircle2,
    Download,
    RefreshCw,
    ExternalLink,
    ShieldAlert,
    Cpu,
    ArrowRight
  } from 'lucide-svelte';
  import type { AiProvider } from '../ai/aiProviders';

  export let providers: AiProvider[] = [];
  export let selectedProviderId: string = 'agy';
  export let isChecking: boolean = false;
  export let onSelectDefault: (id: string) => void;
  export let onInstallProvider: (provider: AiProvider) => void;
  export let onOpenTerminalSession: (provider: AiProvider) => void;
  export let onRefreshStatus: () => void;
  export let onFinishWizard: () => void;
</script>

<div class="ai-wizard-container">
  <!-- Cabeçalho do Wizard -->
  <div class="wizard-header">
    <div class="icon-orb">
      <Sparkles size={22} color="var(--veu-h1-color)" />
    </div>
    <h2 class="wizard-title">Configurar Assistente de IA</h2>
    <p class="wizard-desc">
      O Veu MD suporta as principais ferramentas de IA para desenvolvimento com planos mensais.
      Escolha qual deseja instalar e utilizar diretamente no seu fluxo de trabalho.
    </p>
  </div>

  <!-- Lista de Cartões de Provedores -->
  <div class="providers-list">
    {#each providers as provider (provider.id)}
      {@const isDefault = provider.id === selectedProviderId}
      {@const isInstalled = !!provider.isInstalled}
      <div
        class="provider-card"
        class:is-installed={isInstalled}
        class:is-default={isDefault}
        style="--provider-color: {provider.color};"
      >
        <div class="card-top">
          <div class="provider-info">
            <div class="title-row">
              <span class="provider-name">{provider.name}</span>
              <span class="plan-badge">{provider.planType}</span>
            </div>
            <span class="provider-tagline">{provider.tagline}</span>
          </div>

          <div class="status-indicator">
            {#if isInstalled}
              <span class="badge-installed">
                <CheckCircle2 size={13} /> Instalado
              </span>
            {:else}
              <span class="badge-missing">
                Não detectado
              </span>
            {/if}
          </div>
        </div>

        <p class="provider-desc">{provider.description}</p>

        <!-- Barra de Ações do Cartão -->
        <div class="card-actions">
          {#if isInstalled}
            <button
              class="btn-action default-btn"
              class:active={isDefault}
              on:click={() => onSelectDefault(provider.id)}
            >
              {isDefault ? '✓ IA Padrão Ativa' : 'Definir como Padrão'}
            </button>

            <button
              class="btn-action terminal-access-btn"
              title="Abrir sessão interativa completa no Terminal Veu"
              on:click={() => onOpenTerminalSession(provider)}
            >
              <Terminal size={13} /> Acesso no Terminal
            </button>
          {:else}
            <button
              class="btn-action install-btn"
              title="Executar comando oficial de instalação no Terminal Veu com controle total"
              on:click={() => onInstallProvider(provider)}
            >
              <Download size={13} /> Instalar via Terminal
            </button>
          {/if}

          <a
            href={provider.docsUrl}
            target="_blank"
            rel="noreferrer"
            class="docs-link"
            title="Ver documentação oficial"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    {/each}
  </div>

  <!-- Rodapé do Wizard com Ações Globais -->
  <div class="wizard-footer">
    <button
      class="btn-refresh"
      disabled={isChecking}
      on:click={onRefreshStatus}
      title="Verificar novamente se as ferramentas foram instaladas"
    >
      <RefreshCw size={13} class={isChecking ? 'spin' : ''} />
      <span>{isChecking ? 'Verificando...' : 'Re-verificar Sistema'}</span>
    </button>

    <button class="btn-continue" on:click={onFinishWizard}>
      <span>Ir para o Chat</span>
      <ArrowRight size={14} />
    </button>
  </div>
</div>

<style>
  .ai-wizard-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 16px;
    background-color: var(--veu-bg-sidebar);
    color: var(--veu-text-color);
    box-sizing: border-box;
    overflow-y: auto;
    font-family: inherit;
  }

  .wizard-header {
    text-align: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--veu-border-color);
  }

  .icon-orb {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background-color: var(--veu-active-item-bg);
    border: 1px solid var(--veu-h1-color);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 10px;
    box-shadow: 0 0 16px rgba(203, 166, 247, 0.2);
  }

  .wizard-title {
    font-size: 15px;
    font-weight: 600;
    margin: 0 0 4px;
    color: var(--veu-text-color);
  }

  .wizard-desc {
    font-size: 11.5px;
    line-height: 1.5;
    opacity: 0.75;
    margin: 0;
    max-width: 420px;
    margin: 0 auto;
  }

  .providers-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
  }

  .provider-card {
    background-color: var(--veu-bg-app);
    border: 1px solid var(--veu-border-color);
    border-radius: 8px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: all 0.15s ease;
  }

  .provider-card.is-default {
    border-color: var(--provider-color, var(--veu-h1-color));
    box-shadow: 0 0 12px rgba(203, 166, 247, 0.1);
  }

  .card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  }

  .provider-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .provider-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--veu-text-color);
  }

  .plan-badge {
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 4px;
    background-color: rgba(127, 127, 127, 0.12);
    color: var(--provider-color, var(--veu-h2-color));
    font-weight: 500;
  }

  .provider-tagline {
    font-size: 11px;
    opacity: 0.65;
  }

  .status-indicator {
    flex-shrink: 0;
  }

  .badge-installed {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10.5px;
    color: #4ade80;
    background-color: rgba(74, 222, 128, 0.12);
    border: 1px solid rgba(74, 222, 128, 0.3);
    padding: 2px 7px;
    border-radius: 4px;
    font-weight: 500;
  }

  .badge-missing {
    font-size: 10.5px;
    color: var(--veu-text-color);
    opacity: 0.55;
    background-color: rgba(127, 127, 127, 0.1);
    padding: 2px 7px;
    border-radius: 4px;
  }

  .provider-desc {
    font-size: 11.5px;
    line-height: 1.45;
    opacity: 0.8;
    margin: 0;
  }

  .card-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
    padding-top: 8px;
    border-top: 1px solid rgba(127, 127, 127, 0.1);
  }

  .btn-action {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 500;
    padding: 5px 10px;
    border-radius: 5px;
    border: 1px solid var(--veu-border-color);
    background-color: transparent;
    color: var(--veu-text-color);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-action:hover {
    background-color: var(--veu-active-item-bg);
    color: var(--veu-h1-color);
  }

  .btn-action.install-btn {
    background-color: var(--veu-active-item-bg);
    border-color: var(--provider-color, var(--veu-h1-color));
    color: var(--provider-color, var(--veu-h1-color));
  }

  .btn-action.install-btn:hover {
    filter: brightness(1.15);
  }

  .btn-action.default-btn.active {
    background-color: rgba(74, 222, 128, 0.15);
    border-color: #4ade80;
    color: #4ade80;
  }

  .docs-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 4px;
    color: var(--veu-text-color);
    opacity: 0.6;
    margin-left: auto;
    transition: opacity 0.15s, color 0.15s;
  }

  .docs-link:hover {
    opacity: 1;
    color: var(--veu-h1-color);
  }

  .wizard-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid var(--veu-border-color);
  }

  .btn-refresh {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11.5px;
    background: transparent;
    border: 1px solid var(--veu-border-color);
    color: var(--veu-text-color);
    padding: 6px 10px;
    border-radius: 5px;
    cursor: pointer;
    opacity: 0.8;
  }

  .btn-refresh:hover:not(:disabled) {
    opacity: 1;
    background-color: var(--veu-active-item-bg);
  }

  .btn-continue {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    background-color: var(--veu-active-item-bg);
    border: 1px solid var(--veu-h1-color);
    color: var(--veu-h1-color);
    padding: 6px 14px;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-continue:hover {
    filter: brightness(1.15);
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

