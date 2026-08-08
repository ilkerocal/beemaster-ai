import asyncio
from playwright.async_api import async_playwright

async def test_async_callback():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        ctx = await browser.new_context()
        page = await ctx.new_page()

        page.on("console", lambda msg: print(f"[D] {msg.type}: {msg.text}") if msg.type in ('error', 'warning') else None)

        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle")
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
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
        await page.wait_for_timeout(5000)
        await page.evaluate("() => BM.Modal && BM.Modal.close()")
        await page.wait_for_timeout(500)

        # Test direct add
        print("=== Direct add test ===")
        result = await page.evaluate("""async () => {
            const before = BM.Storage.list('frames').length;
            console.log('Before frames:', before);
            const r = await BM.Storage.add('frames', {
                hiveId: 'test_hive_xyz', position: 1, frameType: 'brood',
                foundationType: 'wax', status: 'in_use', cyclesCompleted: 0, waxAgeMonths: 0
            });
            const after = BM.Storage.list('frames').length;
            console.log('After frames:', after);
            return { before, after, id: r.id };
        }""")
        print(f"Direct add result: {result}")

        # Test via BM.hives.add
        print("\n=== BM.hives.add test ===")
        # Create apiary first
        await page.evaluate("""async () => {
            const r = await BM.Storage.add('apiaries', { name: 'Test Apiary', location: 'Test', lat: 38, lng: 40 });
            window.__testApiaryId = r.id;
            console.log('Apiary created:', r.id);
        }""")

        await page.wait_for_timeout(1000)

        # Try BM.hives.add manually
        add_result = await page.evaluate("""async () => {
            try {
                const result = await BM.hives.add();  // Bu modal açacak, ama callback çalışacak mı?
                return { ok: true, result };
            } catch (e) {
                return { ok: false, error: e.message };
            }
        }""")
        print(f"BM.hives.add result: {add_result}")

        await browser.close()

asyncio.run(test_async_callback())