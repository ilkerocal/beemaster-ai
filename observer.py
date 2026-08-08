import asyncio
from playwright.async_api import async_playwright
import time

async def observer():
    """Open the page and let user interact - we'll monitor in background"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        all_logs = []
        page.on("console", lambda msg: all_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: all_logs.append(f"[PAGE_ERROR] {err}"))

        # Clear any existing session/data for clean start
        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle", timeout=30000)
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(3000)

        # Show user state
        initial = await page.evaluate("""
            () => ({
                bmExists: typeof BM !== 'undefined',
                auth: BM.Auth?.isAuthenticated ? BM.Auth.isAuthenticated() : false,
                supabaseConfigured: BM.Auth?.isConfigured ? BM.Auth.isConfigured() : false,
                url: window.__SUPABASE_URL__,
                hasKey: !!window.__SUPABASE_ANON_KEY__,
                hives: BM.Storage?.list('hives')?.length || 0,
                apiaries: BM.Storage?.list('apiaries')?.length || 0
            })
        """)
        print(f"Initial state: {initial}")
        print("\n=== PAGE IS OPEN ===")
        print("Now YOU login with: adnanmurat021@gmail.com / 123456")
        print("Then add your apiary + hives")
        print("Then logout, reload, login again")
        print("I'll keep monitoring in the background")
        print("=" * 60)

        # Wait and monitor every 5 seconds
        for i in range(60):  # 5 minutes
            await page.wait_for_timeout(5000)

            try:
                state = await page.evaluate("""
                    () => ({
                        auth: BM.Auth?.isAuthenticated ? BM.Auth.isAuthenticated() : false,
                        user: BM.Auth?.getUser ? (BM.Auth.getUser()?.email || 'none') : 'none',
                        hives: BM.Storage?.list('hives')?.length || 0,
                        apiaries: BM.Storage?.list('apiaries')?.length || 0,
                        localStorageSize: localStorage.getItem('beemaster-v4')?.length || 0,
                        sessionExists: !!localStorage.getItem('bm-auth-session')
                    })
                """)
                print(f"[{i*5:3}s] auth={state['auth']} user={state['user']} hives={state['hives']} apiaries={state['apiaries']} LS={state['localStorageSize']} session={state['sessionExists']}")
            except Exception as e:
                print(f"[{i*5:3}s] Error getting state: {e}")

            # Also dump recent logs every 30 seconds
            if i % 6 == 5 and all_logs:
                print(f"\n--- Last 10 console messages ---")
                for log in all_logs[-10:]:
                    print(f"  {log[:200]}")
                print("---")
                all_logs.clear()

        await browser.close()

asyncio.run(observer())