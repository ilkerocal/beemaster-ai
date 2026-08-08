import asyncio
from playwright.async_api import async_playwright

async def mobile_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)

        iphone = p.devices['iPhone 13']
        ctx = await browser.new_context(**iphone)
        page = await ctx.new_page()
        page.on("console", lambda msg: print(f"[M] {msg.type}: {msg.text}") if msg.type in ('error', 'warning') else None)
        page.on("pageerror", lambda err: print(f"[M ERROR] {err}"))

        print("=" * 60)
        print("MOBİL TEST: fresh state + login + sidebar check")
        print("=" * 60)

        # Clear localStorage and login
        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle")
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(2000)

        # Guest state - should have seed data
        guest_apiaries = await page.evaluate("() => BM.Storage.list('apiaries')")
        guest_hives = await page.evaluate("() => BM.Storage.list('hives')")
        print(f"[M] Guest state (before login): {len(guest_apiaries)} apiaries, {len(guest_hives)} hives")

        # Login
        print("\n[M] Login yapılıyor...")
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

        # Check after login
        auth = await page.evaluate("() => ({ user: BM.Auth.getUser()?.email, isAuth: BM.Auth.isAuthenticated() })")
        print(f"[M] Auth: {auth}")

        apiaries = await page.evaluate("() => BM.Storage.list('apiaries')")
        hives = await page.evaluate("() => BM.Storage.list('hives')")
        print(f"[M] After login: {len(apiaries)} apiaries, {len(hives)} hives")
        for a in apiaries:
            print(f"  - {a['name']} (id: {a['id']})")
        for h in hives[:5]:
            print(f"  - {h['name']} (id: {h['id']})")

        # Sidebar check - should be HIDDEN on mobile
        sidebar = await page.evaluate("""() => {
            const sb = document.getElementById('app-sidebar');
            const rect = sb.getBoundingClientRect();
            const style = window.getComputedStyle(sb);
            return {
                offsetWidth: sb.offsetWidth,
                boundingLeft: rect.left,
                visibility: style.visibility,
                position: style.position,
                displayed: sb.offsetWidth > 0 && rect.left < window.innerWidth
            };
        }""")
        print(f"\n[M] Sidebar state: {sidebar}")

        # Take screenshot of dashboard
        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/mobile_dashboard_fixed.png', full_page=True)
        print("[M] Dashboard screenshot: mobile_dashboard_fixed.png")

        # Add a real apiary
        print("\n[M] Yeni üs ekleniyor...")
        add = await page.evaluate("""async () => {
            const r = await BM.Storage.add('apiaries', {
                name: 'Mobil Üs',
                location: 'Diyarbakır',
                lat: 38.247,
                lng: 40.135,
                flora: 'Geven',
                notes: 'Mobile test'
            });
            return { id: r.id, name: r.name };
        }""")
        print(f"[M] Added: {add}")
        await page.wait_for_timeout(3000)

        # Check cloud has it
        cloud = await page.evaluate("""async () => {
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
        print(f"[M] Cloud apiaries: {cloud['body']}")

        # Click Arı Üsleri
        print("\n[M] Arı Üsleri tıklanıyor...")
        # Try bottom nav first
        try:
            await page.click('[data-view="apiaries"]', timeout=5000)
            print("[M] Bottom nav clicked")
        except:
            print("[M] Bottom nav failed, trying sidebar...")
        await page.wait_for_timeout(3000)

        content = await page.evaluate("() => document.querySelector('#view-apiaries')?.innerHTML || ''")
        print(f"[M] View content length: {len(content)}")
        print(f"[M] 'Mobil Üs' görünüyor mu: {'Mobil Üs' in content}")

        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/mobile_apiaries_fixed.png', full_page=True)
        print("[M] Apiaries screenshot: mobile_apiaries_fixed.png")

        # ============ LOGOUT + LOGIN TEST ============
        print("\n" + "=" * 60)
        print("LOGOUT/LOGIN test")
        print("=" * 60)

        await page.evaluate("() => BM.Auth.doLogout()")
        await page.wait_for_timeout(2000)

        apiaries_after_logout = await page.evaluate("() => BM.Storage.list('apiaries')")
        print(f"[M] Apiaries after logout: {len(apiaries_after_logout)}")

        # Login again
        await page.wait_for_timeout(1000)
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

        apiaries_after_relogin = await page.evaluate("() => BM.Storage.list('apiaries')")
        print(f"[M] Apiaries after relogin: {len(apiaries_after_relogin)}")
        for a in apiaries_after_relogin:
            print(f"  - {a['name']} (id: {a['id']})")

        if any(a['name'] == 'Mobil Üs' for a in apiaries_after_relogin):
            print("\n✅ LOGOUT/LOGIN PERSISTENCE BAŞARILI")
        else:
            print("\n❌ LOGOUT/LOGIN PERSISTENCE BAŞARISIZ")

        await browser.close()

asyncio.run(mobile_test())