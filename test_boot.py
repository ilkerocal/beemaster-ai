import asyncio
from playwright.async_api import async_playwright

async def test_boot():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 720})
        page = await context.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ["error", "warning"] else None)
        page.on("pageerror", lambda err: console_errors.append(f"[PAGEERROR] {err}"))

        print("Navigating...")
        await page.goto("https://beemaster-ai.vercel.app/?v=test9999", wait_until="domcontentloaded", timeout=30000)

        # Wait a bit for JS to execute
        await page.wait_for_timeout(5000)

        # Check boot screen
        boot = await page.query_selector(".boot-screen")
        if boot:
            is_hidden = await boot.evaluate("el => el.classList.contains('hidden')")
            print(f"Boot screen exists, hidden={is_hidden}")
        else:
            print("Boot screen not found in DOM")

        # Check BM
        bm_exists = await page.evaluate("typeof BM !== 'undefined'")
        print(f"BM defined: {bm_exists}")

        if not bm_exists:
            print("ERROR: BM is not defined!")
            scripts = await page.evaluate("Array.from(document.querySelectorAll('script[src]')).map(s => s.src)")
            print("Script srcs:", scripts)

        # Print console errors
        print(f"\nConsole errors ({len(console_errors)}):")
        for err in console_errors[:20]:
            print(f"  {err}")

        await page.screenshot(path="test_boot_stuck.png")
        print("\nScreenshot saved to test_boot_stuck.png")

        await browser.close()

asyncio.run(test_boot())
