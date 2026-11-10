/**
 * Serviço de sincronização em nuvem sem servidor proprietário (Zero-Server Cloud Sync).
 * Implementa protocolo aberto WebDAV HTTP/1.1 com fila assíncrona tolerante a desconexão (Offline-First).
 */

export interface WebDavConfig {
  enabled: boolean;
  serverUrl: string;
  username: string;
  password?: string;
  remoteFolder: string;
  autoSync: boolean;
}

export interface SyncQueueItem {
  id: string;
  localPath: string;
  relPath: string;
  content: string;
  attempts: number;
  status: 'pending' | 'syncing' | 'failed' | 'synced';
  queuedAt: number;
}

export type SyncStatus = 'disabled' | 'idle' | 'syncing' | 'offline' | 'error';

const CONFIG_STORAGE_KEY = 'veu_cloud_sync_config';

export function createDefaultConfig(): WebDavConfig {
  return {
    enabled: false,
    serverUrl: '',
    username: '',
    password: '',
    remoteFolder: 'VeuMD',
    autoSync: true
  };
}

export function buildBasicAuth(username?: string, password?: string): string {
  if (!username) return '';
  const token = typeof btoa === 'function' ? btoa(`${username}:${password || ''}`) : Buffer.from(`${username}:${password || ''}`).toString('base64');
  return `Basic ${token}`;
}

export function buildRemoteUrl(serverUrl: string, remoteFolder: string, relPath: string): string {
  const base = serverUrl.replace(/\/+$/, '');
  const folder = remoteFolder.replace(/^\/+|\/+$/g, '');
  const cleanRel = relPath.replace(/^\/+/, '').replace(/\\/g, '/');
  return folder ? `${base}/${folder}/${cleanRel}` : `${base}/${cleanRel}`;
}

export class CloudSyncService {
  private config: WebDavConfig;
  private queue: SyncQueueItem[] = [];
  private status: SyncStatus = 'disabled';
  private listeners: Set<(status: SyncStatus, pendingCount: number) => void> = new Set();
  private processTimer: any = null;

  constructor() {
    this.config = this.loadConfig();
    this.status = this.config.enabled ? 'idle' : 'disabled';

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  public getConfig(): WebDavConfig {
    return { ...this.config };
  }

  public saveConfig(newConfig: WebDavConfig) {
    this.config = { ...newConfig };
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));
      } catch (err) {
        console.warn('Erro ao salvar configuração de nuvem:', err);
      }
    }
    this.status = this.config.enabled ? (this.isOnline() ? 'idle' : 'offline') : 'disabled';
    this.notify();
    if (this.config.enabled && this.queue.length > 0) {
      this.scheduleProcessing(200);
    }
  }

  public isOnline(): boolean {
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      return navigator.onLine;
    }
    return true;
  }

  public getStatus(): SyncStatus {
    return this.status;
  }

  public getPendingCount(): number {
    return this.queue.filter((item) => item.status === 'pending' || item.status === 'failed').length;
  }

  public subscribe(listener: (status: SyncStatus, pendingCount: number) => void): () => void {
    this.listeners.add(listener);
    listener(this.status, this.getPendingCount());
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Enfileira um arquivo para envio em background desacoplado.
   * Não bloqueia a thread de execução do chamador (fire-and-forget).
   */
  public enqueueUpload(localPath: string, relPath: string, content: string) {
    if (!this.config.enabled || !this.config.serverUrl) {
      return;
    }

    const cleanRel = relPath.replace(/\\/g, '/').replace(/^\/+/, '');
    const existingIndex = this.queue.findIndex((item) => item.relPath === cleanRel);

    const queueItem: SyncQueueItem = {
      id: `sync-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      localPath,
      relPath: cleanRel,
      content,
      attempts: 0,
      status: 'pending',
      queuedAt: Date.now()
    };

    if (existingIndex >= 0) {
      this.queue[existingIndex] = queueItem;
    } else {
      this.queue.push(queueItem);
    }

    this.notify();
    this.scheduleProcessing(500);
  }

  /**
   * Dispara o processamento da fila de envio em segundo plano.
   */
  public async processQueue(): Promise<void> {
    if (!this.config.enabled || !this.config.serverUrl) return;

    if (!this.isOnline()) {
      this.status = 'offline';
      this.notify();
      return;
    }

    const pending = this.queue.filter((item) => item.status === 'pending' || item.status === 'failed');
    if (pending.length === 0) {
      this.status = 'idle';
      this.notify();
      return;
    }

    this.status = 'syncing';
    this.notify();

    const authHeader = buildBasicAuth(this.config.username, this.config.password);

    for (const item of pending) {
      item.status = 'syncing';
      item.attempts += 1;

      try {
        const targetUrl = buildRemoteUrl(this.config.serverUrl, this.config.remoteFolder, item.relPath);
        const res = await fetch(targetUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            ...(authHeader ? { Authorization: authHeader } : {})
          },
          body: item.content
        });

        if (res.ok || res.status === 201 || res.status === 204) {
          item.status = 'synced';
          // Remove itens concluídos
          this.queue = this.queue.filter((q) => q.id !== item.id);
        } else {
          item.status = 'failed';
        }
      } catch (err) {
        item.status = 'failed';
        if (!this.isOnline()) {
          this.status = 'offline';
          this.notify();
          return;
        }
      }
    }

    const remaining = this.getPendingCount();
    this.status = remaining > 0 ? 'error' : 'idle';
    this.notify();
  }

  /**
   * Testa a conectividade com o servidor WebDAV sem alterar a fila.
   */
  public async testConnection(testCfg?: WebDavConfig): Promise<{ success: boolean; message: string }> {
    const cfg = testCfg || this.config;
    if (!cfg.serverUrl) {
      return { success: false, message: 'URL do servidor WebDAV não informada.' };
    }

    const authHeader = buildBasicAuth(cfg.username, cfg.password);
    const testUrl = cfg.serverUrl.replace(/\/+$/, '');

    try {
      const res = await fetch(testUrl, {
        method: 'OPTIONS',
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {})
        }
      });

      if (res.ok || res.status === 200 || res.status === 207 || res.status === 405) {
        return { success: true, message: 'Conexão estabelecida com sucesso com o servidor WebDAV!' };
      }
      return { success: false, message: `Servidor retornou status HTTP ${res.status} (${res.statusText}).` };
    } catch (err: any) {
      return { success: false, message: `Falha de rede ao conectar: ${err?.message || err}` };
    }
  }

  private scheduleProcessing(delayMs: number) {
    if (this.processTimer) {
      clearTimeout(this.processTimer);
    }
    this.processTimer = setTimeout(() => {
      this.processTimer = null;
      this.processQueue().catch(() => {});
    }, delayMs);
  }

  private handleNetworkChange(online: boolean) {
    if (online) {
      if (this.config.enabled && this.queue.length > 0) {
        this.scheduleProcessing(300);
      } else {
        this.status = this.config.enabled ? 'idle' : 'disabled';
        this.notify();
      }
    } else {
      if (this.config.enabled) {
        this.status = 'offline';
        this.notify();
      }
    }
  }

  private notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.status, this.getPendingCount());
      } catch (err) {
        console.error('Erro em listener de sync:', err);
      }
    }
  }

  private loadConfig(): WebDavConfig {
    if (typeof localStorage === 'undefined') {
      return createDefaultConfig();
    }
    try {
      const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (raw) {
        return { ...createDefaultConfig(), ...JSON.parse(raw) };
      }
    } catch (err) {
      console.warn('Erro ao carregar configuração de nuvem:', err);
    }
    return createDefaultConfig();
  }
}

export const cloudSyncService = new CloudSyncService();

