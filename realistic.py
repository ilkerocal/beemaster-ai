import asyncio
from playwright.async_api import async_playwright
import time

async def realistic_test():
    """Realistic flow: login → add → signOut → reload (session cleared but localStorage not) → login again"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        all_logs = []
        page.on("console", lambda msg: all_logs.append(f"[{msg.type}] {msg.text}"))

        print("=" * 70)
        print("STEP 1: Open page (fresh)")
        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle", timeout=30000)
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(4000)

        print("\nSTEP 2: LOGIN")
        await page.evaluate("""
            async () => { await BM.Auth.signIn('adnanmurat021@gmail.com', '123456'); }
        """)
        await page.wait_for_timeout(8000)  # Wait for loadFromCloud

        state = await page.evaluate("""
            () => ({
                auth: BM.Auth.isAuthenticated(),
                hives: BM.Storage.list('hives').length,
                apiaries: BM.Storage.list('apiaries').length,
                session: !!localStorage.getItem('bm-auth-session')
            })
        """)
        print(f"  After login: {state}")

        print("\nSTEP 3: Add custom apiary + 3 hives")
        add = await page.evaluate("""
            async () => {
                const apiary = await BM.Storage.add('apiaries', {
                    name: 'GERCEK KULLANICI US', lat: 37.85, lng: 40.05
                });
                const hive = await BM.Storage.add('hives', {
                    name: 'GERCEK KOVAN 1', apiaryId: apiary.id,
                    frameCount: 9, strain: 'carniolan',
                    boxType: 'langstroth', status: 'active'
                });
                const hive2 = await BM.Storage.add('hives', {
                    name: 'GERCEK KOVAN 2', apiaryId: apiary.id,
                    frameCount: 11, strain: 'buckfast',
                    boxType: 'dadant', status: 'active'
                });
                const hive3 = await BM.Storage.add('hives', {
                    name: 'GERCEK KOVAN 3', apiaryId: apiary.id,
                    frameCount: 6, strain: 'anatolian',
                    boxType: 'layens', status: 'active'
                });
                return { apiary: apiary.id };
            }
        """)
        print(f"  Added: {add}")
        await page.wait_for_timeout(5000)

        state = await page.evaluate("""
            () => {
                const apiaries = BM.Storage.list('apiaries');
                const hives = BM.Storage.list('hives');
                return {
                    auth: BM.Auth.isAuthenticated(),
                    apiaries: apiaries.map(a => a.name),
                    hives: hives.map(h => h.name),
                    session: !!localStorage.getItem('bm-auth-session')
                };
            }
        """)
        print(f"  After add: {state}")

        # Check Supabase directly
        cloud = await page.evaluate("""
            async () => {
                const client = BM.Auth.getClient();
                const uid = BM.Auth.getUser().id;
                const apiaries = await client.from('apiaries').select('*').eq('user_id', uid);
                const hives = await client.from('hives').select('*').eq('user_id', uid);
                const myApiaries = apiaries.data?.filter(a => a.name.includes('GERCEK'));
                const myHives = hives.data?.filter(h => h.name.includes('GERCEK'));
                return {
                    myApiariesCount: myApiaries?.length || 0,
                    myHivesCount: myHives?.length || 0,
                    myHivesNames: myHives?.map(h => h.name) || []
                };
            }
        """)
        print(f"  Cloud has my data: {cloud}")

        print("\nSTEP 4: SIGN OUT")
        await page.evaluate("() => BM.Auth.signOut()")
        await page.wait_for_timeout(2000)

        print("\nSTEP 5: Reload (session cleared by signOut, but localStorage kept)")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(4000)

        state = await page.evaluate("""
            () => ({
                auth: BM.Auth.isAuthenticated(),
                hives: BM.Storage.list('hives').length,
                apiaries: BM.Storage.list('apiaries').length,
                session: !!localStorage.getItem('bm-auth-session'),
                sessionContent: localStorage.getItem('bm-auth-session')?.substring(0, 50)
            })
        """)
        print(f"  After signOut+reload: {state}")

        print("\nSTEP 6: LOGIN again")
        await page.evaluate("""
            async () => { await BM.Auth.signIn('adnanmurat021@gmail.com', '123456'); }
        """)
        await page.wait_for_timeout(10000)  # Wait for loadFromCloud

        state = await page.evaluate("""
            () => {
                const apiaries = BM.Storage.list('apiaries');
                const hives = BM.Storage.list('hives');
                return {
                    auth: BM.Auth.isAuthenticated(),
                    apiaries: apiaries.map(a => a.name),
                    hives: hives.map(h => h.name + ' (frameCount=' + h.frameCount + ')'),
                    session: !!localStorage.getItem('bm-auth-session')
                };
            }
        """)
        print(f"  After login 2: {state}")

        has_gercek = any('GERCEK' in h for h in state['hives'])
        if has_gercek:
            print("\n*** DATA PRESERVED - WORKS ***")
        else:
            print("\n*** DATA LOST ***")

        print(f"\n=== LOGS ===")
        for log in all_logs[-30:]:
            print(f"  {log[:250]}")

        await browser.close()

asyncio.run(realistic_test())