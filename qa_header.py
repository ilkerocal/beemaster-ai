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

        # Login
        await page.click('#auth-btn')
        await page.wait_for_timeout(1500)
        await page.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page.fill('input[type="password"]', "123456")
        await page.click('#modal-submit')
        await page.wait_for_timeout(8000)
        await page.wait_for_function("() => typeof App !== 'undefined'")
        await page.wait_for_timeout(2000)

        # Header bilgisi
        info = await page.evaluate("""() => {
            const h = document.querySelector('.app__header');
            const r = h.getBoundingClientRect();
            const cs = getComputedStyle(h);
            return {
                rect: { top: r.top, left: r.left, width: r.width, height: r.height },
                computedHeight: cs.height,
                padding: cs.padding,
                boxSizing: cs.boxSizing,
                position: cs.position,
                top: cs.top
            };
        }""")
        print(f"Header: {info}")

        # Butonlar (geniş çapta)
        buttons = await page.evaluate("""() => {
            return Array.from(document.querySelectorAll('.app__header button')).map((b, i) => {
                const r = b.getBoundingClientRect();
                const cs = getComputedStyle(b);
                return {
                    i: i,
                    text: b.textContent.trim().slice(0, 15),
                    rect: { top: Math.round(r.top), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height) },
                    csHeight: cs.height,
                    csMarginTop: cs.marginTop,
                    csVerticalAlign: cs.verticalAlign
                };
            });
        }""")
        print(f"\nHeader butonları:")
        for b in buttons:
            print(f"  [{b['i']}] '{b['text']}' y={b['rect']['top']} h={b['rect']['height']} csH={b['csHeight']} mt={b['csMarginTop']}")

        # Sadece header al
        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/header_only.png', clip={'x':0,'y':0,'width':390,'height':120})
        await browser.close()

asyncio.run(main())
