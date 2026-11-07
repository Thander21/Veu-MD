<script lang="ts">
  export let size: number = 14;
  export let color: string = '#cba6f7';
  let className: string = '';
  export { className as class };
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  width={size}
  height={size}
  class={className}
  style="display: inline-block; vertical-align: middle; flex-shrink: 0;"
  aria-hidden="true"
>
  <defs>
    <linearGradient id="veuIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color={color || '#cba6f7'} />
      <stop offset="60%" stop-color="#f5c2e7" />
      <stop offset="100%" stop-color="#89b4fa" />
    </linearGradient>
  </defs>
  <!-- Fita V estilizada dos Véus do Veu MD -->
  <path
    d="M 4.5 5.5 
       C 6 5.5, 9.5 12, 11.6 16.8 
       C 11.9 17.5, 12.1 17.5, 12.4 16.8 
       C 14.5 12, 18 5.5, 19.5 5.5 
       C 18 6.5, 14.8 13.5, 12 18.5 
       C 9.2 13.5, 6 6.5, 4.5 5.5 Z"
    fill="url(#veuIconGrad)"
  />
  <circle cx="12" cy="18.5" r="1.3" fill="#f5c2e7" />
</svg>

