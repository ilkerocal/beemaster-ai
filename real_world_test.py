import asyncio
from playwright.async_api import async_playwright
import time

async def real_world_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)

        # ============ SEKME 1: İlk cihaz (PC) ============
        print("=" * 60)
        print("SEKME 1: İlk cihaz - login + üs ekle")
        print("=" * 60)

        page1 = await browser.new_page()
        page1.on("console", lambda msg: print(f"[S1] {msg.type}: {msg.text}") if msg.type in ('error', 'warning') else None)
        page1.on("pageerror", lambda err: print(f"[S1 ERROR] {err}"))

        await page1.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle")
        await page1.wait_for_timeout(2000)

        # Login
        print("[S1] Giriş yapılıyor...")
        auth_btn = await page1.wait_for_selector('#auth-btn', timeout=10000)
        await auth_btn.click()
        await page1.wait_for_timeout(1000)
        email_input = await page1.wait_for_selector('input[type="email"]', timeout=5000)
        pass_input = await page1.wait_for_selector('input[type="password"]', timeout=5000)
        await email_input.fill("adnanmurat021@gmail.com")
        await pass_input.fill("123456")
        submit_btn = await page1.wait_for_selector('#modal-submit', timeout=5000)
        await submit_btn.click()
        await page1.wait_for_timeout(5000)
        await page1.evaluate("() => BM.Modal && BM.Modal.close()")
        await page1.wait_for_timeout(500)

        # Auth check
        auth = await page1.evaluate("() => ({ user: BM.Auth.getUser()?.email, isAuth: BM.Auth.isAuthenticated() })")
        print(f"[S1] Auth: {auth}")

        # Add a real apiary
        print("[S1] Yeni üs ekleniyor...")
        add_result = await page1.evaluate("""async () => {
            const r = await BM.Storage.add('apiaries', {
                name: 'Cihaz 1 Üssü',
                location: 'Diyarbakır',
                lat: 38.247,
                lng: 40.135,
                flora: 'Geven',
                notes: 'İlk cihazdan eklendi'
            });
            return { id: r.id, name: r.name };
        }""")
        print(f"[S1] Add result: {add_result}")

        # Wait for cloud sync
        await page1.wait_for_timeout(4000)

        # Check sync errors
        apiaries_cloud = await page1.evaluate("""async () => {
            const token = localStorage.getItem('beemaster-auth-token');
            const userId = BM.Auth.getUser().id;
            const r = await fetch('https://assfwtjbvuuxclioqsih.supabase.co/rest/v1/apiaries?user_id=eq.' + userId + '&select=id,name,lat,lng', {
                headers: {
                    'apikey': 'sb_publishable_3j7uCLoJRximHZjlAi4Frw_7HCwHm6M',
                    'Authorization': 'Bearer ' + token
                }
            });
            return { status: r.status, body: await r.text() };
        }""")
        print(f"[S1] Cloud fetch status: {apiaries_cloud['status']}")
        print(f"[S1] Cloud data: {apiaries_cloud['body'][:500]}")

        # ============ SEKME 2: Farklı cihaz (aynı browser, yeni context) ============
        print("\n" + "=" * 60)
        print("SEKME 2: Farklı sekme/context - login + verileri gör")
        print("=" * 60)

        # Yeni context = farklı "cihaz"
        context2 = await browser.new_context()
        page2 = await context2.new_page()
        page2.on("console", lambda msg: print(f"[S2] {msg.type}: {msg.text}") if msg.type in ('error', 'warning') else None)
        page2.on("pageerror", lambda err: print(f"[S2 ERROR] {err}"))

        await page2.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle")
        await page2.wait_for_timeout(2000)

        print("[S2] Giriş yapılıyor...")
        auth_btn = await page2.wait_for_selector('#auth-btn', timeout=10000)
        await auth_btn.click()
        await page2.wait_for_timeout(1000)
        email_input = await page2.wait_for_selector('input[type="email"]', timeout=5000)
        pass_input = await page2.wait_for_selector('input[type="password"]', timeout=5000)
        await email_input.fill("adnanmurat021@gmail.com")
        await pass_input.fill("123456")
        submit_btn = await page2.wait_for_selector('#modal-submit', timeout=5000)
        await submit_btn.click()
        await page2.wait_for_timeout(5000)
        await page2.evaluate("() => BM.Modal && BM.Modal.close()")
        await page2.wait_for_timeout(500)

        auth2 = await page2.evaluate("() => ({ user: BM.Auth.getUser()?.email, isAuth: BM.Auth.isAuthenticated() })")
        print(f"[S2] Auth: {auth2}")

        # Force sync from cloud
        print("[S2] Cloud'dan sync ediliyor...")
        sync_res = await page2.evaluate("async () => { const r = await BM.Storage.syncFromCloud(true); return r; }")
        print(f"[S2] Sync result: {sync_res}")

        await page2.wait_for_timeout(3000)

        # Check apiaries
        apiaries_s2 = await page2.evaluate("() => BM.Storage.list('apiaries')")
        print(f"[S2] Apiaries count: {len(apiaries_s2)}")
        for a in apiaries_s2:
            print(f"  - {a['name']} (id: {a['id']}, lat: {a['lat']})")

        # Click Arı Üsleri nav
        print("[S2] Arı Üsleri açılıyor...")
        apiaries_nav = await page2.wait_for_selector('text=Arı Üsleri', timeout=10000)
        await apiaries_nav.click()
        await page2.wait_for_timeout(3000)

        content = await page2.evaluate("() => document.querySelector('#view-apiaries')?.innerHTML || ''")
        print(f"[S2] View content length: {len(content)}")
        print(f"[S2] 'Cihaz 1' görünüyor mu: {'Cihaz 1' in content}")
        print(f"[S2] 'GPS' görünüyor mu: {'GPS' in content}")

        # Final verifications
        if 'Cihaz 1' in content:
            print("\n✅ TEST BAŞARILI: İkinci cihaz birinci cihazdaki üssü görüyor!")
        else:
            print("\n❌ TEST BAŞARISIZ: İkinci cihaz birinci cihazdaki üssü görmüyor!")

        # Check other modules - add hive on device 2
        print("\n[S2] İkinci cihazdan kovan ekleniyor...")
        hive_add = await page2.evaluate("""async () => {
            const apiary = BM.Storage.list('apiaries').find(a => a.name === 'Cihaz 1 Üssü');
            if (!apiary) return { error: 'apiary not found' };
            const r = await BM.Storage.add('hives', {
                name: 'Cihaz 2 Kovanı',
                apiaryId: apiary.id,
                strain: 'carniolan',
                boxType: 'langstroth',
                frameCount: 10,
                positionInApiary: 1,
                installedAt: '2026-08-03',
                status: 'active'
            });
            return { id: r.id, name: r.name };
        }""")
        print(f"[S2] Hive add: {hive_add}")

        await page2.wait_for_timeout(4000)

        # Now switch to device 1 and check
        print("\n[S1] İlk cihazda yeni sync yapılıyor...")
        sync1 = await page1.evaluate("async () => { const r = await BM.Storage.syncFromCloud(true); return r; }")
        print(f"[S1] Sync result: {sync1}")
        await page1.wait_for_timeout(2000)

        hives_s1 = await page1.evaluate("() => BM.Storage.list('hives').filter(h => h.name === 'Cihaz 2 Kovanı')")
        print(f"[S1] 'Cihaz 2 Kovanı' count: {len(hives_s1)}")
        for h in hives_s1:
            print(f"  - {h['name']} (apiaryId: {h['apiaryId']})")

        if hives_s1:
            print("\n✅ Çift yönlü sync BAŞARILI!")
        else:
            print("\n❌ Çift yönlü sync BAŞARISIZ")

        await browser.close()

asyncio.run(real_world_test())