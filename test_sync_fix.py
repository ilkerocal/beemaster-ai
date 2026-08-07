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

        uid = await page.evaluate("() => BM.Storage._userId()")
        print("User ID:", uid)
        a1 = await page.evaluate("() => BM.Storage.list('apiaries').length")
        h1 = await page.evaluate("() => BM.Storage.list('hives').length")
        q1 = await page.evaluate("() => BM.Storage.list('queens').length")
        print("Local: apis=%d hives=%d queens=%d" % (a1, h1, q1))

        print("\n=== DESKTOP: Adding data ===")
        await page.evaluate("""() => {
            BM.Storage.add('apiaries', { name: 'Egil-Desktop', lat: 38.2, lng: 40.1 });
            return true;
        }""")
        await page.wait_for_timeout(500)

        apiary_id = await page.evaluate("() => BM.Storage.list('apiaries')[0]?.id || 'NONE'")
        print("apiary_id:", apiary_id)

        if apiary_id != 'NONE':
            await page.evaluate("""() => {
                var aid = BM.Storage.list('apiaries')[0].id;
                BM.Storage.add('hives', { name: 'Kovan-Desktop', apiaryId: aid, strain: 'Kafkas', frameCount: 8 });
                return true;
            }""")
            await page.wait_for_timeout(300)

            hive_id = await page.evaluate("() => BM.Storage.list('hives')[0]?.id || 'NONE'")
            print("hive_id:", hive_id)

            if hive_id != 'NONE':
                await page.evaluate("""() => {
                    var aid = BM.Storage.list('apiaries')[0].id;
                    var hid = BM.Storage.list('hives')[0].id;
                    BM.Storage.add('queens', { name: 'AnaAri-Desktop', hiveId: hid, apiaryId: aid, markingColor: 'Mavi' });
                    return true;
                }""")
                await page.wait_for_timeout(500)

        print("\n=== SYNC TO CLOUD ===")
        await page.evaluate("() => BM.Storage.syncFromCloud()")
        await page.wait_for_timeout(3000)

        cloud_errors = [e for e in errors if 'CloudSync' in e or 'add error' in e]
        if cloud_errors:
            print("Cloud errors found:")
            for e in cloud_errors:
                print(" ", e)
        else:
            print("No CloudSync errors!")

        a2 = await page.evaluate("() => BM.Storage.list('apiaries').length")
        h2 = await page.evaluate("() => BM.Storage.list('hives').length")
        q2 = await page.evaluate("() => BM.Storage.list('queens').length")
        print("After sync: apis=%d hives=%d queens=%d" % (a2, h2, q2))

        # === MOBILE ===
        print("\n=== MOBILE: New login ===")
        ctx2 = await browser.new_context(**p.devices['iPhone 13'])
        page2 = await ctx2.new_page()
        errors2 = []
        page2.on("console", lambda msg: errors2.append("[%s] %s" % (msg.type, msg.text)) if msg.type in ('error', 'warning') else None)

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
        await page2.wait_for_timeout(4000)

        a = await page2.evaluate("() => BM.Storage.list('apiaries').length")
        h = await page2.evaluate("() => BM.Storage.list('hives').length")
        q = await page2.evaluate("() => BM.Storage.list('queens').length")
        print("Mobile: apis=%d hives=%d queens=%d" % (a, h, q))

        if a > 0:
            names = await page2.evaluate("() => BM.Storage.list('apiaries').map(function(x){return x.name})")
            print("  Names:", names)
        if h > 0:
            names = await page2.evaluate("() => BM.Storage.list('hives').map(function(x){return x.name})")
            print("  Hives:", names)
        if q > 0:
            names = await page2.evaluate("() => BM.Storage.list('queens').map(function(x){return x.name})")
            print("  Queens:", names)

        await page2.screenshot(path='C:/Users/hatbi/BeeMaster-AI/v340_mobile_sync.png')
        await page2.close()
        await browser.close()

asyncio.run(main())