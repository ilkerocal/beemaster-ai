
import asyncio
from playwright.async_api import async_playwright

async def test_frame_edit():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 720})
        page = await context.new_page()
        
        # Collect console errors
        console_errors = []
        page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ["error", "warning"] else None)
        page.on("pageerror", lambda err: console_errors.append(f"[PAGEERROR] {err}"))
        
        # Navigate to the app
        print("Navigating to https://beemaster-ai.vercel.app/?v=test" + str(__import__('random').randint(1000,9999)))
        await page.goto("https://beemaster-ai.vercel.app/?v=test" + str(__import__('random').randint(1000,9999)), wait_until="networkidle", timeout=30000)
        
        # Wait for boot screen to disappear
        await page.wait_for_selector(".boot-screen.hidden", timeout=10000)
        print("Boot screen hidden.")
        
        # Check if BM is defined
        bm_exists = await page.evaluate("typeof BM !== 'undefined'")
        print(f"BM defined: {bm_exists}")
        
        if not bm_exists:
            print("ERROR: BM is not defined!")
            print("Console errors:", console_errors)
            await browser.close()
            return
        
        # Check hives
        hives = await page.evaluate("BM.Storage.list('hives')")
        print(f"Number of hives: {len(hives)}")
        if hives:
            h = hives[0]
            print(f"First hive: {h.get('name')} frameCount={h.get('frameCount')}")
            hive_id = h['id']
            
            # Check frames for this hive
            frames = await page.evaluate(f"BM.Storage.list('frames').filter(f => f.hiveId === '{hive_id}')")
            print(f"Frames for this hive: {len(frames)}")
            
            # Now try to update the frameCount to 4 via the edit function
            print("\\nUpdating frameCount to 4...")
            await page.evaluate(f"BM.Storage.update('hives', '{hive_id}', {{ frameCount: 4 }})")
            
            # Check the updated hive
            updated_hive = await page.evaluate(f"BM.Storage.get('hives', '{hive_id}')")
            print(f"Updated hive frameCount: {updated_hive.get('frameCount')}")
            
            # Check frames again
            frames_after = await page.evaluate(f"BM.Storage.list('frames').filter(f => f.hiveId === '{hive_id}')")
            print(f"Frames after update: {len(frames_after)}")
            
            # Check localStorage
            ls_data = await page.evaluate("JSON.parse(localStorage.getItem('beemaster-v4') || '{}')")
            ls_hives = ls_data.get('hives', [])
            ls_hive = next((x for x in ls_hives if x['id'] == hive_id), None)
            if ls_hive:
                print(f"localStorage hive frameCount: {ls_hive.get('frameCount')}")
            else:
                print("Hive not found in localStorage!")
            
            # Check if the update persisted in the state
            state_hive = await page.evaluate(f"BM.Storage.state.hives.find(h => h.id === '{hive_id}')")
            print(f"State hive frameCount: {state_hive.get('frameCount') if state_hive else 'NOT FOUND'}")
        
        print("\\nConsole errors:", console_errors[:10])
        await browser.close()

asyncio.run(test_frame_edit())
