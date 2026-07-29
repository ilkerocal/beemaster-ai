# BeeMaster AI — UI/UX Design System v1.0

> **Amaç:** Tutarlı, erişilebilir, mobil-öncelikli, koyu-tema varsayılanlı, "Premium SaaS" estetiğinde bir tasarım dili tanımlamak. Tüm bileşenler, sayfalar ve etkileşimler bu sistemdeki token ve kurallara uyar.

---

## 1. Tasarım Felsefesi (Design Philosophy)

| Prensip | Tanım | Uygulama |
|---------|-------|----------|
| **Koyu Varsayılan (Dark First)** | Arıcılar güneş ışığında, petek başında çalışır. Koyu arka plan göz yormaz, pil tasarrufu yapar, bal rengi (marka) üzerinde parlar. | `prefers-color-scheme: dark` varsayılan, light mode opsiyonel (ayarlar) |
| **Mobil-Öncelikli (Mobile First)** | 90%+ kullanım telefon. Parmakla, eldivenle, tek elle kullanılabilir. | Bottom nav, 44px+ dokunma hedefleri, kaydırma yok (dikey ritim) |
| **Cam Morfoloji (Glassmorphism)** | Derinlik hissi verir, koyu arka planda "hücre" metaforu, petek şeffaflığı. | `backdrop-filter: blur(16px)`, yarı saydam kartlar, ince kenarlık |
| **Bal Rengi Vurgu (Honey Accent)** | Tek vurgulama rengi: `#F4B400` (honey-400). Eylemler, linkler, aktif durumlar, veri vurgu. | Çok az, çok etkili. Kullanım: Primary button, aktif nav, grafik vurgusu, badge |
| **8px Grid Sistemi** | Tüm spacing, radius, boyutlar 8px'in katları. Tutarlılık, geliştirici hızı. | `--space-1: 4px` (yarım birim), `--space-2: 8px` (temel birim) |
| **Erişilebilirlik (WCAG AA)** | Kontrast, odak halka, ekran okuyucu, hareket azaltma. | Her bileşen test edilmeli, `prefers-reduced-motion` saygılı |
| **Mikro Animasyonlar** | Anlamlı geri bildirim, durum değişikliği, yönlendirme. 120-300ms, `ease-out`. | Hover, tap, modal giriş/çıkış, toast, skeleton shimmer, nav aktivasyon |
| **İçerik Önce (Content First)** | UI içerik için vardır. Boşluk, hiyerarşi, okunabilirlik. | Tipografi ölçek, satır yüksekliği 1.6, okunabilir genişlik (65-75ch) |

---

## 2. Tasarım Tokenleri (Design Tokens)

### 2.1 Renk Sistemi (Color System)

```css
:root {
  /* ============================================================
     BRAND — BAL SARISI (Tek vurgulama rengi)
     ============================================================ */
  --color-honey-50:  #fffbeb;
  --color-honey-100: #fef3c7;
  --color-honey-200: #fde68a;
  --color-honey-300: #fcd34d;
  --color-honey-400: #fbbf24;  /* PRIMARY BRAND — Butonlar, linkler, aktif nav, grafik vurgusu */
  --color-honey-500: #f59e0b;  /* Hover */
  --color-honey-600: #d97706;
  --color-honey-700: #b45309;
  --color-honey-800: #92400e;
  --color-honey-900: #78350f;
  --color-honey-950: #451a03;

  /* ============================================================
     NEUTRAL — KOYU TEMA TEMELİ
     ============================================================ */
  --color-neutral-0:   #ffffff;
  --color-neutral-50:  #fafafa;
  --color-neutral-100: #f5f5f5;
  --color-neutral-200: #e5e5e5;
  --color-neutral-300: #d4d4d4;
  --color-neutral-400: #a3a3a3;
  --color-neutral-500: #737373;
  --color-neutral-600: #525252;
  --color-neutral-700: #404040;
  --color-neutral-800: #262626;
  --color-neutral-900: #171717;
  --color-neutral-950: #0a0a0a;

  /* ============================================================
     SEMANTIC — ANLAMLI RENK KULLANIMI (Bileşenler bunu kullanır)
     ============================================================ */
  /* Arka Planlar */
  --color-bg-primary:      var(--color-neutral-950);  /* Ana sayfa arka planı */
  --color-bg-secondary:    var(--color-neutral-900);  /* Sidebar, header, alt bölümler */
  --color-bg-tertiary:     var(--color-neutral-800);  /* Kart içi alanlar, input arka planı */
  --color-bg-card:         var(--color-neutral-900);  /* Kart arka planı */
  --color-bg-card-hover:   var(--color-neutral-800);  /* Hover kart */
  --color-bg-input:        var(--color-neutral-800);  /* Form input arka planı */
  --color-bg-glass:        rgba(23, 23, 23, 0.7);    /* Glassmorphism kart */
  --color-bg-modal:        var(--color-neutral-900);  /* Modal arka planı */
  --color-bg-toast:        var(--color-neutral-800);  /* Toast arka planı */

  /* Kenarlıklar */
  --color-border-primary:   var(--color-neutral-700);  /* Varsayılan kenarlık */
  --color-border-secondary: var(--color-neutral-600);  /* Vurgulu kenarlık */
  --color-border-focus:     var(--color-honey-400);    /* Odak kenarlığı */
  --color-border-glass:     rgba(255, 255, 255, 0.08); /* Glass kenarlık */

  /* Metin */
  --color-text-primary:    var(--color-neutral-50);   /* Başlıklar, ana metin */
  --color-text-secondary:  var(--color-neutral-400);  /* Açıklamalar, ikincil metin */
  --color-text-muted:      var(--color-neutral-500);  /* Etiketler, placeholder, kapalı */
  --color-text-inverse:    var(--color-neutral-950);  /* Koyu arka plan üzerinde (honey buton metni) */
  --color-text-brand:      var(--color-honey-400);    /* Marka metni, linkler */

  /* Durum Renkleri (Semantic) */
  --color-success:         #22c55e;  /* Başarı, onay, sağlıklı */
  --color-success-bg:      rgba(34, 197, 94, 0.15);
  --color-success-border:  rgba(34, 197, 94, 0.3);
  --color-warning:         #f59e0b;  /* Uyarı, dikkat, bekleyen */
  --color-warning-bg:      rgba(245, 158, 11, 0.15);
  --color-warning-border:  rgba(245, 158, 11, 0.3);
  --color-error:           #ef4444;  /* Hata, tehlike, kritik */
  --color-error-bg:        rgba(239, 68, 68, 0.15);
  --color-error-border:    rgba(239, 68, 68, 0.3);
  --color-info:            #3b82f6;  /* Bilgi, öğrenme, ipucu */
  --color-info-bg:         rgba(59, 130, 246, 0.15);
  --color-info-border:     rgba(59, 130, 246, 0.3);

  /* ============================================================
     GLASSMORPHISM UTILITIES
     ============================================================ */
  --glass-bg:        rgba(23, 23, 23, 0.7);
  --glass-border:    rgba(255, 255, 255, 0.08);
  --glass-shadow:    0 8px 32px rgba(0, 0, 0, 0.4);
  --glass-blur:      blur(16px);
}
```

### 2.2 Light Mode Override (Opsiyonel)

```css
@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    --color-bg-primary:      var(--color-neutral-50);
    --color-bg-secondary:    var(--color-neutral-100);
    --color-bg-tertiary:     var(--color-neutral-200);
    --color-bg-card:         var(--color-neutral-0);
    --color-bg-card-hover:   var(--color-neutral-100);
    --color-bg-input:        var(--color-neutral-0);
    --color-bg-glass:        rgba(255, 255, 255, 0.8);
    --color-bg-modal:        var(--color-neutral-0);
    --color-bg-toast:        var(--color-neutral-100);

    --color-border-primary:   var(--color-neutral-300);
    --color-border-secondary: var(--color-neutral-400);
    --color-border-glass:     rgba(0, 0, 0, 0.08);

    --color-text-primary:    var(--color-neutral-900);
    --color-text-secondary:  var(--color-neutral-600);
    --color-text-muted:      var(--color-neutral-500);
    --color-text-inverse:    var(--color-neutral-50);

    --glass-bg:     rgba(255, 255, 255, 0.8);
    --glass-border: rgba(0, 0, 0, 0.06);
    --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
}
```

### 2.3 Spacing Sistemi (Spacing Scale)

```css
:root {
  /* 8px Temel Birim — Tüm spacing bu ölçekten gelir */
  --space-0: 0;
  --space-1: 4px;    /* 0.5x — İç içe küçük boşluklar */
  --space-2: 8px;    /* 1x   — TEMEL BİRİM */
  --space-3: 12px;   /* 1.5x */
  --space-4: 16px;   /* 2x   — Kart padding, bölüm arası */
  --space-5: 20px;   /* 2.5x */
  --space-6: 24px;   /* 3x   — Sayfa padding, büyük bölüm arası */
  --space-7: 28px;   /* 3.5x */
  --space-8: 32px;   /* 4x   — Hero, modal padding */
  --space-10: 40px;  /* 5x */
  --space-12: 48px;  /* 6x */
  --space-16: 64px;  /* 8x */
  --space-20: 80px;  /* 10x */
  --space-24: 96px;  /* 12x */

  /* Semantik Spacing Aliases */
  --spacing-xs:    var(--space-1);
  --spacing-sm:    var(--space-2);
  --spacing-md:    var(--space-4);
  --spacing-lg:    var(--space-6);
  --spacing-xl:    var(--space-8);
  --spacing-2xl:   var(--space-12);
  --spacing-3xl:   var(--space-16);
}
```

### 2.4 Tipografi Sistemi (Typography)

```css
:root {
  /* Font Families */
  --font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
  --font-display: 'Inter', system-ui, sans-serif;  /* Display için weight 700 */

  /* Font Sizes — Clamp ile responsive */
  --text-xs:    clamp(0.7rem, 0.65rem + 0.25vw, 0.75rem);      /* 11-12px — Etiket, caption */
  --text-sm:    clamp(0.8rem, 0.75rem + 0.25vw, 0.875rem);     /* 13-14px — İçerik küçük, form label */
  --text-base:  clamp(0.95rem, 0.875rem + 0.375vw, 1rem);      /* 15-16px — BODY VARSAYILAN */
  --text-lg:    clamp(1.05rem, 1rem + 0.25vw, 1.125rem);       /* 17-18px — Vurgulu body */
  --text-xl:    clamp(1.2rem, 1.125rem + 0.375vw, 1.25rem);    /* 19-20px — H3, Kart başlığı */
  --text-2xl:   clamp(1.4rem, 1.25rem + 0.75vw, 1.5rem);       /* 22-24px — H2, Bölüm başlığı */
  --text-3xl:   clamp(1.75rem, 1.5rem + 1.25vw, 1.875rem);     /* 28-30px — H1, Sayfa başlığı */
  --text-4xl:   clamp(2.1rem, 1.75rem + 1.75vw, 2.25rem);      /* 34-36px — Hero */
  --text-5xl:   clamp(2.5rem, 2rem + 2.5vw, 3rem);             /* 40-48px — Büyük hero */

  /* Line Heights */
  --leading-tight:   1.15;  /* Başlıklar */
  --leading-snug:    1.3;   /* H2-H3 */
  --leading-normal:  1.6;   /* Body — OKUNABILIRLIK İÇİN KRİTİK */
  --leading-relaxed: 1.7;   /* Uzun metinler */

  /* Font Weights */
  --font-light:      300;
  --font-normal:     400;
  --font-medium:     500;
  --font-semibold:   600;
  --font-bold:       700;
  --font-extrabold:  800;

  /* Letter Spacing */
  --tracking-tight:  -0.02em;  /* Büyük başlıklar */
  --tracking-normal: 0;
  --tracking-wide:   0.02em;   /* Etiketler, uppercase */

  /* Tipografi Composite Tokens */
  --typo-display:      var(--text-5xl) / var(--leading-tight) var(--font-display) var(--font-extrabold) var(--tracking-tight);
  --typo-h1:           var(--text-3xl) / var(--leading-tight) var(--font-sans) var(--font-bold) var(--tracking-tight);
  --typo-h2:           var(--text-2xl) / var(--leading-snug) var(--font-sans) var(--font-bold) var(--tracking-tight);
  --typo-h3:           var(--text-xl)  / var(--leading-snug) var(--font-sans) var(--font-semibold) var(--tracking-normal);
  --typo-body-lg:      var(--text-lg)  / var(--leading-normal) var(--font-sans) var(--font-normal);
  --typo-body:         var(--text-base) / var(--leading-normal) var(--font-sans) var(--font-normal);
  --typo-body-sm:      var(--text-sm)  / var(--leading-normal) var(--font-sans) var(--font-normal);
  --typo-caption:      var(--text-xs)  / var(--leading-normal) var(--font-sans) var(--font-medium) var(--tracking-wide);
  --typo-code:         var(--text-sm)  / var(--leading-normal) var(--font-mono) var(--font-normal);
  --typo-button:       var(--text-sm)  / 1 var(--font-sans) var(--font-semibold) var(--tracking-wide);
}
```

### 2.5 Border Radius

```css
:root {
  --radius-none:  0;
  --radius-sm:    4px;   /* Input, badge, küçük bileşenler */
  --radius-md:    8px;   /* Button, card (varsayılan) */
  --radius-lg:    12px;  /* Modal, büyük kart, bottom sheet */
  --radius-xl:    16px;  /* Hero kart, floating panel */
  --radius-2xl:   24px;  /* Çok yuvarlak */
  --radius-full:  9999px; /* Avatar, pill button, progress */

  /* Bileşen Mapping */
  --radius-button:     var(--radius-md);
  --radius-card:       var(--radius-lg);
  --radius-input:      var(--radius-md);
  --radius-modal:      var(--radius-xl);
  --radius-badge:      var(--radius-full);
  --radius-avatar:     var(--radius-full);
  --radius-tooltip:    var(--radius-md);
  --radius-dropdown:   var(--radius-md);
  --radius-toast:      var(--radius-lg);
}
```

### 2.6 Gölgeler (Shadows)

```css
:root {
  /* Elevation Levels — Material benzeri ama daha yumuşak */
  --shadow-0:   none;
  --shadow-1:   0 1px 2px  rgba(0, 0, 0, 0.3);   /* Düz, hafif */
  --shadow-2:   0 2px 8px  rgba(0, 0, 0, 0.35);  /* Kart seviyesi */
  --shadow-3:   0 4px 16px rgba(0, 0, 0, 0.4);   /* Yükseltili kart, dropdown */
  --shadow-4:   0 8px 24px rgba(0, 0, 0, 0.45);  /* Modal, bottom sheet */
  --shadow-5:   0 16px 48px rgba(0, 0, 0, 0.5);  /* Floating panel, toast */

  /* Special */
  --shadow-glow:       0 0 24px rgba(251, 191, 36, 0.3);   /* Marka vurgulu (honey) */
  --shadow-glow-lg:    0 0 48px rgba(251, 191, 36, 0.2);
  --shadow-inner:      inset 0 2px 4px rgba(0, 0, 0, 0.3);  /* Input focus iç gölge */
  --shadow-focus:      0 0 0 3px rgba(251, 191, 36, 0.4);  /* Focus ring */
}
```

### 2.7 Z-Index Katmanları

```css
:root {
  --z-base:        0;      /* Normal akış */
  --z-sticky:      100;    /* Sticky header, tab bar */
  --z-dropdown:    200;    /* Dropdown, popover, autocomplete */
  --z-fixed:       300;    /* Fixed header, bottom nav */
  --z-modal-back:  400;    /* Modal arka plan (overlay) */
  --z-modal:       500;    /* Modal içerik */
  --z-popover:     600;    /* Popover, tooltip, context menu */
  --z-toast:       700;    /* Toast, bildirim */
  --z-tooltip:     800;    /* Tooltip (en üst) */
  --z-max:         9999;   /* Acil durum */
}
```

### 2.8 Geçişler (Transitions)

```css
:root {
  --transition-instant:  0ms;           /* Anında */
  --transition-fast:     100ms ease-out; /* Hover, tap feedback */
  --transition-base:     200ms ease-out; /* Varsayılan — modal, panel, tab */
  --transition-slow:     300ms ease-out; /* Sayfa geçişi, karmaşık animasyon */
  --transition-slower:   500ms ease-out; /* Hero, onboarding */

  /* Easing Functions */
  --ease-out:      cubic-bezier(0.16, 1, 0.3, 1);     /* Doğal, yumuşak çıkış */
  --ease-in:       cubic-bezier(0.7, 0, 0.84, 0);     /* Hızlı giriş */
  --ease-in-out:   cubic-bezier(0.87, 0, 0.13, 1);    /* Simetrik */
  --ease-bounce:   cubic-bezier(0.68, -0.55, 0.27, 1.55); /* Eğlenceli, bounce */
  --ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1); /* Yaylı hissi */
}
```

### 2.9 Breakpoints (Responsive)

```css
:root {
  --bp-xs:   320px;   /* Küçük telefon */
  --bp-sm:   480px;   /* Telefon */
  --bp-md:   768px;   /* Tablet portrait */
  --bp-lg:   1024px;  /* Tablet landscape / Küçük desktop */
  --bp-xl:   1280px;  /* Desktop */
  --bp-2xl:  1536px;  /* Geniş desktop */

  /* Container Max Widths */
  --container-sm:  640px;
  --container-md:  768px;
  --container-lg:  1024px;
  --container-xl:  1280px;
  --container-2xl: 1400px;
}
```

---

## 3. İkon Sistemi (Icon System)

| Özellik | Değer |
|---------|-------|
| **Kütüphane** | `lucide-react` (tree-shakable, 300+ ikon, MIT) |
| **Stil** | Outline (çizgisel), 2px stroke-width, 24x24 viewBox |
| **Boyutlar** | `w-4 h-4` (16px — inline), `w-5 h-5` (20px — buton), `w-6 h-6` (24px — nav, kart), `w-8 h-8` (32px — boş durum, hero) |
| **Renk** | `currentColor` (metin rengini miras alır) — Vurgulu: `text-honey-400` |
| **Kullanım** | `<Home className="w-5 h-5" />` — Bileşen prop olarak `Icon` kabul eder |

### 3.1 Alan Özel İkonlar (Domain Icons)

| Alan | İkon | Kullanım |
|------|------|----------|
| Apiary | `MapPin` / `Map` | Arı üssü harita, liste |
| Hive | `Home` / `Box` | Kovan kartı, detay |
| Frame | `Layout` / `Grid` | Çerçeve haritası, döngü |
| Inspection | `ClipboardList` / `Mic` | Muayene girişi, ses |
| Queen | `Crown` / `UserCircle` | Ana arı listesi, pedigree |
| Honey | `Droplets` / `Wheat` | Hasat, verim |
| Feeding | `Utensils` / `Droplet` | Besleme takvimi |
| Disease | `AlertTriangle` / `Bug` | Varroa, hastalık riski |
| Inventory | `Package` / `Box` | Stok, envanter |
| Reports | `FileText` / `BarChart` | Raporlar, analitik |
| Weather | `CloudSun` / `Thermometer` | Hava durumu widget |
| Flora | `Flower` / `Leaf` | Çiçeklenme takvimi |
| Community | `Users` / `MessageCircle` | Forum, mentor |
| Settings | `Settings` / `Cog` | Ayarlar |
| Sync | `RefreshCw` / `Cloud` | Senkronizasyon durumu |

---

## 4. Bileşen Kütüphanesi (Component Library)

### 4.1 Temel Bileşenler (Primitive Components)

#### Button
```tsx
// components/ui/Button.tsx
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
  const base = 'inline-flex items-center justify-center font-semibold transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-honey-400 text-neutral-950 hover:bg-honey-300 active:bg-honey-500 shadow-sm',
    secondary: 'bg-neutral-800 text-neutral-50 hover:bg-neutral-700 border border-neutral-600',
    ghost: 'bg-transparent hover:bg-neutral-800 text-neutral-50',
    danger: 'bg-error text-neutral-50 hover:bg-error/90 active:bg-error',
    outline: 'border border-neutral-600 hover:bg-neutral-800 text-neutral-50',
    glass: 'bg-neutral-900/50 backdrop-blur-md border border-white/10 hover:bg-neutral-900/70 text-neutral-50',
  }[variant];

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
    xl: 'px-8 py-4 text-lg gap-3',
  }[size];

  return (
    <button
      className={cn(base, variants, sizes, fullWidth && 'w-full', className)}
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
```

#### Card
```tsx
// components/ui/Card.tsx
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'glass' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  children,
  ...props
}: CardProps) {
  const variants = {
    default: 'bg-neutral-900',
    bordered: 'bg-neutral-900 border border-neutral-700',
    glass: 'bg-neutral-900/50 backdrop-blur-md border border-white/10',
    interactive: 'bg-neutral-900 border border-neutral-700 transition-all duration-200 hover:border-honey-400 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer',
  }[variant];

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }[padding];

  return (
    <div
      className={cn(
        'rounded-xl',
        variants,
        paddings,
        hover && 'hover:shadow-lg hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

#### Input / FormField
```tsx
// components/ui/FormField.tsx
interface FormFieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactElement; // Input, Select, Textarea, etc.
}

export function FormField({ label, hint, error, required, children }: FormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-neutral-50" htmlFor={id}>
        {label} {required && <span className="text-error" aria-hidden="true">*</span>}
      </label>
      {React.cloneElement(children, {
        id,
        'aria-describedby': cn(error && errorId, hint && hintId),
        'aria-invalid': !!error,
        className: cn(
          'w-full rounded-lg bg-neutral-800 border border-neutral-600',
          'text-neutral-50 placeholder:text-neutral-500',
          'px-3 py-2.5 text-sm',
          'transition-colors duration-100',
          'focus:outline-none focus:ring-2 focus:ring-honey-400 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-error focus:ring-error',
          children.props.className
        ),
      })}
      {error && (
        <p id={errorId} className="text-sm text-error flex items-center gap-1" role="alert">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="text-xs text-neutral-500">{hint}</p>
      )}
    </div>
  );
}
```

#### Modal / BottomSheet
```tsx
// components/ui/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
}: ModalProps) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  }[size];

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[400]" role="dialog" aria-modal="true" aria-labelledby={title ? 'modal-title' : undefined} aria-describedby={description ? 'modal-desc' : undefined}>
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
          onClick={closeOnOverlayClick ? onClose : undefined}
          aria-hidden="true"
        />
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className={cn('w-full bg-neutral-900 rounded-2xl shadow-5 border border-neutral-700 animate-in fade-in zoom-in-95 duration-200', sizes)}>
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between p-4 border-b border-neutral-700">
                <div>
                  {title && <h2 id="modal-title" className="text-lg font-semibold text-neutral-50">{title}</h2>}
                  {description && <p id="modal-desc" className="text-sm text-neutral-400 mt-1">{description}</p>}
                </div>
                {showCloseButton && (
                  <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-neutral-50 hover:bg-neutral-800 transition-colors" aria-label="Kapat">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            <div className="p-4">{children}</div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
```

#### Bottom Navigation (Mobil Ana Navigasyon)
```tsx
// components/ui/BottomNav.tsx
interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  badge?: number | string;
  href?: string;
  onClick?: () => void;
}

interface BottomNavProps {
  items: NavItem[];
  activeId: string;
  onChange: (id: string) => void;
  hidden?: boolean;
}

export function BottomNav({ items, activeId, onChange, hidden = false }: BottomNavProps) {
  if (hidden) return null;

  return (
    <nav className={cn('fixed bottom-0 left-0 right-0 z-[300] bg-neutral-950/95 backdrop-blur-md border-t border-neutral-700 animate-in slide-in-from-bottom-full duration-300', hidden && 'animate-out slide-out-to-bottom-full')}>
      <div className="grid grid-cols-5 gap-1 px-2 pb-2 pt-1.5 max-w-xl mx-auto">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={cn(
                'relative flex flex-col items-center gap-1 px-2 py-2 rounded-xl',
                'transition-all duration-200',
                'active:scale-[0.98]',
                isActive ? 'text-honey-400' : 'text-neutral-500 hover:text-neutral-300'
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              <div className="relative">
                {isActive && item.activeIcon ? item.activeIcon : item.icon}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-5 px-1.5 bg-honey-400 text-neutral-950 text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={cn('text-[11px] font-medium', isActive ? 'text-honey-400' : 'text-neutral-500')}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-6 h-1 bg-honey-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
```

#### Toast / Bildirim
```tsx
// components/ui/Toast.tsx
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info' | 'default';
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  duration?: number; // ms, 0 = manual dismiss
  onClose: () => void;
}

export function Toast({ type, title, description, action, duration = 4000, onClose }: ToastProps) {
  const typeStyles = {
    success: 'border-success bg-success-bg',
    error: 'border-error bg-error-bg',
    warning: 'border-warning bg-warning-bg',
    info: 'border-info bg-info-bg',
    default: 'border-neutral-700 bg-neutral-900',
  }[type];

  const typeIcons = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <AlertCircle className="w-5 h-5 text-error" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning" />,
    info: <Info className="w-5 h-5 text-info" />,
    default: <Bell className="w-5 h-5 text-neutral-400" />,
  }[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className={cn('fixed bottom-20 right-4 z-[700] w-full max-w-sm rounded-xl border p-4 shadow-5 animate-in slide-in-from-right duration-300', typeStyles)}>
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">{typeIcons}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-50">{title}</p>
          {description && <p className="text-sm text-neutral-400 mt-0.5">{description}</p>}
          {action && (
            <button onClick={action.onClick} className="mt-2 text-xs font-semibold text-honey-400 hover:underline">
              {action.label}
            </button>
          )}
        </div>
        <button onClick={onClose} className="flex-shrink-0 text-neutral-400 hover:text-neutral-50 p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
```

### 4.2 Alan Bileşenleri (Domain Components)

#### HiveCard (Kovan Kartı)
```tsx
// components/domain/HiveCard.tsx
interface HiveCardProps {
  hive: Hive;
  variant: 'grid' | 'list' | 'compact';
  onClick?: () => void;
  onInspect?: () => void;
  showActions?: boolean;
}

export function HiveCard({ hive, variant = 'grid', onClick, onInspect, showActions = true }: HiveCardProps) {
  const strengthColors = {
    very_weak: 'text-error',
    weak: 'text-warning',
    moderate: 'text-info',
    strong: 'text-success',
    very_strong: 'text-honey-400',
  };

  const statusBadges = {
    active: <Badge variant="success">Aktif</Badge>,
    weak: <Badge variant="warning">Zayıf</Badge>,
    dead: <Badge variant="error">Ölü</Badge>,
    sold: <Badge variant="default">Satıldı</Badge>,
    merged: <Badge variant="info">Birleştirildi</Badge>,
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-3 bg-neutral-900/50 backdrop-blur rounded-xl border border-neutral-700">
        <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
          <Home className="w-5 h-5 text-neutral-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-neutral-50 truncate">{hive.name}</p>
          <p className="text-xs text-neutral-400">{hive.strain} • {hive.frame_count} çerçeve</p>
        </div>
        {statusBadges[hive.status]}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <Card variant="bordered" padding="md" className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center">
            <Home className="w-6 h-6 text-neutral-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-neutral-50">{hive.name}</h3>
              {statusBadges[hive.status]}
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-400 mt-1">
              <span className="flex items-center gap-1">{hive.strain}</span>
              <span className="flex items-center gap-1">{hive.frame_count} çerçeve</span>
              <span className={cn('flex items-center gap-1', strengthColors[hive.strength])}>
                <Circle className="w-2 h-2 rounded-full" /> {hive.strength}
              </span>
              {hive.queen && (
                <span className="flex items-center gap-1 text-honey-400">
                  <Crown className="w-3.5 h-3.5" /> Ana arı var
                </span>
              )}
            </div>
          </div>
        </div>
        {showActions && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onInspect} leftIcon={<ClipboardList className="w-4 h-4" />}>
              Muayene
            </Button>
            <Button variant="primary" size="sm" onClick={onClick} rightIcon={<ChevronRight className="w-4 h-4" />}>
              Detay
            </Button>
          </div>
        )}
      </Card>
    );
  }

  // Grid variant
  return (
    <Card variant="interactive" padding="md" onClick={onClick} className="h-full flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center">
            <Home className="w-5 h-5 text-neutral-400" />
          </div>
          <h3 className="font-semibold text-neutral-50 truncate">{hive.name}</h3>
        </div>
        {statusBadges[hive.status]}
      </div>

      <div className="flex-1 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-neutral-400">
          <Tag className="w-3.5 h-3.5" /> {hive.strain}
        </div>
        <div className="flex items-center gap-2 text-neutral-400">
          <Layout className="w-3.5 h-3.5" /> {hive.frame_count} çerçeve • {hive.box_type}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('flex items-center gap-1', strengthColors[hive.strength])}>
            <Circle className="w-2 h-2 rounded-full" />
            <span className="capitalize">{hive.strength.replace('_', ' ')}</span>
          </span>
        </div>
        {hive.lastInspectionAt && (
          <div className="flex items-center gap-2 text-neutral-500">
            <Clock className="w-3.5 h-3.5" />
            Son muayene: {formatDistanceToNow(new Date(hive.lastInspectionAt), { addSuffix: true, locale: tr })}
          </div>
        )}
      </div>

      {showActions && (
        <div className="mt-4 pt-3 border-t border-neutral-700 flex gap-2">
          <Button variant="primary" size="sm" fullWidth onClick={onInspect} leftIcon={<Mic className="w-3.5 h-3.5" />}>
            Hızlı Muayene
          </Button>
          <Button variant="outline" size="sm" fullWidth onClick={onClick} rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
            Detay
          </Button>
        </div>
      )}
    </Card>
  );
}
```

#### InspectionCard (Muayene Kartı)
```tsx
// components/domain/InspectionCard.tsx
interface InspectionCardProps {
  inspection: Inspection;
  variant: 'timeline' | 'card' | 'compact';
  onClick?: () => void;
}

export function InspectionCard({ inspection, variant = 'card', onClick }: InspectionCardProps) {
  const anomalyCount = inspection.ai_anomalies?.length || 0;
  const hasCriticalAnomaly = inspection.ai_anomalies?.some(a => a.severity === 'critical') || false;

  const severityColors = {
    info: 'text-info',
    warning: 'text-warning',
    critical: 'text-error',
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-3 bg-neutral-900/50 rounded-xl border border-neutral-700">
        <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-neutral-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-50">
            {format(new Date(inspection.inspected_at), 'dd MMM yyyy, HH:mm', { locale: tr })}
          </p>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
            <span className={cn('flex items-center gap-1', severityColors[hasCriticalAnomaly ? 'critical' : anomalyCount > 0 ? 'warning' : 'info'])}>{anomalyCount} anomali</span>
            <span>Güç: {inspection.strength}</span>
            {inspection.queen_status !== 'seen' && (
              <span className="text-warning flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Ana arı yok</span>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-neutral-500" />
      </div>
    );
  }

  return (
    <Card variant="bordered" padding="md" className={cn(onClick && 'cursor-pointer hover:border-honey-400', onClick && 'hover:shadow-lg')}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <time className="text-sm text-neutral-400 whitespace-nowrap">
              {format(new Date(inspection.inspected_at), 'dd MMM yyyy, HH:mm', { locale: tr })}
            </time>
            <StrengthBadge strength={inspection.strength} />
            <QueenStatusBadge status={inspection.queen_status} />
          </div>
          {inspection.ai_summary && (
            <p className="mt-2 text-sm text-neutral-300 line-clamp-2">{inspection.ai_summary}</p>
          )}
        </div>
        {anomalyCount > 0 && (
          <Badge variant={hasCriticalAnomaly ? 'error' : 'warning'} className="flex-shrink-0">
            <AlertTriangle className="w-3 h-3 mr-1" /> {anomalyCount}
          </Badge>
        )}
      </div>

      {inspection.varroa_count !== null && inspection.varroa_count !== undefined && (
        <VarroaBadge count={inspection.varroa_count} method={inspection.varroa_method} className="mt-3" />
      )}

      <div className="mt-3 flex items-center gap-3 text-xs text-neutral-500">
        {inspection.weather_snapshot && (
          <span className="flex items-center gap-1">
            <CloudSun className="w-3.5 h-3.5" />
            {inspection.weather_snapshot.temp}°C · %{inspection.weather_snapshot.humidity}
          </span>
        )}
        {inspection.duration_seconds && (
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {Math.round(inspection.duration_seconds / 60)} dk
          </span>
        )}
      </div>

      {inspection.ai_recommendations && inspection.ai_recommendations.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {inspection.ai_recommendations.slice(0, 2).map((rec, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-neutral-400 bg-neutral-800/50 p-2 rounded-lg">
              <CheckCircle className="w-4 h-4 text-honey-400 flex-shrink-0 mt-0.5" />
              <span>{rec.action}</span>
            </div>
          ))}
          {inspection.ai_recommendations.length > 2 && (
            <button className="text-xs text-honey-400 hover:underline">+{inspection.ai_recommendations.length - 2} öneri daha</button>
          )}
        </div>
      )}
    </Card>
  );
}
```

#### FrameCounter (Petek Döngüsü Çipleri — Muayene Modal İçinde)
```tsx
// components/domain/FrameCounter.tsx
interface FrameCounterProps {
  frames: Frame[]; // Kovanın çerçeveleri
  onUpdate?: (frameId: string, updates: Partial<Frame>) => void;
  compact?: boolean;
}

export function FrameCounter({ frames, onUpdate, compact = false }: FrameCounterProps) {
  // Çerçeve tiplerini say
  const counts = useMemo(() => ({
    brood: frames.filter(f => f.frame_type === 'brood').length,
    honey: frames.filter(f => f.frame_type === 'honey').length,
    pollen: frames.filter(f => f.frame_type === 'pollen').length,
    foundation: frames.filter(f => f.frame_type === 'foundation').length,
    empty: frames.filter(f => f.frame_type === 'empty').length,
    total: frames.length,
  }), [frames]);

  const chips = [
    { key: 'brood', label: 'Yumurtalık', count: counts.brood, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: <Egg className="w-3 h-3" /> },
    { key: 'honey', label: 'Bal', count: counts.honey, color: 'bg-honey-400/20 text-honey-400 border-honey-400/30', icon: <Droplets className="w-3 h-3" /> },
    { key: 'pollen', label: 'Polen', count: counts.pollen, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: <CircleDot className="w-3 h-3" /> },
    { key: 'foundation', label: 'Perga', count: counts.foundation, color: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30', icon: <Layout className="w-3 h-3" /> },
    { key: 'empty', label: 'Boş', count: counts.empty, color: 'bg-neutral-700/50 text-neutral-500 border-neutral-600/30', icon: <Square className="w-3 h-3" /> },
  ];

  return (
    <div className={cn('flex flex-wrap gap-1.5', compact && 'gap-1')}>
      {chips.map(({ key, label, count, color, icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => { /* Tip değiştirme modalı */ }}
          className={cn(
            'inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium transition-all',
            'hover:shadow-md hover:-translate-y-0.5',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400',
            color,
            compact ? 'px-1.5 py-0.5 text-[11px]' : ''
          )}
          aria-label={`${count} ${label} çerçeve`}
        >
          {icon}
          <span>{count}</span>
          {count > 0 && !compact && (
            <span className="w-4 h-4 flex items-center justify-center bg-white/10 rounded-full text-[10px]">{count}</span>
          )}
        </button>
      ))}
      <div className="flex items-center px-2 py-1 text-xs text-neutral-500 border border-dashed border-neutral-700 rounded-full">
        <span>Toplam: {counts.total}</span>
      </div>
    </div>
  );
}
```

#### VarroaBadge (Varroa Risk Rozeti)
```tsx
// components/domain/VarroaBadge.tsx
interface VarroaBadgeProps {
  count: number;
  method: VarroaMethod;
  trend?: 'up' | 'down' | 'stable';
  className?: string;
  showThreshold?: boolean;
}

export function VarroaBadge({ count, method, trend = 'stable', className, showThreshold = true }: VarroaBadgeProps) {
  // Eşik: 100 çekirdekte 3 varroa = %3 enfeksiyon = tedavi eşiği
  // Basit hesap: count > 10 = yüksek risk (alkol yıkama için)
  const getRiskLevel = (count: number, method: VarroaMethod) => {
    if (method === 'alcohol_wash' || method === 'sugar_shake') {
      if (count <= 2) return 'low';
      if (count <= 9) return 'medium';
      return 'high';
    }
    if (method === 'sticky_board') {
      if (count <= 10) return 'low';
      if (count <= 50) return 'medium';
      return 'high';
    }
    return 'unknown';
  };

  const risk = getRiskLevel(count, method);
  const riskConfig = {
    low: { label: 'Düşük', color: 'success', bg: 'bg-success-bg', border: 'border-success', icon: <CheckCircle className="w-3 h-3" /> },
    medium: { label: 'Orta', color: 'warning', bg: 'bg-warning-bg', border: 'border-warning', icon: <AlertTriangle className="w-3 h-3" /> },
    high: { label: 'Yüksek', color: 'error', bg: 'bg-error-bg', border: 'border-error', icon: <AlertCircle className="w-3 h-3" /> },
    unknown: { label: 'Bilinmiyor', color: 'info', bg: 'bg-info-bg', border: 'border-info', icon: <HelpCircle className="w-3 h-3" /> },
  }[risk];

  const trendIcons = {
    up: <TrendingUp className="w-3 h-3" />,
    down: <TrendingDown className="w-3 h-3" />,
    stable: <Minus className="w-3 h-3" />,
  };

  return (
    <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium', riskConfig.bg, riskConfig.border, className)}>
      {riskConfig.icon}
      <span>Varroa: {count}</span>
      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10">{riskConfig.label}</span>
      {trend !== 'stable' && <span className={cn('text-[10px]', risk === 'high' ? 'text-error' : risk === 'low' ? 'text-success' : 'text-warning')}>{trendIcons[trend]}</span>}
      {showThreshold && risk === 'high' && (
        <Tooltip content="Tedavi eşiği aşıldı! Hemen müdahale gerekli.">
          <AlertTriangle className="w-3 h-3 text-error animate-pulse" />
        </Tooltip>
      )}
    </div>
  );
}
```

---

## 5. Sayfa Şablonları (Page Templates)

### 5.1 Ana Layout (App Shell)

```tsx
// components/layout/AppShell.tsx
export function AppShell({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showBottomNav, setShowBottomNav] = useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Ana Sayfa', icon: <Home className="w-5 h-5" />, activeIcon: <Home className="w-5 h-5 fill-current" /> },
    { id: 'apiaries', label: 'Arı Üssleri', icon: <MapPin className="w-5 h-5" />, activeIcon: <MapPin className="w-5 h-5 fill-current" /> },
    { id: 'inspections', label: 'Muayeneler', icon: <ClipboardList className="w-5 h-5" />, activeIcon: <ClipboardList className="w-5 h-5 fill-current" /> },
    { id: 'analytics', label: 'Analitik', icon: <BarChart className="w-5 h-5" />, activeIcon: <BarChart className="w-5 h-5 fill-current" /> },
    { id: 'more', label: 'Daha Fazla', icon: <MoreHorizontal className="w-5 h-5" />, activeIcon: <MoreHorizontal className="w-5 h-5 fill-current" /> },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col">
      {/* Sayfa İçeriği */}
      <main className="flex-1 pb-20 pt-safe-top overflow-y-auto">
        <div className="max-w-xl mx-auto px-4">
          {children}
        </div>
      </main>

      {/* Alt Navigasyon */}
      <BottomNav
        items={navItems}
        activeId={activeTab}
        onChange={setActiveTab}
        hidden={!showBottomNav}
      />
    </div>
  );
}
```

### 5.2 Sayfa Başlığı (Page Header)

```tsx
// components/layout/PageHeader.tsx
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
}

export function PageHeader({ title, subtitle, actions, breadcrumb }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-[100] bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 px-4 py-4">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          {breadcrumb && breadcrumb.length > 0 && (
            <nav className="flex items-center gap-1.5 text-xs text-neutral-500 mb-2" aria-label="Breadcrumb">
              {breadcrumb.map((item, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="w-3 h-3" />}
                  {item.href ? (
                    <a href={item.href} className="hover:text-honey-400 transition-colors">{item.label}</a>
                  ) : (
                    <span className="text-neutral-400">{item.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-2xl font-bold text-neutral-50 truncate">{title}</h1>
          {subtitle && <p className="text-sm text-neutral-400 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
```

### 5.3 Boş Durum (Empty State)

```tsx
// components/ui/EmptyState.tsx
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action, secondaryAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-4">
      <div className="w-16 h-16 rounded-2xl bg-neutral-800/50 flex items-center justify-center mb-4 text-neutral-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-neutral-50 mb-1">{title}</h3>
      <p className="text-sm text-neutral-400 max-w-sm mb-6">{description}</p>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        {action && (
          <Button onClick={action.action} fullWidth className="w-full sm:w-auto">
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="outline" onClick={secondaryAction.action} fullWidth className="w-full sm:w-auto">
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}
```

---

## 6. Animasyon ve Mikro Etkileşimler

### 6.1 Genel Geçiş Kuralları

```css
/* Tüm etkileşimli elementler için temel geçiş */
.interactive {
  transition: 
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

/* Buton basılma hissisi */
.btn-press:active {
  transform: scale(0.98);
}

/* Kart hover */
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-3);
  border-color: var(--color-border-focus);
}

/* Odak halka (Accessibility) */
.focus-ring:focus-visible {
  outline: none;
  ring: 2px;
  ring-color: var(--color-honey-400);
  ring-offset: 2px;
  ring-offset-color: var(--color-bg-primary);
}
```

### 6.2 Özel Animasyonlar

```css
/* Modal / Bottom Sheet Giriş/Çıkış */
@keyframes modalIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes modalOut {
  to { opacity: 0; transform: scale(0.95) translateY(10px); }
}

.modal-enter { animation: modalIn 200ms var(--ease-out); }
.modal-exit { animation: modalOut 150ms var(--ease-in); }

/* Bottom Nav Aktivasyon Çubuğu */
.nav-indicator {
  position: absolute;
  top: -2px; left: 50%; transform: translateX(-50%);
  width: 24px; height: 3px;
  background: var(--color-honey-400);
  border-radius: var(--radius-full);
  animation: indicatorSlide 200ms var(--ease-out);
}

@keyframes indicatorSlide {
  from { opacity: 0; transform: translateX(-50%) scaleX(0.5); }
  to { opacity: 1; transform: translateX(-50%) scaleX(1); }
}

/* Toast Gir/Çık */
@keyframes toastIn {
  from { opacity: 0; transform: translateX(100%) translateY(20px); }
  to { opacity: 1; transform: translateX(0) translateY(0); }
}
@keyframes toastOut {
  to { opacity: 0; transform: translateX(100%) translateY(-20px); }
}

.toast-enter { animation: toastIn 300ms var(--ease-out); }
.toast-exit { animation: toastOut 200ms var(--ease-in); }

/* Skeleton Shimmer */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-neutral-800) 25%,
    var(--color-neutral-700) 50%,
    var(--color-neutral-800) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* Pulse (Yükleniyor, Canlı veri) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.pulse { animation: pulse 2s ease-in-out infinite; }

/* Spin (Yükleniyor spinner) */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner { animation: spin 1s linear infinite; }
```

### 6.3 Hareket Azaltma (Reduced Motion)

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 7. Erişilebilirlik (Accessibility — WCAG AA)

### 7.1 Kontrol Listesi (Her Bileşen İçin)

| Kriter | Standard | Test Yöntemi |
|--------|----------|--------------|
| **Renk Kontrastı** | Metin: 4.5:1 (büyük metin 3:1), UI öğeleri: 3:1 | axe-core, WAVE, manuel |
| **Odak Görünürlüğü** | Her etkileşimli öğe net odak halkası | Tab navigasyonu |
| **Odak Sırası** | Mantıksal, görsel sıra ile eşleşen | Tab sırası testi |
| **ARIA Etiketleri** | Butonlar, inputlar, durumlar etiketlenmiş | Ekran okuyucu (NVDA, VoiceOver) |
| **Alt Metin** | Anlamlı görseller için `alt`, dekoratif için `alt=""` | Manuel inceleme |
| **Form Etiketleri** | Her input için `<label>` veya `aria-label` | axe-core |
| **Hata Mesajları** | `aria-invalid`, `aria-describedby` ile bağlı | Form testi |
| **