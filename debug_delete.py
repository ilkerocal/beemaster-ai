import asyncio
from playwright.async_api import async_playwright
import time

async def debug_delete():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        all_logs = []
        page.on("console", lambda msg: all_logs.append(f"[{msg.type}] {msg.text}"))

        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle", timeout=30000)
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(3000)

        # Login
        await page.evaluate("async () => { await BM.Auth.signIn('adnanmurat021@gmail.com', '123456'); }")
        await page.wait_for_timeout(5000)

        # Try deleting one hive with detailed error catching
        result = await page.evaluate("""
            async () => {
                const client = BM.Auth.getClient();
                const uid = BM.Auth.getUser().id;

                // Try direct Supabase delete with error handling
                const hiveId = 'hv_1';
                try {
                    const res = await client.from('hives').delete().eq('id', hiveId).eq('user_id', uid);
                    return {
                        directDelete: { data: res.data, error: res.error?.message, status: res.status, statusText: res.statusText }
                    };
                } catch (e) {
                    return { error: e.message };
                }
            }
        """)
        print(f"Direct delete: {result}")

        # Now check if hive was deleted
        state = await page.evaluate("""
            async () => {
                const client = BM.Auth.getClient();
                const uid = BM.Auth.getUser().id;
                const res = await client.from('hives').select('id').eq('user_id', uid);
                const ids = res.data?.map(h => h.id) || [];
                return {
                    hv1Exists: ids.includes('hv_1'),
                    totalCount: ids.length,
                    ids: ids
                };
            }
        """)
        print(f"After direct delete: {state}")

        await browser.close()

asyncio.run(debug_delete())