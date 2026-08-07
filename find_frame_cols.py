import asyncio, time, json
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        ctx = await browser.new_context()
        page = await ctx.new_page()

        await page.goto("https://beemaster-ai.vercel.app/?t=%d" % int(time.time()), wait_until="networkidle")
        await page.wait_for_timeout(2000)
        await page.click('#auth-btn'); await page.wait_for_timeout(1500)
        await page.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page.fill('input[type="password"]', "123456")
        await page.click('#modal-submit')
        await page.wait_for_timeout(8000)
        await page.wait_for_function("() => typeof App !== 'undefined'")
        await page.wait_for_timeout(2000)

        token = await page.evaluate("() => localStorage.getItem('beemaster-auth-token')")
        uid = await page.evaluate("() => BM.Storage._userId()")

        # Try different columns for frames table
        tests = [
            {"hive_id": "x", "user_id": uid, "position": 1, "notes": "brood"},
            {"hive_id": "x", "user_id": uid, "position": 2, "frame_type": "brood"},
            {"hive_id": "x", "user_id": uid, "position": 3, "type": "brood"},
            {"hive_id": "x", "user_id": uid, "position": 4, "data": '{"type":"brood"}'},
        ]
        
        for i, payload in enumerate(tests):
            r = await page.evaluate("""async function() {
                var r = await fetch('https://assfwtjbvuuxclioqsih.supabase.co/rest/v1/frames', {
                    method: 'POST',
                    headers: {
                        'apikey': 'sb_publishable_3j7uCLoJRximHZjlAi4Frw_7HCwHm6M',
                        'Authorization': 'Bearer %s',
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify(%s)
                });
                return { status: r.status, text: await r.text() };
            }""" % (token, json.dumps(payload)))
            ok = "OK" if r['status'] == 201 else "FAIL"
            msg = r.get('text','')[:80]
            print("Test %d (%s): %s | %s" % (i, json.dumps(payload)[:60], ok, msg))

        await browser.close()

asyncio.run(main())