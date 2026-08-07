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
        await page.wait_for_timeout(2000)

        # Debug: bottom-nav pozisyonu ve boyutu
        info = await page.evaluate("""() => {
            const nav = document.getElementById('app-bottom-nav');
            const r = nav.getBoundingClientRect();
            const cs = getComputedStyle(nav);
            const docHeight = document.documentElement.scrollHeight;
            const viewHeight = window.innerHeight;
            const items = document.querySelectorAll('.bottom-nav__item');
            const itemPositions = Array.from(items).map((it, i) => {
                const ir = it.getBoundingClientRect();
                return {
                    i: i,
                    text: it.textContent.trim().slice(0, 20),
                    top: ir.top,
                    left: ir.left,
                    width: ir.width,
                    height: ir.height
                };
            });
            return {
                nav: {
                    top: r.top, left: r.left, width: r.width, height: r.height,
                    display: cs.display,
                    position: cs.position,
                    zIndex: cs.zIndex,
                    bottom: cs.bottom
                },
                docHeight,
                viewHeight,
                scrollY: window.scrollY,
                items: itemPositions,
                bodyOverflow: getComputedStyle(document.body).overflow
            };
        }""")
        print(f"Bottom-nav:")
        print(f"  Position: top={info['nav']['top']} z={info['nav']['zIndex']} pos={info['nav']['position']} display={info['nav']['display']}")
        print(f"  Size: {info['nav']['width']}x{info['nav']['height']}")
        print(f"  View: {info['viewHeight']}, Doc: {info['docHeight']}, ScrollY: {info['scrollY']}")
        print(f"  Body overflow: {info['bodyOverflow']}")
        print(f"\nItems:")
        for it in info['items']:
            print(f"  [{it['i']}] '{it['text']}' y={it['top']} x={it['left']} {it['width']}x{it['height']}")

        await browser.close()

asyncio.run(main())
