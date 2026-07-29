# BeeMaster AI — Offline Mode (Çevrimdışı Çalışma) Mimarisi v1.0

> **Amaç:** İntenet bağlantısı olmadan %100 işlevsel uygulama. Veri yerel öncelikli (local-first), arka plan senkronizasyonu, çakışma çözümleme, medya yönetimi.

---

## 1. Offline-First Prensipleri

| Prensip | Uygulama |
|---------|----------|
| **Veri Önce Yerel** | Tüm yazma/okuma IndexedDB → Sonra bulut (Supabase) |
| **Kullanıcı Bloklanmaz** | Ağ yoksa bile muayene, hasat, besleme, tedavi girişi çalışır |
| **Şeffaf Durum** | UI her an: "Çevrimiçi" / "Çevrimdışı" / "Senkronize ediliyor" |
| **Otomatik Kurtarma** | Bağlantı gelince arka planda senkron, kullanıcı müdahalesiz |
| **Çakışma Yönetimi** | Aynı veri iki cihazda değişirse → Kullanıcıya seçim sunulur |

---

## 2. Mimarisi

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           OFFLINE ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        UI LAYER (React)                              │   │
│  │  Components → Hooks (useHives, useInspections, useSync)             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      STATE LAYER (Zustand + TanStack Query)          │   │
│  │  - Local Cache (Query Client)                                        │   │
│  │  - Optimistic Updates                                                │   │
│  │  - Sync Status Store                                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                    ┌───────────────┼───────────────┐                       │
│                    ▼               ▼               ▼                       │
│  ┌───────────────────────┐ ┌───────────────┐ ┌───────────────────────┐   │
│  │   INDEXED DB          │ │  SERVICE      │ │   SYNC ENGINE         │   │
│  │   (Dexie.js)          │ │  WORKER       │ │   (Background Sync)   │   │
│  │  - Tables             │ │  (Workbox)    │ │  - Push Queue         │   │
│  │  - Blobs (Media)      │ │  - Cache      │ │  - Pull Delta         │   │
│  │  - Sync Queue         │ │  - Offline    │ │  - Conflict Resolver  │   │
│  └───────────────────────┘ └───────────────┘ └───────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. IndexedDB Şeması (Dexie.js)

```typescript
// db/indexedDB.ts
import { Dexie } from 'dexie';

export interface SyncOperation {
  id: string;
  table: string;
  operation: 'create' | 'update' | 'delete';
  payload: Record<string, any>;
  timestamp: number;
  retryCount: number;
  serverId?: string;
  localId?: string;
}

export interface MediaFile {
  id: string;
  entityType: 'inspection' | 'harvest' | 'inventory' | 'hive' | 'queen';
  entityId: string;
  mimeType: string;
  blob: Blob;
  thumbnail?: Blob;
  createdAt: number;
  synced: boolean;
  serverUrl?: string;
}

export class BeeMasterDB extends Dexie {
  // Core Tables
  apiaries!: Dexie.Table<Apiary, string>;
  hives!: Dexie.Table<Hive, string>;
  frames!: Dexie.Table<Frame, string>;
  inspections!: Dexie.Table<Inspection, string>;
  queens!: Dexie.Table<Queen, string>;
  harvests!: Dexie.Table<HoneyHarvest, string>;
  feedings!: Dexie.Table<Feeding, string>;
  treatments!: Dexie.Table<Treatment, string>;
  inventory!: Dexie.Table<InventoryItem, string>;
  
  // Sync & Media
  syncQueue!: Dexie.Table<SyncOperation, string>;
  media!: Dexie.Table<MediaFile, string>;
  
  // AI & Settings
  aiAgentStates!: Dexie.Table<AIAgentState, string>;
  userSettings!: Dexie.Table<UserSettings, string>;
  regionalCache!: Dexie.Table<RegionalCache, string>;

  constructor() {
    super('BeeMasterDB');
    this.version(1).stores({
      // Core: user_id + timestamp for queries
      apiaries: 'id, user_id, name, location, created_at, updated_at',
      hives: 'id, apiary_id, user_id, name, status, queen_id, nfc_tag, created_at, updated_at',
      frames: 'id, hive_id, position, frame_type, status, cycles_completed, updated_at',
      inspections: 'id, hive_id, user_id, inspected_at, created_at, synced, updated_at',
      queens: 'id, hive_id, strain, birth_date, status, created_at, updated_at',
      harvests: 'id, hive_id, apiary_id, user_id, harvested_at, weight_kg, created_at',
      feedings: 'id, hive_id, user_id, fed_at, feed_type, amount_kg, created_at',
      treatments: 'id, hive_id, user_id, started_at, treatment_type, status, created_at',
      inventory: 'id, user_id, name, category, current_stock, min_stock, updated_at',
      
      // Sync Queue: timestamp order, status filter
      syncQueue: 'id, table, operation, timestamp, retryCount, status',
      
      // Media: entity lookup, sync status
      media: 'id, entityType, entityId, mimeType, createdAt, synced',
      
      // AI & Cache
      aiAgentStates: 'id, user_id, hive_id, agent_type, updatedAt',
      userSettings: 'id, user_id, key',
      regionalCache: 'id, regionId, type, expiresAt',
    });
    
    // Hooks for auto-timestamp
    this.apiaries.hook('creating', (primKey, obj) => {
      obj.createdAt = obj.createdAt || new Date().toISOString();
      obj.updatedAt = new Date().toISOString();
    });
    this.hives.hook('creating', (primKey, obj) => {
      obj.createdAt = obj.createdAt || new Date().toISOString();
      obj.updatedAt = new Date().toISOString();
    });
    // ... diğer tablolar için benzer hook'lar
  }
}

export const db = new BeeMasterDB();
```

---

## 4. Senkronizasyon Motoru

### 4.1 Sync Engine Sınıfı

```typescript
// sync/syncEngine.ts
class SyncEngine {
  private db: BeeMasterDB;
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private listeners: Set<(status: SyncStatus) => void> = new Set();
  
  // Yapılandırma
  private readonly BATCH_SIZE = 50;
  private readonly MAX_RETRIES = 5;
  private readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 dakika
  
  constructor(db: BeeMasterDB) {
    this.db = db;
    this.setupNetworkListeners();
    this.startPeriodicSync();
  }
  
  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyStatus({ phase: 'online', message: 'Bağlantı yeniden kuruldu' });
      this.flushQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyStatus({ phase: 'offline', message: 'Çevrimdışı mod' });
    });
  }
  
  private startPeriodicSync() {
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.flushQueue();
      }
    }, this.SYNC_INTERVAL);
  }
  
  // === PUBLIC API ===
  
  async queueOperation(op: Omit<SyncOperation, 'id' | 'retryCount' | 'timestamp'>) {
    const id = crypto.randomUUID();
    const operation: SyncOperation = {
      ...op,
      id,
      retryCount: 0,
      timestamp: Date.now(),
      localId: op.operation === 'create' ? op.payload.id : undefined,
    };
    
    await this.db.syncQueue.add(operation);
    this.notifyStatus({ phase: 'queued', operation });
    
    if (this.isOnline) {
      this.flushQueue(); // Fire and forget
    }
  }
  
  async flushQueue(): Promise<SyncResult> {
    if (this.syncInProgress || !this.isOnline) {
      return { success: false, reason: 'Already syncing or offline' };
    }
    
    this.syncInProgress = true;
    this.notifyStatus({ phase: 'syncing', message: 'Senkronizasyon başlıyor...' });
    
    const results: SyncResult = { pushed: 0, pulled: 0, conflicts: 0, errors: 0 };
    
    try {
      // 1. PUSH: Local → Server
      const pushResult = await this.pushChanges();
      results.pushed = pushResult.successCount;
      results.errors += pushResult.errorCount;
      results.conflicts += pushResult.conflictCount;
      
      // 2. PULL: Server → Local
      const pullResult = await this.pullChanges();
      results.pulled = pullResult.count;
      
      // 3. MEDIA SYNC
      await this.syncMedia();
      
      this.notifyStatus({ 
        phase: 'completed', 
        message: `Senkronizasyon tamamlandı: ${results.pushed} gönderildi, ${results.pulled} alındı` 
      });
      
      return { success: true, ...results };
    } catch (error) {
      this.notifyStatus({ phase: 'error', message: `Senkronizasyon hatası: ${error.message}` });
      return { success: false, error: error.message };
    } finally {
      this.syncInProgress = false;
    }
  }
  
  // === PUSH OPERATIONS ===
  
  private async pushChanges(): Promise<PushResult> {
    const pending = await this.db.syncQueue
      .where('status')
      .anyOf(['pending', 'retry'])
      .sortBy('timestamp')
      .limit(this.BATCH_SIZE);
    
    if (pending.length === 0) return { successCount: 0, errorCount: 0, conflictCount: 0 };
    
    const token = await this.getAuthToken();
    let successCount = 0, errorCount = 0, conflictCount = 0;
    
    for (const op of pending) {
      try {
        await this.db.syncQueue.update(op.id, { status: 'processing' });
        
        const response = await fetch('/api/v1/sync/push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify([this.sanitizeOperation(op)]),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        // Server ID mapping for creates
        if (op.operation === 'create' && result.serverId) {
          await this.remapLocalIds(op.table, op.payload.id, result.serverId);
        }
        
        await this.db.syncQueue.delete(op.id);
        successCount++;
      } catch (error) {
        await this.handleSyncError(op, error);
        errorCount++;
        if (error.message.includes('conflict')) conflictCount++;
      }
    }
    
    return { successCount, errorCount, conflictCount };
  }
  
  private sanitizeOperation(op: SyncOperation): any {
    const { id, retryCount, timestamp, status, serverId, localId, ...clean } = op;
    return clean;
  }
  
  private async handleSyncError(op: SyncOperation, error: Error) {
    const newRetryCount = op.retryCount + 1;
    
    if (newRetryCount >= this.MAX_RETRIES) {
      await this.db.syncQueue.update(op.id, { 
        status: 'failed', 
        errorMessage: error.message,
        retryCount: newRetryCount 
      });
      // Dead letter queue'a taşı
      await this.moveToDeadLetter(op, error);
    } else {
      await this.db.syncQueue.update(op.id, { 
        retryCount: newRetryCount,
        status: 'retry',
        errorMessage: error.message 
      });
    }
  }
  
  // === PULL OPERATIONS ===
  
  private async pullChanges(): Promise<PullResult> {
    const lastSync = await this.getLastSyncTimestamp();
    const token = await this.getAuthToken();
    
    const response = await fetch(`/api/v1/sync/pull?since=${lastSync}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!response.ok) throw new Error(`Pull failed: ${response.status}`);
    
    const { changes, serverTime } = await response.json();
    
    for (const change of changes) {
      await this.applyServerChange(change);
    }
    
    await this.setLastSyncTimestamp(serverTime);
    return { count: changes.length };
  }
  
  private async applyServerChange(change: ServerChange) {
    const { table, operation, record } = change;
    const dbTable = this.db.table(table);
    
    switch (operation) {
      case 'create':
      case 'update':
        // Upsert: server verisi her zaman kazanır (LWW)
        await dbTable.put(record);
        break;
      case 'delete':
        await dbTable.delete(record.id);
        break;
    }
  }
  
  // === CONFLICT RESOLUTION ===
  
  async resolveConflict(conflict: SyncConflict, resolution: ConflictResolution): Promise<void> {
    const { table, localRecord, serverRecord, mergedRecord } = conflict;
    
    let finalRecord: any;
    switch (resolution) {
      case 'local':
        finalRecord = localRecord;
        break;
      case 'server':
        finalRecord = serverRecord;
        break;
      case 'merge':
        finalRecord = mergedRecord;
        break;
      case 'both':
        // İkisini de ayrı ID ile kaydet
        await this.db.table(table).put(localRecord);
        await this.db.table(table).put(serverRecord);
        return;
    }
    
    // Server'a merged record gönder
    await this.pushMergedRecord(table, finalRecord);
    
    // Local DB'yi güncelle
    await this.db.table(table).put(finalRecord);
  }
  
  // === MEDIA SYNC ===
  
  private async syncMedia(): Promise<void> {
    const unsyncedMedia = await this.db.media
      .where('synced')
      .equals(false)
      .limit(10)
      .toArray();
    
    for (const media of unsyncedMedia) {
      try {
        const uploadUrl = await this.getMediaUploadUrl(media);
        await fetch(uploadUrl, {
          method: 'PUT',
          body: media.blob,
          headers: { 'Content-Type': media.mimeType },
        });
        
        await this.db.media.update(media.id, { 
          synced: true, 
          serverUrl: uploadUrl.split('?')[0] 
        });
      } catch (error) {
        console.warn('Media sync failed:', error);
      }
    }
  }
  
  // === UTILITIES ===
  
  private async getAuthToken(): Promise<string> {
    // Supabase session'dan token al
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  }
  
  private async remapLocalIds(table: string, localId: string, serverId: string) {
    // Referansları güncelle: frames.hive_id, inspections.hive_id, etc.
    const mappings = await this.getReferenceMappings(table, localId);
    for (const { refTable, refField, refId } of mappings) {
      if (refId === localId) {
        await this.db.table(refTable).update(refId, { [refField]: serverId });
      }
    }
  }
  
  private notifyStatus(status: SyncStatus) {
    this.listeners.forEach(cb => cb(status));
  }
  
  onStatusChange(cb: (status: SyncStatus) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
}

export const syncEngine = new SyncEngine(db);
```

---

## 5. Çakışma Çözümleme UI

```tsx
// components/sync/ConflictResolver.tsx
export function ConflictResolver({ 
  conflict, 
  onResolve, 
  onDismiss 
}: ConflictResolverProps) {
  const [resolution, setResolution] = useState<ConflictResolution>('merge');
  const [mergedData, setMergedData] = useState(conflict.serverRecord);
  
  const fields = Object.keys(conflict.localRecord).filter(
    k => k !== 'id' && k !== 'created_at' && k !== 'updated_at'
  );
  
  const differences = fields
    .map(field => ({
      field,
      local: conflict.localRecord[field],
      server: conflict.serverRecord[field],
      merged: mergedData[field],
      isDifferent: conflict.localRecord[field] !== conflict.serverRecord[field],
    }))
    .filter(d => d.isDifferent);
  
  return (
    <Modal isOpen onClose={onDismiss} title="Veri Çakışması" size="lg">
      <div className="space-y-4">
        <Alert variant="warning">
          <AlertTriangle className="w-5 h-5" />
          <div>
            <p className="font-medium">"{conflict.table}" tablosunda çakışma tespit edildi</p>
            <p className="text-sm text-neutral-400 mt-1">
              Bu kayıt hem bu cihazda hem de sunucuda değiştirilmiş. Hangisini tutmak istersiniz?
            </p>
          </div>
        </Alert>
        
        {differences.length > 0 && (
          <div className="max-h-60 overflow-y-auto space-y-3">
            {differences.map((diff, i) => (
              <Card key={i} variant="bordered" padding="md">
                <p className="text-xs text-neutral-400 mb-2">{diff.field}</p>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="p-2 bg-neutral-800 rounded-lg">
                    <p className="text-neutral-500 text-xs">Bu Cihaz</p>
                    <p className="font-mono text-neutral-50 truncate">{JSON.stringify(diff.local)}</p>
                  </div>
                  <div className="p-2 bg-neutral-800 rounded-lg">
                    <p className="text-neutral-500 text-xs">Sunucu</p>
                    <p className="font-mono text-neutral-50 truncate">{JSON.stringify(diff.server)}</p>
                  </div>
                  <div className="p-2 bg-honey-400/10 rounded-lg border border-honey-400/20">
                    <p className="text-neutral-500 text-xs">Birleştirilmiş</p>
                    <select
                      value={diff.merged}
                      onChange={e => setMergedData({ ...mergedData, [diff.field]: e.target.value })}
                      className="w-full bg-transparent text-neutral-50 text-sm"
                    >
                      <option value={diff.local}>Bu Cihaz: {JSON.stringify(diff.local)}</option>
                      <option value={diff.server}>Sunucu: {JSON.stringify(diff.server)}</option>
                    </select>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-xl">
          <RadioGroup value={resolution} onValueChange={setResolution}>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="local" className="w-4 h-4" />
              <Label>Bu cihazı tut</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="server" className="w-4 h-4" />
              <Label>Sunucuyu tut</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="merge" className="w-4 h-4" />
              <Label>Birleştir (yukarıdan seç)</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="both" className="w-4 h-4" />
              <Label>İkisini de ayrı kayıt olarak tut</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="flex gap-3 pt-4 border-t border-neutral-800">
          <Button variant="ghost" fullWidth onClick={onDismiss}>İptal</Button>
          <Button variant="primary" fullWidth onClick={() => onResolve(resolution, mergedData)}>
            Çöz ve Senkronize Et
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

---

## 6. Offline UI İndikatörleri

```tsx
// components/sync/OfflineIndicator.tsx
export function OfflineIndicator() {
  const [status, setStatus] = useState<SyncStatus>({ phase: 'idle' });
  
  useEffect(() => {
    const unsubscribe = syncEngine.onStatusChange(setStatus);
    return unsubscribe;
  }, []);
  
  const isOffline = !navigator.onLine;
  const isSyncing = status.phase === 'syncing';
  const pendingCount = status.pendingCount || 0;
  
  if (!isOffline && !isSyncing && pendingCount === 0) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-[200] animate-in slide-in-from-top">
      <div className="max-w-xl mx-auto px-4 py-2">
        <div className={cn(
          'flex items-center justify-between gap-3 px-3 py-2 rounded-xl',
          isOffline ? 'bg-error-bg border-error' : 'bg-info-bg border-info'
        )}>
          <div className="flex items-center gap-2">
            {isOffline ? (
              <>
                <WifiOff className="w-5 h-5 text-error" />
                <span className="font-medium text-error">Çevrimdışı</span>
              </>
            ) : isSyncing ? (
              <>
                <Loader2 className="w-5 h-5 text-info animate-spin" />
                <span className="font-medium text-info">Senkronize ediliyor...</span>
              </>
            ) : (
              <>
                <Clock className="w-5 h-5 text-warning" />
                <span className="font-medium text-warning">Bekleyen: {pendingCount}</span>
              </>
            )}
          </div>
          
          {isOffline && (
            <span className="text-xs text-neutral-400 px-2 py-1 bg-neutral-900 rounded-lg">
              Değişiklikleriniz kaydedildi, bağlantı gelince senkronize edilecek
            </span>
          )}
          
          {!isOffline && pendingCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => syncEngine.flushQueue()}>
              <RefreshCw className="w-4 h-4 mr-1" /> Şimdi Senkronize Et
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 7. Veri Bütünlüğü ve Garantiler

| Senaryo | Garanti | Mekanizma |
|---------|---------|-----------|
| **Yazma sırasında kapanma** | Veri kaybı yok | IndexedDB transaction (atomic) |
| **Ağ kesintisi** | Kuyrukta bekler | Service Worker Background Sync |
| **Aynı veri çakışması** | Kullanıcı seçer | LWW + Manual merge UI |
| **Medya yüklenemedi** | Blob olarak sakla | IndexedDB + Retry queue |
| **Token süresi doldu** | Yenile + Tekrar dene | Interceptor + Refresh token |
| **Depolama doldu** | Uyarı + Temizlik | Quota API + LRU eviction |

---

## 8. Test Senaryoları

| Senaryo | Beklenen |
|---------|----------|
| **Tam offline muayene** | Kaydedilir, kuyruğa alınır, online → push başarılı |
| **İki cihazda aynı kovan güncelleme** | Çakışma UI açılır, merge seçeneği çalışır |
| **Medya offline yüklenme** | Blob IndexedDB, thumb oluşturulur, online → upload |
| **Uzun süre offline (1 hafta)** | Tüm veriler local, online → full pull + merge |
| **Token expire offline** | LocalStorage'da refresh token, online → auto refresh |
| **Çakışma: local silme, server güncelleme** | "Resurrect" seçeneği: silme iptal, güncelleme uygulanır |

---

## 9. Gelecek Geliştirmeler (v1.5+)

| Özellik | Açıklama |
|---------|----------|
| **CRDT (Conflict-free Replicated Data Types)** | Otomatik merge, manuel çakışma çözme ihtiyacını azaltır |
| **Selective Sync** | Sadece aktif üss/kovanları senkronize et (bant genişliği tasarrufu) |
| **Peer-to-Peer Sync (WebRTC)** | İnternet olmadan iki cihaz arası veri transferi |
| **Sync Analytics** | "Son 7 günde 234 kayıt senkronize edildi, 2 çakışma" |
| **Offline AI Model Updates** | Model dosyası background indirilir, hazırda bekler |
| **Encrypted Local DB** | SQLCipher / Web Crypto API ile şifreli IndexedDB |