import asyncio
from playwright.async_api import async_playwright
import time

async def reload_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        all_logs = []
        page.on("console", lambda msg: all_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: all_logs.append(f"[PAGE_ERROR] {err}"))

        print("=" * 70)
        print("RELOAD TEST: Login → reload 10 times")
        print("=" * 70)

        # Step 1: Open and login
        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle", timeout=30000)
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(3000)

        print("\n[1] Login...")
        await page.evaluate("async () => { await BM.Auth.signIn('adnanmurat021@gmail.com', '123456'); }")
        await page.wait_for_timeout(5000)

        state = await page.evaluate("""
            () => ({
                auth: BM.Auth.isAuthenticated(),
                user: BM.Auth.getUser()?.email,
                session: !!localStorage.getItem('bm-auth-session'),
                sessionKeys: localStorage.getItem('bm-auth-session') ? Object.keys(JSON.parse(localStorage.getItem('bm-auth-session'))) : []
            })
        """)
        print(f"  After login: {state}")

        # Step 2: Reload 10 times
        print("\n[2] Reload 10 times, check session persistence...")
        for i in range(10):
            await page.reload(wait_until="networkidle")
            await page.wait_for_timeout(3000)

            state = await page.evaluate("""
                () => ({
                    auth: BM.Auth.isAuthenticated(),
                    user: BM.Auth.getUser()?.email,
                    session: !!localStorage.getItem('bm-auth-session'),
                    sessionContent: localStorage.getItem('bm-auth-session')?.substring(0, 80),
                    hasAccessToken: false,
                    hasRefreshToken: false,
                    expiresAt: null
                })
            """)

            # Check token details
            token_info = await page.evaluate("""
                () => {
                    try {
                        const s = JSON.parse(localStorage.getItem('bm-auth-session') || '{}');
                        return {
                            hasAccessToken: !!s.access_token,
                            hasRefreshToken: !!s.refresh_token,
                            expiresAt: s.expires_at,
                            expiresIn: s.expires_in
                        };
                    } catch (e) { return { error: e.message }; }
                }
            """)
            state.update(token_info)

            status = "✅" if state['auth'] and state['user'] == 'adnanmurat021@gmail.com' else "❌"
            print(f"  Reload {i+1}: {status} auth={state['auth']}, user={state['user']}, session={state['session']}, accessToken={state['hasAccessToken']}, refreshToken={state['hasRefreshToken']}, expiresAt={state['expiresAt']}")

            if not state['auth']:
                print(f"    *** LOST AUTH on reload {i+1} ***")
                print(f"    session content: {state['sessionContent']}")
                break

        print(f"\n[3] Final check")
        final = await page.evaluate("""
            () => ({
                auth: BM.Auth.isAuthenticated(),
                user: BM.Auth.getUser()?.email,
                session: !!localStorage.getItem('bm-auth-session'),
                apiaries: BM.Storage.list('apiaries').length,
                hives: BM.Storage.list('hives').length
            })
        """)
        print(f"  Final state: {final}")

        await browser.close()

asyncio.run(reload_test())