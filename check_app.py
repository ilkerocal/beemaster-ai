import asyncio, time
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        await page.goto(f'https://beemaster-ai.vercel.app/?cb={int(time.time())}', wait_until='networkidle')
        await page.wait_for_timeout(2000)
        has_app = await page.evaluate('() => typeof window.App')
        has_bm = await page.evaluate('() => typeof window.BM')
        print(f'window.App: {has_app}')
        print(f'window.BM: {has_bm}')
        print(f'Errors: {errors[:3]}')
        await browser.close()

asyncio.run(main())
