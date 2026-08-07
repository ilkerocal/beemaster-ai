import asyncio
from playwright.async_api import async_playwright
import time

async def debug2():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()

        all_logs = []
        page.on("console", lambda msg: all_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: all_logs.append(f"[PAGE_ERROR] {err}"))

        await page.goto(f"https://beemaster-ai.vercel.app/?cb={int(time.time())}", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(5000)

        # Open edit modal
        await page.evaluate("() => BM.hives.edit('hv_1')")
        await page.wait_for_timeout(1000)

        submit_info = await page.evaluate("""
            () => {
                const btn = document.querySelector('#modal-submit');
                if (!btn) return { error: 'No submit button' };
                const form = document.getElementById('modal-form');
                return {
                    btnType: btn.type,
                    btnText: btn.textContent.trim(),
                    btnClass: btn.className,
                    formExists: !!form,
                    inForm: btn.form ? btn.form.id : null
                };
            }
        """)
        print(f"Submit info: {submit_info}")

        # Set frameCount to 5
        fc_input = await page.query_selector("input[name='frameCount']")
        await fc_input.click()
        await fc_input.select_text()
        await fc_input.type("5", delay=100)
        await page.wait_for_timeout(300)

        # Click submit
        submit_btn = await page.query_selector("#modal-submit")
        print(f"\nClicking submit button...")
        await submit_btn.click()
        await page.wait_for_timeout(2000)

        toast = await page.query_selector(".toast, .notification, [class*='toast']")
        if toast:
            toast_text = await toast.inner_text()
            print(f"Toast: {toast_text}")
        else:
            print("No toast")

        modal_active = await page.evaluate("() => document.getElementById('modal-overlay').classList.contains('modal-overlay--active')")
        print(f"Modal still active: {modal_active}")

        fc = await page.evaluate("() => BM.Storage.get('hives', 'hv_1').frameCount")
        frame_records = await page.evaluate("() => BM.Storage.list('frames').filter(f => f.hiveId === 'hv_1').length")
        print(f"After: h.frameCount={fc}, frame records={frame_records}")

        print(f"\nAll logs:")
        for log in all_logs[-15:]:
            print(f"  {log[:200]}")

        await browser.close()

asyncio.run(debug2())