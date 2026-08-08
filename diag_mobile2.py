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

        # Login
        await page.click('#auth-btn')
        await page.wait_for_timeout(1500)
        await page.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page.fill('input[type="password"]', "123456")
        
        t0 = time.time()
        await page.click('#modal-submit')
        
        # Track CloudSync timing
        await page.evaluate("""() => {
            var origSync = BM.Storage.syncFromCloud;
            BM.Storage.syncFromCloud = function() {
                window.__syncStart = Date.now();
                var p = origSync.apply(this, arguments);
                p.then(function() {
                    window.__syncEnd = Date.now();
                    window.__syncDuration = window.__syncEnd - window.__syncStart;
                });
                return p;
            };
        }""")

        await page.wait_for_function("() => typeof App !== 'undefined' && App.currentView === 'dashboard'")
        await page.wait_for_timeout(5000)

        sync_dur = await page.evaluate("() => window.__syncDuration || 'UNKNOWN'")
        print("CloudSync: %sms" % sync_dur)

        data = await page.evaluate("() => ({ a: BM.Storage.list('apiaries').length, h: BM.Storage.list('hives').length, q: BM.Storage.list('queens').length })")
        print("Data: apis=%d hives=%d queens=%d" % (data['a'], data['h'], data['q']))

        # TEST: hamburger → sidebar → navigation
        print("\n=== Sidebar flow ===")
        
        # 1) Hamburger visible?
        hb = await page.evaluate("""() => {
            var b = document.querySelector('.sidebar-toggle');
            var cs = getComputedStyle(b);
            return { display: cs.display, visible: b.offsetWidth > 0 };
        }""")
        print("Hamburger:", hb)

        # 2) Open sidebar
        await page.click('.sidebar-toggle')
        await page.wait_for_timeout(500)
        sb_open = await page.evaluate("() => document.getElementById('app-sidebar')?.classList.contains('sidebar--open')")
        print("Sidebar open:", sb_open)

        # 3) Click Üsler in sidebar
        await page.evaluate("""() => {
            var items = document.querySelectorAll('#app-sidebar .nav-item');
            var target = Array.from(items).find(function(i) { return i.textContent.includes('Üsler'); });
            if (target) target.click();
        }""")
        await page.wait_for_timeout(800)
        view = await page.evaluate("() => App.currentView")
        sb_still_open = await page.evaluate("() => document.getElementById('app-sidebar')?.classList.contains('sidebar--open')")
        print("After Üsler: view=%s sidebar=%s" % (view, sb_still_open))

        # Sidebar should auto-close on mobile after navigation
        if sb_still_open:
            print("  ⚠️ Sidebar still open after nav!")

        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/v360_sidebar.png')
        await browser.close()

asyncio.run(main())