import asyncio, time
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        iphone = p.devices['iPhone 13']
        ctx = await browser.new_context(**iphone)
        page = await ctx.new_page()

        errors = []
        page.on("console", lambda msg: errors.append("[%s] %s" % (msg.type, msg.text)) if msg.type in ('error', 'warning') else None)
        page.on("pageerror", lambda err: errors.append("[PAGE] %s" % err))

        await page.goto("https://beemaster-ai.vercel.app/?t=%d" % int(time.time()), wait_until="networkidle")
        await page.wait_for_timeout(2000)

        await page.click('#auth-btn')
        await page.wait_for_timeout(1500)
        await page.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page.fill('input[type="password"]', "123456")
        await page.click('#modal-submit')
        await page.wait_for_timeout(8000)
        await page.wait_for_function("() => typeof App !== 'undefined'")
        await page.wait_for_timeout(3000)

        # 1) Check apiaries module
        apiaries_mod = await page.evaluate("() => typeof BM.apiaries")
        print("BM.apiaries type:", apiaries_mod)
        
        apiaries_funcs = await page.evaluate("""() => {
            if (!BM.apiaries) return 'MISSING';
            var keys = Object.keys(BM.apiaries);
            return keys.join(', ');
        }""")
        print("BM.apiaries keys:", apiaries_funcs)

        # 2) Navigate to apiaries view
        await page.evaluate("() => App.nav('apiaries')")
        await page.wait_for_timeout(2000)

        view = await page.evaluate("() => App.currentView")
        print("View:", view)

        body_html = await page.evaluate("""() => {
            var v = document.getElementById('view-apiaries');
            return v ? v.innerHTML.substring(0, 500) : 'NO VIEW ELEMENT';
        }""")
        print("view-apiaries HTML (first 500):", body_html[:200])

        # 3) Errors
        print("\nErrors:")
        for e in errors:
            print(" ", e)

        # Screenshot
        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/check_apiaries.png')

        # 4) Bottom nav check
        nav_visible = await page.evaluate("""() => {
            var nav = document.getElementById('app-bottom-nav');
            if (!nav) return 'NO ELEMENT';
            var cs = getComputedStyle(nav);
            return {
                display: cs.display,
                position: cs.position,
                bottom: cs.bottom,
                zIndex: cs.zIndex,
                height: cs.height,
                bgColor: cs.backgroundColor
            };
        }""")
        print("\nBottom nav:", nav_visible)

        await browser.close()

asyncio.run(main())