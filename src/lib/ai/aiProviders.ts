/**
 * Definições canônicas de provedores de IA suportados no Veu MD
 * Focado nas 3 principais ferramentas de IA para desenvolvimento com planos mensais:
 * - Google Antigravity (agy)
 * - Anthropic Claude Code (claude)
 * - Muse Code (muse)
 */

export interface AiProvider {
  id: 'agy' | 'claude' | 'muse';
  name: string;
  tagline: string;
  cli: string;
  planType: string;
  description: string;
  installCmd: string;
  installCmdBash: string;
  docsUrl: string;
  color: string;
  isInstalled?: boolean;
}

export const AI_PROVIDERS: Record<string, AiProvider> = {
  agy: {
    id: 'agy',
    name: 'Google Antigravity',
    tagline: 'Google Deepmind Advanced Agentic Coding',
    cli: 'agy',
    planType: 'Plano Mensal Google / Pro',
    description: 'Agente autônomo do Google Deepmind com raciocínio profundo, navegação em repositórios e pair programming.',
    installCmd: 'npm install -g @google/antigravity',
    installCmdBash: 'npm install -g @google/antigravity',
    docsUrl: 'https://antigravity.google.com',
    color: '#74c7ec'
  },
  claude: {
    id: 'claude',
    name: 'Claude Code',
    tagline: 'Anthropic Agentic Coding Assistant',
    cli: 'claude',
    planType: 'Plano Mensal Claude Pro / Team',
    description: 'Assistente da Anthropic operando diretamente no shell com arquitetura agentic e raciocínio Claude 3.7 Sonnet.',
    installCmd: 'npm install -g @anthropic-ai/claude-code',
    installCmdBash: 'npm install -g @anthropic-ai/claude-code',
    docsUrl: 'https://docs.anthropic.com/en/docs/agents-and-tools/claude-code',
    color: '#f5c2e7'
  },
  muse: {
    id: 'muse',
    name: 'Muse Code',
    tagline: 'Meta AI Coding Assistant & Agents',
    cli: 'muse',
    planType: 'Plano Mensal Meta AI / API',
    description: 'Agente de codificação da Meta com subagentes paralelos e janela de contexto estendida.',
    installCmd: 'irm https://dev.meta.ai/install.ps1 | iex',
    installCmdBash: 'curl -fsSL https://dev.meta.ai/install.sh | bash',
    docsUrl: 'https://dev.meta.ai/muse',
    color: '#cba6f7'
  }
};

export const DEFAULT_AI_PROVIDER_ID = 'agy';

/**
 * Retorna a lista ordenada dos provedores suportados
 */
export function getSupportedAiProviders(): AiProvider[] {
  return [AI_PROVIDERS.agy, AI_PROVIDERS.claude, AI_PROVIDERS.muse];
}

