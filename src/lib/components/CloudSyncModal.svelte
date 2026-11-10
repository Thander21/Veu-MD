<script lang="ts">
  import { X, Cloud, RefreshCw, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-svelte';
  import { cloudSyncService, type WebDavConfig } from '../services/cloudSyncService';

  export let visible: boolean = false;
  export let onClose: () => void;

  let config: WebDavConfig = cloudSyncService.getConfig();
  let testing = false;
  let testResult: { success: boolean; message: string } | null = null;
  let saveSuccess = false;

  $: if (visible) {
    config = cloudSyncService.getConfig();
    testResult = null;
    saveSuccess = false;
  }

  async function handleTestConnection() {
    testing = true;
    testResult = null;
    try {
      testResult = await cloudSyncService.testConnection(config);
    } catch (err: any) {
      testResult = { success: false, message: `Erro ao testar: ${err?.message || err}` };
    } finally {
      testing = false;
    }
  }

  function handleSave() {
    cloudSyncService.saveConfig(config);
    saveSuccess = true;
    setTimeout(() => {
      saveSuccess = false;
      onClose();
    }, 1200);
  }

  function handleSyncNow() {
    cloudSyncService.processQueue().catch((err) => {
      console.warn('Erro ao sincronizar manualmente:', err);
    });
  }
</script>

{#if visible}
  <div
    class="modal-backdrop"
    on:click={(e) => { if (e.target === e.currentTarget) onClose(); }}
    on:keydown={(e) => e.key === 'Escape' && onClose()}
    role="presentation"
  >
    <div
      class="modal-content"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <div class="modal-header">
        <div class="header-title">
          <Cloud size={18} color="var(--primary-color, #cba6f7)" />
          <h3>Sincronização em Nuvem (WebDAV)</h3>
        </div>
        <button type="button" class="close-btn" on:click={onClose} title="Fechar">
          <X size={16} />
        </button>
      </div>

      <div class="modal-body">
        <div class="info-box">
          <ShieldCheck size={16} color="#a6e3a1" />
          <span>Privacidade total sem intermediários. Conecte diretamente ao seu Nextcloud, ownCloud ou NAS pessoal.</span>
        </div>

        <div class="form-group toggle-group">
          <label class="toggle-label" for="sync-enabled">
            <input
              id="sync-enabled"
              type="checkbox"
              bind:checked={config.enabled}
            />
            <span class="toggle-text">Habilitar Sincronização em Nuvem</span>
          </label>
        </div>

        <div class="form-group">
          <label for="server-url">URL do Servidor WebDAV</label>
          <input
            id="server-url"
            type="url"
            placeholder="https://nuvem.exemplo.com/remote.php/dav/files/usuario/"
            bind:value={config.serverUrl}
            disabled={!config.enabled}
          />
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label for="sync-user">Usuário</label>
            <input
              id="sync-user"
              type="text"
              placeholder="ex: admin"
              bind:value={config.username}
              disabled={!config.enabled}
            />
          </div>
          <div class="form-group half">
            <label for="sync-pass">Senha / App Token</label>
            <input
              id="sync-pass"
              type="password"
              placeholder="••••••••••••"
              bind:value={config.password}
              disabled={!config.enabled}
            />
          </div>
        </div>

        <div class="form-group">
          <label for="remote-folder">Pasta Remota no Servidor</label>
          <input
            id="remote-folder"
            type="text"
            placeholder="VeuMD"
            bind:value={config.remoteFolder}
            disabled={!config.enabled}
          />
        </div>

        {#if testResult}
          <div class="test-feedback" class:success={testResult.success} class:error={!testResult.success}>
            {#if testResult.success}
              <CheckCircle2 size={15} color="#a6e3a1" />
            {:else}
              <AlertCircle size={15} color="#f38ba8" />
            {/if}
            <span>{testResult.message}</span>
          </div>
        {/if}

        {#if saveSuccess}
          <div class="test-feedback success">
            <CheckCircle2 size={15} color="#a6e3a1" />
            <span>Configuração salva com sucesso!</span>
          </div>
        {/if}
      </div>

      <div class="modal-footer">
        <button
          type="button"
          class="btn-secondary"
          on:click={handleTestConnection}
          disabled={!config.enabled || !config.serverUrl || testing}
        >
          {#if testing}
            <RefreshCw size={13} class="spin" />
            <span>Testando...</span>
          {:else}
            <span>Testar Conexão</span>
          {/if}
        </button>

        <button
          type="button"
          class="btn-secondary"
          on:click={handleSyncNow}
          disabled={!config.enabled}
        >
          <span>Sincronizar Agora</span>
        </button>

        <button type="button" class="btn-primary" on:click={handleSave}>
          <span>Salvar</span>
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(3px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: var(--sidebar-bg, #181825);
    border: 1px solid var(--border-color, #313244);
    border-radius: 8px;
    width: 480px;
    max-width: 90vw;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-size: 12.5px;
    color: var(--text-color, #cdd6f4);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    border-bottom: 1px solid var(--border-color, #313244);
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-title h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: var(--text-muted, #a6adc8);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-color, #cdd6f4);
  }

  .modal-body {
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .info-box {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(166, 227, 161, 0.08);
    border: 1px solid rgba(166, 227, 161, 0.2);
    border-radius: 5px;
    font-size: 11.5px;
    color: var(--text-color, #cdd6f4);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .form-row {
    display: flex;
    gap: 12px;
  }

  .form-group.half {
    flex: 1;
  }

  .toggle-group {
    padding: 4px 0;
  }

  .toggle-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-weight: 500;
  }

  label {
    font-size: 11.5px;
    color: var(--text-muted, #a6adc8);
  }

  input[type="url"],
  input[type="text"],
  input[type="password"] {
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--border-color, #313244);
    border-radius: 5px;
    padding: 7px 10px;
    color: var(--text-color, #cdd6f4);
    font-size: 12px;
    outline: none;
    transition: border-color 0.15s ease;
  }

  input:focus {
    border-color: var(--primary-color, #cba6f7);
  }

  input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .test-feedback {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 5px;
    font-size: 11.5px;
  }

  .test-feedback.success {
    background: rgba(166, 227, 161, 0.1);
    color: #a6e3a1;
    border: 1px solid rgba(166, 227, 161, 0.3);
  }

  .test-feedback.error {
    background: rgba(243, 139, 168, 0.1);
    color: #f38ba8;
    border: 1px solid rgba(243, 139, 168, 0.3);
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 18px;
    border-top: 1px solid var(--border-color, #313244);
    background: rgba(0, 0, 0, 0.15);
  }

  .btn-primary,
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 5px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-primary {
    background: var(--primary-color, #cba6f7);
    color: #11111b;
    border: none;
  }

  .btn-primary:hover {
    filter: brightness(1.1);
  }

  .btn-secondary {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-color, #cdd6f4);
    border: 1px solid var(--border-color, #313244);
  }

  .btn-secondary:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
  }

  .btn-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  :global(.spin) {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
