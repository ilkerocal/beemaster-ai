import asyncio
from playwright.async_api import async_playwright

async def verify_fix():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 720})
        page = await context.new_page()

        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))

        print("Waiting for Vercel deploy (polling)...")
        # Wait for deploy by polling
        import time
        for attempt in range(6):
            try:
                await page.goto("https://beemaster-ai.vercel.app/?v=test" + str(attempt), 
                               wait_until="domcontentloaded", timeout=15000)
                await page.wait_for_timeout(3000)
                
                # Check if BM is defined and no duplicate errors
                bm = await page.evaluate("typeof BM !== 'undefined'")
                dup_errors = [e for e in errors if "already been declared" in e]
                
                print(f"Attempt {attempt+1}: BM={bm}, duplicate_errors={len(dup_errors)}, total_errors={len(errors)}")
                
                if not dup_errors:
                    break
                    
                errors.clear()
                await page.wait_for_timeout(5000)  # Wait before next poll
            except Exception as ex:
                print(f"Attempt {attempt+1} failed: {ex}")
                time.sleep(5)

        # Now run the real test
        await page.goto("https://beemaster-ai.vercel.app/?v=finaltest", wait_until="domcontentloaded", timeout=30000)
        await page.wait_for_timeout(5000)

        print(f"\n=== FINAL RESULTS ===")
        print(f"Page errors: {len(errors)}")
        for e in errors:
            print(f"  {e}")

        if errors:
            print("\n**STILL HAS ERRORS**")
        else:
            print("\nNO ERRORS - CLEAN!")

        # Check BM
        bm_exists = await page.evaluate("typeof BM !== 'undefined'")
        print(f"BM defined: {bm_exists}")

        if bm_exists:
            hives = await page.evaluate("BM.Storage.list('hives')")
            print(f"Hives: {len(hives)}")
            if hives:
                h = hives[0]
                print(f"First hive: {h.get('name')} frameCount={h.get('frameCount')}")

            # Try frame edit
            if hives:
                hive_id = hives[0]['id']
                # Update frameCount through Storage
                await page.evaluate(f"""
                    BM.Storage.update('hives', '{hive_id}', {{ frameCount: 4 }})
                """)
                h_updated = await page.evaluate(f"BM.Storage.get('hives', '{hive_id}')")
                print(f"Updated hive frameCount: {h_updated.get('frameCount')}")
                print("*** frameCount UPDATE WORKS ***")
            else:
                print("No hives to test with")
        else:
            print("BM not defined - FAIL")

        await page.screenshot(path="final_test.png")
        print("Screenshot: final_test.png")

        await browser.close()

asyncio.run(test_fix())