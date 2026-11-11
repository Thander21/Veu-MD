<script lang="ts">
  import { tick } from 'svelte';
  import { LayoutTemplate, FileText, Check, X, Sparkles, FolderKanban } from 'lucide-svelte';
  import {
    BUILTIN_TEMPLATES,
    loadWorkspaceTemplates,
    interpolateTemplate,
    interpolateFilename,
    type DocumentTemplate
  } from '../utils/templateRegistry';

  export let visible: boolean = false;
  export let currentFolderPath: string = '';
  export let onClose: () => void;
  export let onCreate: (template: DocumentTemplate, fileName: string, content: string) => void;

  let allTemplates: DocumentTemplate[] = [...BUILTIN_TEMPLATES];
  let selectedTemplateId: string = BUILTIN_TEMPLATES[0].id;
  let docTitle: string = '';
  let customFileName: string = '';
  let inputTitleEl: HTMLInputElement | null = null;
  let loadingTemplates: boolean = false;

  $: selectedTemplate = allTemplates.find((t) => t.id === selectedTemplateId) || allTemplates[0];

  $: projectName = currentFolderPath ? currentFolderPath.split(/[\\/]/).pop() || 'Workspace' : 'Workspace';

  $: interpolatedContent = selectedTemplate
    ? interpolateTemplate(selectedTemplate.content, {
        title: docTitle.trim() || undefined,
        project: projectName
      })
    : '';

  $: defaultSuggestedFilename = selectedTemplate
    ? interpolateFilename(selectedTemplate.defaultFilename, {
        title: docTitle.trim() || undefined,
        project: projectName
      })
    : 'Documento.md';

  $: finalFileName = customFileName.trim() ? ensureMdExtension(customFileName.trim()) : defaultSuggestedFilename;

  function ensureMdExtension(name: string): string {
    return name.endsWith('.md') ? name : `${name}.md`;
  }

  let prevVisible = false;
  $: if (visible && !prevVisible) {
    prevVisible = true;
    docTitle = '';
    customFileName = '';
    selectedTemplateId = BUILTIN_TEMPLATES[0].id;
    loadTemplates();
    tick().then(() => {
      inputTitleEl?.focus();
    });
  } else if (!visible && prevVisible) {
    prevVisible = false;
  }

  async function loadTemplates() {
    loadingTemplates = true;
    try {
      const custom = await loadWorkspaceTemplates(currentFolderPath);
      allTemplates = [...BUILTIN_TEMPLATES, ...custom];
      if (!allTemplates.some((t) => t.id === selectedTemplateId)) {
        selectedTemplateId = allTemplates[0].id;
      }
    } catch {
      allTemplates = [...BUILTIN_TEMPLATES];
    } finally {
      loadingTemplates = false;
    }
  }

  function handleSelectTemplate(t: DocumentTemplate) {
    selectedTemplateId = t.id;
    customFileName = ''; // Reseta para sugestão padrão do template selecionado
  }

  function handleConfirm() {
    if (!selectedTemplate) return;
    onCreate(selectedTemplate, finalFileName, interpolatedContent);
    onClose();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.stopPropagation();
      handleConfirm();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if visible}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="modal-backdrop" on:click={handleBackdropClick} role="presentation">
    <div
      class="template-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-dialog-title"
      tabindex="-1"
    >
      <!-- Cabeçalho -->
      <div class="dialog-header">
        <div class="header-title-row">
          <div class="header-icon-badge">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 id="template-dialog-title">Novo Documento a partir de Modelo</h2>
            <p class="dialog-subtitle">Escolha um modelo estruturado ou crie o seu na pasta .templates/</p>
          </div>
        </div>
        <button class="close-btn" title="Fechar (Esc)" on:click={onClose}>
          <X size={16} />
        </button>
      </div>

      <!-- Configurações Rápidas (Título & Nome do Arquivo) -->
      <div class="quick-config-bar">
        <div class="config-field flex-2">
          <label for="template-doc-title">Título do Documento</label>
          <input
            id="template-doc-title"
            bind:this={inputTitleEl}
            bind:value={docTitle}
            placeholder="Ex: Alinhamento de Produto Q4"
            class="config-input"
          />
        </div>
        <div class="config-field flex-1">
          <label for="template-file-name">Nome do Arquivo (.md)</label>
          <input
            id="template-file-name"
            bind:value={customFileName}
            placeholder={defaultSuggestedFilename}
            class="config-input"
          />
        </div>
      </div>

      <!-- Corpo Principal (Split Catálogo e Preview) -->
      <div class="dialog-body">
        <!-- Coluna Esquerda: Lista de Modelos -->
        <div class="catalog-column">
          <div class="section-label">
            <span>Modelos Disponíveis</span>
            {#if loadingTemplates}
              <span class="loading-tag">Atualizando...</span>
            {/if}
          </div>

          <div class="templates-list">
            {#each allTemplates as tmpl (tmpl.id)}
              <button
                class="template-card"
                class:selected={selectedTemplateId === tmpl.id}
                on:click={() => handleSelectTemplate(tmpl)}
              >
                <div class="template-card-header">
                  <div class="tmpl-title-row">
                    {#if tmpl.category === 'custom'}
                      <FolderKanban size={14} class="cat-icon custom" />
                    {:else}
                      <LayoutTemplate size={14} class="cat-icon builtin" />
                    {/if}
                    <span class="tmpl-name">{tmpl.name}</span>
                  </div>
                  {#if tmpl.category === 'custom'}
                    <span class="badge custom">Custom</span>
                  {/if}
                </div>
                <p class="tmpl-desc">{tmpl.description}</p>
              </button>
            {/each}
          </div>
        </div>

        <!-- Coluna Direita: Preview do Conteúdo Formatado -->
        <div class="preview-column">
          <div class="preview-header">
            <span class="section-label">Prévia do Documento</span>
            <span class="preview-meta">{finalFileName}</span>
          </div>
          <div class="preview-pane">
            <pre class="preview-text">{interpolatedContent}</pre>
          </div>
        </div>
      </div>

      <!-- Rodapé de Ações -->
      <div class="dialog-footer">
        <div class="footer-tip">
          <span>Dica: Pressione <kbd>Ctrl</kbd> + <kbd>Enter</kbd> para criar rapidamente.</span>
        </div>
        <div class="footer-actions">
          <button class="btn-cancel" on:click={onClose}>Cancelar</button>
          <button class="btn-primary" on:click={handleConfirm}>
            <Check size={14} />
            <span>Criar Documento</span>
          </button>
        </div>
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
    background-color: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .template-dialog {
    width: 860px;
    max-width: 95vw;
    height: 600px;
    max-height: 90vh;
    background-color: var(--veu-panel-bg, #181825);
    border: 1px solid var(--veu-border-color, #313244);
    border-radius: 10px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    outline: none;
    overflow: hidden;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid var(--veu-border-color, #313244);
    background-color: rgba(255, 255, 255, 0.02);
  }

  .header-title-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-icon-badge {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(203, 166, 247, 0.25), rgba(245, 194, 231, 0.15));
    border: 1px solid rgba(203, 166, 247, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--veu-h1-color, #cba6f7);
  }

  h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--veu-text-color, #cdd6f4);
  }

  .dialog-subtitle {
    margin: 2px 0 0 0;
    font-size: 11.5px;
    color: var(--veu-text-secondary, #a6adc8);
  }

  .close-btn {
    background: transparent;
    border: none;
    color: var(--veu-text-secondary, #a6adc8);
    cursor: pointer;
    padding: 6px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .close-btn:hover {
    color: var(--veu-text-color, #cdd6f4);
    background-color: rgba(255, 255, 255, 0.08);
  }

  .quick-config-bar {
    display: flex;
    gap: 16px;
    padding: 12px 20px;
    background-color: rgba(0, 0, 0, 0.15);
    border-bottom: 1px solid var(--veu-border-color, #313244);
  }

  .config-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .config-field.flex-2 {
    flex: 2;
  }

  .config-field.flex-1 {
    flex: 1.3;
  }

  label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--veu-h2-color, #89b4fa);
  }

  .config-input {
    background-color: var(--veu-input-bg, #11111b);
    border: 1px solid var(--veu-border-color, #313244);
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 13px;
    color: var(--veu-text-color, #cdd6f4);
    outline: none;
    transition: border-color 0.15s ease;
  }

  .config-input:focus {
    border-color: var(--veu-h1-color, #cba6f7);
  }

  .dialog-body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .catalog-column {
    width: 320px;
    border-right: 1px solid var(--veu-border-color, #313244);
    display: flex;
    flex-direction: column;
    background-color: rgba(0, 0, 0, 0.08);
  }

  .section-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--veu-text-secondary, #a6adc8);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .catalog-column .section-label {
    padding: 12px 16px 8px 16px;
  }

  .loading-tag {
    font-size: 10px;
    color: var(--veu-h1-color, #cba6f7);
    font-weight: 400;
  }

  .templates-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 10px 10px 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .template-card {
    text-align: left;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 8px;
    padding: 10px 12px;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: inherit;
  }

  .template-card:hover {
    background-color: var(--veu-active-item-bg, #313244);
  }

  .template-card.selected {
    background-color: rgba(203, 166, 247, 0.14);
    border-color: rgba(203, 166, 247, 0.4);
  }

  .template-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .tmpl-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  :global(.cat-icon.builtin) {
    color: var(--veu-h1-color, #cba6f7);
  }

  :global(.cat-icon.custom) {
    color: var(--veu-h3-color, #a6e3a1);
  }

  .tmpl-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--veu-text-color, #cdd6f4);
  }

  .tmpl-desc {
    margin: 0;
    font-size: 11.5px;
    color: var(--veu-text-secondary, #a6adc8);
    line-height: 1.35;
  }

  .badge.custom {
    font-size: 10px;
    font-weight: 600;
    padding: 1px 6px;
    border-radius: 10px;
    background-color: rgba(166, 227, 161, 0.15);
    color: var(--veu-h3-color, #a6e3a1);
    border: 1px solid rgba(166, 227, 161, 0.3);
  }

  .preview-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: var(--veu-input-bg, #11111b);
  }

  .preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    border-bottom: 1px solid var(--veu-border-color, #313244);
    background-color: rgba(255, 255, 255, 0.015);
  }

  .preview-meta {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 11px;
    color: var(--veu-h2-color, #89b4fa);
    background-color: rgba(137, 180, 250, 0.1);
    padding: 2px 8px;
    border-radius: 4px;
  }

  .preview-pane {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
  }

  .preview-text {
    margin: 0;
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 12px;
    line-height: 1.5;
    color: var(--veu-text-color, #cdd6f4);
    white-space: pre-wrap;
    word-break: break-word;
  }

  .dialog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-top: 1px solid var(--veu-border-color, #313244);
    background-color: rgba(255, 255, 255, 0.02);
  }

  .footer-tip {
    font-size: 11.5px;
    color: var(--veu-text-secondary, #a6adc8);
  }

  kbd {
    background-color: rgba(255, 255, 255, 0.1);
    padding: 2px 5px;
    border-radius: 4px;
    font-size: 10.5px;
    font-family: inherit;
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .footer-actions {
    display: flex;
    gap: 10px;
  }

  .btn-cancel {
    background: transparent;
    border: 1px solid var(--veu-border-color, #313244);
    color: var(--veu-text-secondary, #a6adc8);
    border-radius: 6px;
    padding: 7px 14px;
    font-size: 12.5px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-cancel:hover {
    color: var(--veu-text-color, #cdd6f4);
    background-color: rgba(255, 255, 255, 0.05);
  }

  .btn-primary {
    background-color: var(--veu-h1-color, #cba6f7);
    color: #11111b;
    border: none;
    border-radius: 6px;
    padding: 7px 16px;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: opacity 0.15s ease;
  }

  .btn-primary:hover {
    opacity: 0.9;
  }
</style>

