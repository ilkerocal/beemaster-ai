import asyncio, time
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
        await page.click('#auth-btn'); await page.wait_for_timeout(1500)
        await page.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page.fill('input[type="password"]', "123456")
        await page.click('#modal-submit')
        await page.wait_for_timeout(10000)
        await page.wait_for_function("() => typeof App !== 'undefined'")
        await page.wait_for_timeout(3000)

        # Clear cloud first
        token = await page.evaluate("() => localStorage.getItem('beemaster-auth-token')")
        uid = await page.evaluate("() => BM.Storage._userId()")
        for t in ['apiaries','hives','queens','inspections','frames','feedings','harvests']:
            await page.evaluate("""async function() {
                await fetch('https://assfwtjbvuuxclioqsih.supabase.co/rest/v1/%s?user_id=neq.00000000-0000-0000-0000-000000000000', {
                    method: 'DELETE', headers: { 'apikey': 'sb_publishable_3j7uCLoJRximHZjlAi4Frw_7HCwHm6M', 'Authorization': 'Bearer %s' }
                });
            }""" % (t, token))

        # Clear local
        await page.evaluate("""() => {
            BM.Storage.state = {apiaries:[],hives:[],queens:[],frames:[],inspections:[],harvests:[],feedings:[],treatments:[],diseases:[],inventory:[]};
            BM.Storage.save();
            location.reload();
        }""")
        await page.wait_for_timeout(3000)
        await page.wait_for_function("() => typeof App !== 'undefined'")
        await page.wait_for_timeout(2000)

        # SIMULATE USER: Add apiary via UI
        print("=== ADD APIARY VIA UI ===")
        await page.evaluate("() => BM.apiaries.add()")
        await page.wait_for_timeout(800)
        await page.fill('input[name="name"]', 'UI-TEST-US')
        await page.click('#modal-submit')
        await page.wait_for_timeout(2000)
        
        # Add hive via UI
        print("=== ADD HIVE VIA UI ===")
        await page.evaluate("() => BM.hives.add()")
        await page.wait_for_timeout(800)
        # Select apiary
        await page.evaluate("""() => {
            var sel = document.querySelector('select[name="apiaryId"]');
            if (sel) sel.value = sel.options[0].value;
        }""")
        await page.fill('input[name="name"]', 'UI-KOVAN')
        try:
            await page.click('#modal-submit', timeout=5000)
        except:
            pass
        await page.wait_for_timeout(2000)

        # Add QUEEN via UI
        print("=== ADD QUEEN VIA UI ===")
        await page.evaluate("() => BM.queens.add()")
        await page.wait_for_timeout(800)
        # Select hive
        await page.evaluate("""() => {
            var sel = document.querySelector('select[name="hiveId"]');
            if (sel && sel.options.length > 0) sel.value = sel.options[0].value;
        }""")
        try:
            await page.click('#modal-submit', timeout=5000)
        except:
            pass
        await page.wait_for_timeout(2000)

        # Add INSPECTION via UI wizard
        print("=== ADD INSPECTION VIA UI ===")
        await page.evaluate("() => BM.inspections.add()")
        await page.wait_for_timeout(800)
        # Step 1: hive + date
        try:
            await page.click('#modal-submit', timeout=5000)  # Next
        except:
            pass
        await page.wait_for_timeout(800)
        # Step 2: details
        try:
            await page.click('#modal-submit', timeout=5000)
        except:
            pass
        await page.wait_for_timeout(800)
        # Step 3: media (skip)
        try:
            await page.click('#modal-submit', timeout=5000)
        except:
            pass
        await page.wait_for_timeout(2000)

        # Wait for sync
        await page.evaluate("() => BM.Storage.syncFromCloud(true)")
        await page.wait_for_timeout(4000)

        # Check Supabase
        print("\n=== SUPABASE CHECK ===")
        for t in ['apiaries','hives','queens','inspections']:
            r = await page.evaluate("""async function() {
                var r = await fetch('https://assfwtjbvuuxclioqsih.supabase.co/rest/v1/%s?select=id&user_id=eq.%s', {
                    headers: { 'apikey': 'sb_publishable_3j7uCLoJRximHZjlAi4Frw_7HCwHm6M', 'Authorization': 'Bearer %s' }
                });
                var d = await r.json();
                return d.length;
            }""" % (t, uid, token))
            print("  %s: %d" % (t, r))

        # Console errors
        print("\n=== CONSOLE ERRORS ===")
        for l in logs:
            if 'error' in l.lower() or 'CloudSync' in l or 'add error' in l:
                print(" ", l[:150])

        print("\n=== LOCAL ===")
        for t in ['apiaries','hives','queens','inspections']:
            cnt = await page.evaluate("() => BM.Storage.list('%s').length" % t)
            print("  %s: %d" % (t, cnt))

        await browser.close()

asyncio.run(main())