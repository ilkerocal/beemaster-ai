import asyncio, time
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        iphone = p.devices['iPhone 13']
        ctx = await browser.new_context(**iphone)
        page = await ctx.new_page()

        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle")
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(2000)

        await page.click('#auth-btn')
        await page.wait_for_timeout(1500)
        await page.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page.fill('input[type="password"]', "123456")
        await page.click('#modal-submit')
        await page.wait_for_timeout(8000)
        await page.wait_for_function("() => typeof App !== 'undefined'")
        await page.wait_for_timeout(3000)

        # Y=706'da (bottom-nav orta) element ne?
        for y in [700, 710, 720, 730, 740, 750, 760]:
            e = await page.evaluate(f"""() => {{
                const el = document.elementFromPoint(195, {y});
                if (!el) return null;
                return {{
                    tag: el.tagName,
                    class: (el.className || '').toString().slice(0, 50),
                    text: (el.textContent || '').slice(0, 20).trim()
                }};
            }}""")
            print(f"y={y}: {e}")

        await browser.close()

asyncio.run(main())
