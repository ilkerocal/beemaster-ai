import asyncio
from playwright.async_api import async_playwright
import time

async def check_deploy():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()

        await page.goto(f"https://beemaster-ai.vercel.app/?cb={int(time.time())}", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(5000)

        bundle_check = await page.evaluate("""
            () => {
                return BM.Modal.open.toString().includes('typeof result.then');
            }
        """)
        print(f"Modal.open has async fix: {bundle_check}")

        update_check = await page.evaluate("""
            () => {
                return BM.Storage.update.constructor.name === 'AsyncFunction';
            }
        """)
        print(f"Storage.update is async: {update_check}")

        await browser.close()

asyncio.run(check_deploy())