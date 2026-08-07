import asyncio
from playwright.async_api import async_playwright

async def full_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)

        # ============ MOBİL BOYUT: iPhone 14 Pro ============
        iphone = p.devices['iPhone 13']
        context_mobile = await browser.new_context(**iphone)
        page_m = await context_mobile.new_page()
        page_m.on("console", lambda msg: print(f"[M] {msg.type}: {msg.text}") if msg.type in ('error', 'warning') else None)
        page_m.on("pageerror", lambda err: print(f"[M ERROR] {err}"))

        print("=" * 60)
        print("MOBİL: iPhone 13 viewport")
        print("=" * 60)

        await page_m.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle")
        await page_m.wait_for_timeout(2000)

        # Sidebar kontrolü - açık mı kapalı mı?
        sidebar_state = await page_m.evaluate("""() => {
            const sb = document.getElementById('app-sidebar');
            const bn = document.getElementById('app-bottom-nav');
            return {
                sidebar: sb ? { class: sb.className, width: sb.offsetWidth, visible: sb.offsetWidth > 0 } : null,
                bottomNav: bn ? { class: bn.className, visible: bn.offsetHeight > 0 } : null,
                viewportWidth: window.innerWidth,
                viewportHeight: window.innerHeight
            };
        }""")
        print(f"[M] Sidebar state: {sidebar_state}")

        # Login
        auth_btn = await page_m.wait_for_selector('#auth-btn', timeout=10000)
        await auth_btn.click()
        await page_m.wait_for_timeout(1000)
        email_input = await page_m.wait_for_selector('input[type="email"]', timeout=5000)
        pass_input = await page_m.wait_for_selector('input[type="password"]', timeout=5000)
        await email_input.fill("adnanmurat021@gmail.com")
        await pass_input.fill("123456")
        submit_btn = await page_m.wait_for_selector('#modal-submit', timeout=5000)
        await submit_btn.click()
        await page_m.wait_for_timeout(5000)
        await page_m.evaluate("() => BM.Modal && BM.Modal.close()")
        await page_m.wait_for_timeout(500)

        # Check - is seed data loaded?
        apiaries = await page_m.evaluate("() => BM.Storage.list('apiaries')")
        hives = await page_m.evaluate("() => BM.Storage.list('hives')")
        print(f"[M] After login - apiaries: {len(apiaries)}, hives: {len(hives)}")

        # Force sync from cloud
        sync_res = await page_m.evaluate("async () => { const r = await BM.Storage.syncFromCloud(true); return r; }")
        print(f"[M] Sync from cloud: {sync_res}")

        apiaries_after = await page_m.evaluate("() => BM.Storage.list('apiaries')")
        hives_after = await page_m.evaluate("() => BM.Storage.list('hives')")
        print(f"[M] After sync - apiaries: {len(apiaries_after)}, hives: {len(hives_after)}")

        # Now add a real apiary
        add_res = await page_m.evaluate("""async () => {
            const r = await BM.Storage.add('apiaries', {
                name: 'Mobil Üs',
                location: 'Diyarbakır Mobil',
                lat: 38.247,
                lng: 40.135,
                flora: 'Mobil',
                notes: 'Mobile test'
            });
            return { id: r.id, name: r.name };
        }""")
        print(f"[M] Add apiary: {add_res}")

        await page_m.wait_for_timeout(3000)

        # Click Arı Üsleri on mobile
        print("[M] Arı Üsleri açılıyor...")
        try:
            apiaries_nav = await page_m.wait_for_selector('text=Arı Üsleri', timeout=10000)
            await apiaries_nav.click()
        except:
            print("[M] Arı Üsleri text not found, trying bottom nav...")
            apiaries_nav = await page_m.wait_for_selector('[data-view="apiaries"]', timeout=10000)
            await apiaries_nav.click()

        await page_m.wait_for_timeout(3000)

        # Check rendered content
        content = await page_m.evaluate("() => document.querySelector('#view-apiaries')?.innerHTML || ''")
        print(f"[M] View content length: {len(content)}")
        print(f"[M] 'Mobil Üs' görünüyor mu: {'Mobil Üs' in content}")

        # Take screenshot
        await page_m.screenshot(path='C:/Users/hatbi/BeeMaster-AI/mobile_apiaries.png')
        print("[M] Screenshot saved: mobile_apiaries.png")

        # Take dashboard screenshot too
        await page_m.evaluate("() => App.nav('dashboard')")
        await page_m.wait_for_timeout(2000)
        await page_m.screenshot(path='C:/Users/hatbi/BeeMaster-AI/mobile_dashboard.png')
        print("[M] Dashboard screenshot saved")

        # Sidebar state on dashboard
        sidebar_state2 = await page_m.evaluate("""() => {
            const sb = document.getElementById('app-sidebar');
            return {
                sidebar: sb ? { class: sb.className, width: sb.offsetWidth, visible: sb.offsetWidth > 0 } : null,
            };
        }""")
        print(f"[M] Dashboard sidebar state: {sidebar_state2}")

        # ============ LOGOUT + LOGIN TEST ============
        print("\n" + "=" * 60)
        print("LOGOUT + LOGIN test")
        print("=" * 60)

        await page_m.evaluate("() => BM.Auth.doLogout()")
        await page_m.wait_for_timeout(2000)
        auth_after_logout = await page_m.evaluate("() => ({ user: BM.Auth.getUser(), isAuth: BM.Auth.isAuthenticated() })")
        print(f"[M] After logout: {auth_after_logout}")

        apiaries_after_logout = await page_m.evaluate("() => BM.Storage.list('apiaries')")
        print(f"[M] Apiaries after logout: {len(apiaries_after_logout)}")

        # Login again
        auth_btn = await page_m.wait_for_selector('#auth-btn', timeout=10000)
        await auth_btn.click()
        await page_m.wait_for_timeout(1000)
        email_input = await page_m.wait_for_selector('input[type="email"]', timeout=5000)
        pass_input = await page_m.wait_for_selector('input[type="password"]', timeout=5000)
        await email_input.fill("adnanmurat021@gmail.com")
        await pass_input.fill("123456")
        submit_btn = await page_m.wait_for_selector('#modal-submit', timeout=5000)
        await submit_btn.click()
        await page_m.wait_for_timeout(5000)
        await page_m.evaluate("() => BM.Modal && BM.Modal.close()")
        await page_m.wait_for_timeout(500)

        # Sync
        sync_res2 = await page_m.evaluate("async () => { const r = await BM.Storage.syncFromCloud(true); return r; }")
        print(f"[M] Sync after relogin: {sync_res2}")

        apiaries_after_relogin = await page_m.evaluate("() => BM.Storage.list('apiaries')")
        print(f"[M] Apiaries after relogin: {len(apiaries_after_relogin)}")
        for a in apiaries_after_relogin:
            print(f"  - {a['name']} (id: {a['id']})")

        if any(a['name'] == 'Mobil Üs' for a in apiaries_after_relogin):
            print("\n✅ LOGOUT/LOGIN PERSISTENCE BAŞARILI!")
        else:
            print("\n❌ LOGOUT/LOGIN PERSISTENCE BAŞARISIZ")

        # Check cloud
        cloud_check = await page_m.evaluate("""async () => {
            const token = localStorage.getItem('beemaster-auth-token');
            const userId = BM.Auth.getUser().id;
            const r = await fetch('https://assfwtjbvuuxclioqsih.supabase.co/rest/v1/apiaries?user_id=eq.' + userId + '&select=id,name', {
                headers: {
                    'apikey': 'sb_publishable_3j7uCLoJRximHZjlAi4Frw_7HCwHm6M',
                    'Authorization': 'Bearer ' + token
                }
            });
            return { status: r.status, body: await r.text() };
        }""")
        print(f"\n[M] Cloud check: status={cloud_check['status']}, body={cloud_check['body'][:300]}")

        await browser.close()

asyncio.run(full_test())