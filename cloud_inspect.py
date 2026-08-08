import asyncio
from playwright.async_api import async_playwright
import time

async def inspect_cloud():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle", timeout=30000)
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(3000)

        await page.evaluate("async () => { await BM.Auth.signIn('adnanmurat021@gmail.com', '123456'); }")
        await page.wait_for_timeout(5000)

        # List all your records in cloud
        details = await page.evaluate("""
            async () => {
                const client = BM.Auth.getClient();
                const uid = BM.Auth.getUser().id;
                const tables = ['apiaries', 'hives', 'queens', 'frames', 'inspections',
                               'harvests', 'feedings', 'treatments', 'diseases', 'inventory'];
                const result = {};
                for (const t of tables) {
                    const res = await client.from(t).select('*').eq('user_id', uid);
                    if (res.error) {
                        result[t] = { error: res.error.message };
                    } else {
                        result[t] = {
                            count: res.data?.length || 0,
                            items: (res.data || []).slice(0, 15).map(item => {
                                if (t === 'apiaries') return { id: item.id, name: item.name };
                                if (t === 'hives') return { id: item.id, name: item.name, apiary_id: item.apiary_id };
                                if (t === 'queens') return { id: item.id, hive_id: item.hive_id, strain: item.strain };
                                if (t === 'frames') return { id: item.id, hive_id: item.hive_id, frame_type: item.frame_type };
                                return { id: item.id };
                            })
                        };
                    }
                }
                return result;
            }
        """)

        print("=== YOUR CLOUD DATA ===\n")
        for table, info in details.items():
            if isinstance(info, dict) and 'error' in info:
                print(f"{table}: ERROR - {info['error']}")
            else:
                print(f"{table} ({info['count']} records):")
                for item in info['items']:
                    print(f"  {item}")
                print()

        await browser.close()

asyncio.run(inspect_cloud())