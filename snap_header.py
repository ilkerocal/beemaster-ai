import asyncio, time
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        iphone = p.devices['iPhone 13']
        ctx = await browser.new_context(**iphone)
        page = await ctx.new_page()
        await page.goto(f"https://beemaster-ai.vercel.app/?t={int(time.time())}", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/v3_header.png', clip={'x':0,'y':0,'width':390,'height':120})
        await browser.close()

asyncio.run(main())
