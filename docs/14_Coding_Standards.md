# BeeMaster AI — Kodlama Standartları (Coding Standards) v1.0

> **Amaç:** Tutarlı, okunabilir, sürdürülebilir ve güvenli kod yazımı için zorunlu standartlar. Tüm geliştiriciler (insan + AI ajanları) bu standartlara uyar.

---

## 1. Genel Prensipler

| Kural | Açıklama |
|-------|----------|
| **TypeScript Strict** | `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true` |
| **ESLint + Prettier** | `eslint.config.js` (flat config), `prettier.config.js` — CI'da `lint` ve `format` kontrolü |
| **Path Aliases** | `@/` → `src/`, `@/components`, `@/hooks`, `@/lib`, `@/types`, `@/db`, `@/store` |
| **Barrel Exports** | `index.ts` dosyaları ile `import { Button, Card } from '@/components/ui'` |
| **Colocation** | Bileşene özel hook/util/test aynı klasörde (`Button.tsx`, `Button.test.tsx`, `useButton.ts`) |
| **Named Exports** | Default export **YOK** — her zaman `export function/const/type` |
| **Interfaces over Types** | Object shape'ler için `interface`, union/primitive için `type` |

---

## 2. TypeScript Standartları

### 2.1 Tip Tanımları

```typescript
// ✅ DOĞRU — Interface, explicit types, readonly
export interface Hive {
  readonly id: string;
  readonly apiaryId: string;
  readonly userId: string;
  name: string;
  status: HiveStatus;
  strain: BeeStrain;
  queenId?: string;
  boxType: BoxType;
  frameCount: number;
  positionInApiary: number;
  nfcTag?: string;
  installedAt: string; // ISO 8601
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// Union types için type
export type HiveStatus = 'active' | 'weak' | 'dead' | 'sold' | 'merged';
export type BeeStrain = 'anatolian' | 'caucasian' | 'carniolan' | 'italian' | 'hybrid' | 'other';

// Generic utility types
export type ApiResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: ApiError };

// ❌ YANLIŞ — any, implicit any, default export
export default function processHive(data: any) { ... }
```

### 2.2 Zorunlu TypeScript Ayarları (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@hooks/*": ["src/hooks/*"],
      "@lib/*": ["src/lib/*"],
      "@types/*": ["src/types/*"],
      "@store/*": ["src/store/*"],
      "@db/*": ["src/db/*"]
    }
  }
}
```

---

## 3. React / Frontend Standartları

### 3.1 Bileşen Yapısı

```tsx
// ✅ DOĞRU — Functional, TypeScript, named export, props interface
import { cn } from '@/lib/utils/cn';
import { ChevronRight } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';
  
  const variantClasses = {
    primary: 'bg-honey-400 text-neutral-950 hover:bg-honey-300 active:bg-honey-500 shadow-sm',
    secondary: 'bg-neutral-800 text-neutral-50 hover:bg-neutral-700 border border-neutral-600',
    ghost: 'bg-transparent hover:bg-neutral-800 text-neutral-50',
    danger: 'bg-error text-neutral-50 hover:bg-error/90 active:bg-error',
    outline: 'border border-neutral-600 hover:bg-neutral-800 text-neutral-50',
    glass: 'bg-neutral-900/50 backdrop-blur-md border border-white/10 hover:bg-neutral-900/70 text-neutral-50',
  }[variant];

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
    xl: 'px-8 py-4 text-lg gap-3',
  }[size];

  return (
    <button
      className={cn(baseClasses, variantClasses, sizeClasses, fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="w-4 h-4" />}
      {!loading && leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}

// ❌ YANLIŞ — default export, any, inline styles, className string concat
export default function Button(props: any) {
  return <button style={{background: 'yellow'}} className="btn " + props.className>{props.children}</button>
}
```

### 3.2 Hook Kuralları

```tsx
// ✅ DOĞRU — Custom hook, proper typing, cleanup
export function useHives(apiaryId?: string) {
  const [hives, setHives] = useState<Hive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    async function fetchHives() {
      setLoading(true);
      try {
        const data = await db.hives
          .where('apiary_id')
          .equals(apiaryId || '')
          .toArray();
        if (!cancelled) setHives(data);
      } catch (err) {
        if (!cancelled) setError(err as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchHives();
    return () => { cancelled = true; };
  }, [apiaryId]);

  return { hives, loading, error, refetch: fetchHives };
}
```

### 3.3 State Management

| Katman | Kütüphane | Kullanım |
|--------|-----------|----------|
| **UI State** | Zustand | Modal açık/kapalı, sidebar, theme, form taslakları |
| **Server State** | TanStack Query (React Query) | Tüm API verisi, cache, invalidation, optimistic updates |
| **Form State** | React Hook Form + Zod | Validation, submit, dirty tracking |
| **Local DB** | Dexie.js (IndexedDB) | Offline veri, media, sync queue |
| **AI State** | Custom Context + useReducer | Agent working memory, streaming responses |

```tsx
// ✅ Zustand store örneği
interface DashboardStore {
  activeApiaryId: string | null;
  setActiveApiary: (id: string | null) => void;
  data: DashboardData | null;
  setData: (data: DashboardData) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      activeApiaryId: null,
      setActiveApiary: (id) => set({ activeApiaryId: id }),
      data: null,
      setData: (data) => set({ data }),
      loading: true,
      setLoading: (loading) => set({ loading }),
    }),
    { name: 'dashboard-store', partialize: (s) => ({ activeApiaryId: s.activeApiaryId }) }
  )
);
```

---

## 4. Backend / API Standartları

### 4.1 Edge Functions (Supabase)

```typescript
// supabase/functions/ai-analyze-inspection/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface AnalyzeRequest {
  inspectionId: string;
  forceRemote?: boolean;
}

serve(async (req) => {
  // 1. CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // 2. Auth
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return errorResponse(401, 'Missing authorization');
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return errorResponse(401, 'Invalid token');
  }

  // 3. Request validation
  const body: AnalyzeRequest = await req.json();
  if (!body.inspectionId) {
    return errorResponse(422, 'inspectionId required');
  }

  // 4. Business logic
  const result = await analyzeInspection(body.inspectionId, user.id, body.forceRemote);

  // 4. Response
  return new Response(JSON.stringify({ success: true, data: result }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});

function errorResponse(status: number, message: string) {
  return new Response(JSON.stringify({ 
    type: `https://api.beemaster.ai/errors/${getErrorType(status)}`,
    title: getErrorTitle(status),
    status,
    detail: message,
  }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
```

### 4.2 Database Queries (PostgREST / Supabase Client)

```typescript
// lib/api/hives.ts
export async function getHivesWithDetails(apiaryId: string): Promise<HiveWithDetails[]> {
  const { data, error } = await supabase
    .from('hives')
    .select(`
      *,
      queen:queens(*),
      frames:frames(*),
      latestInspection:inspections!hive_id(
        inspected_at,
        strength,
        varroa_count,
        queen_status
      )
    `)
    .eq('apiary_id', apiaryId)
    .is('deleted_at', null)
    .order('position_in_apiary');

  if (error) throw new ApiError(error.message);
  return data as HiveWithDetails[];
}
```

---

## 5. Database / SQL Standartları

### 5.1 Migration Kuralları

```sql
-- ✅ DOĞRU — Geriye uyumlu, indekslı, RLS
-- migrations/20241201_add_wintered_at_to_hives.sql

ALTER TABLE public.hives 
ADD COLUMN IF NOT EXISTS wintered_at DATE;

CREATE INDEX IF NOT EXISTS idx_hives_wintered 
ON public.hives(wintered_at) 
WHERE wintered_at IS NOT NULL;

-- RLS politikası zaten user_id bazlı, yeni kolon için ekstra policy GEREKMEZ

-- ❌ YANLIŞ — Breaking change, veri kaybı riski
-- ALTER TABLE hives DROP COLUMN old_field;
-- ALTER TABLE hives ALTER COLUMN name TYPE VARCHAR(50);
```

### 5.2 Naming Conventions

| Öğe | Convention | Örnek |
|-----|------------|-------|
| **Tablo** | snake_case, çoğul | `honey_harvests`, `inventory_items` |
| **Kolon** | snake_case | `inspected_at`, `varroa_count`, `frame_count` |
| **PK** | `id` (UUIDv7) | `id UUID PRIMARY KEY DEFAULT gen_random_uuid_v7()` |
| **FK** | `{table}_id` | `apiary_id`, `hive_id`, `queen_id` |
| **İndeks** | `idx_{table}_{column(s)}` | `idx_hives_apiary_status` |
| **Trigger** | `trg_{table}_{action}` | `trg_hives_updated_at` |
| **Policy** | `pol_{table}_{action}` | `pol_hives_select_own` |
| **View** | `v_{purpose}` | `v_hive_monthly_summary` |
| **Materialized View** | `mv_{purpose}` | `mv_regional_benchmark` |

---

## 6. Test Standartları

### 6.1 Test Piramidi

```
                    E2E Tests (Playwright)
                   /                        \
          Integration Tests (Vitest + MSW)   \
         /              |              \      \
Unit Tests          Contract Tests    Accuracy Tests  Safety Tests
(Vitest)            (Pact/Schema)     (Custom Eval)   (Red Team)
```

### 6.2 Unit Test Örneği

```typescript
// components/ui/__tests__/Button.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with correct variant classes', () => {
    render(<Button variant="primary">Test</Button>);
    const btn = screen.getByRole('button', { name: 'Test' });
    expect(btn).toHaveClass('bg-honey-400');
    expect(btn).toHaveClass('text-neutral-950');
  });

  it('shows loading spinner when loading', () => {
    render(<Button loading>Test</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toContainHTML('<svg'); // Spinner
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Test</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### 6.3 Integration Test Örneği

```typescript
// lib/api/__tests__/hives.integration.test.ts
import { describe, it, expect, vi } from 'vitest';
import { getHivesWithDetails } from '../hives';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase');

describe('getHivesWithDetails', () => {
  it('fetches hives with relations', async () => {
    const mockData = [{ id: '1', name: 'Kovan-1', queen: {...}, frames: [...], latestInspection: {...} }];
    
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    } as any);

    const result = await getHivesWithDetails('apiary-123');
    
    expect(result).toEqual(mockData);
    expect(supabase.from).toHaveBeenCalledWith('hives');
  });
});
```

---

## 7. Git ve Commit Standartları

### 7.1 Commit Mesaj Formatı (Conventional Commits)

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

| Type | Açıklama |
|------|----------|
| `feat` | Yeni özellik |
| `fix` | Hata düzeltmesi |
| `docs` | Dokümantasyon |
| `style` | Biçimlendirme (kod çalışmaz) |
| `refactor` | Kod yeniden düzenleme |
| `perf` | Performans iyileştirmesi |
| `test` | Test ekleme/düzeltme |
| `chore` | Bakım, bağımlılıklar |
| `security` | Güvenlik düzeltmesi |

**Örnekler:**
```
feat(inspection): add voice recording with Whisper.cpp
fix(sync): resolve conflict when same hive updated on two devices
docs(api): update GraphQL schema for honey forecast
refactor(ai): extract rule engine to separate module
perf(dashboard): add virtualization for hive list
test(queen): add supersedure prediction accuracy tests
chore(deps): update Supabase client to v2.39
security(auth): add rate limiting to magic link endpoint
```

### 7.2 Branch Stratejisi

| Branch | Amaç | Koruma |
|--------|------|--------|
| `main` | Production-ready | Branch protection, required reviews |
| `develop` | Integration branch | CI geçmeli |
| `feature/*` | Yeni özellik | PR → develop |
| `fix/*` | Hata düzeltmesi | PR → develop/main |
| `release/*` | Release hazırlığı | PR → main |
| `hotfix/*` | Acil production fix | PR → main + develop |

---

## 8. Kod İnceleme (Code Review) Checklist

### 8.1 Zorunlu Kontroller

- [ ] **TypeScript**: `strict` modda hata yok, `any` kullanılmamış
- [ ] **ESLint/Prettier**: `npm run lint` ve `npm run format` geçiyor
- [ ] **Testler**: Unit testler eklenmiş, `npm run test` geçiyor
- [ ] **Güvenlik**: PII sızıntısı yok, RLS politikası doğru, input validation var
- [ ] **Performans**: Gereksiz re-render yok, lazy loading uygun, bundle boyutu artmamış
- [ ] **Erişilebilirlik**: ARIA etiketleri, focus-visible, kontrast, klavye navigasyonu
- [ ] **Offline**: IndexedDB yazma, sync queue, hata durumu handle edilmiş
- [ ] **Dokümantasyon**: Complex logic için JSDoc, README güncellenmiş
- [ ] **Migration**: Geriye uyumlu, indeks eklenmiş, RLS güncellenmiş
- [ ] **Changelog**: `CHANGELOG.md` güncellenmiş (feat/fix/breaking)

### 8.2 PR Şablonu

```markdown
## Değişiklik Özeti
<!-- Ne değişti ve neden? -->

## Tür
- [ ] feat  [ ] fix  [ ] docs  [ ] style  [ ] refactor  [ ] perf  [ ] test  [ ] chore  [ ] security

## Test
- [ ] Unit testler eklendi/güncellendi
- [ ] Integration testler geçiyor
- [ ] Manual test yapıldı (senaryo: ...)

## Ekran Görüntüleri
<!-- UI değişiklikleri için before/after -->

## Breaking Changes
- [ ] Yok
- [ ] Var (açıklama: ...)

## Checklist
- [ ] TypeScript strict geçiyor
- [ ] ESLint/Prettier geçiyor
- [ ] Testler geçiyor
- [ ] Güvenlik kontrolü
- [ ] Performans kontrolü
- [ ] Erişilebilirlik kontrolü
- [ ] Offline kontrolü
- [ ] Dokümantasyon güncellendi
```

---

## 9. AI Kod Üretimi Standartları

### 9.1 AI Agent Kuralları

```markdown
# .github/copilot-instructions.md (veya .cursorrules)

Sen BeeMaster AI projesinde çalışan bir senior full-stack geliştiricisisin.

ZORUNLU KURALLAR:
1. Her zaman TypeScript strict mode, `any` KULLANMA
2. Named export kullan, default export YAPMA
3. `cn()` utility'si ile className birleştir (Tailwind)
4. Lucide React ikonları kullan (lucide-react)
5. Zod ile validation, React Hook Form ile formlar
6. TanStack Query ile server state, Zustand ile UI state
7. IndexedDB (Dexie) ile offline-first, sync queue
8. Lucide ikon boyutları: w-4 h-4 (inline), w-5 h-5 (buton), w-6 h-6 (nav)
9. Renkler: CSS variables (--color-honey-400, --color-neutral-900, vb.)
9. Spacing: 8px grid (--space-2 = 8px)
10. Radius: --radius-md (8px) buton, --radius-lg (12px) kart
11. Loading state: Spinner + disabled button
12. Error handling: try/catch + toast + user-friendly message
13. Accessibility: aria-label, focus-visible, semantic HTML
14. Offline: IndexedDB write → sync queue → background sync
15. Test: Vitest + React Testing Library, coverage > 80%

YASAKLAR:
- `any` type
- Default export
- Inline styles (style={{}})
- className string concatenation
- `console.log` production kodunda
- `alert()` / `confirm()`
- `localStorage` direkt kullanımı (Zustand persist kullan)
- `fetch` direkt kullanımı (supabase client / api client kullan)
- Hardcoded renkler (#fff, #000) - CSS variables kullan
- Magic numbers (spacing, radius, z-index - token'ları kullan)
```

---

## 10. CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run format:check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  build:
    runs-on: ubuntu-latest
    needs: [lint-and-typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with: { name: dist, path: dist }

  e2e:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - run: npm run test:e2e
        env:
          PLAYWRIGHT_BASE_URL: http://localhost:4173
          PLAYWRIGHT_API_URL: http://localhost:54321
```