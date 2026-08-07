import asyncio
from playwright.async_api import async_playwright

async def inspect_schema():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        page.on("console", lambda msg: print(f"[CONSOLE] {msg.type}: {msg.text}") if msg.type == 'error' else None)

        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle")
        await page.wait_for_timeout(2000)

        # Login
        auth_btn = await page.wait_for_selector('#auth-btn', timeout=10000)
        await auth_btn.click()
        await page.wait_for_timeout(1000)
        email_input = await page.wait_for_selector('input[type="email"]', timeout=5000)
        pass_input = await page.wait_for_selector('input[type="password"]', timeout=5000)
        await email_input.fill("adnanmurat021@gmail.com")
        await pass_input.fill("123456")
        submit_btn = await page.wait_for_selector('#modal-submit', timeout=5000)
        await submit_btn.click()
        await page.wait_for_timeout(4000)
        await page.evaluate("() => BM.Modal && BM.Modal.close()")

        # Get access_token from localStorage
        token = await page.evaluate("() => localStorage.getItem('beemaster-auth-token')")
        user_id = await page.evaluate("() => BM.Auth.getUser()?.id")
        print(f"User ID: {user_id}")
        print(f"Token length: {len(token) if token else 0}")

        # Try to insert a test row with authenticated token to see schema errors
        result = await page.evaluate(f"""async () => {{
            const token = localStorage.getItem('beemaster-auth-token');
            const tables = ['apiaries', 'hives', 'queens', 'frames', 'inspections', 'harvests', 'feedings', 'treatments', 'diseases', 'inventory'];
            const userId = BM.Auth.getUser().id;
            const results = {{}};
            for (const t of tables) {{
                // Try insert with minimal data
                let testData = {{ id: 'schema_test_' + t, user_id: userId }};
                if (t === 'apiaries') testData = {{ ...testData, name: 'x', location: 'x' }};
                if (t === 'hives') testData = {{ ...testData, name: 'x', apiary_id: 'x' }};
                if (t === 'queens') testData = {{ ...testData, hive_id: 'x' }};
                if (t === 'frames') testData = {{ ...testData, hive_id: 'x', position: 1 }};
                if (t === 'inspections') testData = {{ ...testData, hive_id: 'x' }};
                if (t === 'harvests') testData = {{ ...testData, hive_id: 'x' }};
                if (t === 'feedings') testData = {{ ...testData, hive_id: 'x' }};
                if (t === 'treatments') testData = {{ ...testData, hive_id: 'x' }};
                if (t === 'diseases') testData = {{ ...testData, hive_id: 'x' }};
                if (t === 'inventory') testData = {{ ...testData, name: 'x' }};
                const r = await fetch('https://assfwtjbvuuxclioqsih.supabase.co/rest/v1/' + t, {{
                    method: 'POST',
                    headers: {{
                        'apikey': 'sb_publishable_3j7uCLoJRximHZjlAi4Frw_7HCwHm6M',
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    }},
                    body: JSON.stringify(testData)
                }});
                const body = await r.text();
                results[t] = {{ status: r.status, body: body.slice(0, 200) }};
            }}
            return results;
        }}""")

        for table, info in result.items():
            print(f"\n{table}: status={info['status']}")
            print(f"  body: {info['body']}")

        await browser.close()

asyncio.run(inspect_schema())