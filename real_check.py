import asyncio
from playwright.async_api import async_playwright
import time

async def check_real_state():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle", timeout=30000)
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(3000)

        await page.evaluate("async () => { await BM.Auth.signIn('adnanmurat021@gmail.com', '123456'); }")
        await page.wait_for_timeout(8000)

        # Detailed check
        info = await page.evaluate("""
            async () => {
                const client = BM.Auth.getClient();
                const uid = BM.Auth.getUser().id;
                const out = {};

                // Cloud
                const cloudRes = await client.from('hives').select('id,name,frame_count,updated_at').eq('user_id', uid);
                out.cloudHives = (cloudRes.data || []).map(h => ({
                    id: h.id, name: h.name, frame_count: h.frame_count, updated_at: h.updated_at
                }));

                // Local
                out.localHives = BM.Storage.list('hives').map(h => ({
                    id: h.id, name: h.name, frameCount: h.frameCount, updatedAt: h.updatedAt
                }));

                // Apiaries
                const apRes = await client.from('apiaries').select('id,name').eq('user_id', uid);
                out.cloudApiaries = apRes.data || [];
                out.localApiaries = BM.Storage.list('apiaries').map(a => ({id: a.id, name: a.name}));

                return out;
            }
        """)

        print("=== APIARIES ===")
        print("Cloud:", info['cloudApiaries'])
        print("Local:", info['localApiaries'])

        print("\n=== HIVES ===")
        print(f"Cloud ({len(info['cloudHives'])} records):")
        for h in info['cloudHives']:
            print(f"  {h}")
        print(f"\nLocal ({len(info['localHives'])} records):")
        for h in info['localHives']:
            print(f"  {h}")

        await browser.close()

asyncio.run(check_real_state())