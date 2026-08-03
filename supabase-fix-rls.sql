-- ============================================================
-- Supabase RLS Fix for BeeMaster AI
-- ============================================================
-- Run this in Supabase SQL Editor to fix:
-- 1. Enable CASCADE delete so deleting apiaries/hives removes related records
-- 2. Fix RLS policies so users only see their own data
-- ============================================================

-- 1. Fix foreign keys with ON DELETE CASCADE
ALTER TABLE queens DROP CONSTRAINT IF EXISTS queens_hive_id_fkey;
ALTER TABLE queens ADD CONSTRAINT queens_hive_id_fkey
  FOREIGN KEY (hive_id) REFERENCES hives(id) ON DELETE CASCADE;

ALTER TABLE frames DROP CONSTRAINT IF EXISTS frames_hive_id_fkey;
ALTER TABLE frames ADD CONSTRAINT frames_hive_id_fkey
  FOREIGN KEY (hive_id) REFERENCES hives(id) ON DELETE CASCADE;

ALTER TABLE inspections DROP CONSTRAINT IF EXISTS inspections_hive_id_fkey;
ALTER TABLE inspections ADD CONSTRAINT inspections_hive_id_fkey
  FOREIGN KEY (hive_id) REFERENCES hives(id) ON DELETE CASCADE;

ALTER TABLE harvests DROP CONSTRAINT IF EXISTS harvests_hive_id_fkey;
ALTER TABLE harvests ADD CONSTRAINT harvests_hive_id_fkey
  FOREIGN KEY (hive_id) REFERENCES hives(id) ON DELETE CASCADE;

ALTER TABLE feedings DROP CONSTRAINT IF EXISTS feedings_hive_id_fkey;
ALTER TABLE feedings ADD CONSTRAINT feedings_hive_id_fkey
  FOREIGN KEY (hive_id) REFERENCES hives(id) ON DELETE CASCADE;

ALTER TABLE treatments DROP CONSTRAINT IF EXISTS treatments_hive_id_fkey;
ALTER TABLE treatments ADD CONSTRAINT treatments_hive_id_fkey
  FOREIGN KEY (hive_id) REFERENCES hives(id) ON DELETE CASCADE;

ALTER TABLE diseases DROP CONSTRAINT IF EXISTS diseases_hive_id_fkey;
ALTER TABLE diseases ADD CONSTRAINT diseases_hive_id_fkey
  FOREIGN KEY (hive_id) REFERENCES hives(id) ON DELETE CASCADE;

ALTER TABLE hives DROP CONSTRAINT IF EXISTS hives_apiary_id_fkey;
ALTER TABLE hives ADD CONSTRAINT hives_apiary_id_fkey
  FOREIGN KEY (apiary_id) REFERENCES apiaries(id) ON DELETE SET NULL;

-- 2. Enable RLS on all tables
ALTER TABLE apiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE hives ENABLE ROW LEVEL SECURITY;
ALTER TABLE queens ENABLE ROW LEVEL SECURITY;
ALTER TABLE frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvests ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedings ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies (to avoid duplicates)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename IN ('apiaries', 'hives', 'queens', 'frames', 'inspections',
                         'harvests', 'feedings', 'treatments', 'diseases', 'inventory')
    LOOP
        EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 4. Create proper RLS policies - each user only sees their own data
CREATE POLICY "Users see own apiaries" ON apiaries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users see own hives" ON hives
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users see own queens" ON queens
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users see own frames" ON frames
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users see own inspections" ON inspections
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users see own harvests" ON harvests
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users see own feedings" ON feedings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users see own treatments" ON treatments
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users see own diseases" ON diseases
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users see own inventory" ON inventory
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. Verify
SELECT 'RLS policies created' as status;
