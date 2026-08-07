import asyncio, time, json
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        ctx = await browser.new_context()
        page = await ctx.new_page()

        logs = []
        page.on("console", lambda msg: logs.append("[%s] %s" % (msg.type, msg.text)))

        await page.goto("https://beemaster-ai.vercel.app/?t=%d" % int(time.time()), wait_until="networkidle")
        await page.wait_for_timeout(2000)

        # Login
        await page.click('#auth-btn'); await page.wait_for_timeout(1500)
        await page.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page.fill('input[type="password"]', "123456")
        await page.click('#modal-submit')
        await page.wait_for_timeout(10000)
        await page.wait_for_function("() => typeof App !== 'undefined'")
        await page.wait_for_timeout(3000)

        uid = await page.evaluate("() => BM.Storage._userId()")
        token = await page.evaluate("() => localStorage.getItem('beemaster-auth-token')")
        print("User:", uid)
        print("Token:", token[:30] + "..." if token else "YOK!")
        print("Auth:", await page.evaluate("() => BM.Auth.isAuthenticated ? BM.Auth.isAuthenticated() : 'NO FN'"))

        # 1) Add apiary
        await page.evaluate("""async () => {
            await BM.Storage.add('apiaries', { name: 'DIRECT-TEST', lat: 38, lng: 40, location: 'Test' });
        }""")
        await page.wait_for_timeout(500)
        aid = await page.evaluate("() => BM.Storage.list('apiaries').filter(function(x){return x.name==='DIRECT-TEST'})[0]?.id || 'YOK'")
        print("\napiary:", aid)

        # 2) Add hive
        await page.evaluate("""async () => {
            var a = BM.Storage.list('apiaries').filter(function(x){return x.name==='DIRECT-TEST'})[0];
            await BM.Storage.add('hives', { name: 'DIRECT-KOVAN', apiaryId: a.id, strain: 'Test', frameCount: 5 });
        }""")
        await page.wait_for_timeout(500)

        # 3) Add QUEEN
        print("\n=== ADDING QUEEN ===")
        await page.evaluate("""async () => {
            var a = BM.Storage.list('apiaries').filter(function(x){return x.name==='DIRECT-TEST'})[0];
            var h = BM.Storage.list('hives').filter(function(x){return x.name==='DIRECT-KOVAN'})[0];
            console.log('[DEBUG] Adding queen with hiveId=' + h.id + ' apiaryId=' + a.id);
            var q = await BM.Storage.add('queens', { name: 'DIRECT-ANA', hiveId: h.id, apiaryId: a.id, markingColor: 'Kirmizi', birthDate: new Date().toISOString() });
            console.log('[DEBUG] Queen add result: ' + JSON.stringify({id: q.id, name: q.name}));
        }""")
        await page.wait_for_timeout(2000)

        # 4) Add INSPECTION
        print("=== ADDING INSPECTION ===")
        await page.evaluate("""async () => {
            var a = BM.Storage.list('apiaries').filter(function(x){return x.name==='DIRECT-TEST'})[0];
            var h = BM.Storage.list('hives').filter(function(x){return x.name==='DIRECT-KOVAN'})[0];
            console.log('[DEBUG] Adding inspection with hiveId=' + h.id);
            var insp = await BM.Storage.add('inspections', { 
                hiveId: h.id, apiaryId: a.id, date: new Date().toISOString(),
                queenSeen: 'seen', eggsPattern: 'regular', notes: 'DIRECT test'
            });
            console.log('[DEBUG] Inspection add result: ' + JSON.stringify({id: insp.id, notes: insp.notes}));
        }""")
        await page.wait_for_timeout(2000)

        # Show all debug logs
        print("\n=== CONSOLE LOGS ===")
        for l in logs:
            if 'DEBUG' in l or 'CloudSync' in l or 'add error' in l or 'add failed' in l:
                print(" ", l)

        # NOW CHECK SUPABASE DIRECTLY
        print("\n=== DIRECT SUPABASE QUERY ===")
        for table in ['apiaries', 'hives', 'queens', 'inspections']:
            resp = await page.evaluate("""async function() {
                var r = await fetch('https://assfwtjbvuuxclioqsih.supabase.co/rest/v1/%s?select=id&user_id=eq.%s', {
                    headers: {
                        'apikey': 'sb_publishable_3j7uCLoJRximHZjlAi4Frw_7HCwHm6M',
                        'Authorization': 'Bearer %s'
                    }
                });
                var data = await r.json();
                return { status: r.status, count: data.length, error: r.status !== 200 ? JSON.stringify(data).slice(0,100) : null };
            }""" % (table, uid, token))
            print("  %s: status=%d count=%d %s" % (table, resp['status'], resp['count'], resp.get('error','')))

        # CHECK LOCAL
        print("\n=== LOCAL STATE ===")
        for coll in ['apiaries', 'hives', 'queens', 'inspections']:
            cnt = await page.evaluate("() => BM.Storage.list('%s').length" % coll)
            print("  %s: %d" % (coll, cnt))

        await browser.close()

asyncio.run(main())