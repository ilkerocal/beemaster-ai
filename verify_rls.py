import asyncio
from playwright.async_api import async_playwright
import time

async def verify_rls():
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

        # Login
        await page.evaluate("async () => { await BM.Auth.signIn('adnanmurat021@gmail.com', '123456'); }")
        await page.wait_for_timeout(8000)

        state = await page.evaluate("""
            () => ({
                auth: BM.Auth.isAuthenticated(),
                user: BM.Auth.getUser()?.email,
                userId: BM.Auth.getUser()?.id,
                apiaries: BM.Storage.list('apiaries').length,
                apiariesNames: BM.Storage.list('apiaries').map(a => a.name),
                hives: BM.Storage.list('hives').length,
                hivesNames: BM.Storage.list('hives').map(h => h.name)
            })
        """)
        print(f"=== After login ===")
        print(f"  auth: {state['auth']}")
        print(f"  user: {state['user']}")
        print(f"  userId: {state['userId']}")
        print(f"  apiaries: {state['apiaries']}")
        print(f"  apiariesNames: {state['apiariesNames']}")
        print(f"  hives: {state['hives']}")
        print(f"  hivesNames: {state['hivesNames']}")

        # Query Supabase directly to verify RLS is working
        cloud_check = await page.evaluate("""
            async () => {
                const client = BM.Auth.getClient();
                const uid = BM.Auth.getUser().id;
                const apiaries = await client.from('apiaries').select('*').eq('user_id', uid);
                const hives = await client.from('hives').select('*').eq('user_id', uid);

                // Try without user_id filter (should be blocked by RLS if working)
                const allApiaries = await client.from('apiaries').select('*');
                const allHives = await client.from('hives').select('*');

                return {
                    myApiaries: apiaries.data?.length || 0,
                    myHives: hives.data?.length || 0,
                    allApiaries: allApiaries.data?.length || 0,
                    allHives: allHives.data?.length || 0,
                    apiariesError: apiaries.error?.message,
                    allApiariesError: allApiaries.error?.message
                };
            }
        """)
        print(f"\n=== Cloud check ===")
        print(f"  My apiaries: {cloud_check['myApiaries']}")
        print(f"  My hives: {cloud_check['myHives']}")
        print(f"  ALL apiaries (RLS test): {cloud_check['allApiaries']}")
        print(f"  ALL hives (RLS test): {cloud_check['allHives']}")
        if cloud_check['allApiaries'] > cloud_check['myApiaries']:
            print(f"  ⚠️ RLS NOT WORKING - can see {cloud_check['allApiaries']} apiaries (other users' data)")
        else:
            print(f"  ✅ RLS WORKING - only own data visible")

        print(f"\n=== Console logs ===")
        errors = [l for l in all_logs if '[error]' in l.lower()]
        if errors:
            for e in errors[:5]:
                print(f"  {e[:200]}")

        await browser.close()

asyncio.run(verify_rls())