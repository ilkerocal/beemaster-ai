import asyncio
from playwright.async_api import async_playwright
import time

async def cleanup():
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

        await page.evaluate("async () => { await BM.Auth.signIn('adnanmurat021@gmail.com', '123456'); }")
        await page.wait_for_timeout(5000)

        # Delete test apiaries (keep ap_1, ap_2, and id_mrszfx3* duplicates of Eğil/Surlar)
        result = await page.evaluate("""
            async () => {
                const client = BM.Auth.getClient();
                const uid = BM.Auth.getUser().id;
                const out = {};

                // 1. Delete test apiary names
                const apiariesRes = await client.from('apiaries').select('*').eq('user_id', uid);
                const allApiaries = apiariesRes.data || [];
                const toDeleteApiaries = allApiaries.filter(a =>
                    a.name === 'Test Üs Kullanıcı' ||
                    a.name === 'YENI US KULLANICI' ||
                    a.name === 'GERCEK KULLANICI US'
                );
                for (const a of toDeleteApiaries) {
                    // First delete related hives
                    await client.from('hives').delete().eq('apiary_id', a.id);
                    await client.from('apiaries').delete().eq('id', a.id);
                }
                out.deletedApiaries = toDeleteApiaries.length;

                // 2. Delete duplicate apiaries (Eğil Merkez / Surlar Üssü with id_ prefix - keep ap_1, ap_2)
                const dupes = allApiaries.filter(a =>
                    (a.name === 'Eğil Merkez' || a.name === 'Surlar Üssü') &&
                    a.id.startsWith('id_')
                );
                for (const a of dupes) {
                    await client.from('hives').delete().eq('apiary_id', a.id);
                    await client.from('apiaries').delete().eq('id', a.id);
                }
                out.deletedDupes = dupes.length;

                // 3. Check for orphan hives (hives without valid apiary_id)
                const hivesRes = await client.from('hives').select('*').eq('user_id', uid);
                const allHives = hivesRes.data || [];
                const apiaryIds = new Set((await client.from('apiaries').select('id').eq('user_id', uid)).data.map(a => a.id));
                const orphans = allHives.filter(h => h.apiary_id && !apiaryIds.has(h.apiary_id));
                out.orphanHives = orphans.length;

                // 4. Delete id_ prefixed hives (test hives)
                const testHives = allHives.filter(h => h.id.startsWith('id_'));
                for (const h of testHives) {
                    await client.from('queens').delete().eq('hive_id', h.id);
                    await client.from('frames').delete().eq('hive_id', h.id);
                    await client.from('inspections').delete().eq('hive_id', h.id);
                    await client.from('harvests').delete().eq('hive_id', h.id);
                    await client.from('feedings').delete().eq('hive_id', h.id);
                    await client.from('treatments').delete().eq('hive_id', h.id);
                    await client.from('diseases').delete().eq('hive_id', h.id);
                    await client.from('hives').delete().eq('id', h.id);
                }
                out.deletedTestHives = testHives.length;

                // 5. Final state
                const finalApiaries = await client.from('apiaries').select('*').eq('user_id', uid);
                const finalHives = await client.from('hives').select('*').eq('user_id', uid);
                out.finalApiaries = finalApiaries.data?.length || 0;
                out.finalApiariesNames = finalApiaries.data?.map(a => a.name);
                out.finalHives = finalHives.data?.length || 0;

                return out;
            }
        """)
        print(f"=== Cleanup result ===")
        for k, v in result.items():
            print(f"  {k}: {v}")

        # Reload local state
        await page.wait_for_timeout(3000)
        await page.evaluate("async () => { if(BM.Storage.loadFromCloud) await BM.Storage.loadFromCloud(); App.render('dashboard'); }")
        await page.wait_for_timeout(3000)

        state = await page.evaluate("""
            () => ({
                apiaries: BM.Storage.list('apiaries').map(a => a.name),
                hives: BM.Storage.list('hives').length
            })
        """)
        print(f"\n=== After cleanup ===")
        print(f"  apiaries: {state['apiaries']}")
        print(f"  hives: {state['hives']}")

        await browser.close()

asyncio.run(cleanup())