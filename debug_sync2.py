import asyncio, time
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        ctx = await browser.new_context()
        page = await ctx.new_page()

        page.on("console", lambda msg: print(f"[{msg.type}] {msg.text}"))

        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle")
        await page.wait_for_timeout(2000)

        # Login
        await page.click('#auth-btn')
        await page.wait_for_timeout(1500)
        await page.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page.fill('input[type="password"]', "123456")
        await page.click('#modal-submit')
        await page.wait_for_timeout(8000)
        await page.wait_for_function("() => typeof App !== 'undefined'")
        await page.wait_for_timeout(3000)

        # Add apiary via Storage.add
        await page.evaluate("""() => {
            BM.Storage.add('apiaries', { name: 'TEST-US', lat: 37.85, lng: 40.2, address: 'Diyarbakir' });
            return true;
        }""")
        await page.wait_for_timeout(500)

        # Get apiary id
        apiary_id = await page.evaluate("() => { const a = BM.Storage.list('apiaries')[0]; return a ? a.id : 'MISSING'; }")
        print(f"apiary_id: {apiary_id}")

        if apiary_id != 'MISSING':
            # Add hive
            await page.evaluate(f"""() => {{
                BM.Storage.add('hives', {{ name: 'TEST-Kovan', apiaryId: '{apiary_id}', strain: 'Anadolu', frameCount: 10 }});
                return true;
            }}""")
            await page.wait_for_timeout(200)

            hive_id = await page.evaluate("() => { const h = BM.Storage.list('hives')[0]; return h ? h.id : 'MISSING'; }")
            print(f"hive_id: {hive_id}")

            if hive_id != 'MISSING':
                # Add queen
                await page.evaluate(f"""() => {{
                    BM.Storage.add('queens', {{ name: 'Queen-Test', hiveId: '{hive_id}', apiaryId: '{apiary_id}', markingColor: 'Kırmızı' }});
                    return true;
                }}""")
                await page.wait_for_timeout(200)

        hives_count = await page.evaluate("() => BM.Storage.list('hives').length")
        apiaries_count = await page.evaluate("() => BM.Storage.list('apiaries').length")
        queens_count = await page.evaluate("() => BM.Storage.list('queens').length")
        uid = await page.evaluate("() => BM.Storage._userId()")
        print(f"\nLocal: {apiaries_count} apiaries, {hives_count} hives, {queens_count} queens")
        print(f"user_id: {uid}")

        # SYNC TO CLOUD
        sync = await page.evaluate("() => { return BM.Storage.syncFromCloud(true); }")
        print(f"syncFromCloud returned: {sync}")

        await page.wait_for_timeout(3000)

        # VERIFY CLOUD via direct Supabase API
        token = await page.evaluate("() => localStorage.getItem('beemaster-auth-token')")
        print(f"\nDirect API check (token: {token[:20]}...):")
        
        for table in ['apiaries', 'hives', 'queens']:
            resp = await page.evaluate(f"""async () => {{
                const r = await fetch('https://assfwtjbvuuxclioqsih.supabase.co/rest/v1/{table}?select=id&limit=1', {{
                    headers: {{ 'apikey': window.__SUPABASEKEYS___ ? window.__SUPABASELEYS__ : supabaseCfg.supabaseKey, 'Authorization': 'Bearer ' + localStorage.getItem('beemaster-auth-token') }}
                }});
                return {{ status: r.status, count: (await r.json()).length }};
            }}""")
            print(f"  {table}: status={resp['status']}")

        await browser.close()

asyncio.run(main())