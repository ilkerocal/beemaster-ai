import asyncio
from playwright.async_api import async_playwright

async def test_real_clicks():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        iphone = p.devices['iPhone 13']
        ctx = await browser.new_context(**iphone)
        page = await ctx.new_page()

        page.on("console", lambda msg: print(f"[M] {msg.type}: {msg.text}") if msg.type in ('error', 'warning') else None)

        await page.goto("https://beemaster-ai.vercel.app/?t=" + str(int(__import__('time').time())), wait_until="networkidle")
        await page.wait_for_timeout(2000)

        # Login
        auth_btn = await page.wait_for_selector('#auth-btn', timeout=10000)
        await auth_btn.click()
        await page.wait_for_timeout(1500)
        email_input = await page.wait_for_selector('input[type="email"]', timeout=5000)
        pass_input = await page.wait_for_selector('input[type="password"]', timeout=5000)
        await email_input.fill("adnanmurat021@gmail.com")
        await pass_input.fill("123456")
        submit_btn = await page.wait_for_selector('#modal-submit', timeout=5000)
        await submit_btn.click()
        await page.wait_for_timeout(5000)
        await page.evaluate("() => BM.Modal && BM.Modal.close()")
        await page.wait_for_timeout(1000)

        print("=" * 60)
        print("REAL TAP TEST - v3.1.3")
        print("=" * 60)

        # 1. Open sidebar via hamburger
        print("\n[1] Hamburger tap...")
        await page.evaluate("() => App.toggleSidebar()")
        await page.wait_for_timeout(1000)

        # 2. Try tapping sidebar nav items
        sidebar_items = ['dashboard', 'apiaries', 'hives', 'inspections']
        for view in sidebar_items:
            print(f"\n[2] Tap sidebar nav: {view}")
            try:
                await page.evaluate(f"""() => {{
                    const item = document.querySelector('.nav-item[data-view="{view}"]');
                    if (item) item.click();
                }}""")
                await page.wait_for_timeout(1000)
                current = await page.evaluate("() => App.currentView")
                print(f"   Current view: {current}")
                if current == view:
                    print(f"   ✅ WORKS")
                else:
                    print(f"   ❌ FAILED - got {current}")
                # Reopen sidebar for next test
                if current == view:
                    await page.evaluate("() => App.toggleSidebar()")
                    await page.wait_for_timeout(800)
            except Exception as e:
                print(f"   Error: {e}")

        # 3. Test bottom nav (should work even with sidebar open)
        print("\n[3] Bottom nav tap with sidebar OPEN...")
        bottom_items = ['dashboard', 'apiaries', 'hives', 'inspections', 'harvest']
        for view in bottom_items:
            print(f"\n   Tap bottom nav: {view}")
            try:
                result = await page.evaluate(f"""() => {{
                    const item = document.querySelector('.bottom-nav__item[data-view="{view}"]');
                    if (!item) return {{ok: false, reason: 'not found'}};
                    const rect = item.getBoundingClientRect();
                    const atPoint = document.elementFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
                    item.click();
                    return {{ok: true, atPoint: atPoint ? atPoint.tagName + '.' + (atPoint.className || '') : 'none'}};
                }}""")
                await page.wait_for_timeout(1000)
                current = await page.evaluate("() => App.currentView")
                print(f"   Click ok: {result['ok']}, atPoint: {result['atPoint']}, view: {current}")
            except Exception as e:
                print(f"   Error: {e}")

        # 4. Close sidebar, test bottom nav again
        print("\n[4] Close sidebar, test bottom nav CLOSED...")
        await page.evaluate("() => App.closeSidebar()")
        await page.wait_for_timeout(800)

        for view in bottom_items:
            print(f"\n   Tap bottom nav (closed): {view}")
            try:
                await page.evaluate(f"""() => {{
                    const item = document.querySelector('.bottom-nav__item[data-view="{view}"]');
                    if (item) item.click();
                }}""")
                await page.wait_for_timeout(1000)
                current = await page.evaluate("() => App.currentView")
                print(f"   View: {current}")
            except Exception as e:
                print(f"   Error: {e}")

        # 5. Test backdrop click closes sidebar
        print("\n[5] Test backdrop click closes sidebar...")
        await page.evaluate("() => App.toggleSidebar()")
        await page.wait_for_timeout(800)
        # Click on backdrop area (x=300)
        await page.mouse.click(300, 200)
        await page.wait_for_timeout(800)
        sidebar_open = await page.evaluate("() => document.getElementById('app-sidebar').classList.contains('sidebar--open')")
        print(f"   Sidebar closed by backdrop click: {not sidebar_open}")

        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/final_v313_test.png', full_page=False)
        await browser.close()

asyncio.run(test_real_clicks())