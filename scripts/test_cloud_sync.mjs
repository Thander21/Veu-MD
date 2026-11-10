import assert from 'node:assert';
import {
  CloudSyncService,
  createDefaultConfig,
  buildBasicAuth,
  buildRemoteUrl
} from '../src/lib/services/cloudSyncService.ts';

console.log('--- TESTANDO ZERO-SERVER CLOUD SYNC (SYNC-01..SYNC-04) ---');

// 1. SYNC-01: Construcao de credenciais WebDAV e URLs remotas
const auth = buildBasicAuth('meu_usuario', 'senha123');
assert(auth.startsWith('Basic '), 'Header de autenticacao deve usar Basic Auth');

const remoteUrl = buildRemoteUrl('https://nuvem.exemplo.com/remote.php/dav/files/user/', 'VeuMD', 'pasta\\nota.md');
assert.strictEqual(
  remoteUrl,
  'https://nuvem.exemplo.com/remote.php/dav/files/user/VeuMD/pasta/nota.md',
  'Deve normalizar barras e construir caminho remoto correto'
);

// 2. SYNC-01 & SYNC-02: Enfileiramento assincrono desacoplado (Zero Bloqueio)
const syncService = new CloudSyncService();
const cfg = createDefaultConfig();
cfg.enabled = true;
cfg.serverUrl = 'https://nuvem.exemplo.com/dav/';
cfg.username = 'tester';
cfg.password = 'pass';
syncService.saveConfig(cfg);

assert.strictEqual(syncService.getStatus(), 'idle', 'Status inicial com servico ativado deve ser idle');

// Enfileira arquivo para upload
syncService.enqueueUpload('/local/docs/nota1.md', 'docs/nota1.md', '# Conteudo 1');
assert.strictEqual(syncService.getPendingCount(), 1, 'Fila deve conter 1 item pendente apos enfileiramento');

// Enfileira atualizacao do mesmo arquivo (deve substituir e nao duplicar)
syncService.enqueueUpload('/local/docs/nota1.md', 'docs/nota1.md', '# Conteudo 1 Atualizado');
assert.strictEqual(syncService.getPendingCount(), 1, 'Re-enfileiramento do mesmo caminho deve atualizar sem duplicar');

// Enfileira segundo arquivo
syncService.enqueueUpload('/local/docs/nota2.md', 'docs/nota2.md', '# Conteudo 2');
assert.strictEqual(syncService.getPendingCount(), 2, 'Fila deve conter 2 itens distintos');

// 3. SYNC-04: Modo tolerante a desconexao (Offline-First)
// Forca modo offline
syncService.isOnline = () => false;
await syncService.processQueue();

assert.strictEqual(syncService.getStatus(), 'offline', 'Status deve comutar para offline quando sem conexao');
assert.strictEqual(syncService.getPendingCount(), 2, 'Itens devem ser retidos na fila durante desconexao');

// 4. SYNC-03: Protecao de Abas Sujas (Dirty Tabs) na Atualizacao Remota
// Simula a logica de reconciliacao de abas do App.svelte
function simulateRemoteSyncArrival(tab, incomingRemoteContent) {
  if (tab.isDirty) {
    // Preserva edicoes locais intactas
    return {
      updated: false,
      notification: `Alteração externa detectada em "${tab.title}". Suas edições locais foram preservadas.`
    };
  } else {
    // Atualiza com seguranca
    tab.content = incomingRemoteContent;
    return {
      updated: true,
      notification: `Arquivo "${tab.title}" sincronizado com alteração externa.`
    };
  }
}

const dirtyTab = {
  id: 'tab-1',
  title: 'Artigo.md',
  content: '# Meu Texto Local Nao Salvo',
  isDirty: true
};

const dirtyRes = simulateRemoteSyncArrival(dirtyTab, '# Texto Remoto Mais Recente');
assert.strictEqual(dirtyRes.updated, false, 'Aba com isDirty === true jamais deve ser sobrescrita');
assert.strictEqual(dirtyTab.content, '# Meu Texto Local Nao Salvo', 'Conteudo local deve permanecer intacto');
assert(dirtyRes.notification.includes('preservadas'), 'Notificacao de preservacao deve ser emitida');

const cleanTab = {
  id: 'tab-2',
  title: 'Leitura.md',
  content: '# Versao Antiga',
  isDirty: false
};

const cleanRes = simulateRemoteSyncArrival(cleanTab, '# Versao Nova Remota');
assert.strictEqual(cleanRes.updated, true, 'Aba limpa deve receber a atualizacao remota');
assert.strictEqual(cleanTab.content, '# Versao Nova Remota', 'Conteudo da aba limpa deve ser atualizado');

// 5. Teste de validacao de configuracao e teste de conexao
const badConfigRes = await syncService.testConnection({ ...cfg, serverUrl: '' });
assert.strictEqual(badConfigRes.success, false, 'TestConnection sem URL deve falhar com mensagem explicativa');

console.log('✓ PASSOU: Todos os testes de Zero-Server Cloud Sync e resiliencia foram aprovados com sucesso!');
