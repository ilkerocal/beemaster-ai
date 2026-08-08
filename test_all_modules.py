import asyncio, time
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        iphone = p.devices['iPhone 13']
        ctx = await browser.new_context(**iphone)
        page = await ctx.new_page()

        page.on("pageerror", lambda err: print("[PAGE ERROR]", err))

        await page.goto("https://beemaster-ai.vercel.app/?t=%d" % int(time.time()), wait_until="networkidle")
        await page.wait_for_timeout(2000)

        await page.click('#auth-btn'); await page.wait_for_timeout(1500)
        await page.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page.fill('input[type="password"]', "123456")
        await page.click('#modal-submit')
        await page.wait_for_timeout(10000)
        await page.wait_for_function("() => typeof App !== 'undefined' && App.currentView === 'dashboard'")
        await page.wait_for_timeout(3000)

        # Add test data
        await page.evaluate("""async () => {
            var a = await BM.Storage.add('apiaries', { name: 'MODUL-TEST', lat: 38, lng: 40, location: 'Test' });
            var h = await BM.Storage.add('hives', { name: 'TEST-KOVAN', apiaryId: a.id, strain: 'Test', frameCount: 8 });
            for (var i = 0; i < 5; i++) {
                await BM.Storage.add('frames', { hiveId: h.id, type: ['brood','honey','pollen','perga','foundation'][i], position: i+1 });
            }
        }""")
        await page.wait_for_timeout(2000)

        modules = [
            ('dashboard', 'Dashboard'),
            ('apiaries', 'Arı Üsleri'),
            ('hives', 'Kovanlar'),
            ('inspections', 'Muayeneler'),
            ('harvest', 'Hasat'),
            ('feeding', 'Besleme'),
            ('treatments', 'Tedaviler'),
            ('diseases', 'Hastalıklar'),
            ('queens', 'Ana Arılar'),
        ]

        print("=== MODÜL TESTLERİ ===")
        for view_id, name in modules:
            try:
                await page.evaluate("() => App.nav('%s')" % view_id)
                await page.wait_for_timeout(800)
                view = await page.evaluate("() => App.currentView")
                
                # Sayfa sonu buton elementi var mı?
                page_bottom = await page.evaluate("""() => {
                    var main = document.querySelector('.app__main');
                    if (!main) return null;
                    var r = main.getBoundingClientRect();
                    var nav = document.getElementById('app-bottom-nav');
                    var navR = nav ? nav.getBoundingClientRect() : null;
                    return {
                        mainBottom: Math.round(r.bottom),
                        navTop: navR ? Math.round(navR.top) : 999,
                        overlapped: navR ? (r.bottom > navR.top) : false
                    };
                }""")
                
                has_error = False
                if view != view_id:
                    has_error = True
                
                status = "❌" if has_error else "✅"
                overlap = "⚠️ TAŞTI" if page_bottom and page_bottom['overlapped'] else "✓"
                print("  %s %-15s view=%-12s mainBottom=%s navTop=%s %s" % (
                    status, name, view, 
                    page_bottom['mainBottom'] if page_bottom else '?',
                    page_bottom['navTop'] if page_bottom else '?',
                    overlap
                ))
            except Exception as e:
                print("  ❌ %-15s CRASH: %s" % (name, str(e)[:60]))

        # TEST: Frame edit modal kaydet butonu
        print("\n=== FRAME EDIT TEST ===")
        await page.evaluate("() => App.nav('hives')")
        await page.wait_for_timeout(800)
        
        # Click first hive to go to detail
        await page.evaluate("""() => {
            var cards = document.querySelectorAll('.card');
            for (var c of cards) {
                if (c.textContent.includes('TEST-KOVAN')) {
                    var btn = c.querySelector('button, [onclick]');
                    if (btn) btn.click();
                    break;
                }
            }
        }""")
        await page.wait_for_timeout(1000)
        
        # Check if we're on hive detail
        view = await page.evaluate("() => App.currentView")
        print("View:", view)

        # Scroll to bottom and check if buttons are visible
        scroll_info = await page.evaluate("""() => {
            var nav = document.getElementById('app-bottom-nav');
            var r = nav.getBoundingClientRect();
            return {
                navHeight: r.height,
                navTop: r.top,
                windowHeight: window.innerHeight,
                coveredBy: window.innerHeight - r.top
            };
        }""")
        print("Nav covers %dpx at bottom" % scroll_info['coveredBy'])

        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/v390_modules.png', full_page=True)
        await browser.close()

asyncio.run(main())