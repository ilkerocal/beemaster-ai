import asyncio, time
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        ctx = await browser.new_context()
        page = await ctx.new_page()

        errors = []
        page.on("console", lambda msg: errors.append("[%s] %s" % (msg.type, msg.text)) if msg.type in ('error', 'warning') else None)

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

        # CLEAR local + sync
        await page.evaluate("""() => {
            BM.Storage.state = {apiaries:[],hives:[],queens:[],frames:[],inspections:[],harvests:[],feedings:[],treatments:[],diseases:[],inventory:[]};
            BM.Storage.save();
            BM.Storage.syncFromCloud(true);
        }""")
        await page.wait_for_timeout(4000)

        a1 = await page.evaluate("() => BM.Storage.list('apiaries').length")
        h1 = await page.evaluate("() => BM.Storage.list('hives').length")
        q1 = await page.evaluate("() => BM.Storage.list('queens').length")
        print("After force sync: apis=%d hives=%d queens=%d" % (a1, h1, q1))

        for e in errors:
            if 'CloudSync' in e:
                print("  ERR:", e)

        print("\n=== ADD ALL THREE ===")
        await page.evaluate("""() => {
            BM.Storage.add('apiaries', { name: 'Final-Test', lat: 38.2, lng: 40.1 });
            return true;
        }""")
        await page.wait_for_timeout(500)
        aid = await page.evaluate("() => BM.Storage.list('apiaries').filter(function(x){return x.name==='Final-Test'})[0]?.id || 'NONE'")
        
        await page.evaluate("""() => {
            var a = BM.Storage.list('apiaries').filter(function(x){return x.name==='Final-Test'})[0];
            BM.Storage.add('hives', { name: 'Final-Kovan', apiaryId: a.id, strain: 'Kafkas', frameCount: 8 });
            return true;
        }""")
        await page.wait_for_timeout(300)
        
        await page.evaluate("""() => {
            var a = BM.Storage.list('apiaries').filter(function(x){return x.name==='Final-Test'})[0];
            var h = BM.Storage.list('hives').filter(function(x){return x.name==='Final-Kovan'})[0];
            BM.Storage.add('queens', { name: 'Final-Ana', hiveId: h.id, apiaryId: a.id, markingColor: 'Mavi', birthDate: new Date().toISOString() });
            return true;
        }""")
        await page.wait_for_timeout(500)

        await page.evaluate("() => BM.Storage.syncFromCloud()")
        await page.wait_for_timeout(3000)

        print("\nCloud errors:")
        has_errors = False
        for e in errors:
            if 'CloudSync' in e or 'add error' in e:
                print(" ", e)
                has_errors = True
        if not has_errors:
            print("  NONE!")

        # MOBILE
        print("\n=== MOBILE ===")
        ctx2 = await browser.new_context(**p.devices['iPhone 13'])
        page2 = await ctx2.new_page()

        await page2.goto("https://beemaster-ai.vercel.app/?t=%d" % int(time.time()), wait_until="networkidle")
        await page2.evaluate("() => localStorage.clear()")
        await page2.reload(wait_until="networkidle")
        await page2.wait_for_timeout(2000)

        await page2.click('#auth-btn')
        await page2.wait_for_timeout(1500)
        await page2.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page2.fill('input[type="password"]', "123456")
        await page2.click('#modal-submit')
        await page2.wait_for_timeout(8000)
        await page2.wait_for_function("() => typeof App !== 'undefined'")
        await page2.wait_for_timeout(5000)

        a = await page2.evaluate("() => BM.Storage.list('apiaries').length")
        h = await page2.evaluate("() => BM.Storage.list('hives').length")
        q = await page2.evaluate("() => BM.Storage.list('queens').length")
        print("Mobile: apis=%d hives=%d queens=%d" % (a, h, q))

        if a > 0:
            aname = await page2.evaluate("() => BM.Storage.list('apiaries').filter(function(x){return x.name==='Final-Test'}).length")
            print("  Final-Test found:", aname > 0)
        if h > 0:
            hname = await page2.evaluate("() => BM.Storage.list('hives').filter(function(x){return x.name==='Final-Kovan'}).length")
            print("  Final-Kovan found:", hname > 0)
        if q > 0:
            qname = await page2.evaluate("() => BM.Storage.list('queens').filter(function(x){return x.name==='Final-Ana'}).length")
            print("  Final-Ana found:", qname > 0)

        await page2.screenshot(path='C:/Users/hatbi/BeeMaster-AI/v342_final.png')
        await page2.close()
        await browser.close()

asyncio.run(main())