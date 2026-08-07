import asyncio, time
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

        # Try different field names for queens
        tests = [
            {"name": "TEST-Q1", "hive_id": "x", "user_id": uid, "queen_name": "TEST-Q1"},
            {"name": "TEST-Q2", "hive_id": "x", "user_id": uid, "label": "TEST-Q2"},
            {"name": "TEST-Q3", "hive_id": "x", "user_id": uid, "notes": "TEST-Q3"},
            {"name": "TEST-Q4", "hive_id": "x", "user_id": uid, "title": "TEST-Q4"},
        ]
        
        for i, payload in enumerate(tests):
            r = await page.evaluate("""async function() {
                var r = await fetch('https://assfwtjbvuuxclioqsih.supabase.co/rest/v1/queens', {
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
            }""" % (token, __import__('json').dumps(payload)))
            print("Test %d (%s): %s" % (i, payload, r))

        await browser.close()

asyncio.run(main())