import asyncio
from playwright.async_api import async_playwright
import time

async def quick_reload_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        all_logs = []
        page.on("console", lambda msg: all_logs.append(f"[{msg.type}] {msg.text}"))

        print("Quick reload test - 5 reloads")
        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle", timeout=30000)
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(3000)

        await page.evaluate("async () => { await BM.Auth.signIn('adnanmurat021@gmail.com', '123456'); }")
        await page.wait_for_timeout(5000)

        # 5 reloads with shorter waits
        for i in range(5):
            await page.reload(wait_until="domcontentloaded", timeout=15000)
            await page.wait_for_timeout(2000)
            state = await page.evaluate("""
                () => ({
                    auth: BM.Auth.isAuthenticated(),
                    user: BM.Auth.getUser()?.email,
                    session: !!localStorage.getItem('bm-auth-session')
                })
            """)
            status = "OK" if state['auth'] else "LOST"
            print(f"Reload {i+1}: {status} - auth={state['auth']} user={state['user']} session={state['session']}")

        print("\nDone")
        await browser.close()

asyncio.run(quick_reload_test())