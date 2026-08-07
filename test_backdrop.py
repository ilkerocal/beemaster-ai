import asyncio
from playwright.async_api import async_playwright

async def test_backdrop():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        iphone = p.devices['iPhone 13']
        ctx = await browser.new_context(**iphone)
        page = await ctx.new_page()
        page.on("console", lambda msg: print(f"[M] {msg.type}: {msg.text}") if msg.type in ('error', 'warning') else None)

        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle")
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
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

        # Open sidebar
        print("\n[1] Sidebar açma...")
        await page.evaluate("() => App.toggleSidebar()")
        await page.wait_for_timeout(500)

        sidebar_open = await page.evaluate("() => document.getElementById('app-sidebar').classList.contains('sidebar--open')")
        print(f"   Sidebar open: {sidebar_open}")

        # Check backdrop visibility
        backdrop = await page.evaluate("""() => {
            const bd = document.getElementById('sidebar-backdrop');
            if (!bd) return null;
            const rect = bd.getBoundingClientRect();
            return {
                display: getComputedStyle(bd).display,
                width: rect.width,
                height: rect.height,
                hasActiveClass: bd.classList.contains('active'),
                hasClickListener: !!bd.onclick || bd._listeners
            };
        }""")
        print(f"   Backdrop: {backdrop}")

        # Take screenshot with sidebar open
        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/sidebar_open.png', full_page=True)
        print("   Screenshot: sidebar_open.png")

        # Click backdrop (find element and click at top-right corner where sidebar isn't)
        print("\n[2] Backdrop tıklama testi...")
        try:
            # Click at coordinates (350, 400) - right side of screen, should hit backdrop
            await page.mouse.click(350, 400)
            await page.wait_for_timeout(500)

            sidebar_after = await page.evaluate("() => document.getElementById('app-sidebar').classList.contains('sidebar--open')")
            print(f"   After backdrop click: {sidebar_after}")

            if sidebar_after:
                print("   ❌ Sidebar hâlâ açık")
            else:
                print("   ✅ Backdrop click ÇALIŞTI - sidebar kapandı")
        except Exception as e:
            print(f"   Click error: {e}")

        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/after_backdrop.png', full_page=True)

        await browser.close()

asyncio.run(test_backdrop())