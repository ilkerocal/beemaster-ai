import asyncio
from playwright.async_api import async_playwright

async def test_no_cache():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        iphone = p.devices['iPhone 13']
        ctx = await browser.new_context(**iphone)
        # Disable cache
        await ctx.route("**/*", lambda route: route.continue_(headers={**route.request.headers, "Cache-Control": "no-cache, no-store"}))
        page = await ctx.new_page()

        page.on("console", lambda msg: print(f"[M] {msg.type}: {msg.text}") if msg.type in ('error', 'warning') else None)

        # Direct app URL with cache buster
        await page.goto("https://beemaster-ai.vercel.app/?nocache=2", wait_until="networkidle")
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

        # Open sidebar
        print("[1] Open sidebar...")
        await page.evaluate("() => App.toggleSidebar()")
        await page.wait_for_timeout(800)

        # Check hamburger visibility
        hb_visible = await page.evaluate("""() => {
            const hb = document.querySelector('.sidebar-toggle');
            const bodyClass = document.body.classList.contains('sidebar-open');
            return {
                hamburgerExists: !!hb,
                hamburgerDisplay: hb ? getComputedStyle(hb).display : 'N/A',
                hamburgerVisibility: hb ? getComputedStyle(hb).visibility : 'N/A',
                bodyHasClass: bodyClass,
                sidebarOpen: document.getElementById('app-sidebar').classList.contains('sidebar--open')
            };
        }""")
        print(f"   Hamburger state: {hb_visible}")

        # Try clicking hamburger via JS
        print("\n[2] Click via JS evaluate...")
        click_result = await page.evaluate("""() => {
            const hb = document.querySelector('.sidebar-toggle');
            if (!hb) return { ok: false, reason: 'not found' };
            try {
                hb.click();
                return { ok: true };
            } catch (e) {
                return { ok: false, error: e.message };
            }
        }""")
        print(f"   Click result: {click_result}")

        # Check sidebar state after
        after = await page.evaluate("""() => ({
            sidebarOpen: document.getElementById('app-sidebar').classList.contains('sidebar--open'),
            bodyClass: document.body.classList.contains('sidebar-open')
        })""")
        print(f"   After click: {after}")

        # Try clicking bottom nav (hives)
        print("\n[3] Bottom nav Kovan tıkla...")
        try:
            await page.click('.bottom-nav__item[data-view="hives"]', timeout=3000, force=True)
            await page.wait_for_timeout(1500)
            current_view = await page.evaluate("() => App.currentView")
            print(f"   Current view: {current_view}")

            if current_view == 'hives':
                print("   ✅ Bottom nav ÇALIŞIYOR")
            else:
                print(f"   ❌ View: {current_view}")
        except Exception as e:
            print(f"   ❌ Bottom nav hatası: {e}")

        await browser.close()

asyncio.run(test_no_cache())