import asyncio
from playwright.async_api import async_playwright

async def deep_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)  # visible browser
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()
        
        all_errors = []
        page.on("pageerror", lambda err: all_errors.append(str(err)))
        page.on("console", lambda msg: 
            all_errors.append(f"[{msg.type}] {msg.text}") 
            if msg.type in ["error", "warning"] else None)
        
        # STEP 1: Navigate to hives
        print("=" * 60)
        print("STEP 1: Navigate to Vercel...")
        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(4000)
        
        # Dump state
        bm = await page.evaluate("typeof BM !== 'undefined'")
        hives = await page.evaluate("() => BM.Storage.list('hives')")
        print(f"BM: {bm}, Hives: {len(hives)}")
        if hives:
            for h in hives[:3]:
                print(f"  {h['name']}: frameCount={h.get('frameCount')}, id={h['id']}")
        
        # STEP 2: Navigate to hives view by clicking sidebar
        print("\n" + "=" * 60)
        print("STEP 2: Click sidebar 'Kovanlar'...")
        kovan_btn = await page.query_selector("[data-view='hives']")
        if kovan_btn:
            await kovan_btn.click()
            await page.wait_for_timeout(2000)
            print("  Clicked 'Kovanlar' sidebar item")
        else:
            # Try JS nav
            await page.evaluate("() => App.nav('hives')")
            await page.wait_for_timeout(2000)
            print("  Navigated via JS")
        
        # Check if hives view is rendered
        view = await page.query_selector("#view-hives")
        if view:
            text = await view.inner_text()
            print(f"  Hives view text (first 200): {text[:200]}")
        else:
            print("  #view-hives NOT FOUND")
        
        # STEP 3: Click 'Duzenle' button on first hive
        print("\n" + "=" * 60)
        print("STEP 3: Click 'Duzenle' on first hive...")
        # Find all buttons in hives view that say 'Duzenle'
        edit_btns = await page.query_selector_all("button")
        edit_btn = None
        for btn in edit_btns:
            t = await btn.inner_text()
            if 'Duzenle' in t or 'Düzenle' in t:
                edit_btn = btn
                break
        
        if edit_btn:
            await edit_btn.click()
            await page.wait_for_timeout(2000)
            print("  Clicked 'Duzenle' button")
        else:
            # Try JS
            hid = hives[0]['id']
            await page.evaluate(f"() => BM.hives.edit('{hid}')")
            await page.wait_for_timeout(2000)
            print(f"  Called BM.hives.edit('{hid}') via JS")
        
        # STEP 4: Check modal
        print("\n" + "=" * 60)
        print("STEP 4: Check modal...")
        modal = await page.query_selector(".modal-overlay--active")
        if modal:
            print("  Modal IS visible")
            # Find frameCount input
            fc_input = await page.query_selector("input[name='frameCount']")
            if fc_input:
                val = await fc_input.input_value()
                print(f"  frameCount input value: '{val}'")
                
                # Change to 4
                await fc_input.click()
                await fc_input.select_text()
                await fc_input.fill("allocation")  # clear
                await fc_input.type("4")
                await page.wait_for_timeout(300)
                
                val2 = await fc_input.input_value()
                print(f"  After change: '{val2}'")
                
                # STEP 5: Click Kaydet
                print("\n" + "=" * 60)
                print("STEP 5: Click Kaydet...")
                save_btn = None
                foot_btns = await page.query_selector_all(".modal__foot button")
                for btn in foot_btns:
                    t = await btn.inner_text()
                    print(f"  Modal foot button: '{t}'")
                    if t.strip() == 'Kaydet':
                        save_btn = btn
                
                if save_btn:
                    await save_btn.click()
                    await page.wait_for_timeout(2000)
                    print("  Clicked Kaydet")
                else:
                    print("  Kaydet button NOT FOUND!")
            else:
                print("  frameCount input NOT FOUND in modal!")
                modal_body = await page.inner_text(".modal__body")
                print(f"  Modal body: {modal_body[:500]}")
        else:
            print("  Modal NOT visible!")
        
        # STEP 6: Check state after save
        print("\n" + "=" * 60)
        print("STEP 6: Check state after save...")
        if hives:
            hid = hives[0]['id']
            fc_state = await page.evaluate(f"(hid) => BM.Storage.get('hives', hid).frameCount", hid)
            fc_ls = await page.evaluate(f"""
                (hid) => {{
                    let ls = JSON.parse(localStorage.getItem('beemaster-v4') || '{{}}');
                    let h = (ls.hives || []).find(x => x.id === hid);
                    return h ? h.frameCount : null;
                }}
            """, hid)
            print(f"  State frameCount: {fc_state}")
            print(f"  localStorage frameCount: {fc_ls}")
            
            # STEP 7: RELOAD
            print("\n" + "=" * 60)
            print("STEP 7: Reload page...")
            await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle", timeout=30000)
            await page.wait_for_timeout(4000)
            
            fc_reload = await page.evaluate(f"(hid) => localStorageStorage.get('hives', hid).frameCount", hid)
            fc_ls_reload = await page.evaluate("""
                (hid) => {
                    let ls = JSON.parse(localStorage.getItem('beemaster-v4') || '{}');
                    let h = (ls.hives || []).find(x => x.id === hid);
                    return h
                }
            """, hid)
            print(f"  Reload state frameCount: {fc_reload}")
            print(f"  Reload localStorage: {fc_ls_reload}")
        
        print("\n" + "=" * 60)
        print("ALL ERRORS:")
        for err in all_errors:
            print(f"  {err[:200]}")
        
        await page.screenshot(path="deep_test_final.png")
        print("\nScreenshot: deep_test_final.png")
        
        await browser.close()

asyncio.run(deep_test())