import asyncio
from playwright.async_api import async_playwright

async def mobile_final_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)

        iphone = p.devices['iPhone 13']
        ctx = await browser.new_context(**iphone)
        page = await ctx.new_page()
        page.on("console", lambda msg: print(f"[M] {msg.type}: {msg.text}") if msg.type in ('error', 'warning') else None)

        # Fresh state
        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle")
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(2000)

        print("=" * 60)
        print("MOBİL FINAL TEST - v3.0.2")
        print("=" * 60)

        # ============ SIDEBAR & HAMBURGER ============
        sidebar_state = await page.evaluate("""() => {
            const sb = document.getElementById('app-sidebar');
            const toggle = document.querySelector('.sidebar-toggle');
            return {
                sidebar: {
                    offsetWidth: sb.offsetWidth,
                    boundingLeft: sb.getBoundingClientRect().left,
                    visibility: getComputedStyle(sb).visibility,
                    pointerEvents: getComputedStyle(sb).pointerEvents
                },
                toggle: toggle ? {
                    display: getComputedStyle(toggle).display,
                    visible: toggle.offsetWidth > 0
                } : null
            };
        }""")
        print(f"[M] Initial sidebar state: {sidebar_state}")

        # Take dashboard screenshot
        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/mobile_v3_dashboard.png', full_page=True)
        print("[M] Dashboard: mobile_v3_dashboard.png")

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

        apiaries = await page.evaluate("() => BM.Storage.list('apiaries')")
        hives = await page.evaluate("() => BM.Storage.list('hives')")
        print(f"\n[M] After login: {len(apiaries)} apiaries, {len(hives)} hives (cloud'da hiç veri yok, 0 bekleniyor)")

        # ============ HAMBURGER MENU TEST ============
        print("\n[M] Hamburger menu test...")
        toggle = await page.wait_for_selector('.sidebar-toggle', timeout=5000)
        is_visible = await toggle.is_visible()
        print(f"[M] Hamburger visible: {is_visible}")

        if is_visible:
            await toggle.click()
            await page.wait_for_timeout(500)
            sidebar_after_open = await page.evaluate("""() => {
                const sb = document.getElementById('app-sidebar');
                return {
                    boundingLeft: sb.getBoundingClientRect().left,
                    visibility: getComputedStyle(sb).visibility,
                    hasOpenClass: sb.classList.contains('sidebar--open')
                };
            }""")
            print(f"[M] Sidebar after toggle: {sidebar_after_open}")
            await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/mobile_v3_sidebar_open.png', full_page=True)
            print("[M] Sidebar open: mobile_v3_sidebar_open.png")

            # Click Arı Üsleri in sidebar
            try:
                apiaries_nav = await page.wait_for_selector('.sidebar--open [data-view="apiaries"]', timeout=5000)
                await apiaries_nav.click()
                await page.wait_for_timeout(3000)
                content = await page.evaluate("() => document.querySelector('#view-apiaries')?.innerHTML || ''")
                print(f"[M] Apiaries view content length: {len(content)}")
                print(f"[M] 'Üs' text in content: {'Üs' in content or 'üs' in content}")
            except Exception as e:
                print(f"[M] Sidebar apiaries click failed: {e}")

        # ============ ADD APIARY TEST ============
        print("\n[M] Yeni üs ekleniyor...")
        add = await page.evaluate("""async () => {
            const r = await BM.Storage.add('apiaries', {
                name: 'Mobil Üs Test',
                location: 'Diyarbakır Mobil',
                lat: 38.247,
                lng: 40.135,
                flora: 'Geven',
                notes: 'Mobile final test'
            });
            return { id: r.id, name: r.name };
        }""")
        print(f"[M] Add: {add}")
        await page.wait_for_timeout(3000)

        # Add hive
        print("[M] Yeni kovan ekleniyor...")
        hive = await page.evaluate("""async () => {
            const apiary = BM.Storage.list('apiaries').find(a => a.name === 'Mobil Üs Test');
            if (!apiary) return { error: 'apiary not found' };
            const r = await BM.Storage.add('hives', {
                name: 'Mobil Kovan',
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
        print(f"[M] Hive add: {hive}")
        await page.wait_for_timeout(3000)

        # Take screenshot of apiaries view
        try:
            await page.click('[data-view="apiaries"]', timeout=3000)
        except:
            pass
        await page.wait_for_timeout(2000)
        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/mobile_v3_apiaries_with_data.png', full_page=True)
        print("[M] Apiaries with data: mobile_v3_apiaries_with_data.png")

        # ============ LOGOUT + LOGIN ============
        print("\n[M] Logout...")
        await page.evaluate("() => BM.Auth.doLogout()")
        await page.wait_for_timeout(2000)

        apiaries_after = await page.evaluate("() => BM.Storage.list('apiaries')")
        print(f"[M] After logout: {len(apiaries_after)} apiaries")

        print("\n[M] Login again...")
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

        apiaries_relogin = await page.evaluate("() => BM.Storage.list('apiaries')")
        hives_relogin = await page.evaluate("() => BM.Storage.list('hives')")
        print(f"[M] After relogin: {len(apiaries_relogin)} apiaries, {len(hives_relogin)} hives")
        for a in apiaries_relogin:
            print(f"  - {a['name']}")
        for h in hives_relogin:
            print(f"  - {h['name']}")

        # VERDICT
        has_apiary = any(a['name'] == 'Mobil Üs Test' for a in apiaries_relogin)
        has_hive = any(h['name'] == 'Mobil Kovan' for h in hives_relogin)
        print(f"\n{'✅' if has_apiary else '❌'} Apiary persisted: {has_apiary}")
        print(f"{'✅' if has_hive else '❌'} Hive persisted: {has_hive}")

        await browser.close()

asyncio.run(mobile_final_test())