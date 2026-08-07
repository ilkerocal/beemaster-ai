import asyncio
from playwright.async_api import async_playwright

async def trace_cloud_sync():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()

        page.on("console", lambda msg: print(f"[CONSOLE] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[PAGE ERROR] {err}"))

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

        # Override console.warn to capture cloud sync warnings
        await page.evaluate("""() => {
            const origWarn = console.warn;
            window.__cloudErrors = [];
            console.warn = function(...args) {
                window.__cloudErrors.push(args.join(' '));
                origWarn.apply(console, args);
            };
        }""")

        # Add a real apiary using the app's Storage.add (which triggers _syncAdd)
        print("=== Calling BM.Storage.add('apiaries', ...) ===")
        result = await page.evaluate("""async () => {
            const r = await BM.Storage.add('apiaries', {
                name: 'Trace Test Üs',
                location: 'Trace Test',
                lat: 38.5,
                lng: 40.5,
                flora: 'Trace',
                notes: 'Trace test'
            });
            return { id: r.id, name: r.name };
        }""")
        print(f"Add result: {result}")

        # Wait for sync
        await page.wait_for_timeout(3000)

        # Get captured errors
        errors = await page.evaluate("() => window.__cloudErrors || []")
        print(f"\n=== Cloud sync warnings captured ({len(errors)}) ===")
        for e in errors:
            print(f"  {e}")

        # Try to fetch from cloud directly
        cloud_data = await page.evaluate("""async () => {
            const token = localStorage.getItem('beemaster-auth-token');
            const userId = BM.Auth.getUser().id;
            const r = await fetch('https://assfwtjbvuuxclioqsih.supabase.co/rest/v1/apiaries?user_id=eq.' + userId + '&select=*', {
                headers: {
                    'apikey': 'sb_publishable_3j7uCLoJRximHZjlAi4Frw_7HCwHm6M',
                    'Authorization': 'Bearer ' + token
                }
            });
            return { status: r.status, body: await r.text() };
        }""")
        print(f"\n=== Cloud fetch ===")
        print(f"Status: {cloud_data['status']}")
        print(f"Body: {cloud_data['body'][:1000]}")

        await browser.close()

asyncio.run(trace_cloud_sync())