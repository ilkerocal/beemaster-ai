import asyncio, time
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        ctx = await browser.new_context()
        page = await ctx.new_page()

        errors = []
        page.on("console", lambda msg: errors.append("[%s] %s" % (msg.type, msg.text)) if msg.type in ('error', 'warning') else None)

        # First: clean cloud data
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

        # Reset cloud
        token = await page.evaluate("() => localStorage.getItem('beemaster-auth-token')")
        print("Token:", token[:30] + "...")

        # Direct delete from supabase
        tables = ['apiaries', 'hives', 'queens', 'inspections', 'frames', 'harvests', 'feedings', 'treatments', 'diseases', 'inventory']
        for t in tables:
            r = await page.evaluate("""async function() {
                var token = localStorage.getItem('beemaster-auth-token');
                var r = await fetch('https://assfwtjbvuuxclioqsih.supabase.co/rest/v1/%s?user_id=neq.00000000-0000-0000-0000-000000000000', {
                    method: 'DELETE',
                    headers: {
                        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzc2Z3dGpidnV1eGNsaW9xc2loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAxNTc3NjAwMH0.placeholder',
                        'Authorization': 'Bearer ' + token
                    }
                });
                return r.status;
            }""" % t)
            print("  DELETE %s: %d" % (t, r))

        await page.evaluate("() => localStorage.clear()")
        await page.close()

        # NOW fresh test
        ctx2 = await browser.new_context()
        page2 = await ctx2.new_page()
        errors2 = []
        page2.on("console", lambda msg: errors2.append("[%s] %s" % (msg.type, msg.text)) if msg.type in ('error', 'warning') else None)

        await page2.goto("https://beemaster-ai.vercel.app/?t=%d" % int(time.time()), wait_until="networkidle")
        await page2.wait_for_timeout(2000)

        await page2.click('#auth-btn')
        await page2.wait_for_timeout(1500)
        await page2.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page2.fill('input[type="password"]', "123456")
        await page2.click('#modal-submit')
        await page2.wait_for_timeout(8000)
        await page2.wait_for_function("() => typeof App !== 'undefined'")
        await page2.wait_for_timeout(3000)

        # ADD DATA - without address field
        await page2.evaluate("""() => {
            BM.Storage.add('apiaries', { name: 'Egil-Test', lat: 38.2, lng: 40.1, location: 'Diyarbakir' });
            return true;
        }""")
        await page2.wait_for_timeout(500)

        aid = await page2.evaluate("() => BM.Storage.list('apiaries')[0]?.id || 'NONE'")
        print("\napiary_id:", aid)

        await page2.evaluate("""() => {
            var a = BM.Storage.list('apiaries')[0];
            BM.Storage.add('hives', { name: 'Kovan-Test', apiaryId: a.id, strain: 'Kafkas', frameCount: 8 });
            return true;
        }""")
        await page2.wait_for_timeout(500)

        hid = await page2.evaluate("() => BM.Storage.list('hives')[0]?.id || 'NONE'")
        print("hive_id:", hid)

        await page2.evaluate("""() => {
            var a = BM.Storage.list('apiaries')[0];
            var h = BM.Storage.list('hives')[0];
            BM.Storage.add('queens', { name: 'AnaAri-Test', hiveId: h.id, apiaryId: a.id, markingColor: 'Mavi', birthDate: new Date().toISOString() });
            return true;
        }""")
        await page2.wait_for_timeout(500)

        # Force sync
        await page2.evaluate("() => BM.Storage.syncFromCloud()")
        await page2.wait_for_timeout(4000)

        print("\n=== ERRORS ===")
        for e in errors2:
            if 'CloudSync' in e or 'add error' in e or 'add failed' in e:
                print(" ", e)
        if not any('CloudSync' in e or 'add error' in e for e in errors2):
            print("  NO CloudSync errors!")

        # NOW MOBILE
        print("\n=== MOBILE LOGIN ===")
        ctx3 = await browser.new_context(**p.devices['iPhone 13'])
        page3 = await ctx3.new_page()

        await page3.goto("https://beemaster-ai.vercel.app/?t=%d" % int(time.time()), wait_until="networkidle")
        await page3.evaluate("() => localStorage.clear()")
        await page3.reload(wait_until="networkidle")
        await page3.wait_for_timeout(2000)

        await page3.click('#auth-btn')
        await page3.wait_for_timeout(1500)
        await page3.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page3.fill('input[type="password"]', "123456")
        await page3.click('#modal-submit')
        await page3.wait_for_timeout(8000)
        await page3.wait_for_function("() => typeof App !== 'undefined'")
        await page3.wait_for_timeout(5000)

        a = await page3.evaluate("() => BM.Storage.list('apiaries').length")
        h = await page3.evaluate("() => BM.Storage.list('hives').length")
        q = await page3.evaluate("() => BM.Storage.list('queens').length")
        print("Mobile: apis=%d hives=%d queens=%d" % (a, h, q))

        if a > 0:
            print("  Apiary:", await page3.evaluate("() => BM.Storage.list('apiaries')[0].name"))
        if h > 0:
            print("  Hive:", await page3.evaluate("() => BM.Storage.list('hives')[0].name"))
        if q > 0:
            print("  Queen:", await page3.evaluate("() => BM.Storage.list('queens')[0].name"))

        await page3.screenshot(path='C:/Users/hatbi/BeeMaster-AI/v340_sync_result.png')
        await page3.close()
        await browser.close()

asyncio.run(main())