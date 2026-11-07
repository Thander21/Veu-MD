<script lang="ts">
  import TerminalVeuPanel from './TerminalVeuPanel.svelte';

  export let projectId: string = 'default';
  export let visible: boolean = false;
  export let currentFolderPath: string = '';
  export let hasActiveFile: boolean = true;
  export let orientation: 'horizontal' | 'vertical' = 'horizontal';
  export let isMaximized: boolean = false;
  export let onClose: () => void;
  export let onInsertText: ((text: string) => void) | undefined = undefined;
  export let onOpenAiAssistant: ((command?: string) => void) | undefined = undefined;

  let veuRef: any = null;

  export function closeProjectTerminals(pId: string) {
    if (veuRef && typeof veuRef.closeProjectTerminals === 'function') {
      veuRef.closeProjectTerminals(pId);
    }
  }
</script>

<TerminalVeuPanel
  bind:this={veuRef}
  {projectId}
  {visible}
  {currentFolderPath}
  {hasActiveFile}
  bind:orientation
  bind:isMaximized
  {onClose}
  {onInsertText}
  {onOpenAiAssistant}
/>
