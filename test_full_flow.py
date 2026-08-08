import asyncio
from playwright.async_api import async_playwright

async def test_full_flow():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        
        page.on("console", lambda msg: print(f"[CONSOLE] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[PAGE ERROR] {err}"))
        
        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        
        # Login
        auth_btn = await page.wait_for_selector('#auth-btn', timeout=10000)
        await auth_btn.click()
        await page.wait_for_timeout(1000)
        
        email_input = await page.wait_for_selector('input[type="email"]', timeout=5000)
        pass_input = await page.wait_for_selector('input[type="password"]', timeout=5000)
        
        await email_input.fill("adnanmurat021@gmail.com")
        await pass_input.fill("123456")
        
        submit_btn = await page.wait_for_selector('#modal-submit', timeout=5000)
        await submit_btn.click()
        await page.wait_for_timeout(5000)
        
        await page.evaluate("() => BM.Modal && BM.Modal.close()")
        await page.wait_for_timeout(500)
        
        # Test 1: Arı Üsleri - add apiary
        print("=== TEST 1: Add apiary ===")
        apiary_add = await page.evaluate("async () => { const r = await BM.Storage.add('apiaries', { name: 'Flow Test Us', location: 'Flow Konum', lat: 38.8, lng: 40.8, flora: 'Flow Test', notes: 'Flow test' }); return { success: true, id: r.id }; }")
        print(f"Add apiary: {apiary_add}")
        await page.wait_for_timeout(2000)
        
        # Test 2: Kovanlar - add hive
        print("=== TEST 2: Add hive ===")
        hive_add = await page.evaluate("async () => { const apiary = BM.Storage.list('apiaries').find(a => a.name === 'Flow Test Us'); if (!apiary) return { success: false, error: 'apiary not found' }; const r = await BM.Storage.add('hives', { name: 'Flow Test Kovan', apiaryId: apiary.id, strain: 'carniolan', boxType: 'langstroth', frameCount: 10, positionInApiary: 1, installedAt: '2026-08-03', status: 'active' }); return { success: true, id: r.id }; }")
        print(f"Add hive: {hive_add}")
        await page.wait_for_timeout(2000)
        
        # Test 3: Frame edit
        print("=== TEST 3: Frame edit ===")
        frame_edit = await page.evaluate("async () => { const frames = BM.Storage.list('frames').filter(f => f.hiveId === 'hv_1'); if (!frames.length) return { success: false, error: 'no frames' }; const f = frames[0]; const r = await BM.Storage.update('frames', f.id, { frameType: 'honey', cyclesCompleted: 2, waxAgeMonths: 5 }); return { success: true, frameId: f.id, newType: r['frameType'], newCycles: r['cyclesCompleted'] }; }")
        print(f"Frame edit: {frame_edit}")
        await page.wait_for_timeout(2000)
        
        # Test 4: Inspections - add inspection
        print("=== TEST 4: Add inspection ===")
        insp_add = await page.evaluate("async () => { const hive = BM.Storage.list('hives').find(h => h.name === 'Flow Test Kovan'); if (!hive) return { success: false, error: 'hive not found' }; const r = await BM.Storage.add('inspections', { hiveId: hive.id, date: '2026-08-03', varroaCount: 2, population: 'strong', eggsPattern: 'regular', broodFrames: 6, honeyFrames: 3, pollenFrames: 1, queenSeen: true, weather: 'sunny', notes: 'Flow test inspection', aiAnomalies: 0 }); return { success: true, id: r.id }; }")
        print(f"Add inspection: {insp_add}")
        await page.wait_for_timeout(2000)
        
        # Test 5: Harvest - add harvest
        print("=== TEST 5: Add harvest ===")
        harvest_add = await page.evaluate("async () => { const hive = BM.Storage.list('hives').find(h => h.name === 'Flow Test Kovan'); if (!hive) return { success: false, error: 'hive not found' }; const apiary = BM.Storage.get('apiaries', hive.apiaryId); const r = await BM.Storage.add('harvests', { hiveId: hive.id, apiaryId: apiary.id, date: '2026-08-03', weight: 5.5, quality: 'A', frames: 4, notes: 'Flow test harvest' }); return { success: true, id: r.id }; }")
        print(f"Add harvest: {harvest_add}")
        await page.wait_for_timeout(2000)
        
        # Test 6: Feeding
        print("=== TEST 6: Add feeding ===")
        feed_add = await page.evaluate("async () => { const hive = BM.Storage.list('hives').find(h => h.name === 'Flow Test Kovan'); if (!hive) return { success: false, error: 'hive not found' }; const r = await BM.Storage.add('feedings', { hiveId: hive.id, date: '2026-08-03', type: 'sugar_syrup_1to1', amountKg: 2.5, reason: 'weak_colony', status: 'completed', notes: 'Flow test feeding' }); return { success: true, id: r.id }; }")
        print(f"Add feeding: {feed_add}")
        await page.wait_for_timeout(2000)
        
        # Test 7: Treatments
        print("=== TEST 7: Add treatment ===")
        treat_add = await page.evaluate("async () => { const hive = BM.Storage.list('hives').find(h => h.name === 'Flow Test Kovan'); if (!hive) return { success: false, error: 'hive not found' }; const r = await BM.Storage.add('treatments', { hiveId: hive.id, date: '2026-08-03', product: 'Apivar', dosage: '2 strip', duration: '42 days', varroaBefore: 3, status: 'in_progress', notes: 'Flow test treatment' }); return { success: true, id: r.id }; }")
        print(f"Add treatment: {treat_add}")
        await page.wait_for_timeout(2000)
        
        # Test 8: Diseases
        print("=== TEST 8: Add disease ===")
        disease_add = await page.evaluate("async () => { const hive = BM.Storage.list('hives').find(h => h.name === 'Flow Test Kovan'); if (!hive) return { success: false, error: 'hive not found' }; const r = await BM.Storage.add('diseases', { hiveId: hive.id, date: '2026-08-03', disease: 'varroosis', severity: 'low', treatment: 'Apivar', status: 'treating', notes: 'Flow test disease' }); return { success: true, id: r.id }; }")
        print(f"Add disease: {disease_add}")
        await page.wait_for_timeout(2000)
        
        # Test 9: Queens
        print("=== TEST 9: Add queen ===")
        queen_add = await page.evaluate("async () => { const hive = BM.Storage.list('hives').find(h => h.name === 'Flow Test Kovan'); if (!hive) return { success: false, error: 'hive not found' }; const qid = 'q_' + Date.now().toString(36); const r = await BM.Storage.add('queens', { id: qid, hiveId: hive.id, strain: 'carniolan', birthDate: '2024-01-15', source: 'bred', markedColor: 'white', status: 'active', performanceScore: 0.8, notes: 'Flow test queen' }); return { success: true, id: r.id }; }")
        print(f"Add queen: {queen_add}")
        await page.wait_for_timeout(2000)
        
        # Test 10: Inventory
        print("=== TEST 10: Add inventory ===")
        inv_add = await page.evaluate("async () => { const r = await BM.Storage.add('inventory', { name: 'Flow Test Material', category: 'equipment', quantity: 10, unit: 'adet', minStock: 2, costTry: 25, supplier: 'Test Supplier', notes: 'Flow test inventory' }); return { success: true, id: r.id }; }")
        print(f"Add inventory: {inv_add}")
        await page.wait_for_timeout(2000)
        
        # Force sync
        print("=== FORCE SYNC ===")
        sync_res = await page.evaluate("async () => { if (BM.Storage && BM.Storage.syncFromCloud) { const r = await BM.Storage.syncFromCloud(true); return r; } return 'no syncFromCloud'; }")
        print(f"Force sync: {sync_res}")
        await page.wait_for_timeout(3000)
        
        # Verify all data
        print("=== FINAL VERIFICATION ===")
        collections = ['apiaries', 'hives', 'frames', 'inspections', 'harvests', 'feedings', 'treatments', 'diseases', 'queens', 'inventory']
        for coll in collections:
            data = await page.evaluate("() => BM.Storage.list('" + coll + "')")
            flow_items = [d for d in data if d['name'] and 'Flow' in d['name']]
            print("  " + coll + ": " + str(len(data)) + " total, " + str(len(flow_items)) + " Flow test items")
            for item in flow_items:
                print("    - " + item['name'] + " (id: " + item['id'] + ")")
        
        await browser.close()

asyncio.run(test_full_flow())