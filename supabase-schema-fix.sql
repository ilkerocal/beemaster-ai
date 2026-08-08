-- BeeMaster AI — Supabase Schema Fix
-- Eksik kolonları ekle. Idempotent (varsa hata vermez).
-- Çalıştır: Supabase Dashboard > SQL Editor > New query > yapıştır > Run

-- 1. FRAMES tablosu - cyclesCompleted, waxAgeMonths, lastExtractedAt, updatedAt
ALTER TABLE public.frames
  ADD COLUMN IF NOT EXISTS cycles_completed integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS wax_age_months integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_extracted_at date,
  ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz DEFAULT now();

-- 2. INSPECTIONS tablosu - updatedAt
ALTER TABLE public.inspections
  ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz DEFAULT now();

-- 3. HARVESTS tablosu - updatedAt
ALTER TABLE public.harvests
  ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz DEFAULT now();

-- 4. FEEDINGS tablosu - updatedAt
ALTER TABLE public.feedings
  ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz DEFAULT now();

-- 5. TREATMENTS tablosu - updatedAt
ALTER TABLE public.treatments
  ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz DEFAULT now();

-- 6. DISEASES tablosu - updatedAt
ALTER TABLE public.diseases
  ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz DEFAULT now();

-- 7. QUEENS tablosu - updatedAt
ALTER TABLE public.queens
  ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz DEFAULT now();

-- 8. INVENTORY tablosu - createdAt, updatedAt
ALTER TABLE public.inventory
  ADD COLUMN IF NOT EXISTS "createdAt" timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz DEFAULT now();

-- 9. HIVES tablosu - updatedAt (yoksa)
ALTER TABLE public.hives
  ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz DEFAULT now();

-- 10. APIARIES tablosu - updatedAt (yoksa)
ALTER TABLE public.apiaries
  ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz DEFAULT now();

-- Kontrol: tüm kolonları listele
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('apiaries','hives','queens','frames','inspections','harvests','feedings','treatments','diseases','inventory')
  AND column_name IN ('cycles_completed', 'wax_age_months', 'last_extracted_at', 'updatedAt', 'createdAt')
ORDER BY table_name, column_name;

-- Başarılı mesajı
DO $$
BEGIN
  RAISE NOTICE '✅ Schema fix tamamlandı. Cloud sync artık çalışmalı.';
END $$;