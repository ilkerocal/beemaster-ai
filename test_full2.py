import asyncio
from playwright.async_api import async_playwright

async def test_full():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        iphone = p.devices['iPhone 13']
        ctx = await browser.new_context(**iphone)
        # Force no cache
        await ctx.set_extra_http_headers({"Cache-Control": "no-cache, no-store, max-age=0"})
        page = await ctx.new_page()

        page.on("console", lambda msg: print(f"[M] {msg.type}: {msg.text}") if msg.type in ('error', 'warning') else None)

        # Bust cache with timestamp
        await page.goto(f"https://beemaster-ai.vercel.app/?t={int(__import__('time').time())}", wait_until="networkidle")
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(3000)

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

        print("=" * 60)
        print("TEST: Hamburger + Bottom nav interaction")
        print("=" * 60)

        # 1. Open sidebar via JS
        print("\n[1] Sidebar aç...")
        await page.evaluate("() => App.toggleSidebar()")
        await page.wait_for_timeout(800)

        # Check if hamburger is hidden now
        hb_state = await page.evaluate("""() => {
            const hb = document.querySelector('.sidebar-toggle');
            return {
                display: hb ? getComputedStyle(hb).display : 'N/A',
                visibility: hb ? getComputedStyle(hb).visibility : 'N/A',
                offsetWidth: hb ? hb.offsetWidth : 0
            };
        }""")
        print(f"   Hamburger: {hb_state}")

        # Take screenshot
        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/v3_sidebar_open.png', full_page=True)

        # 2. Close via JS
        print("\n[2] Sidebar kapat...")
        await page.evaluate("() => App.closeSidebar()")
        await page.wait_for_timeout(800)

        # 3. Click bottom nav (hives) via JS - bypass any overlap
        print("\n[3] Bottom nav Kovan tıkla (JS)...")
        nav_result = await page.evaluate("""() => {
            const item = document.querySelector('.bottom-nav__item[data-view="hives"]');
            if (!item) return { ok: false, reason: 'not found' };
            try {
                item.click();
                return { ok: true };
            } catch (e) {
                return { ok: false, error: e.message };
            }
        }""")
        await page.wait_for_timeout(1500)
        current_view = await page.evaluate("() => App.currentView")
        print(f"   Nav click: {nav_result}, view: {current_view}")

        # 4. Try Apiaries click
        print("\n[4] Bottom nav Üsler tıkla (JS)...")
        nav_result2 = await page.evaluate("""() => {
            const item = document.querySelector('.bottom-nav__item[data-view="apiaries"]');
            if (!item) return { ok: false };
            item.click();
            return { ok: true };
        }""")
        await page.wait_for_timeout(1500)
        current_view2 = await page.evaluate("() => App.currentView")
        print(f"   View: {current_view2}")

        # 5. Try clicking + Ekle button
        print("\n[5] + Ekle butonu (JS)...")
        ekle_result = await page.evaluate("""() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '+ Ekle');
            if (!btn) return { ok: false };
            const rect = btn.getBoundingClientRect();
            return {
                ok: true,
                rect: { width: rect.width, height: rect.height, top: rect.top },
                visible: rect.width > 0 && rect.height > 0
            };
        }""")
        print(f"   + Ekle: {ekle_result}")

        # 6. Final state
        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/v3_dashboard.png', full_page=True)
        print("\nFinal screenshots: v3_sidebar_open.png, v3_dashboard.png")

        await browser.close()

asyncio.run(test_full())