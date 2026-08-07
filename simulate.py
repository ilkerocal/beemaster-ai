import asyncio
from playwright.async_api import async_playwright
import time

async def simulate_user_flow():
    """Simulate user's exact flow: login → add → logout → reload → login → check"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        all_logs = []
        page.on("console", lambda msg: all_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: all_logs.append(f"[PAGE_ERROR] {err}"))

        print("=" * 70)
        print("STEP 1: Open page (fresh)")
        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle", timeout=30000)
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(4000)

        state = await page.evaluate("""
            () => ({
                auth: BM.Auth.isAuthenticated(),
                hives: BM.Storage.list('hives').length,
                apiaries: BM.Storage.list('apiaries').length,
                session: localStorage.getItem('bm-auth-session')
            })
        """)
        print(f"  auth={state['auth']}, hives={state['hives']}, apiaries={state['apiaries']}, session={state['session']}")

        print("\nSTEP 2: LOGIN as adnanmurat021@gmail.com / 123456")
        login = await page.evaluate("""
            async () => {
                try {
                    const r = await BM.Auth.signIn('adnanmurat021@gmail.com', '123456');
                    return { ok: !!r, email: r?.email };
                } catch (e) { return { error: e.message }; }
            }
        """)
        print(f"  Login: {login}")
        await page.wait_for_timeout(5000)  # Wait for syncFromCloud

        state = await page.evaluate("""
            () => ({
                auth: BM.Auth.isAuthenticated(),
                hives: BM.Storage.list('hives').length,
                apiaries: BM.Storage.list('apiaries').length
            })
        """)
        print(f"  After login: auth={state['auth']}, hives={state['hives']}, apiaries={state['apiaries']}")

        print("\nSTEP 3: Add custom apiary + hive")
        add = await page.evaluate("""
            async () => {
                try {
                    const apiary = await BM.Storage.add('apiaries', {
                        name: 'YENI US KULLANICI', lat: 37.85, lng: 40.05,
                        notes: 'Test', archived: false
                    });
                    const hive = await BM.Storage.add('hives', {
                        name: 'YENI KOVAN 1', apiaryId: apiary.id,
                        frameCount: 9, strain: 'carniolan',
                        boxType: 'langstroth', status: 'active',
                        nfcTag: 'YENI-USER-1'
                    });
                    const hive2 = await BM.Storage.add('hives', {
                        name: 'YENI KOVAN 2', apiaryId: apiary.id,
                        frameCount: 11, strain: 'buckfast',
                        boxType: 'dadant', status: 'active',
                        nfcTag: 'YENI-USER-2'
                    });
                    const hive3 = await BM.Storage.add('hives', {
                        name: 'YENI KOVAN 3', apiaryId: apiary.id,
                        frameCount: 6, strain: 'anatolian',
                        boxType: 'layens', status: 'active',
                        nfcTag: 'YENI-USER-3'
                    });
                    return { apiary: apiary.id, hives: [hive.id, hive2.id, hive3.id] };
                } catch (e) { return { error: e.message }; }
            }
        """)
        print(f"  Add result: {add}")
        await page.wait_for_timeout(5000)  # Wait for Supabase sync

        state = await page.evaluate("""
            () => {
                const apiaries = BM.Storage.list('apiaries');
                const hives = BM.Storage.list('hives');
                return {
                    auth: BM.Auth.isAuthenticated(),
                    apiaries: apiaries.map(a => a.name),
                    hives: hives.map(h => h.name + ' (frameCount=' + h.frameCount + ', nfc=' + (h.nfcTag || '').substring(0,15) + ')')
                };
            }
        """)
        print(f"  After add: {state}")

        # Now check what's in Supabase directly via JS
        print("\nSTEP 4: Query Supabase directly")
        cloud = await page.evaluate("""
            async () => {
                const client = BM.Auth.getClient();
                if (!client) return { error: 'No client' };
                const uid = BM.Auth.getUser().id;
                try {
                    const apiaries = await client.from('apiaries').select('*').eq('user_id', uid);
                    const hives = await client.from('hives').select('*').eq('user_id', uid);
                    return {
                        apiariesCount: apiaries.data?.length || 0,
                        apiariesError: apiaries.error?.message,
                        hivesCount: hives.data?.length || 0,
                        hivesError: hives.error?.message,
                        apiariesSample: apiaries.data?.slice(0, 2).map(a => ({ name: a.name, user_id: a.user_id })),
                        hivesSample: hives.data?.slice(0, 3).map(h => ({ name: h.name, user_id: h.user_id, frame_count: h.frame_count }))
                    };
                } catch (e) {
                    return { error: e.message };
                }
            }
        """)
        print(f"  Cloud: {cloud}")

        print("\nSTEP 5: SIGN OUT")
        await page.evaluate("() => BM.Auth.signOut()")
        await page.wait_for_timeout(2000)

        print("\nSTEP 6: Clear localStorage and reload (simulate fresh browser)")
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(4000)

        state = await page.evaluate("""
            () => ({
                auth: BM.Auth.isAuthenticated(),
                hives: BM.Storage.list('hives').length,
                apiaries: BM.Storage.list('apiaries').length,
                hivesSample: BM.Storage.list('hives').slice(0, 3).map(h => h.name),
                apiariesSample: BM.Storage.list('apiaries').map(a => a.name)
            })
        """)
        print(f"  After clear+reload: {state}")

        print("\nSTEP 7: LOGIN again")
        login2 = await page.evaluate("""
            async () => {
                try {
                    const r = await BM.Auth.signIn('adnanmurat021@gmail.com', '123456');
                    return { ok: !!r };
                } catch (e) { return { error: e.message }; }
            }
        """)
        print(f"  Login 2: {login2}")
        await page.wait_for_timeout(8000)  # Wait for full sync

        state = await page.evaluate("""
            () => {
                const apiaries = BM.Storage.list('apiaries');
                const hives = BM.Storage.list('hives');
                return {
                    auth: BM.Auth.isAuthenticated(),
                    apiaries: apiaries.map(a => a.name),
                    hives: hives.map(h => h.name + ' (frameCount=' + h.frameCount + ', nfc=' + (h.nfcTag || '').substring(0,15) + ')')
                };
            }
        """)
        print(f"\n  FINAL STATE after login 2:")
        print(f"  auth: {state['auth']}")
        print(f"  apiaries ({len(state['apiaries'])}): {state['apiaries']}")
        print(f"  hives ({len(state['hives'])}):")
        for h in state['hives']:
            print(f"    - {h}")

        # Diagnostic
        has_yeni = any('YENI' in h for h in state['hives'])
        if has_yeni:
            print("\n*** DATA PRESERVED - WORKS ***")
        else:
            print("\n*** DATA LOST - BUG CONFIRMED ***")
            print("YENI KOVAN should be in list but isn't!")

        print("\n=== CONSOLE LOGS ===")
        for log in all_logs[-25:]:
            print(f"  {log[:200]}")

        await browser.close()

asyncio.run(simulate_user_flow())