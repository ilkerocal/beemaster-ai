import asyncio
from playwright.async_api import async_playwright

async def test_hive_edit():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 720})
        page = await context.new_page()
        
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        logs = []
        page.on("console", lambda msg: logs.append(f"[{msg.type}] {msg.text}"))
        
        # Navigate to main page
        print("Navigating to app...")
        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(3000)
        
        # Check BM and initial state
        bm = await page.evaluate("typeof BM !== 'undefined'")
        print(f"BM defined: {bm}")
        
        hives = await page.evaluate("BM.Storage.list('hives')")
        print(f"Hives count: {len(hives)}")
        first_hive = hives[0] if hives else None
        if first_hive:
            print(f"First hive: {first_hive['name']} frameCount={first_hive.get('frameCount')}")
        
        # Manually navigate to hives view
        print("\nNavigating to hives view...")
        await page.evaluate("App.nav('hives')" if "typeof App !== 'undefined'" else "location.hash = 'hives'")
        await page.wait_for_timeout(2000)
        
        # Check if hives are visible
        is_hives_view = await page.evaluate("document.getElementById('view-hives')?.classList.contains('view--active')")
        print(f"Hives view active: {is_hives_view}")
        
        if is_hives_view:
            # Get the HTML of the hives view
            hives_content = await page.inner_text("#view-hives")
            print(f"Hives view content (first 300): {hives_content[:300]}")
        
        # Find any button with "Kovan" text (the edit button for a hive)
        # Use the JS path: BM.hives.edit(hiveId)
        if first_hive:
            hid = first_hive['id']
            print(f"\nEditing hive '{first_hive['name']}' (id={hid})...")
            await page.evaluate(f"BM.hives.edit('{hid}')")
            await page.wait_for_timeout(1500)
            
            # Check modal
            modal = await page.query_selector(".modal-overlay--active")
            if modal:
                print("Modal opened successfully!")
                modal_text = await modal.inner_text()
                print(f"Modal content (first 500): {modal_text[:500]}")
                
                # Find the frameCount input
                fc_input = await page.query_selector("input[name='frameCount']")
                if fc_input:
                    current_val = await fc_input.input_value()
                    print(f"\nCurrent frameCount in input: {current_val}")
                    
                    # Clear and type new value
                    await fc_input.fill("")
                    await fc_input.type("4")
                    await page.wait_for_timeout(500)
                    new_val = await fc_input.input_value()
                    print(f"After typing: {new_val}")
                    
                    # Find save button
                    buttons = await modal.query_selector_all("button")
                    save_btn = None
                    for btn in buttons:
                        text = await btn.inner_text()
                        if 'Kaydet' in text or 'Save' in text or 'Güncelle' in text:
                            save_btn = btn
                            print(f"Found save button: '{text}'")
                            break
                    
                    if save_btn:
                        await save_btn.click()
                        await page.wait_for_timeout(2000)
                        
                        # Verify state
                        updated = await page.evaluate(f"BM.Storage.get('hives', '{hid}')")
                        print(f"After save, frameCount from state: {updated.get('frameCount')}")
                        
                        # Check localStorage
                        ls = await page.evaluate("JSON.parse(localStorage.getItem('beemaster-v4') || '{}')")
                        ls_hive = next((x for x in ls.get('hives', []) if x['id'] == hid), None)
                        if ls_hive:
                            print(f"local Storage frameCount: {ls_hive.get('frameCount')}")
                        else:
                            print("Hive not found in localStorage!")
                    else:
                        print("Could not find save button. Buttons:")
                        for btn in buttons:
                            print(f"  - '{await btn.inner_text()}'")
                    
                    modal_close = await page.query_selector(".modal__close")
                    if modal_close:
                        await modal_close.click()
                        await page.wait_for_timeout(500)
                else:
                    print("Could not find frameCount input in modal!")
            else:
                print(f"No modal opened. Errors: {errors}")
        else:
            print("No hives found!")
        
        # Check if hives view render works
        print(f"\n errors: {errors}")
        print(f"logs (last 10): {logs[-10:]}")
        
        await page.screenshot(path="hive_edit_test.png")
        print("Screen: hive_edit_test.png")
        
        await browser.close()

asyncio.run(test_hive_edit())