import asyncio, time
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        
        # === DESKTOP: Add queen ===
        ctx1 = await browser.new_context()
        page1 = await ctx1.new_page()
        
        err1 = []
        page1.on("console", lambda msg: err1.append("[%s] %s" % (msg.type, msg.text)) if msg.type in ('error','warning') else None)
        
        await page1.goto("https://beemaster-ai.vercel.app/?t=%d" % int(time.time()), wait_until="networkidle")
        await page1.wait_for_timeout(2000)
        await page1.click('#auth-btn'); await page1.wait_for_timeout(1500)
        await page1.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page1.fill('input[type="password"]', "123456")
        await page1.click('#modal-submit')
        await page1.wait_for_timeout(10000)
        await page1.wait_for_function("() => typeof App !== 'undefined' && App.currentView === 'dashboard'")
        await page1.wait_for_timeout(3000)

        uid = await page1.evaluate("() => BM.Auth.getUser()?.id || 'NO USER'")
        print("Desktop user:", uid[:20] if uid != 'NO USER' else uid)
        
        # Check if authenticated
        is_auth = await page1.evaluate("() => BM.Auth.isAuthenticated ? BM.Auth.isAuthenticated() : false")
        print("Authenticated:", is_auth)
        
        client_ok = await page1.evaluate("() => { try { var c = BM.Auth.getClient(); return !!c; } catch(e) { return false; }}")
        print("Supabase client:", client_ok)

        # Add apiary first
        r = await page1.evaluate("""async () => {
            var obj = await BM.Storage.add('apiaries', { name: 'CROSS-TEST', lat: 38, lng: 40, location: 'Test' });
            return obj ? obj.id.slice(0,12) : 'NULL';
        }""")
        print("apiary add:", r)
        await page1.wait_for_timeout(500)

        # Add hive
        r = await page1.evaluate("""async () => {
            var a = BM.Storage.list('apiaries').filter(function(x){return x.name==='CROSS-TEST'})[0];
            var obj = await BM.Storage.add('hives', { name: 'CROSS-KOVAN', apiaryId: a.id, strain: 'Test', frameCount: 5 });
            return obj ? obj.id.slice(0,12) : 'NULL';
        }""")
        print("hive add:", r)
        await page1.wait_for_timeout(500)

        # ADD QUEEN - the user's exact complaint
        r = await page1.evaluate("""async () => {
            var a = BM.Storage.list('apiaries').filter(function(x){return x.name==='CROSS-TEST'})[0];
            var h = BM.Storage.list('hives').filter(function(x){return x.name==='CROSS-KOVAN'})[0];
            var obj = await BM.Storage.add('queens', { name: 'CROSS-ANA-ARI', hiveId: h.id, apiaryId: a.id, markingColor: 'Mavi', birthDate: new Date().toISOString() });
            return obj ? obj.id.slice(0,12) : 'NULL';
        }""")
        print("queen add:", r)
        await page1.wait_for_timeout(500)

        # ADD INSPECTION
        r = await page1.evaluate("""async () => {
            var a = BM.Storage.list('apiaries').filter(function(x){return x.name==='CROSS-TEST'})[0];
            var h = BM.Storage.list('hives').filter(function(x){return x.name==='CROSS-KOVAN'})[0];
            var obj = await BM.Storage.add('inspections', { 
                hiveId: h.id, apiaryId: a.id, date: new Date().toISOString(),
                queenSeen: 'seen', eggsPattern: 'regular', population: 'strong',
                broodFrames: 5, honeyFrames: 3, pollenFrames: 2, varroaCount: 0,
                mode: 'form', weather: 'sunny', notes: 'Cross-browser test'
            });
            return obj ? obj.id.slice(0,12) : 'NULL';
        }""")
        print("inspection add:", r)
        await page1.wait_for_timeout(2000)

        # Force sync
        await page1.evaluate("() => BM.Storage.syncFromCloud(true)")
        await page1.wait_for_timeout(3000)

        # Sync errors
        print("\nDesktop sync errors:")
        for e in err1:
            if 'CloudSync' in e or 'add error' in e or 'add failed' in e:
                print(" ", e)
        if not any('CloudSync' in e or 'add error' in e for e in err1):
            print("  NONE!")

        # Check local data
        q_count = await page1.evaluate("() => BM.Storage.list('queens').length")
        i_count = await page1.evaluate("() => BM.Storage.list('inspections').length")
        print("Desktop local: queens=%d inspections=%d" % (q_count, i_count))

        page1.close()

        # === WAIT for cloud propagation ===
        await asyncio.sleep(2)

        # === MOBILE: Check data ===
        ctx2 = await browser.new_context(**p.devices['iPhone 13'])
        page2 = await ctx2.new_page()
        
        err2 = []
        page2.on("console", lambda msg: err2.append("[%s] %s" % (msg.type, msg.text)) if msg.type in ('error','warning') else None)

        await page2.goto("https://beemaster-ai.vercel.app/?t=%d" % int(time.time()), wait_until="networkidle")
        await page2.evaluate("() => localStorage.clear()")
        await page2.reload(wait_until="networkidle")
        await page2.wait_for_timeout(2000)

        await page2.click('#auth-btn'); await page2.wait_for_timeout(1500)
        await page2.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page2.fill('input[type="password"]', "123456")
        await page2.click('#modal-submit')
        await page2.wait_for_timeout(10000)
        await page2.wait_for_function("() => typeof App !== 'undefined' && App.currentView === 'dashboard'")
        await page2.wait_for_timeout(5000)

        q_mob = await page2.evaluate("() => BM.Storage.list('queens').length")
        i_mob = await page2.evaluate("() => BM.Storage.list('inspections').length")
        a_mob = await page2.evaluate("() => BM.Storage.list('apiaries').length")
        h_mob = await page2.evaluate("() => BM.Storage.list('hives').length")
        
        print("\n=== MOBILE DATA ===")
        print("apiaries:", a_mob)
        print("hives:", h_mob)
        print("queens:", q_mob)
        print("inspections:", i_mob)

        if q_mob > 0:
            q_names = await page2.evaluate("() => BM.Storage.list('queens').map(function(x){return x.name}).join(', ')")
            print("Queen names:", q_names)
        
        if i_mob > 0:
            i_notes = await page2.evaluate("() => BM.Storage.list('inspections').map(function(x){return x.notes}).join(', ')")
            print("Inspection notes:", i_notes)

        # Mobile sync errors
        print("\nMobile errors:")
        for e in err2:
            if 'CloudSync' in e or 'error' in e.lower():
                print(" ", e)

        await page2.screenshot(path='C:/Users/hatbi/BeeMaster-AI/v371_cross.png')
        await page2.close()
        await browser.close()

asyncio.run(main())