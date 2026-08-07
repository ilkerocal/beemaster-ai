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

        # TEST 1: Bottom nav visible and styled
        nav_info = await page.evaluate("""() => {
            var nav = document.getElementById('app-bottom-nav');
            if (!nav) return 'NO NAV';
            var cs = getComputedStyle(nav);
            var items = nav.querySelectorAll('.bottom-nav__item');
            return {
                display: cs.display,
                bg: cs.backgroundColor,
                blur: cs.backdropFilter,
                itemCount: items.length,
                firstItemText: items[0]?.textContent?.trim().slice(0, 20),
                lastItemText: items[items.length-1]?.textContent?.trim().slice(0, 20)
            };
        }""")
        print("Bottom nav:", nav_info)

        # TEST 2: Navigate to apiaries
        await page.evaluate("() => App.nav('apiaries')")
        await page.wait_for_timeout(2000)

        view = await page.evaluate("() => App.currentView")
        print("View after nav:", view)
        
        has_content = await page.evaluate("""() => {
            var v = document.getElementById('view-apiaries');
            return v ? v.innerHTML.length : 0;
        }""")
        print("Apiaries content length:", has_content)

        # TEST 3: Bottom nav clicks
        print("\n=== Bottom nav taps ===")
        tabs = [
            ("Ana Sayfa", "dashboard", 40),
            ("Kovan", "hives", 120),
            ("Muayene", "inspections", 200),
            ("Hasat", "harvest", 280),
            ("Ekle", None, 350)
        ]
        for label, expected_view, x in tabs:
            # Tap via elementFromPoint
            await page.evaluate("""() => {
                var nav = document.getElementById('app-bottom-nav');
                var r = nav.getBoundingClientRect();
                var y = r.top + r.height/2;
                var el = document.elementFromPoint(%d, y);
                if (el) el.click();
            }""" % x)
            await page.wait_for_timeout(800)
            current = await page.evaluate("() => App.currentView")
            modal = await page.evaluate("() => document.querySelector('.modal-overlay--active') ? true : false")
            ok = "ok" if (expected_view and current == expected_view) or (not expected_view and modal) else "FAIL"
            print("  %s: view=%s %s" % (label, current, ok))

        # Screenshot
        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/v350_bottom_nav.png')

        print("\nErrors:")
        for e in errors:
            if 'error' in e.lower() or 'CloudSync' in e:
                print(" ", e)

        await browser.close()

asyncio.run(main())