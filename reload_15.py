import asyncio
from playwright.async_api import async_playwright
import time

async def reload_15_times():
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
        await page.wait_for_timeout(8000)

        for i in range(15):
            await page.reload(wait_until="domcontentloaded", timeout=10000)
            await page.wait_for_timeout(2000)

            state = await page.evaluate("""
                () => ({
                    auth: BM.Auth.isAuthenticated(),
                    user: BM.Auth.getUser()?.email,
                    hives: BM.Storage.list('hives').map(h => h.name).sort(),
                    hivesCount: BM.Storage.list('hives').length,
                    view: document.querySelector('.toolbar .btn.active')?.textContent || '?'
                })
            """)

            auth_status = "AUTH" if state['auth'] else "NO AUTH"
            view_info = f"view={state['view']}, hives={state['hivesCount']}"

            if not state['auth']:
                print(f"\n*** LOST AUTH on reload {i+1} ***")
                print(f"  hives: {state['hives']}")
                print(f"  view: {state['view']}")

                # Check why auth was lost
                debug = await page.evaluate("""
                    () => ({
                        sbToken: !!localStorage.getItem('sb-assfwtjbvuuxclioqsih-auth-token'),
                        bmToken: !!localStorage.getItem('beemaster-auth-token'),
                        bmSession: localStorage.getItem('bm-auth-session')?.substring(0, 50),
                        allLSKeys: Object.keys(localStorage)
                    })
                """)
                print(f"  debug: {debug}")
                break

            print(f"  Reload {i+1}: {auth_status} {view_info}")

            if i == 14:
                print(f"\n*** All 15 reloads passed ***")

        await browser.close()

asyncio.run(reload_15_times())