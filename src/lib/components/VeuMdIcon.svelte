<script lang="ts">
  export let size: number = 14;
  export let color: string = '#ab47bc';
  let className: string = '';
  export { className as class };
</script>

<!-- Ícone canônico de Markdown (.md) inspirado no Material Icon Theme do VS Code -->
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 32 32"
  width={size}
  height={size}
  class={className}
  style="display: inline-block; vertical-align: middle; flex-shrink: 0;"
  aria-hidden="true"
>
  <!-- Fundo Roxo Material com cantos arredondados -->
  <rect
    x="2"
    y="5"
    width="28"
    height="22"
    rx="4.5"
    fill={color || '#ab47bc'}
  />

  <!-- Glifo M do Markdown em branco -->
  <path
    d="M 6.5 21 V 11.5 L 10.5 15.5 L 14.5 11.5 V 21"
    fill="none"
    stroke="#ffffff"
    stroke-width="2.3"
    stroke-linecap="round"
    stroke-linejoin="round"
  />

  <!-- Seta para baixo do Markdown (↓) em branco -->
  <path
    d="M 22.5 11.5 V 21 M 19 17.5 L 22.5 21 L 26 17.5"
    fill="none"
    stroke="#ffffff"
    stroke-width="2.3"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
