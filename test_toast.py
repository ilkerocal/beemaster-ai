import asyncio, time
from playwright.async_api import async_playwright

async def test_toast():
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
        await page.wait_for_function("() => typeof App !== 'undefined' && typeof BM !== 'undefined'")
        await page.wait_for_timeout(2000)

        # Trigger toast
        await page.evaluate("() => BM.Toast.show('Yumurta yok - test', 'warn')")
        await page.wait_for_timeout(500)

        # Check position
        info = await page.evaluate("""() => {
            const container = document.getElementById('toast-container');
            const cs = getComputedStyle(container);
            const r = container.getBoundingClientRect();
            const toasts = container.querySelectorAll('.toast');
            const toastInfo = Array.from(toasts).map(t => {
                const tr = t.getBoundingClientRect();
                return {
                    text: t.textContent.slice(0, 50),
                    top: tr.top,
                    left: tr.left,
                    visible: tr.width > 0 && tr.height > 0
                };
            });
            return {
                rect: { top: r.top, left: r.left, width: r.width, height: r.height },
                position: cs.position,
                zIndex: cs.zIndex,
                top: cs.top,
                transform: cs.transform,
                toasts: toastInfo
            };
        }""")
        print(f"Toast container: {info}")

        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/toast_test.png', full_page=False)
        await browser.close()

asyncio.run(test_toast())
