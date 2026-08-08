import asyncio, time
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        iphone = p.devices['iPhone 13']
        ctx = await browser.new_context(**iphone)
        page = await ctx.new_page()

        await page.goto("https://beemaster-ai.vercel.app/?t=%d" % int(time.time()), wait_until="networkidle")
        await page.wait_for_timeout(2000)

        # 1) Hamburger visibility BEFORE login
        hamburger = await page.evaluate("""() => {
            var btn = document.querySelector('.sidebar-toggle');
            if (!btn) return 'NOT FOUND';
            var cs = getComputedStyle(btn);
            var r = btn.getBoundingClientRect();
            return {
                display: cs.display,
                visibility: cs.visibility,
                width: r.width,
                height: r.height,
                top: r.top,
                left: r.left,
                opacity: cs.opacity
            };
        }""")
        print("Hamburger BEFORE login:", hamburger)

        # 2) Login speed profiling
        await page.click('#auth-btn')
        await page.wait_for_timeout(1500)
        await page.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page.fill('input[type="password"]', "123456")
        
        t0 = time.time()
        await page.click('#modal-submit')
        await page.wait_for_function("() => typeof App !== 'undefined' && typeof BM !== 'undefined'")
        t1 = time.time()
        print("Bundle load + init: %.1fs" % (t1 - t0))

        await page.wait_for_function("() => App.currentView === 'dashboard'")
        t2 = time.time()
        print("Dashboard render: %.1fs" % (t2 - t1))

        await page.wait_for_timeout(2000)
        t3 = time.time()
        print("Total login: %.1fs" % (t3 - t0))

        # 3) Hamburger AFTER login
        hamburger2 = await page.evaluate("""() => {
            var btn = document.querySelector('.sidebar-toggle');
            if (!btn) return 'NOT FOUND';
            var cs = getComputedStyle(btn);
            var r = btn.getBoundingClientRect();
            return {
                display: cs.display,
                visibility: cs.visibility,
                width: r.width,
                height: r.height,
                top: r.top,
                left: r.left
            };
        }""")
        print("Hamburger AFTER login:", hamburger2)

        # 4) Full page screenshot
        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/v360_mobile_full.png', full_page=True)

        # 5) Header elementFromPoint check
        print("\nElement from point (header area):")
        for x in [195, 225, 255, 295, 335, 375]:
            el = await page.evaluate("""function() {
                var e = document.elementFromPoint(%d, 15);
                if (!e) return null;
                var btn = e.closest('button');
                return btn ? btn.textContent.trim().slice(0, 15) : e.tagName;
            }""" % x)
            print("  x=%d: %s" % (x, el))

        await browser.close()

asyncio.run(main())