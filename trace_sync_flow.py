import asyncio, time
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        ctx = await browser.new_context()
        page = await ctx.new_page()

        page.on("console", lambda m: print("[%s] %s" % (m.type, m.text[:200])) if 'SYNC-TRACE' in m.text or 'add error' in m.text or 'add failed' in m.text else None)

        await page.goto("https://beemaster-ai.vercel.app/?t=%d" % int(time.time()), wait_until="networkidle")
        await page.wait_for_timeout(2000)
        await page.click('#auth-btn'); await page.wait_for_timeout(1500)
        await page.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page.fill('input[type="password"]', "123456")
        await page.click('#modal-submit')
        await page.wait_for_timeout(10000)
        await page.wait_for_function("() => typeof App !== 'undefined'")
        await page.wait_for_timeout(2000)

        # Override _syncAdd to trace
        await page.evaluate("""() => {
            var orig = BM.Storage._syncAdd;
            BM.Storage._syncAdd = function(coll, obj, retries) {
                console.log('SYNC-TRACE _syncAdd START: ' + coll + ' id=' + (obj.id||'?').slice(0,10) + ' retries=' + (retries||0));
                var p = orig.call(this, coll, obj, retries);
                p.then(function() {
                    console.log('SYNC-TRACE _syncAdd DONE: ' + coll);
                }).catch(function(e) {
                    console.log('SYNC-TRACE _syncAdd FAIL: ' + coll + ' ' + e.message);
                });
                return p;
            };
        }""")

        token = await page.evaluate("() => localStorage.getItem('beemaster-auth-token')")
        uid = await page.evaluate("() => BM.Storage._userId()")

        # Clear Supabase
        print("\n=== Clearing Supabase ===")
        for t in ['apiaries','hives','queens','inspections','frames','feedings','harvests']:
            cnt = await page.evaluate("""async function() {
                var client = BM.Auth.getClient();
                var r = await client.from('%s').delete().neq('id', '00000000-0000-0000-0000-000000000000');
                return r.error ? r.error.message : 'OK';
            }""" % t)
            print("  %s: %s" % (t, cnt))

        # Clear local
        await page.evaluate("""() => {
            BM.Storage.state = {apiaries:[],hives:[],queens:[],frames:[],inspections:[],harvests:[],feedings:[],treatments:[],diseases:[],inventory:[]};
            BM.Storage.save();
            location.reload();
        }""")
        await page.wait_for_timeout(3000)
        await page.wait_for_function("() => typeof App !== 'undefined'")
        await page.wait_for_timeout(2000)

        # Re-override after reload
        await page.evaluate("""() => {
            var orig = BM.Storage._syncAdd;
            BM.Storage._syncAdd = function(coll, obj, retries) {
                console.log('SYNC-TRACE _syncAdd START: ' + coll + ' id=' + (obj.id||'?').slice(0,10));
                var p = orig.call(this, coll, obj, retries);
                p.then(function() { console.log('SYNC-TRACE _syncAdd DONE: ' + coll); })
                 .catch(function(e) { console.log('SYNC-TRACE _syncAdd FAIL: ' + coll + ' ' + e.message); });
                return p;
            };
        }""")

        # SIMULATE USER: Add via BM.Storage.add (same as UI does)
        print("\n=== SIMULATE USER FLOW ===")
        
        # Add apiary
        await page.evaluate("""async () => {
            var a = await BM.Storage.add('apiaries', { name: 'FLOW-TEST', lat: 38, lng: 40, location: 'Test' });
            console.log('SYNC-TRACE apiary ADDED: ' + a.id);
        }""")
        await page.wait_for_timeout(1000)

        # Add hive (no await - like UI does!)
        print("Adding hive (fire-and-forget like UI)...")
        await page.evaluate("""() => {
            var a = BM.Storage.list('apiaries')[0];
            BM.Storage.add('hives', { name: 'FLOW-KOVAN', apiaryId: a.id, strain: 'Test', frameCount: 5 });
            console.log('SYNC-TRACE hive CALLED (not awaited)');
        }""")
        await page.wait_for_timeout(500)

        # Add queen immediately (fire-and-forget like UI)
        print("Adding queen immediately (fire-and-forget like UI)...")
        await page.evaluate("""() => {
            var a = BM.Storage.list('apiaries')[0];
            var h = BM.Storage.list('hives')[0];
            BM.Storage.add('queens', { name: 'FLOW-ANA', hiveId: h.id, apiaryId: a.id, markingColor: 'Kirmizi', birthDate: new Date().toISOString() });
            console.log('SYNC-TRACE queen CALLED (not awaited)');
        }""")

        # WAIT for all syncs to complete
        print("Waiting for syncs...")
        await page.wait_for_timeout(8000)

        # Check Supabase
        print("\n=== SUPABASE AFTER ===")
        for t in ['apiaries','hives','queens']:
            cnt = await page.evaluate("""async function() {
                var client = BM.Auth.getClient();
                var r = await client.from('%s').select('*', { count: 'exact', head: true });
                return r.count || 0;
            }""" % t)
            print("  %s: %d" % (t, cnt))

        await browser.close()

asyncio.run(main())