import asyncio, time, json
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        ctx = await browser.new_context()
        page = await ctx.new_page()
        
        page.on("console", lambda m: print("[CONSOLE %s] %s" % (m.type, m.text[:150])) if 'CloudSync' in m.text or 'add error' in m.text or 'add failed' in m.text or 'DEBUG' in m.text else None)

        await page.goto("https://beemaster-ai.vercel.app/?t=%d" % int(time.time()), wait_until="networkidle")
        await page.wait_for_timeout(2000)
        await page.click('#auth-btn'); await page.wait_for_timeout(1500)
        await page.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page.fill('input[type="password"]', "123456")
        await page.click('#modal-submit')
        await page.wait_for_timeout(10000)
        await page.wait_for_function("() => typeof App !== 'undefined'")
        await page.wait_for_timeout(2000)

        token = await page.evaluate("() => localStorage.getItem('beemaster-auth-token')")
        uid = await page.evaluate("() => BM.Storage._userId()")

        # Get existing apiary and hive
        aid = await page.evaluate("() => BM.Storage.list('apiaries')[0]?.id || 'NONE'")
        hid = await page.evaluate("() => BM.Storage.list('hives')[0]?.id || 'NONE'")
        print("apiary:", aid[:20], "hive:", hid[:20])

        if aid == 'NONE':
            await page.evaluate("""async () => { await BM.Storage.add('apiaries', { name: 'ACIL-TEST', lat: 38, lng: 40, location: 'Test' }); }""")
            await page.wait_for_timeout(500)
            aid = await page.evaluate("() => BM.Storage.list('apiaries').filter(function(x){return x.name==='ACIL-TEST'})[0]?.id || 'NONE'")
            await page.evaluate("""async () => {
                var a = BM.Storage.list('apiaries').filter(function(x){return x.name==='ACIL-TEST'})[0];
                await BM.Storage.add('hives', { name: 'ACIL-KOVAN', apiaryId: a.id, strain: 'Test', frameCount: 5 });
            }""")
            await page.wait_for_timeout(500)
            hid = await page.evaluate("() => BM.Storage.list('hives').filter(function(x){return x.name==='ACIL-KOVAN'})[0]?.id || 'NONE'")

        # ADD QUEEN - trace every step
        print("\n=== ADDING QUEEN (trace) ===")
        q_result = await page.evaluate("""async () => {
            try {
                var q = await BM.Storage.add('queens', { 
                    name: 'TRACE-ANA', 
                    hiveId: '%s', 
                    apiaryId: '%s', 
                    markingColor: 'Kirmizi', 
                    birthDate: new Date().toISOString() 
                });
                return { ok: true, id: q.id, name: q.name };
            } catch(e) {
                return { ok: false, error: e.message };
            }
        }""" % (hid, aid))
        print("queen add:", q_result)
        await page.wait_for_timeout(2000)

        # ADD INSPECTION
        print("\n=== ADDING INSPECTION (trace) ===")
        i_result = await page.evaluate("""async () => {
            try {
                var insp = await BM.Storage.add('inspections', { 
                    hiveId: '%s', apiaryId: '%s', date: new Date().toISOString(),
                    queenSeen: 'seen', eggsPattern: 'regular', notes: 'TRACE-MUAYENE',
                    broodFrames: 5, honeyFrames: 3, pollenFrames: 2, varroaCount: 0,
                    mode: 'form', weather: 'sunny'
                });
                return { ok: true, id: insp.id, notes: insp.notes };
            } catch(e) {
                return { ok: false, error: e.message };
            }
        }""" % (hid, aid))
        print("inspection add:", i_result)
        await page.wait_for_timeout(2000)

        # Force sync
        await page.evaluate("() => BM.Storage.syncFromCloud(true)")
        await page.wait_for_timeout(3000)

        # SUPABASE CHECK
        print("\n=== SUPABASE CHECK (AFTER ADD) ===")
        for t in ['queens', 'inspections']:
            r = await page.evaluate("""async function() {
                var r = await fetch('https://assfwtjbvuuxclioqsih.supabase.co/rest/v1/%s?select=*&user_id=eq.%s', {
                    headers: {
                        'apikey': 'sb_publishable_3j7uCLoJRximHZjlAi4Frw_7HCwHm6M',
                        'Authorization': 'Bearer %s'
                    }
                });
                var data = await r.json();
                return { status: r.status, count: data.length, rows: data.map(function(d){ return {id:d.id, notes:d.notes, marked_color:d.marked_color}; }) };
            }""" % (t, uid, token))
            print("  %s: status=%d count=%d" % (t, r['status'], r['count']))
            for row in r.get('rows', []):
                print("    row:", row)

        # LOCAL CHECK
        print("\n=== LOCAL STATE ===")
        for t in ['queens', 'inspections']:
            cnt = await page.evaluate("() => BM.Storage.list('%s').length" % t)
            items = await page.evaluate("() => BM.Storage.list('%s').map(function(x){ return {id:x.id?.slice(0,10), name:x.name, notes:x.notes}; })" % t)
            print("  %s: %d" % (t, cnt), items[:3])

        await browser.close()

asyncio.run(main())