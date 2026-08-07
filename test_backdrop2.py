import asyncio
import time
from playwright.async_api import async_playwright

async def test_backdrop():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        iphone = p.devices['iPhone 13']
        ctx = await browser.new_context(**iphone)
        page = await ctx.new_page()

        # Disable cache
        await ctx.route("**/*", lambda route: route.continue_(headers={**route.request.headers, "Cache-Control": "no-cache"}))
        page.on("console", lambda msg: print(f"[M] {msg.type}: {msg.text}") if msg.type in ('error', 'warning') else None)

        # Cache buster query
        await page.goto(f"https://beemaster-ai.vercel.app/?v={int(time.time())}", wait_until="networkidle")

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
        await page.evaluate("() => App.toggleSidebar()")
        await page.wait_for_timeout(800)

        backdrop = await page.evaluate("""() => {
            const bd = document.getElementById('sidebar-backdrop');
            if (!bd) return null;
            const rect = bd.getBoundingClientRect();
            return {
                display: getComputedStyle(bd).display,
                width: rect.width,
                height: rect.height,
                hasActiveClass: bd.classList.contains('active'),
                cssHeight: getComputedStyle(bd).height,
                cssWidth: getComputedStyle(bd).width
            };
        }""")
        print(f"Backdrop after toggle: {backdrop}")

        # Click at top-right area
        await page.mouse.click(380, 50)
        await page.wait_for_timeout(500)

        sidebar_after = await page.evaluate("() => document.getElementById('app-sidebar').classList.contains('sidebar--open')")
        print(f"After click on backdrop: {sidebar_after}")

        await browser.close()

asyncio.run(test_backdrop())