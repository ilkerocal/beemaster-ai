import asyncio
from playwright.async_api import async_playwright
import time

async def observer():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False, slow_mo=100)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        all_logs = []
        page.on("console", lambda msg: all_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: all_logs.append(f"[PAGE_ERROR] {err}"))

        # Clear state for fresh start
        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle", timeout=30000)
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(3000)

        print("=" * 70)
        print("OBSERVER MODE - Sayfa açık")
        print("Sen giriş yap, ben izliyorum")
        print("=" * 70)

        # Snapshot every 3 seconds for 10 minutes
        for i in range(200):
            await page.wait_for_timeout(3000)

            try:
                state = await page.evaluate("""
                    () => ({
                        auth: BM.Auth.isAuthenticated(),
                        user: BM.Auth.getUser()?.email || 'none',
                        currentView: App.currentView,
                        apiaries: BM.Storage.list('apiaries').length,
                        apiariesNames: BM.Storage.list('apiaries').map(a => a.name),
                        hives: BM.Storage.list('hives').length,
                        localStorage: localStorage.getItem('beemaster-v4')?.length || 0,
                        session: !!localStorage.getItem('bm-auth-session'),
                        supabaseConfigured: BM.Auth.isConfigured()
                    })
                """)
                ts = i * 3
                print(f"[{ts:4}s] auth={state['auth']} user={state['user']} view={state['currentView']} apiaries={state['apiaries']} hives={state['hives']} LS={state['localStorage']}")

                # Show names if any
                if state['apiariesNames']:
                    print(f"        apiaries: {state['apiariesNames'][:5]}")

                # Detect unusual state changes
                if i == 0:
                    last_hives = state['hives']
                    last_apiaries = state['apiaries']
                    last_auth = state['auth']
                    last_view = state['currentView']
                else:
                    if state['hives'] != last_hives:
                        print(f"        >>> HIVES CHANGED: {last_hives} -> {state['hives']}")
                        last_hives = state['hives']
                    if state['apiaries'] != last_apiaries:
                        print(f"        >>> APIARIES CHANGED: {last_apiaries} -> {state['apiaries']}")
                        last_apiaries = state['apiaries']
                    if state['auth'] != last_auth:
                        print(f"        >>> AUTH CHANGED: {last_auth} -> {state['auth']}")
                        last_auth = state['auth']
                    if state['currentView'] != last_view:
                        print(f"        >>> VIEW CHANGED: {last_view} -> {state['currentView']}")
                        last_view = state['currentView']

                # Dump errors every 20 seconds
                if i % 7 == 6 and all_logs:
                    errors = [l for l in all_logs if 'PAGE_ERROR' in l or '[error]' in l]
                    if errors:
                        print(f"        >>> ERRORS ({len(errors)}):")
                        for e in errors[-5:]:
                            print(f"            {e[:200]}")
                    all_logs.clear()
            except Exception as e:
                print(f"[{i*3:4}s] Error getting state: {e}")

        await browser.close()

asyncio.run(observer())