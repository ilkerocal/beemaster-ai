import asyncio
from playwright.async_api import async_playwright
import time

async def test_full_flow():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        all_logs = []
        page.on("console", lambda msg: all_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: all_logs.append(f"[PAGE_ERROR] {err}"))

        # First clear any existing session
        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle", timeout=30000)
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(3000)

        # Try login with test credentials
        print("1. Attempting login with test credentials...")
        login_result = await page.evaluate("""
            async () => {
                try {
                    const result = await BM.Auth.signIn('adnanmurat021@gmail.com', '123456');
                    return { success: !!result, result: result ? { id: result.id, email: result.email } : null };
                } catch (e) {
                    return { error: e.message, stack: e.stack };
                }
            }
        """)
        print(f"   Login result: {login_result}")
        await page.wait_for_timeout(2000)

        # Check if logged in
        is_auth = await page.evaluate("() => BM.Auth.isAuthenticated && BM.Auth.isAuthenticated()")
        user = await page.evaluate("() => BM.Auth.getUser && BM.Auth.getUser()")
        print(f"   isAuthenticated: {is_auth}")
        print(f"   User: {user}")

        # Now add a custom hive
        print("\n2. Adding custom hive...")
        # First add a custom apiary
        add_result = await page.evaluate("""
            async () => {
                try {
                    const apiary = await BM.Storage.add('apiaries', {
                        name: 'Test Üs Kullanıcı',
                        lat: 37.85, lng: 40.05,
                        notes: 'Test amaçlı'
                    });
                    const hive = await BM.Storage.add('hives', {
                        name: 'KOVAN KULLANICI-1',
                        apiaryId: apiary.id,
                        frameCount: 8,
                        strain: 'anatolian',
                        boxType: 'langstroth',
                        status: 'active',
                        nfcTag: 'TEST-USER-1',
                        installedAt: new Date().toISOString().split('T')[0],
                        notes: 'Kullanıcı tarafından eklendi'
                    });
                    return { apiary: apiary.id, hive: hive.id };
                } catch (e) {
                    return { error: e.message };
                }
            }
        """)
        print(f"   Add result: {add_result}")

        # Wait for Supabase sync
        await page.wait_for_timeout(3000)

        # Check state
        hives = await page.evaluate("() => BM.Storage.list('hives')")
        print(f"\n3. Hives after add: {len(hives)}")
        for h in hives:
            print(f"   - {h['name']} (frameCount={h.get('frameCount')}, nfcTag={h.get('nfcTag', '')[:20]})")

        # Sign out
        print("\n4. Signing out...")
        await page.evaluate("() => BM.Auth.signOut()")
        await page.wait_for_timeout(2000)

        # Clear localStorage to simulate fresh browser
        await page.evaluate("() => localStorage.clear()")

        # Reload - should init with empty localStorage -> seedData() -> 7 demo hives
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(5000)

        # Check what we got
        hives_after_reload = await page.evaluate("() => BM.Storage.list('hives')")
        print(f"\n5. After reload + clear LS (no login): {len(hives_after_reload)} hives")
        for h in hives_after_reload[:3]:
            print(f"   - {h['name']}")

        # Login again
        print("\n6. Logging in again...")
        login2 = await page.evaluate("""
            async () => {
                try {
                    const result = await BM.Auth.signIn('adnanmurat021@gmail.com', '123456');
                    return { success: !!result, email: result?.email };
                } catch (e) {
                    return { error: e.message };
                }
            }
        """)
        print(f"   Login 2 result: {login2}")
        await page.wait_for_timeout(5000)  # Wait for sync

        # Check final state
        hives_final = await page.evaluate("() => BM.Storage.list('hives')")
        print(f"\n7. After login 2: {len(hives_final)} hives")
        for h in hives_final:
            print(f"   - {h['name']} (frameCount={h.get('frameCount')}, nfcTag={h.get('nfcTag', '')[:30]})")

        # Check apiaries too
        apiaries_final = await page.evaluate("() => BM.Storage.list('apiaries')")
        print(f"\n   Apiaries: {len(apiaries_final)}")
        for a in apiaries_final:
            print(f"   - {a['name']}")

        print(f"\n=== LOGS (last 30) ===")
        for log in all_logs[-30:]:
            print(f"  {log[:300]}")

        await browser.close()

asyncio.run(test_full_flow())