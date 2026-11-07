<script lang="ts">
  import { X, Palette, Download, Upload, Save, Check } from 'lucide-svelte';
  import { defaultThemes } from '../theme/defaultThemes';
  import { getTheme, setTheme, updateThemeTag } from '../theme/themeStore';
  import type { ThemeConfig } from '../types';

  export let visible: boolean = false;
  export let onClose: () => void;

  let theme = getTheme();
  let selectedPreset = defaultThemes[theme.id] ? theme.id : 'custom';
  let customThemeName = '';
  let showSaveNotice = false;

  $: if (visible) {
    theme = getTheme();
    selectedPreset = defaultThemes[theme.id] ? theme.id : 'custom';
  }

  function handlePresetChange(presetKey: string) {
    if (presetKey === 'custom') {
      selectedPreset = 'custom';
      theme = { ...theme, id: 'custom' };
      setTheme(theme);
    } else if (defaultThemes[presetKey]) {
      selectedPreset = presetKey;
      theme = { ...defaultThemes[presetKey] };
      setTheme(theme);
    }
  }

  function handleColorChange(key: keyof ThemeConfig, subKey: string, value: string) {
    const current = (theme as any)[key];
    if (typeof current === 'object' && current !== null) {
      (theme as any)[key] = {
        ...current,
        [subKey]: value
      };
      selectedPreset = 'custom';
      theme.id = 'custom';
      setTheme({ ...theme });
    }
  }

  function handleDirectChange(key: keyof ThemeConfig, value: string) {
    (theme as any)[key] = value;
    selectedPreset = 'custom';
    theme.id = 'custom';
    setTheme({ ...theme });
  }

  function exportThemeJson() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(theme, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${theme.id || 'meu-tema'}.veutheme.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function importThemeJson(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          theme = parsed;
          setTheme(theme);
        } catch (err) {
          alert('Arquivo de tema inválido!');
        }
      };
      reader.readAsText(target.files[0]);
    }
  }
</script>

{#if visible}
  <aside class="theme-drawer">
    <div class="drawer-header">
      <div class="drawer-title">
        <Palette size={16} />
        <span>Cores das Tags & Temas</span>
      </div>
      <button class="close-btn" on:click={onClose}>
        <X size={15} />
      </button>
    </div>

    <div class="drawer-body">
      <!-- Seletor de Temas Base (Dropdown) -->
      <section class="section">
        <div class="section-label">Tema de Leitura</div>
        <div class="theme-select-container">
          <select
            class="theme-dropdown"
            bind:value={selectedPreset}
            on:change={() => handlePresetChange(selectedPreset)}
          >
            {#each Object.entries(defaultThemes) as [key, t]}
              <option value={key}>{t.name}</option>
            {/each}
            <option value="custom">Personalizado</option>
          </select>
        </div>
      </section>

      <!-- Layout da Folha de Leitura -->
      <section class="section">
        <div class="section-label">Layout da Folha de Leitura</div>
        <div class="field">
          <span>Largura da Página:</span>
          <select
            value={theme.editorMaxWidth}
            on:change={(e) => handleDirectChange('editorMaxWidth', (e.target as HTMLSelectElement).value)}
          >
            <option value="720px">Estreita (720px - Foco)</option>
            <option value="860px">Média (860px - Padrão)</option>
            <option value="1050px">Larga (1050px)</option>
            <option value="100%">Tela Cheia (100%)</option>
          </select>
        </div>

        <div class="field">
          <span>Fonte do Texto:</span>
          <select
            value={theme.fontFamily}
            on:change={(e) => handleDirectChange('fontFamily', (e.target as HTMLSelectElement).value)}
          >
            <option value="'Roboto', system-ui, -apple-system, sans-serif">Roboto (Padrão Veu MD)</option>
            <option value="'JetBrains Mono', 'Fira Code', monospace">JetBrains Mono (IDE / Código)</option>
            <option value="'Fira Code', 'JetBrains Mono', monospace">Fira Code (Ligaduras / IDE)</option>
            <option value="'Cascadia Code', 'Fira Code', monospace">Cascadia Code (Windows Terminal / IDE)</option>
            <option value="'Source Code Pro', monospace">Source Code Pro (Adobe / IDE)</option>
            <option value="Inter, system-ui, -apple-system, sans-serif">Inter (Sem Serifa Moderna)</option>
            <option value='"Merriweather", "Georgia", serif'>Merriweather (Serifada Livro)</option>
          </select>
        </div>

        <div class="field">
          <span>Tamanho da Fonte:</span>
          <input
            type="range"
            min="13"
            max="22"
            value={parseInt(theme.fontSize)}
            on:input={(e) => handleDirectChange('fontSize', `${(e.target as HTMLInputElement).value}px`)}
          />
          <span class="val-badge">{theme.fontSize}</span>
        </div>
      </section>

      <!-- Cores por Título (H1 a H6) -->
      <section class="section">
        <div class="section-label">Cores dos Títulos (H1 a H6)</div>
        <div class="color-grid">
          <div class="color-item">
            <span>H1:</span>
            <input
              type="color"
              value={theme.h1.color}
              on:input={(e) => handleColorChange('h1', 'color', (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="color-item">
            <span>H2:</span>
            <input
              type="color"
              value={theme.h2.color}
              on:input={(e) => handleColorChange('h2', 'color', (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="color-item">
            <span>H3:</span>
            <input
              type="color"
              value={theme.h3.color}
              on:input={(e) => handleColorChange('h3', 'color', (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="color-item">
            <span>H4:</span>
            <input
              type="color"
              value={theme.h4.color}
              on:input={(e) => handleColorChange('h4', 'color', (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="color-item">
            <span>H5:</span>
            <input
              type="color"
              value={theme.h5.color}
              on:input={(e) => handleColorChange('h5', 'color', (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="color-item">
            <span>H6:</span>
            <input
              type="color"
              value={theme.h6.color}
              on:input={(e) => handleColorChange('h6', 'color', (e.target as HTMLInputElement).value)}
            />
          </div>
        </div>
      </section>

      <!-- Cores de Destaques Inline -->
      <section class="section">
        <div class="section-label">Marcações no Texto (Inline)</div>
        <div class="color-grid">
          <div class="color-item">
            <span>Negrito:</span>
            <input
              type="color"
              value={theme.bold.color}
              on:input={(e) => handleColorChange('bold', 'color', (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="color-item">
            <span>Itálico:</span>
            <input
              type="color"
              value={theme.italic.color}
              on:input={(e) => handleColorChange('italic', 'color', (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="color-item">
            <span>Tachado:</span>
            <input
              type="color"
              value={theme.strikethrough.color}
              on:input={(e) => handleColorChange('strikethrough', 'color', (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="color-item">
            <span>Links:</span>
            <input
              type="color"
              value={theme.link.color}
              on:input={(e) => handleColorChange('link', 'color', (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="color-item">
            <span>Marca-texto:</span>
            <input
              type="color"
              value={theme.highlight.backgroundColor || '#fef08a'}
              on:input={(e) => handleColorChange('highlight', 'backgroundColor', (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="color-item">
            <span>Código Inline:</span>
            <input
              type="color"
              value={theme.inlineCode.color}
              on:input={(e) => handleColorChange('inlineCode', 'color', (e.target as HTMLInputElement).value)}
            />
          </div>
        </div>
      </section>

      <!-- Cores de Blocos -->
      <section class="section">
        <div class="section-label">Cores de Blocos & Listas</div>
        <div class="color-grid">
          <div class="color-item">
            <span>Borda Citação:</span>
            <input
              type="color"
              value={theme.blockquote.borderLeft?.split(' ')[2] || '#38bdf8'}
              on:input={(e) => handleColorChange('blockquote', 'borderLeft', `4px solid ${(e.target as HTMLInputElement).value}`)}
            />
          </div>
          <div class="color-item">
            <span>Balas da Lista:</span>
            <input
              type="color"
              value={theme.listBullet.color}
              on:input={(e) => handleColorChange('listBullet', 'color', (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="color-item">
            <span>Borda Tabelas:</span>
            <input
              type="color"
              value={theme.tableBorder}
              on:input={(e) => handleDirectChange('tableBorder', (e.target as HTMLInputElement).value)}
            />
          </div>
        </div>
      </section>

      <!-- Exportar / Importar Temas JSON -->
      <section class="section footer-actions">
        <button class="action-btn" on:click={exportThemeJson}>
          <Download size={14} />
          <span>Exportar Tema (.json)</span>
        </button>
        <label class="action-btn upload-btn">
          <Upload size={14} />
          <span>Importar Tema (.json)</span>
          <input type="file" accept=".json,.veutheme.json" on:change={importThemeJson} />
        </label>
      </section>
    </div>
  </aside>
{/if}

<style>
  .theme-drawer {
    position: fixed;
    right: 0;
    top: 44px;
    bottom: 24px;
    width: 320px;
    background-color: var(--veu-bg-sidebar);
    border-left: 1px solid var(--veu-border-color);
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.35);
    z-index: 40;
    display: flex;
    flex-direction: column;
    animation: slideLeft 0.15s ease-out;
  }

  @keyframes slideLeft {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--veu-border-color);
  }

  .drawer-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--veu-text-color);
  }

  .close-btn {
    background: transparent;
    border: none;
    color: var(--veu-text-color);
    opacity: 0.7;
    cursor: pointer;
    border-radius: 4px;
    padding: 3px;
  }

  .close-btn:hover {
    background-color: var(--veu-active-item-bg);
    color: var(--veu-text-color);
    opacity: 1;
  }

  .drawer-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .section-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--veu-text-color);
    opacity: 0.7;
  }

  .theme-select-container {
    width: 100%;
  }

  .theme-dropdown {
    width: 100%;
    padding: 8px 10px;
    font-size: 13px;
    font-weight: 500;
    border-radius: 6px;
    background-color: var(--veu-bg-app);
    color: var(--veu-text-color);
    border: 1px solid var(--veu-border-color);
    outline: none;
    cursor: pointer;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .theme-dropdown:hover,
  .theme-dropdown:focus {
    border-color: var(--veu-h1-color);
    box-shadow: 0 0 0 1px var(--veu-h1-color);
  }

  .field {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    gap: 8px;
  }

  .field select, .field input[type="range"] {
    background-color: var(--veu-bg-app);
    color: var(--veu-text-color);
    border: 1px solid var(--veu-border-color);
    border-radius: 4px;
    padding: 4px 6px;
    font-size: 12px;
  }

  .val-badge {
    font-size: 11px;
    font-weight: 600;
    color: var(--veu-h1-color);
    min-width: 35px;
  }

  .color-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .color-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 8px;
    background-color: var(--veu-bg-app);
    border: 1px solid var(--veu-border-color);
    border-radius: 4px;
    font-size: 12px;
  }

  .color-item input[type="color"] {
    -webkit-appearance: none;
    appearance: none;
    border: none;
    width: 22px;
    height: 22px;
    border-radius: 4px;
    cursor: pointer;
    background: none;
  }

  .footer-actions {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px;
    border-radius: 4px;
    background-color: var(--veu-bg-app);
    border: 1px solid var(--veu-border-color);
    color: var(--veu-text-color);
    font-size: 12px;
    cursor: pointer;
  }

  .action-btn:hover {
    background-color: var(--veu-active-item-bg);
  }

  .upload-btn input {
    display: none;
  }
</style>
