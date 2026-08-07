import asyncio
from playwright.async_api import async_playwright
import time

async def deep_debug_browser2():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        ctx = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await ctx.new_page()

        all_logs = []
        page.on("console", lambda msg: all_logs.append(f"[{msg.type}] {msg.text}"))

        # Fresh start
        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(3000)

        # Login
        await page.evaluate("async () => { await BM.Auth.signIn('adnanmurat021@gmail.com', '123456'); }")
        await page.wait_for_timeout(10000)

        # Check what happened
        info = await page.evaluate("""
            () => {
                const out = {
                    apiaries: BM.Storage.list('apiaries').length,
                    hives: BM.Storage.list('hives').length,
                    frames: BM.Storage.list('frames').length,
                    sessionKey: localStorage.getItem('sb-assfwtjbvuuxclioqsih-auth-token')?.substring(0, 50),
                    beemasterKeys: Object.keys(localStorage).filter(k => k.includes('beemaster'))
                };
                return out;
            }
        """)
        print(f"After login:")
        print(f"  apiaries: {info['apiaries']}")
        print(f"  hives: {info['hives']}")
        print(f"  frames: {info['frames']}")
        print(f"  sessionKey exists: {bool(info['sessionKey'])}")
        print(f"  beemaster keys: {info['beemasterKeys']}")

        # Now check cloud
        cloud = await page.evaluate("""
            async () => {
                const client = BM.Auth.getClient();
                const uid = BM.Auth.getUser().id;
                const hivesRes = await client.from('hives').select('id,name').eq('user_id', uid);
                return {
                    cloudHives: hivesRes.data?.length || 0,
                    cloudHivesNames: (hivesRes.data || []).map(h => h.name).sort()
                };
            }
        """)
        print(f"\nCloud:")
        print(f"  hives: {cloud['cloudHives']}")
        print(f"  names: {cloud['cloudHivesNames']}")

        # Manual loadFromCloud test - first reset state to empty
        print("\n=== Reset local state and re-run loadFromCloud ===")
        await page.evaluate("""
            () => {
                BM.Storage.state = {
                    apiaries: [], hives: [], queens: [], frames: [],
                    inspections: [], harvests: [], feedings: [],
                    treatments: [], diseases: [], inventory: []
                };
                BM.Storage.save();
            }
        """)
        await page.wait_for_timeout(1000)

        before_load = await page.evaluate("""
            () => ({
                hives: BM.Storage.list('hives').length,
                apiaries: BM.Storage.list('apiaries').length
            })
        """)
        print(f"  Before loadFromCloud: {before_load}")

        # Call loadFromCloud
        await page.evaluate("async () => { await BM.Storage.loadFromCloud(); }")
        await page.wait_for_timeout(5000)

        after_load = await page.evaluate("""
            () => ({
                hives: BM.Storage.list('hives').map(h => h.name).sort(),
                apiaries: BM.Storage.list('apiaries').length
            })
        """)
        print(f"  After loadFromCloud: hives={after_load['hives']}, apiaries={after_load['apiaries']}")

        await browser.close()

asyncio.run(deep_debug_browser2())