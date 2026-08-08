import asyncio
from playwright.async_api import async_playwright
import time

async def full_cleanup():
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

        # Clean all orphan hives in cloud - keep only standard Kovan-01..07 with hv_X ids
        result = await page.evaluate("""
            async () => {
                const client = BM.Auth.getClient();
                const uid = BM.Auth.getUser().id;
                const out = {};

                const res = await client.from('hives').select('*').eq('user_id', uid);
                const allHives = res.data || [];

                // Delete: any hive with id starting with 'id_' (test hives)
                const orphans = allHives.filter(h => h.id.startsWith('id_'));
                out.orphansFound = orphans.length;

                for (const h of orphans) {
                    await client.from('queens').delete().eq('hive_id', h.id);
                    await client.from('frames').delete().eq('hive_id', h.id);
                    await client.from('inspections').delete().eq('hive_id', h.id);
                    await client.from('harvests').delete().eq('hive_id', h.id);
                    await client.from('feedings').delete().eq('hive_id', h.id);
                    await client.from('treatments').delete().eq('hive_id', h.id);
                    await client.from('diseases').delete().eq('hive_id', h.id);
                    await client.from('hives').delete().eq('id', h.id);
                }

                // Also delete orphan inspections/queens that don't have valid hives
                const orphanQs = await client.from('queens').select('*').eq('user_id', uid);
                const finalHives = await client.from('hives').select('id').eq('user_id', uid);
                const validHiveIds = new Set((finalHives.data || []).map(h => h.id));
                const orphanQ = (orphanQs.data || []).filter(q => !validHiveIds.has(q.hive_id));
                for (const q of orphanQ) await client.from('queens').delete().eq('id', q.id);
                out.orphanQueensRemoved = orphanQ.length;

                const orphanInsps = await client.from('inspections').select('*').eq('user_id', uid);
                const orphanI = (orphanInsps.data || []).filter(i => !validHiveIds.has(i.hive_id));
                for (const i of orphanI) await client.from('inspections').delete().eq('id', i.id);
                out.orphanInspectionsRemoved = orphanI.length;

                // Final state
                const fh = await client.from('hives').select('*').eq('user_id', uid);
                out.finalHives = (fh.data || []).map(h => ({ id: h.id, name: h.name }));

                return out;
            }
        """)
        print(f"=== Cleanup result ===")
        for k, v in result.items():
            if k != 'finalHives':
                print(f"  {k}: {v}")
        print(f"\n  finalHives: {result['finalHives']}")

        # Now reload local from cloud
        await page.evaluate("async () => { if(BM.Storage.loadFromCloud) await BM.Storage.loadFromCloud(); }")
        await page.wait_for_timeout(2000)

        local = await page.evaluate("""
            () => ({
                apiaries: BM.Storage.list('apiaries').map(a => a.name),
                hives: BM.Storage.list('hives').map(h => h.name).sort(),
                count: BM.Storage.list('hives').length
            })
        """)
        print(f"\n=== Final local state ===")
        print(f"  apiaries: {local['apiaries']}")
        print(f"  hives: {local['hives']}")

        await browser.close()

asyncio.run(full_cleanup())