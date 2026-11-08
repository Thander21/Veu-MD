<script lang="ts">
  import { onMount } from 'svelte';
  import {
    ZoomIn,
    ZoomOut,
    Maximize2,
    RotateCcw,
    Code,
    Eye,
    Copy,
    Check,
    Image as ImageIcon
  } from 'lucide-svelte';

  export let src: string = '';
  export let title: string = '';
  export let path: string = '';

  let zoomLevel: number = 1.0;
  let isPanning: boolean = false;
  let panX: number = 0;
  let panY: number = 0;
  let startX: number = 0;
  let startY: number = 0;

  let naturalWidth: number = 0;
  let naturalHeight: number = 0;
  let viewMode: 'preview' | 'code' = 'preview';
  let svgSourceCode: string = '';
  let copied: boolean = false;

  $: isSvg = (title || '').toLowerCase().endsWith('.svg');

  $: if (isSvg && src.startsWith('data:image/svg+xml;base64,')) {
    try {
      const b64 = src.slice('data:image/svg+xml;base64,'.length);
      svgSourceCode = decodeURIComponent(escape(atob(b64)));
    } catch {
      try {
        const b64 = src.slice('data:image/svg+xml;base64,'.length);
        svgSourceCode = atob(b64);
      } catch (e) {
        svgSourceCode = '';
      }
    }
  }

  function handleImageLoad(e: Event) {
    const img = e.currentTarget as HTMLImageElement;
    naturalWidth = img.naturalWidth;
    naturalHeight = img.naturalHeight;
  }

  function zoomIn() {
    zoomLevel = Math.min(5.0, Number((zoomLevel + 0.25).toFixed(2)));
  }

  function zoomOut() {
    zoomLevel = Math.max(0.1, Number((zoomLevel - 0.25).toFixed(2)));
  }

  function resetZoom() {
    zoomLevel = 1.0;
    panX = 0;
    panY = 0;
  }

  function fitToWindow() {
    // Zoom para caber no container com margem
    zoomLevel = 0.85;
    panX = 0;
    panY = 0;
  }

  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    zoomLevel = Math.min(5.0, Math.max(0.1, Number((zoomLevel + delta).toFixed(2))));
  }

  function startPan(e: MouseEvent) {
    if (e.button !== 0) return; // apenas botão esquerdo
    isPanning = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
  }

  function onPan(e: MouseEvent) {
    if (!isPanning) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
  }

  function stopPan() {
    isPanning = false;
  }

  function copySvgCode() {
    if (!svgSourceCode) return;
    navigator.clipboard.writeText(svgSourceCode);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2000);
  }
</script>

<div class="image-viewer-container">
  <!-- Barra de Ferramentas Superior -->
  <div class="image-viewer-toolbar">
    <div class="left-info">
      <div class="image-badge">
        <ImageIcon size={14} color="#a78bfa" />
        <span class="file-name" title={path}>{title}</span>
      </div>
      {#if naturalWidth > 0 && naturalHeight > 0}
        <span class="dim-badge">{naturalWidth} × {naturalHeight} px</span>
      {/if}
    </div>

    <div class="right-controls">
      {#if isSvg}
        <div class="mode-toggle">
          <button
            class="mode-btn"
            class:active={viewMode === 'preview'}
            on:click={() => (viewMode = 'preview')}
            title="Visualizar renderização do SVG"
          >
            <Eye size={13} />
            <span>Imagem</span>
          </button>
          <button
            class="mode-btn"
            class:active={viewMode === 'code'}
            on:click={() => (viewMode = 'code')}
            title="Visualizar código XML do SVG"
          >
            <Code size={13} />
            <span>Código SVG</span>
          </button>
        </div>
      {/if}

      {#if viewMode === 'preview'}
        <div class="zoom-controls">
          <button class="tool-btn" on:click={zoomOut} title="Diminuir Zoom (-)">
            <ZoomOut size={14} />
          </button>
          <button class="tool-btn zoom-indicator" on:click={resetZoom} title="Redefinir 100%">
            {Math.round(zoomLevel * 100)}%
          </button>
          <button class="tool-btn" on:click={zoomIn} title="Aumentar Zoom (+)">
            <ZoomIn size={14} />
          </button>
          <button class="tool-btn" on:click={fitToWindow} title="Ajustar à Janela">
            <Maximize2 size={13} />
          </button>
          <button class="tool-btn" on:click={resetZoom} title="Centralizar Imagem">
            <RotateCcw size={13} />
          </button>
        </div>
      {:else}
        <button class="tool-btn copy-btn" on:click={copySvgCode} title="Copiar código SVG">
          {#if copied}
            <Check size={13} color="#4ade80" />
            <span style="color: #4ade80;">Copiado!</span>
          {:else}
            <Copy size={13} />
            <span>Copiar SVG</span>
          {/if}
        </button>
      {/if}
    </div>
  </div>

  <!-- Palco Central -->
  {#if viewMode === 'preview'}
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="canvas-stage"
      class:panning={isPanning}
      on:wheel={handleWheel}
      on:mousedown={startPan}
      on:mousemove={onPan}
      on:mouseup={stopPan}
      on:mouseleave={stopPan}
      role="region"
      aria-label="Área de visualização da imagem"
    >
      <div
        class="image-wrapper"
        style="transform: translate({panX}px, {panY}px) scale({zoomLevel});"
      >
        <img
          {src}
          alt={title}
          draggable="false"
          on:load={handleImageLoad}
          class="preview-img"
        />
      </div>
    </div>
  {:else}
    <div class="code-view-container">
      <pre class="svg-code-block"><code>{svgSourceCode}</code></pre>
    </div>
  {/if}
</div>

<style>
  .image-viewer-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-color: var(--veu-bg-app);
    color: var(--veu-text-color);
    overflow: hidden;
    user-select: none;
    font-family: inherit;
  }

  .image-viewer-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 38px;
    padding: 0 14px;
    background-color: var(--veu-bg-sidebar);
    border-bottom: 1px solid var(--veu-border-color);
    flex-shrink: 0;
    gap: 12px;
  }

  .left-info {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .image-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    font-weight: 500;
    color: var(--veu-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dim-badge {
    font-size: 11px;
    padding: 2px 7px;
    border-radius: 4px;
    background-color: rgba(127, 127, 127, 0.12);
    color: var(--veu-text-color);
    opacity: 0.8;
  }

  .right-controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .mode-toggle {
    display: flex;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.25);
    border: 1px solid var(--veu-border-color);
    border-radius: 6px;
    padding: 2px;
  }

  .mode-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 3px 8px;
    border-radius: 4px;
    border: none;
    background: transparent;
    color: var(--veu-text-color);
    opacity: 0.65;
    font-size: 11.5px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .mode-btn:hover {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.05);
  }

  .mode-btn.active {
    opacity: 1;
    background-color: var(--veu-active-item-bg);
    color: var(--veu-h1-color);
    font-weight: 500;
  }

  .zoom-controls {
    display: flex;
    align-items: center;
    gap: 4px;
    background-color: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--veu-border-color);
    border-radius: 6px;
    padding: 2px 4px;
  }

  .tool-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    height: 24px;
    padding: 0 6px;
    border-radius: 4px;
    border: none;
    background: transparent;
    color: var(--veu-text-color);
    opacity: 0.75;
    cursor: pointer;
    font-size: 11px;
    transition: all 0.15s ease;
  }

  .tool-btn:hover {
    opacity: 1;
    background-color: var(--veu-active-item-bg);
    color: var(--veu-h1-color);
  }

  .zoom-indicator {
    min-width: 44px;
    font-family: 'Fira Code', monospace;
    font-weight: 500;
  }

  .copy-btn {
    background-color: rgba(127, 127, 127, 0.12);
    border: 1px solid var(--veu-border-color);
    padding: 0 10px;
    height: 26px;
  }

  /* Palco com padrão xadrez (transparência) */
  .canvas-stage {
    flex: 1;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    cursor: grab;
    background-color: #11111b;
    background-image:
      linear-gradient(45deg, #181825 25%, transparent 25%),
      linear-gradient(-45deg, #181825 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #181825 75%),
      linear-gradient(-45deg, transparent 75%, #181825 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  }

  .canvas-stage.panning {
    cursor: grabbing;
  }

  .image-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    transform-origin: center center;
    transition: transform 0.05s ease-out;
  }

  .preview-img {
    max-width: none;
    max-height: none;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
    border-radius: 4px;
    pointer-events: none;
  }

  /* Exibição do código XML do SVG */
  .code-view-container {
    flex: 1;
    width: 100%;
    height: 100%;
    overflow: auto;
    padding: 16px;
    background-color: var(--veu-bg-app);
    user-select: text;
    box-sizing: border-box;
  }

  .svg-code-block {
    margin: 0;
    font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
    font-size: 12.5px;
    line-height: 1.6;
    color: var(--veu-text-color);
    white-space: pre-wrap;
    word-break: break-all;
  }
</style>

