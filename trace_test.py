import asyncio
from playwright.async_api import async_playwright
import time

async def trace():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()

        all_logs = []
        page.on("console", lambda msg: all_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: all_logs.append(f"[PAGE_ERROR] {err}"))

        await page.goto(f"https://beemaster-ai.vercel.app/?cb={int(time.time())}", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(5000)

        # Hook into console to track all logs
        await page.evaluate("""
            window.__capturedLogs = [];
            const origLog = console.log;
            const origError = console.error;
            const origWarn = console.warn;
            console.log = function(...args) {
                window.__capturedLogs.push(['log', ...args].join(' '));
                origLog.apply(console, args);
            };
            console.error = function(...args) {
                window.__capturedLogs.push(['error', ...args].join(' '));
                origError.apply(console, args);
            };
        """)

        # Open edit modal
        await page.evaluate("() => BM.hives.edit('hv_1')")
        await page.wait_for_timeout(1000)

        # Set frameCount
        fc_input = await page.query_selector("input[name='frameCount']")
        await fc_input.click()
        await fc_input.select_text()
        await fc_input.type("5", delay=100)
        await page.wait_for_timeout(300)

        # Submit
        submit_btn = await page.query_selector("#modal-submit")
        await submit_btn.click()
        await page.wait_for_timeout(3000)

        # Check state
        fc = await page.evaluate("() => BM.Storage.get('hives', 'hv_1').frameCount")
        frames = await page.evaluate("() => BM.Storage.list('frames').filter(f => f.hiveId === 'hv_1').length")
        print(f"h.frameCount={fc}, frame records={frames}")

        # Get captured logs
        captured = await page.evaluate("() => window.__capturedLogs")
        print(f"\nCaptured logs ({len(captured)}):")
        for log in captured:
            print(f"  {log[:300]}")

        # Also dump BM.Storage.update source
        update_src = await page.evaluate("() => BM.Storage.update.toString()")
        print(f"\nStorage.update src: {update_src[:300]}")

        await browser.close()

asyncio.run(trace())