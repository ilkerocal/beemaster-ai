import asyncio
from playwright.async_api import async_playwright
import time

async def test_with_cache_bust():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        # Create a NEW context (no cache from previous tests)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        all_logs = []
        page.on("console", lambda msg: all_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: all_logs.append(f"[PAGE_ERROR] {err}"))

        # Hard cache-bust URL
        cb = int(time.time() * 1000)
        await page.goto(f"https://beemaster-ai.vercel.app/?nocache={cb}", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(5000)

        # First, force fresh load of bundle
        await page.evaluate(f"""
            () => {{
                const s = document.createElement('script');
                s.src = 'js/app.bundle.v3.js?v=fresh_{cb}';
                document.head.appendChild(s);
            }}
        """)

        # Check Storage.update source
        update_src = await page.evaluate("() => BM.Storage.update.toString()")
        print(f"Storage.update is async: {'async update' in update_src}")
        print(f"Storage.update source: {update_src[:200]}")

        # Now test the flow
        await page.evaluate("() => BM.hives.edit('hv_1')")
        await page.wait_for_timeout(1000)

        fc_input = await page.query_selector("input[name='frameCount']")
        await fc_input.click()
        await fc_input.select_text()
        await fc_input.type("5", delay=100)
        await page.wait_for_timeout(300)

        # Submit
        submit_btn = await page.query_selector("#modal-submit")
        await submit_btn.click()
        await page.wait_for_timeout(3000)

        fc = await page.evaluate("() => BM.Storage.get('hives', 'hv_1').frameCount")
        frames = await page.evaluate("() => BM.Storage.list('frames').filter(f => f.hiveId === 'hv_1').length")
        print(f"\nh.frameCount={fc}, frame records={frames}")

        print(f"\nLogs ({len(all_logs)}):")
        for log in all_logs:
            print(f"  {log[:300]}")

        await browser.close()

asyncio.run(test_with_cache_bust())