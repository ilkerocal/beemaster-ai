import asyncio
from playwright.async_api import async_playwright
import time

async def test_delete_persistence():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        all_logs = []
        page.on("console", lambda msg: all_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: all_logs.append(f"[PAGE_ERROR] {err}"))

        # Fresh load
        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle", timeout=30000)
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(4000)

        print("STEP 1: Login as adnanmurat021@gmail.com")
        await page.evaluate("""
            async () => { await BM.Auth.signIn('adnanmurat021@gmail.com', '123456'); }
        """)
        await page.wait_for_timeout(8000)

        state = await page.evaluate("""
            () => ({
                auth: BM.Auth.isAuthenticated(),
                apiaries: BM.Storage.list('apiaries').map(a => a.name),
                hives: BM.Storage.list('hives').map(h => h.name),
                apiariesCount: BM.Storage.list('apiaries').length,
                hivesCount: BM.Storage.list('hives').length
            })
        """)
        print(f"  After login: apiaries={state['apiariesCount']}, hives={state['hivesCount']}")
        print(f"  Apiaries: {state['apiaries']}")
        print(f"  Hives (first 5): {state['hives'][:5]}")

        print("\nSTEP 2: Delete 3 hives via Storage.remove")
        delete_result = await page.evaluate("""
            async () => {
                const hives = BM.Storage.list('hives');
                // Delete the LAST 3 hives
                const toDelete = hives.slice(-3);
                const deletedIds = [];
                for (const h of toDelete) {
                    const result = await BM.Storage.remove('hives', h.id);
                    deletedIds.push({ id: h.id, name: h.name, result: result === undefined ? 'undefined' : 'ok' });
                }
                return {
                    deleted: deletedIds,
                    remaining: BM.Storage.list('hives').length,
                    localStorageHives: JSON.parse(localStorage.getItem('beemaster-v4') || '{}').hives?.length || 0
                };
            }
        """)
        print(f"  Delete result: {delete_result}")
        await page.wait_for_timeout(5000)  # Wait for Supabase sync

        state = await page.evaluate("""
            () => ({
                hives: BM.Storage.list('hives').length,
                localStorageHives: JSON.parse(localStorage.getItem('beemaster-v4') || '{}').hives?.length || 0
            })
        """)
        print(f"  After delete: state.hives={state['hives']}, localStorage hives={state['localStorageHives']}")

        # Check cloud
        cloud = await page.evaluate("""
            async () => {
                const client = BM.Auth.getClient();
                const uid = BM.Auth.getUser().id;
                const res = await client.from('hives').select('*').eq('user_id', uid);
                return {
                    cloudCount: res.data?.length || 0,
                    cloudError: res.error?.message
                };
            }
        """)
        print(f"  Cloud hives: {cloud}")

        print("\nSTEP 3: HARD RELOAD")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(10000)  # Wait for auth + sync

        state = await page.evaluate("""
            () => ({
                auth: BM.Auth.isAuthenticated(),
                apiaries: BM.Storage.list('apiaries').length,
                hives: BM.Storage.list('hives').length,
                localStorageHives: JSON.parse(localStorage.getItem('beemaster-v4') || '{}').hives?.length || 0
            })
        """)
        print(f"  After reload: {state}")

        if state['hives'] > 10:
            print(f"\n*** BUG: {state['hives']} hives after deleting 3! ***")

        print(f"\n=== LOGS ===")
        for log in all_logs[-20:]:
            print(f"  {log[:250]}")

        await browser.close()

asyncio.run(test_delete_persistence())