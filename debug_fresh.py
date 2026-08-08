import asyncio
from playwright.async_api import async_playwright
import time

async def debug_download_only():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        all_logs = []
        page.on("console", lambda msg: all_logs.append(f"[{msg.type}] {msg.text}"))

        # Fresh browser 2 - no localStorage at all
        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(5000)  # Wait for init

        print("=== Fresh browser - before login ===")
        before_login = await page.evaluate("""
            () => ({
                hives: BM.Storage.list('hives').length,
                hivesNames: BM.Storage.list('hives').map(h => h.name).sort(),
                apiaries: BM.Storage.list('apiaries').length
            })
        """)
        print(f"  {before_login}")

        print("\n=== Login... ===")
        await page.evaluate("async () => { await BM.Auth.signIn('adnanmurat021@gmail.com', '123456'); }")
        await page.wait_for_timeout(10000)

        after_login = await page.evaluate("""
            () => ({
                hives: BM.Storage.list('hives').map(h => h.name).sort(),
                apiaries: BM.Storage.list('apiaries').length,
                auth: BM.Auth.isAuthenticated()
            })
        """)
        print(f"  {after_login}")

        # Direct cloud check
        cloud = await page.evaluate("""
            async () => {
                const client = BM.Auth.getClient();
                const uid = BM.Auth.getUser()?.id;
                if (!uid) return { error: 'no uid' };
                const res = await client.from('hives').select('id,name').eq('user_id', uid);
                return {
                    count: res.data?.length || 0,
                    names: (res.data || []).map(h => h.name).sort(),
                    error: res.error?.message
                };
            }
        """)
        print(f"\n=== Cloud ===")
        print(f"  {cloud}")

        await browser.close()

asyncio.run(debug_download_only())