import asyncio
from playwright.async_api import async_playwright
import time

async def final_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()

        all_logs = []
        page.on("console", lambda msg: all_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: all_logs.append(f"[PAGE_ERROR] {err}"))

        await page.goto(f"https://beemaster-ai.vercel.app/?cb={int(time.time())}", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(5000)

        hid = 'hv_1'

        before = await page.evaluate(f"(hid) => {{ const list = BM.Storage.list('frames').filter(f => f.hiveId === hid); return {{ frameRecords: list.length, h_fc: BM.Storage.get('hives', hid).frameCount }}; }}", hid)
        print(f"Before: {before}")

        # Open edit modal
        await page.evaluate("(hid) => BM.hives.edit(hid)", hid)
        await page.wait_for_timeout(1000)

        # Set frameCount to 5
        fc_input = await page.query_selector("input[name='frameCount']")
        await fc_input.click()
        await fc_input.select_text()
        await fc_input.type("5", delay=100)
        await page.wait_for_timeout(300)

        new_val = await fc_input.input_value()
        print(f"Input value: {new_val}")

        # Submit form properly
        # The Kaydet button has type="submit" - it's inside the form
        # Find form and submit
        form = await page.query_selector("#modal-form")
        if form:
            # Submit the form via Enter or submit button
            submit_btn = await page.query_selector("#modal-form button[type='submit']")
            if submit_btn:
                print("Clicking submit button...")
                await submit_btn.click()
            else:
                print("Submit button not found, trying form.requestSubmit()")
                await page.evaluate("document.getElementById('modal-form').requestSubmit()")
        else:
            print("Form not found!")
            # Try Kaydet button in modal__foot
            kaydet = await page.query_selector(".modal__foot button.btn--primary")
            if kaydet:
                print("Clicking Kaydet button in foot...")
                await kaydet.click()
            else:
                print("No Kaydet button either!")

        # Wait for async ops
        await page.wait_for_timeout(4000)

        # Check state
        after = await page.evaluate(f"(hid) => {{ const list = BM.Storage.list('frames').filter(f => f.hiveId === hid); return {{ frameRecords: list.length, h_fc: BM.Storage.get('hives', hid).frameCount }}; }}", hid)
        print(f"\nAfter: {after}")

        if after['frameRecords'] == 5 and after['h_fc'] == 5:
            print("\n*** PERFECT - BOTH SYNCED ***")
        elif after['h_fc'] == 5:
            print(f"\n*** h.frameCount=5 but records={after['frameRecords']} - SYNC BROKEN ***")

        # Check localStorage
        ls_check = await page.evaluate(f"""
            (hid) => {{
                const ls = JSON.parse(localStorage.getItem('beemaster-v4') || '{{}}');
                const hive = (ls.hives || []).find(h => h.id === hid);
                const frames = (ls.frames || []).filter(f => f.hiveId === hid);
                return {{ h_fc: hive ? hive.frameCount : null, frameRecords: frames.length }};
            }}
        """, hid)
        print(f"localStorage: {ls_check}")

        print(f"\nLogs:")
        for log in all_logs:
            print(f"  {log[:200]}")

        await browser.close()

asyncio.run(final_test())