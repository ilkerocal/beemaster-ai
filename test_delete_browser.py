import asyncio
from playwright.async_api import async_playwright
import time

async def test_delete_in_one_browser_see_in_other():
    async with async_playwright() as p:
        # Browser 1: Login, delete Kovan-01
        browser1 = await p.chromium.launch(headless=False)
        ctx1 = await browser1.new_context(viewport={"width": 1280, "height": 800})
        page1 = await ctx1.new_page()

        await page1.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle", timeout=30000)
        await page1.evaluate("() => localStorage.clear()")
        await page1.reload(wait_until="networkidle")
        await page1.wait_for_timeout(3000)

        print("=" * 70)
        print("BROWSER 1: Login + delete Kovan-01")
        print("=" * 70)
        await page1.evaluate("async () => { await BM.Auth.signIn('adnanmurat021@gmail.com', '123456'); }")
        await page1.wait_for_timeout(8000)

        before = await page1.evaluate("""
            () => ({
                apiaries: BM.Storage.list('apiaries').length,
                hives: BM.Storage.list('hives').map(h => h.name).sort(),
                count: BM.Storage.list('hives').length
            })
        """)
        print(f"  Before delete: {before}")

        # Delete Kovan-01 using BM.hives.del
        delete_result = await page1.evaluate("""
            async () => {
                const h = BM.Storage.list('hives').find(x => x.name === 'Kovan-01');
                if (!h) return { error: 'Kovan-01 not found' };

                // Direct delete using Storage.remove (skips modal)
                await BM.Storage.remove('hives', h.id);
                await new Promise(r => setTimeout(r, 3000));

                // Verify in localStorage
                const stillExists = !!BM.Storage.list('hives').find(x => x.id === h.id);

                // Verify in cloud
                const client = BM.Auth.getClient();
                const cloudRes = await client.from('hives').select('*').eq('id', h.id);
                const cloudHasIt = (cloudRes.data || []).length > 0;

                return {
                    hiveId: h.id,
                    localStillExists: stillExists,
                    cloudStillExists: cloudHasIt,
                    localCount: BM.Storage.list('hives').length,
                    cloudError: cloudRes.error?.message
                };
            }
        """)
        print(f"  Delete result: {delete_result}")

        await page1.wait_for_timeout(3000)

        print("\n" + "=" * 70)
        print("BROWSER 2: Fresh browser, login")
        print("=" * 70)
        browser2 = await p.chromium.launch(headless=False)
        ctx2 = await browser2.new_context(viewport={"width": 1280, "height": 800})
        page2 = await ctx2.new_page()

        await page2.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle", timeout=30000)
        await page2.wait_for_timeout(3000)

        await page2.evaluate("async () => { await BM.Auth.signIn('adnanmurat021@gmail.com', '123456'); }")
        await page2.wait_for_timeout(10000)

        after = await page2.evaluate("""
            () => ({
                apiaries: BM.Storage.list('apiaries').length,
                hives: BM.Storage.list('hives').map(h => h.name).sort(),
                count: BM.Storage.list('hives').length,
                kovan01Exists: !!BM.Storage.list('hives').find(x => x.name === 'Kovan-01')
            })
        """)
        print(f"  Browser 2 state: {after}")

        if after['kovan01Exists']:
            print("\n*** BUG CONFIRMED: Kovan-01 came back in browser 2 ***")
        else:
            print("\n*** WORKING: Kovan-01 deleted and stays deleted ***")

        await browser1.close()
        await browser2.close()

asyncio.run(test_delete_in_one_browser_see_in_other())