import asyncio
from playwright.async_api import async_playwright
import time

async def simulate_real_user():
    """Simulate exact user flow: login → delete hive → reload → check"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        all_logs = []
        page.on("console", lambda msg: all_logs.append(f"[{msg.type}] {msg.text}"))

        print("=" * 70)
        print("STEP 1: Open page, fresh localStorage")
        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle", timeout=30000)
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(3000)

        print("\nSTEP 2: Login as adnanmurat021@gmail.com / 123456")
        await page.evaluate("async () => { await BM.Auth.signIn('adnanmurat021@gmail.com', '123456'); }")
        await page.wait_for_timeout(8000)

        state = await page.evaluate("""
            () => ({
                apiaries: BM.Storage.list('apiaries').map(a => a.name),
                hives: BM.Storage.list('hives').map(h => h.name),
                apiariesCount: BM.Storage.list('apiaries').length,
                hivesCount: BM.Storage.list('hives').length
            })
        """)
        print(f"  After login: {state}")

        print("\nSTEP 3: Delete Kovan-01 (your flow)")
        # First navigate to hives
        await page.evaluate("() => App.nav('hives')")
        await page.wait_for_timeout(1000)

        # Click the Sil button on Kovan-01
        delete_result = await page.evaluate("""
            async () => {
                const hive = BM.Storage.list('hives').find(h => h.name === 'Kovan-01');
                if (!hive) return { error: 'Kovan-01 not found' };

                // Direct call to del
                const before = BM.Storage.list('hives').length;

                // Call BM.hives.del - it will show confirm modal
                BM.hives.del(hive.id);

                // Wait for modal
                await new Promise(r => setTimeout(r, 500));

                // Click Evet (yes) in confirm modal
                const yesBtn = document.querySelector('#confirm-yes');
                if (!yesBtn) return { error: 'confirm button not found', modalExists: !!document.querySelector('.modal-overlay--active') };
                yesBtn.click();
                await new Promise(r => setTimeout(r, 3000));

                const after = BM.Storage.list('hives').length;
                return {
                    before, after,
                    hiveId: hive.id,
                    hiveStillExists: !!BM.Storage.list('hives').find(h => h.id === hive.id),
                    framesForHive: BM.Storage.list('frames').filter(f => f.hiveId === hive.id).length
                };
            }
        """)
        print(f"  Delete result: {delete_result}")

        # Check cloud directly
        cloud = await page.evaluate("""
            async () => {
                const client = BM.Auth.getClient();
                const uid = BM.Auth.getUser().id;
                const res = await client.from('hives').select('*').eq('user_id', uid);
                const kovan01 = res.data?.find(h => h.name === 'Kovan-01');
                return {
                    cloudHives: res.data?.length || 0,
                    cloudHivesNames: res.data?.map(h => h.name).sort(),
                    kovan01InCloud: !!kovan01,
                    kovan01FrameCount: kovan01?.frame_count
                };
            }
        """)
        print(f"  Cloud state: {cloud}")

        print("\nSTEP 4: HARD RELOAD (user's action)")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(10000)  # Wait for full auth + sync

        state_after_reload = await page.evaluate("""
            () => ({
                apiaries: BM.Storage.list('apiaries').map(a => a.name),
                hives: BM.Storage.list('hives').map(h => h.name),
                hivesCount: BM.Storage.list('hives').length,
                kovan01Exists: !!BM.Storage.list('hives').find(h => h.name === 'Kovan-01')
            })
        """)
        print(f"  After reload: {state_after_reload}")

        # Direct cloud check after reload
        cloud_after = await page.evaluate("""
            async () => {
                const client = BM.Auth.getClient();
                const uid = BM.Auth.getUser().id;
                const res = await client.from('hives').select('*').eq('user_id', uid);
                return {
                    cloudHives: res.data?.length || 0,
                    cloudHivesNames: res.data?.map(h => h.name).sort(),
                    kovan01InCloud: !!res.data?.find(h => h.name === 'Kovan-01')
                };
            }
        """)
        print(f"  Cloud after reload: {cloud_after}")

        if state_after_reload['kovan01Exists']:
            print("\n*** BUG CONFIRMED: Kovan-01 came back after reload ***")
        else:
            print("\n*** Kovan-01 deleted and stayed deleted - WORKING ***")

        await browser.close()

asyncio.run(simulate_real_user())