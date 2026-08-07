import asyncio, time, json
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        ctx = await browser.new_context()
        page = await ctx.new_page()

        sync_errors = []
        page.on("console", lambda msg: sync_errors.append("[%s] %s" % (msg.type, msg.text)) if msg.type in ('error', 'warning') else None)

        await page.goto("https://beemaster-ai.vercel.app/?t=%d" % int(time.time()), wait_until="networkidle")
        await page.wait_for_timeout(2000)

        # Login
        await page.click('#auth-btn'); await page.wait_for_timeout(1500)
        await page.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page.fill('input[type="password"]', "123456")
        await page.click('#modal-submit')
        await page.wait_for_timeout(8000)
        await page.wait_for_function("() => typeof App !== 'undefined'")
        await page.wait_for_timeout(2000)

        uid = await page.evaluate("() => BM.Storage._userId()")
        print("User:", uid[:20] + "...")

        # ADD DATA: apiary → hive → frames → queen → inspection → feeding → harvest
        print("\n=== ADDING ALL DATA TYPES ===")
        
        # 1) Apiary
        r = await page.evaluate("""async () => {
            try {
                var obj = await BM.Storage.add('apiaries', { name: 'SYNC-TEST-US', lat: 38.5, lng: 40.3, location: 'Diyarbakir' });
                return 'OK:' + obj.id.slice(0,12);
            } catch(e) { return 'ERR:' + e.message; }
        }""")
        print("apiary:", r)
        await page.wait_for_timeout(300)

        # 2) Hive
        r = await page.evaluate("""async () => {
            try {
                var aid = BM.Storage.list('apiaries').filter(function(x){return x.name==='SYNC-TEST-US'})[0].id;
                var obj = await BM.Storage.add('hives', { name: 'SYNC-KOVAN', apiaryId: aid, strain: 'Kafkas', frameCount: 10 });
                return 'OK:' + obj.id.slice(0,12);
            } catch(e) { return 'ERR:' + e.message; }
        }""")
        print("hive:", r)
        await page.wait_for_timeout(300)

        # 3) Frames
        r = await page.evaluate("""async () => {
            try {
                var hid = BM.Storage.list('hives').filter(function(x){return x.name==='SYNC-KOVAN'})[0].id;
                var types = ['brood','honey','pollen','perga','foundation'];
                var results = [];
                for (var i = 0; i < types.length; i++) {
                    var obj = await BM.Storage.add('frames', { hiveId: hid, type: types[i], position: i+1 });
                    results.push(obj.id.slice(0,10));
                }
                return 'OK:' + results.length + ' frames';
            } catch(e) { return 'ERR:' + e.message; }
        }""")
        print("frames:", r)
        await page.wait_for_timeout(300)

        # 4) Queen
        r = await page.evaluate("""async () => {
            try {
                var aid = BM.Storage.list('apiaries').filter(function(x){return x.name==='SYNC-TEST-US'})[0].id;
                var hid = BM.Storage.list('hives').filter(function(x){return x.name==='SYNC-KOVAN'})[0].id;
                var obj = await BM.Storage.add('queens', { name: 'SYNC-ANA', hiveId: hid, apiaryId: aid, markingColor: 'Kirmizi', birthDate: new Date().toISOString() });
                return 'OK:' + obj.id.slice(0,12);
            } catch(e) { return 'ERR:' + e.message; }
        }""")
        print("queen:", r)
        await page.wait_for_timeout(300)

        # 5) Inspection
        r = await page.evaluate("""async () => {
            try {
                var aid = BM.Storage.list('apiaries').filter(function(x){return x.name==='SYNC-TEST-US'})[0].id;
                var hid = BM.Storage.list('hives').filter(function(x){return x.name==='SYNC-KOVAN'})[0].id;
                var obj = await BM.Storage.add('inspections', { 
                    hiveId: hid, apiaryId: aid, date: new Date().toISOString(),
                    queenSeen: 'seen', eggsPattern: 'regular', population: 'strong',
                    broodFrames: 5, honeyFrames: 3, pollenFrames: 2, varroaCount: 1,
                    mode: 'form', weather: 'sunny', notes: 'Test muayenesi'
                });
                return 'OK:' + obj.id.slice(0,12);
            } catch(e) { return 'ERR:' + e.message; }
        }""")
        print("inspection:", r)
        await page.wait_for_timeout(300)

        # 6) Feeding
        r = await page.evaluate("""async () => {
            try {
                var aid = BM.Storage.list('apiaries').filter(function(x){return x.name==='SYNC-TEST-US'})[0].id;
                var hid = BM.Storage.list('hives').filter(function(x){return x.name==='SYNC-KOVAN'})[0].id;
                var obj = await BM.Storage.add('feedings', { 
                    hiveId: hid, apiaryId: aid, date: new Date().toISOString(),
                    type: 'sugar_syrup', amount: 2.5, unit: 'lt', notes: 'Test besleme'
                });
                return 'OK:' + obj.id.slice(0,12);
            } catch(e) { return 'ERR:' + e.message; }
        }""")
        print("feeding:", r)
        await page.wait_for_timeout(300)

        # 7) Harvest
        r = await page.evaluate("""async () => {
            try {
                var aid = BM.Storage.list('apiaries').filter(function(x){return x.name==='SYNC-TEST-US'})[0].id;
                var hid = BM.Storage.list('hives').filter(function(x){return x.name==='SYNC-KOVAN'})[0].id;
                var obj = await BM.Storage.add('harvests', { 
                    hiveId: hid, apiaryId: aid, date: new Date().toISOString(),
                    weight: 15.5, quality: 'premium', notes: 'Test hasat'
                });
                return 'OK:' + obj.id.slice(0,12);
            } catch(e) { return 'ERR:' + e.message; }
        }""")
        print("harvest:", r)

        await page.wait_for_timeout(2000)

        # Force sync to cloud
        await page.evaluate("() => BM.Storage.syncFromCloud(true)")
        await page.wait_for_timeout(3000)

        # Check sync errors
        print("\n=== SYNC ERRORS ===")
        sync_msgs = [e for e in sync_errors if 'CloudSync' in e or 'add error' in e or 'add failed' in e]
        for m in sync_msgs:
            print(" ", m)
        if not sync_msgs:
            print("  NONE!")

        # NOW CHECK CLOUD DIRECTLY
        token = await page.evaluate("() => localStorage.getItem('beemaster-auth-token')")
        print("\n=== DIRECT SUPABASE CHECK ===")

        for table in ['apiaries','hives','frames','queens','inspections','feedings','harvests']:
            count = await page.evaluate("""async function() {
                var r = await fetch('https://assfwtjbvuuxclioqsih.supabase.co/rest/v1/%s?select=id&user_id=eq.%s', {
                    headers: {
                        'apikey': 'sb_publishable_3j7uCLoJRximHZjlAi4Frw_7HCwHm6M',
                        'Authorization': 'Bearer %s'
                    }
                });
                var data = await r.json();
                return { status: r.status, count: data.length };
            }""" % (table, uid, token))
            print("  %s: status=%d count=%d" % (table, count['status'], count['count']))

        # NOW MOBILE
        print("\n=== MOBILE CHECK ===")
        ctx2 = await browser.new_context(**p.devices['iPhone 13'])
        page2 = await ctx2.new_page()
        await page2.goto("https://beemaster-ai.vercel.app/?t=%d" % int(time.time()), wait_until="networkidle")
        await page2.evaluate("() => localStorage.clear()")
        await page2.reload(wait_until="networkidle")
        await page2.wait_for_timeout(2000)

        await page2.click('#auth-btn'); await page2.wait_for_timeout(1500)
        await page2.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page2.fill('input[type="password"]', "123456")
        await page2.click('#modal-submit')
        await page2.wait_for_timeout(8000)
        await page2.wait_for_function("() => typeof App !== 'undefined' && App.currentView === 'dashboard'")
        await page2.wait_for_timeout(4000)

        for coll in ['apiaries','hives','frames','queens','inspections','feedings','harvests']:
            cnt = await page2.evaluate("() => BM.Storage.list('%s').length" % coll)
            print("  %s: %d" % (coll, cnt))

        await page2.close()
        await browser.close()

asyncio.run(main())