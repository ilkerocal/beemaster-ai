import asyncio
from playwright.async_api import async_playwright
import time

async def test_10_reloads():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle", timeout=30000)
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(3000)

        await page.evaluate("async () => { await BM.Auth.signIn('adnanmurat021@gmail.com', '123456'); }")
        await page.wait_for_timeout(5000)

        print("10 reload test:")
        for i in range(10):
            await page.reload(wait_until="domcontentloaded", timeout=10000)
            await page.wait_for_timeout(2000)
            state = await page.evaluate("""
                () => ({
                    auth: BM.Auth.isAuthenticated(),
                    user: BM.Auth.getUser()?.email
                })
            """)
            status = "OK" if state['auth'] and state['user'] == 'adnanmurat021@gmail.com' else "FAIL"
            print(f"  Reload {i+1}: {status} - {state['user']}")

        await browser.close()

asyncio.run(test_10_reloads())