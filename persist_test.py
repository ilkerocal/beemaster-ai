import asyncio
from playwright.async_api import async_playwright

async def test_persist():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 720})
        page = await context.new_page()
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        
        print("STEP 1: Load app...")
        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(3000)
        
        hives = await page.evaluate("BM.Storage.list('hives')")
        print(f"Hives: {len(hives)}")
        
        hid = hives[0]['id']
        initial_fc = await page.evaluate("h => BM.Storage.get('hives', h).frameCount", hid)
        initial_ls = await page.evaluate("""
            (hid) => {
                let ls = JSON.parse(localStorage.getItem('beemaster-v4') || '{}');
                let h = (ls.hives || []).find(x => x.id === hid);
                return h ? h.frameCount : null;
            }
        """, hid)
        print(f"First hive frameCount: state={initial_fc}, localStorage={initial_ls}")
        
        # Step 2: Edit to 7
        print("\nSTEP 2: Edit frameCount to 7...")
        await page.evaluate("(hid) => BM.hives.edit(hid)", hid)
        await page.wait_for_timeout(1000)
        
        fc_input = await page.query_selector("input[name='frameCount']")
        await fc_input.focus()
        await fc_input.select_text()
        await fc_input.fill("7")
        await page.wait_for_timeout(300)
        
        # Click save button (modal foot last button)
        save_btns = await page.query_selector_all(".modal__foot button")
        save_btn = save_btns[-1]  # last button is Kaydet
        await save_btn.click()
        await page.wait_for_timeout(2000)
        
        fc_after = await page.evaluate("(hid) => BM.Storage.get('hives', hid).frameCount", hid)
        print(f"After save: frameCount={fc_after}")
        
        # Step 3: RELOAD
        print("\nSTEP 3: Reload page...")
        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(3000)
        
        fc_reloaded = await page.evaluate("(hid) => BM.Storage.get('hives', hid).frameCount", hid)
        ls_reloaded = await page.evaluate("""
            (hid) => {
                let ls = JSON.parse(localStorage.getItem('beemaster-v4') || '{}');
                let h = (ls.hives || []).find(x => x.id === hid);
                return h ? h.frameCount : null;
            }
        """, hid)
        print(f"After reload: state={fc_reloaded}, localStorage={ls_reloaded}")
        
        if fc_reloaded == 7:
            print("\n*** PERSISTENCE OK ***")
        else:
            print(f"\n*** PERSISTENCE FAIL: expected 7, got {fc_reloaded} ***")
        
        print(f"Errors: {errors}")
        await browser.close()

asyncio.run(test_persist())