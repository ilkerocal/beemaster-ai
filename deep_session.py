import asyncio
from playwright.async_api import async_playwright
import time

async def deep_session_test():
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

        print("Login...")
        await page.evaluate("async () => { await BM.Auth.signIn('adnanmurat021@gmail.com', '123456'); }")
        await page.wait_for_timeout(5000)

        # Inspect session storage
        info = await page.evaluate("""
            () => {
                const out = {
                    bmAuthSession: localStorage.getItem('bm-auth-session')?.substring(0, 100),
                    allLSKeys: Object.keys(localStorage),
                    supabaseKeys: Object.keys(localStorage).filter(k => k.includes('supabase') || k.includes('sb-')),
                    authState: BM.Auth.getSession ? BM.Auth.getSession() : null,
                    currentUser: BM.Auth.getUser() ? BM.Auth.getUser()?.email : null,
                    isAuth: BM.Auth.isAuthenticated()
                };
                return out;
            }
        """)
        print("After login:")
        for k, v in info.items():
            print(f"  {k}: {v}")

        # Reload 3 times and check
        for i in range(3):
            print(f"\n--- Reload {i+1} ---")
            await page.reload(wait_until="networkidle", timeout=15000)
            await page.wait_for_timeout(5000)

            info = await page.evaluate("""
                () => ({
                    isAuth: BM.Auth.isAuthenticated(),
                    user: BM.Auth.getUser()?.email,
                    bmAuthSession: !!localStorage.getItem('bm-auth-session'),
                    sessionFromAuth: BM.Auth.getSession ? BM.Auth.getSession() : null,
                    supabaseKeys: Object.keys(localStorage).filter(k => k.includes('supabase') || k.includes('sb-'))
                })
            """)
            print(f"  auth={info['isAuth']}, user={info['user']}, bmSession={info['bmAuthSession']}")
            print(f"  supabaseKeys: {info['supabaseKeys']}")
            if info['sessionFromAuth']:
                session = info['sessionFromAuth']
                if session.data and session.data.session:
                                        token = session.data.session.access_token or ''
                                        print(f"  supabaseSession.access_token: {token[:30]}")
                                        print(f"  supabaseSession.expires_at: {session.data.session.expires_at}")

        await browser.close()

asyncio.run(deep_session_test())