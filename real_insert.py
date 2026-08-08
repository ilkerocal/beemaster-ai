import asyncio
from playwright.async_api import async_playwright

async def real_insert():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        page.on("console", lambda msg: print(f"[CONSOLE] {msg.type}: {msg.text}") if msg.type == 'error' else None)

        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle")
        await page.wait_for_timeout(2000)

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

        # Try to insert an apiary with all camelCase + snake_case fields via fetch
        result = await page.evaluate("""async () => {
            const token = localStorage.getItem('beemaster-auth-token');
            const userId = BM.Auth.getUser().id;

            // Try full payload as the app sends it (camelCase + extras)
            const payload = {
                id: 'real_test_001',
                name: 'Test Üs Real',
                location: 'Test Konum',
                lat: 38.247,
                lng: 40.135,
                flora: 'Test Flora',
                notes: 'Test',
                archived: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                user_id: userId
            };
            const r = await fetch('https://assfwtjbvuuxclioqsih.supabase.co/rest/v1/apiaries', {
                method: 'POST',
                headers: {
                    'apikey': 'sb_publishable_3j7uCLoJRximHZjlAi4Frw_7HCwHm6M',
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const body = await r.text();
            return { status: r.status, body: body };
        }""")
        print(f"Real insert: status={result['status']}")
        print(f"Body: {result['body']}")

        await browser.close()

asyncio.run(real_insert())