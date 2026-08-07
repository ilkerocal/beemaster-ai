import asyncio
from playwright.async_api import async_playwright
import time

async def full_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        all_logs = []
        page.on("console", lambda msg: all_logs.append(f"[{msg.type}] {msg.text}"))

        # Force fresh load
        await page.goto(f"https://beemaster-ai.vercel.app/?cb={int(time.time()*1000)}", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(5000)

        # Verify async update
        is_async = await page.evaluate("() => BM.Storage.update.constructor.name === 'AsyncFunction'")
        print(f"Storage.update is async: {is_async}")

        # Get test hive
        hid = 'hv_1'

        # Initial state
        before = await page.evaluate(f"(hid) => {{ const list = BM.Storage.list('frames').filter(f => f.hiveId === hid); return {{ fc: BM.Storage.get('hives', hid).frameCount, frames: list.length }}; }}", hid)
        print(f"Before: h.frameCount={before['fc']}, frame records={before['frames']}")

        # Edit
        await page.evaluate(f"(hid) => BM.hives.edit(hid)", hid)
        await page.wait_for_timeout(1000)

        # Set to 7
        fc_input = await page.query_selector("input[name='frameCount']")
        await fc_input.click()
        await fc_input.select_text()
        await fc_input.type("7", delay=50)
        await page.wait_for_timeout(300)

        # Submit
        submit_btn = await page.query_selector("#modal-submit")
        await submit_btn.click()
        await page.wait_for_timeout(3000)

        # Check
        after = await page.evaluate(f"(hid) => {{ const list = BM.Storage.list('frames').filter(f => f.hiveId === hid); return {{ fc: BM.Storage.get('hives', hid).frameCount, frames: list.length }}; }}", hid)
        print(f"After edit (10→7): h.frameCount={after['fc']}, frame records={after['frames']}")

        # Now test increase: 7 → 12
        await page.evaluate(f"(hid) => BM.hives.edit(hid)", hid)
        await page.wait_for_timeout(1000)

        fc_input = await page.query_selector("input[name='frameCount']")
        await fc_input.click()
        await fc_input.select_text()
        await fc_input.type("12", delay=50)
        await page.wait_for_timeout(300)

        submit_btn = await page.query_selector("#modal-submit")
        await submit_btn.click()
        await page.wait_for_timeout(3000)

        after2 = await page.evaluate(f"(hid) => {{ const list = BM.Storage.list('frames').filter(f => f.hiveId === hid); return {{ fc: BM.Storage.get('hives', hid).frameCount, frames: list.length }}; }}", hid)
        print(f"After edit (7→12): h.frameCount={after2['fc']}, frame records={after2['frames']}")

        # Hard reload
        await page.goto(f"https://beemaster-ai.vercel.app/?cb={int(time.time()*1000)}", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(4000)

        reload = await page.evaluate(f"(hid) => {{ const list = BM.Storage.list('frames').filter(f => f.hiveId === hid); return {{ fc: BM.Storage.get('hives', hid).frameCount, frames: list.length }}; }}", hid)
        print(f"After reload: h.frameCount={reload['fc']}, frame records={reload['frames']}")

        if after['fc'] == 7 and after['frames'] == 7 and after2['fc'] == 12 and after2['frames'] == 12 and reload['fc'] == 12 and reload['frames'] == 12:
            print("\n*** ALL TESTS PASS - FRAME SYNC WORKS PERFECTLY ***")
        else:
            print("\n*** SOMETHING FAILED ***")

        print(f"\nLogs:")
        for log in all_logs[-10:]:
            print(f"  {log[:200]}")

        await browser.close()

asyncio.run(full_test())