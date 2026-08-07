import asyncio
from playwright.async_api import async_playwright
import time

async def debug():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()

        # Capture all console messages
        all_logs = []
        page.on("console", lambda msg: all_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: all_logs.append(f"[PAGE_ERROR] {err}"))

        await page.goto(f"https://beemaster-ai.vercel.app/?cb={int(time.time())}", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(5000)

        # Get the edit function source to verify it's the new async version
        edit_src = await page.evaluate("""
            () => {
                // Get the edit function via BM.hives.edit
                const fn = BM.hives.edit;
                return fn.toString().substring(0, 100);
            }
        """)
        print(f"Edit function signature: {edit_src[:100]}")

        # Now let's manually test the async flow
        result = await page.evaluate("""
            async () => {
                const hid = 'hv_1';
                const before = BM.Storage.list('frames').filter(f => f.hiveId === hid).length;
                
                // Open the modal
                BM.hives.edit(hid);
                await new Promise(r => setTimeout(r, 500));
                
                // Find frameCount input
                const fcInput = document.querySelector("input[name='frameCount']");
                if (!fcInput) return { error: 'No input' };
                
                // Clear and set to 6
                fcInput.value = '6';
                fcInput.dispatchEvent(new Event('input', { bubbles: true }));
                fcInput.dispatchEvent(new Event('change', { bubbles: true }));
                
                await new Promise(r => setTimeout(r, 200));
                
                // Find Kaydet button
                const buttons = document.querySelectorAll('.modal__foot button');
                let kaydet = null;
                for (const btn of buttons) {
                    if (btn.textContent.trim() === 'Kaydet') {
                        kaydet = btn;
                        break;
                    }
                }
                if (!kaydet) return { error: 'No Kaydet button' };
                
                // Click submit (form submission)
                const form = document.getElementById('modal-form');
                if (form) {
                    // Submit the form
                    const submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.click();
                    } else {
                        kaydet.click();
                    }
                } else {
                    kaydet.click();
                }
                
                // Wait for async operations to complete
                await new Promise(r => setTimeout(r, 3000));
                
                const after = BM.Storage.list('frames').filter(f => f.hiveId === hid).length;
                const h_fc = BM.Storage.get('hives', hid).frameCount;
                
                return { before, after, h_fc };
            }
        """)
        print(f"\nManual test result: {result}")
        print(f"\nConsole logs:")
        for log in all_logs:
            print(f"  {log[:200]}")

        await browser.close()

asyncio.run(debug())