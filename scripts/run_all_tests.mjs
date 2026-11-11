import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const testSuites = [
  { name: 'Multi-Project Manager & Workspaces', script: 'scripts/test_project_manager.mjs' },
  { name: 'Code Formatter & Standards', script: 'scripts/test_formatter_and_features.mjs' },
  { name: 'AI Wizard & Multi-CLI Providers', script: 'scripts/test_ai_wizard_and_providers.mjs' },
  { name: 'Sidebar Layout & Splash Screen', script: 'scripts/test_sidebar_splash.mjs' },
  { name: 'Terminal Veu Lab & ANSI Processing', script: 'scripts/test_terminal_veu_lab.mjs' },
  { name: 'Theme System & Known Files Support', script: 'scripts/test_theme_and_file_support.mjs' },
  { name: 'IPC Contracts & Terminal Ring-Buffer', script: 'scripts/test_ipc_and_ringbuffer.mjs' },
  { name: 'Architecture Resilience & Lifecycle', script: 'scripts/test_architecture_resilience.mjs' },
  { name: 'YAML Frontmatter Handling', script: 'scripts/test_yaml_frontmatter.mjs' },
  { name: 'AI Context Dropper & Token Counter', script: 'scripts/test_ai_context_and_tokens.mjs' },
  { name: 'Zero-Server Cloud Sync', script: 'scripts/test_cloud_sync.mjs' },
  { name: 'Workspace Global Search', script: 'scripts/test_workspace_search.mjs' },
  { name: 'Split View Editor', script: 'scripts/test_split_view.mjs' },
  { name: 'Document Templates & Snippets', script: 'scripts/test_templates.mjs' },
  { name: 'Wiki-Links & Backlinks', script: 'scripts/test_wiki_links.mjs' },
  { name: 'Zen Mode / Distraction-Free', script: 'scripts/test_zen_mode.mjs' }
];

console.log('🚀 Executando Suíte Completa de Testes Automatizados (Modo Fail-Fast)\n');

let passedCount = 0;
const startTime = Date.now();

for (const suite of testSuites) {
  process.stdout.write(`▶ Testando: ${suite.name}... `);
  try {
    execSync(`node "${path.join(rootDir, suite.script)}"`, {
      stdio: 'pipe',
      cwd: rootDir
    });
    console.log('✓ PASSOU');
    passedCount++;
  } catch (err) {
    console.log('✗ FALHOU!\n');
    console.error(`[FAIL-FAST] Falha detectada na suíte "${suite.name}":`);
    if (err.stdout) console.error(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    process.exit(1);
  }
}

const duration = ((Date.now() - startTime) / 1000).toFixed(2);
console.log(`\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO! (${passedCount}/${testSuites.length} suítes em ${duration}s)\n`);
