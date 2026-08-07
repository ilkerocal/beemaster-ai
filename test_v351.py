import asyncio, time
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        iphone = p.devices['iPhone 13']
        ctx = await browser.new_context(**iphone)
        page = await ctx.new_page()

        errors = []
        page.on("pageerror", lambda err: errors.append("[PAGE] %s" % err))

        await page.goto("https://beemaster-ai.vercel.app/?t=%d" % int(time.time()), wait_until="networkidle")
        await page.wait_for_timeout(2000)

        await page.click('#auth-btn')
        await page.wait_for_timeout(1500)
        await page.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page.fill('input[type="password"]', "123456")
        await page.click('#modal-submit')
        
        t0 = time.time()
        await page.wait_for_timeout(10000)
        await page.wait_for_function("() => typeof App !== 'undefined' && App.currentView === 'dashboard'")
        t1 = time.time()
        print("Login suresi: %.1f saniye" % (t1 - t0))

        await page.wait_for_timeout(2000)

        # Sidebar + header test
        print("\n=== Sidebar acikken header butonlari ===")
        
        # Open sidebar
        await page.evaluate("() => App.toggleSidebar()")
        await page.wait_for_timeout(500)
        
        sidebar_open = await page.evaluate("() => document.getElementById('app-sidebar')?.classList.contains('sidebar--open')")
        print("Sidebar open:", sidebar_open)

        # Try clicking header buttons
        btns = [
            ("Hamburger", ".sidebar-toggle"),
            ("Arama", "button[onclick*='App.search']"),
            ("Tema", "#theme-toggle"),
        ]
        for label, sel in btns:
            try:
                await page.click(sel, timeout=3000)
                await page.wait_for_timeout(300)
                print("  %s: clicked OK" % label)
            except Exception as e:
                print("  %s: FAILED - %s" % (label, str(e)[:50]))

        # Close sidebar
        await page.evaluate("() => App.closeSidebar()")
        await page.wait_for_timeout(300)

        # Bottom nav check
        nav = await page.evaluate("""() => {
            var n = document.getElementById('app-bottom-nav');
            var cs = getComputedStyle(n);
            return { display: cs.display, blur: cs.backdropFilter, items: n.children.length };
        }""")
        print("\nBottom nav:", nav)

        # BDS denetimi
        print("\n=== BDS Denetim ===")
        bds = await page.evaluate("""() => {
            var nav = document.getElementById('app-bottom-nav');
            var item = nav.querySelector('.bottom-nav__item');
            var cs = getComputedStyle(item);
            return {
                fontFamily: cs.fontFamily.slice(0, 30),
                fontSize: cs.fontSize,
                color: cs.color,
                height: cs.minHeight,
                borderRadius: cs.borderRadius,
                transition: cs.transition.slice(0, 40)
            };
        }""")
        print("Font:", bds['fontFamily'])
        print("Font size:", bds['fontSize'])
        print("Color:", bds['color'])
        print("Min height:", bds['height'])
        print("Border radius:", bds['borderRadius'])
        print("Transition:", bds['transition'])

        print("\nErrors:", len(errors))
        for e in errors:
            print(" ", e)

        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/v351_final.png')
        await browser.close()

asyncio.run(main())