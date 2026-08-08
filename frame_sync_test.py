import asyncio
from playwright.async_api import async_playwright

async def test_frame_sync():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        all_errors = []
        page.on("pageerror", lambda err: all_errors.append("ERR: " + str(err)))

        # Clear cache to force fresh load
        await context.clear_cookies()
        await page.goto("https://beemaster-ai.vercel.app/?v=final" + str(int(__import__('time').time())), wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(4000)

        hives = await page.evaluate("() => BM.Storage.list('hives')")
        hid = hives[0]['id']
        print(f"Test hive: {hives[0]['name']}")

        # Check frame records count
        frame_count = await page.evaluate("(hid) => BM.Storage.list('frames').filter(f => f.hiveId === hid).length", hid)
        h_frameCount = await page.evaluate("(hid) => BM.Storage.get('hives', hid).frameCount", hid)
        print(f"Before: h.frameCount={h_frameCount}, frame records={frame_count}")

        # Edit hive to set frameCount=6
        await page.evaluate(f"(hid) => BM.hives.edit(hid)", hid)
        await page.wait_for_timeout(1500)

        fc_input = await page.query_selector("input[name='frameCount']")
        await fc_input.select_text()
        await fc_input.type("6", delay=50)
        await page.wait_for_timeout(500)

        # Click Kaydet
        foot = await page.query_selector(".modal__foot")
        buttons = await foot.query_selector_all("button")
        for btn in buttons:
            t = await btn.inner_text()
            if t.strip() == "Kaydet":
                await btn.click()
                await page.wait_for_timeout(3000)  # Wait for async ops
                break

        # Check after save
        frame_count_after = await page.evaluate("(hid) => BM.Storage.list('frames').filter(f => f.hiveId === hid).length", hid)
        h_frameCount_after = await page.evaluate("(hid) => BM.Storage.get('hives', hid).frameCount", hid)
        print(f"After edit to 6: h.frameCount={h_frameCount_after}, frame records={frame_count_after}")

        # Reload page and check
        await page.goto("https://beemaster-ai.vercel.app/?v=reload" + str(int(__import__('time').time())), wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(4000)

        frame_count_reload = await page.evaluate("(hid) => BM.Storage.list('frames').filter(f => f.hiveId === hid).length", hid)
        h_frameCount_reload = await page.evaluate("(hid) => BM.Storage.get('hives', hid).frameCount", hid)
        print(f"After reload: h.frameCount={h_frameCount_reload}, frame records={frame_count_reload}")

        # Verify they're both 6
        if h_frameCount_reload == 6 and frame_count_reload == 6:
            print("\n*** BOTH frameCount AND frame records are 6 - FIX WORKING ***")
        elif h_frameCount_reload == 6 and frame_count_reload != 6:
            print(f"\n*** frameCount=6 but records={frame_count_reload} - PARTIAL FIX ***")
        else:
            print(f"\n*** FAIL: expected 6, got h.frameCount={h_frameCount_reload}, records={frame_count_reload} ***")

        print(f"\nErrors: {all_errors}")

        # Navigate to hives view and take screenshot
        await page.evaluate("() => App.nav('hives')")
        await page.wait_for_timeout(2000)
        await page.screenshot(path="frame_sync_test.png")
        print("Screenshot: frame_sync_test.png")

        await browser.close()

asyncio.run(test_frame_sync())