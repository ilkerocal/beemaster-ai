import asyncio
from playwright.async_api import async_playwright
import time

async def clean_orphan():
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

        # Delete orphan hive 'kovan-01' and 'TEST 3 CERCEVE' (left from my tests)
        result = await page.evaluate("""
            async () => {
                const client = BM.Auth.getClient();
                const uid = BM.Auth.getUser().id;
                const out = {};

                const res = await client.from('hives').select('*').eq('user_id', uid);
                const allHives = res.data || [];

                // Delete: 'kovan-01' (lowercase k), 'TEST 3 CERCEVE' (my test)
                const toDelete = allHives.filter(h =>
                    h.name === 'kovan-01' ||
                    h.name === 'TEST 3 CERCEVE'
                );
                out.toDelete = toDelete.length;

                for (const h of toDelete) {
                    // Cascade delete
                    await client.from('queens').delete().eq('hive_id', h.id);
                    await client.from('frames').delete().eq('hive_id', h.id);
                    await client.from('inspections').delete().eq('hive_id', h.id);
                    await client.from('harvests').delete().eq('hive_id', h.id);
                    await client.from('feedings').delete().eq('hive_id', h.id);
                    await client.from('treatments').delete().eq('hive_id', h.id);
                    await client.from('diseases').delete().eq('hive_id', h.id);
                    await client.from('hives').delete().eq('id', h.id);
                }

                // Final check
                const final = await client.from('hives').select('*').eq('user_id', uid);
                out.finalHives = final.data?.map(h => h.name).sort();
                out.finalCount = final.data?.length || 0;

                // Also delete orphan queen/inspection records if any
                const orphanQueens = await client.from('queens').select('*').eq('user_id', uid);
                const validHiveIds = new Set(final.data?.map(h => h.id) || []);
                const orphanQ = (orphanQueens.data || []).filter(q => !validHiveIds.has(q.hive_id));
                for (const q of orphanQ) {
                    await client.from('queens').delete().eq('id', q.id);
                }
                out.orphanQueensDeleted = orphanQ.length;

                return out;
            }
        """)
        print(f"=== Cleanup ===")
        for k, v in result.items():
            print(f"  {k}: {v}")

        # Reload local state from cloud
        await page.evaluate("async () => { if(BM.Storage.loadFromCloud) await BM.Storage.loadFromCloud(); App.render('dashboard'); }")
        await page.wait_for_timeout(3000)

        local = await page.evaluate("""
            () => ({
                apiaries: BM.Storage.list('apiaries').map(a => a.name),
                hives: BM.Storage.list('hives').map(h => h.name).sort(),
                hivesCount: BM.Storage.list('hives').length,
                framesCount: BM.Storage.list('frames').length,
                queensCount: BM.Storage.list('queens').length
            })
        """)
        print(f"\n=== Final local state ===")
        print(f"  apiaries: {local['apiaries']}")
        print(f"  hives ({local['hivesCount']}): {local['hives']}")
        print(f"  frames: {local['framesCount']}")
        print(f"  queens: {local['queensCount']}")

        await browser.close()

asyncio.run(clean_orphan())