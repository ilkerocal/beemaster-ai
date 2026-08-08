import asyncio
from playwright.async_api import async_playwright

async def test_push_then_sync():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        
        page.on("console", lambda msg: print(f"[CONSOLE] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[PAGE ERROR] {err}"))
        
        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        
        # Login
        auth_btn = await page.wait_for_selector('#auth-btn', timeout=10000)
        await auth_btn.click()
        await page.wait_for_timeout(1000)
        
        email_input = await page.wait_for_selector('input[type="email"]', timeout=5000)
        pass_input = await page.wait_for_selector('input[type="password"]', timeout=5000)
        
        await email_input.fill("adnanmurat021@gmail.com")
        await pass_input.fill("123456")
        
        submit_btn = await page.wait_for_selector('#modal-submit', timeout=5000)
        await submit_btn.click()
        await page.wait_for_timeout(5000)
        
        await page.evaluate("() => BM.Modal && BM.Modal.close()")
        await page.wait_for_timeout(500)
        
        # Add a NEW apiary (will push to cloud)
        print("Adding new apiary to push to cloud...")
        add_result = await page.evaluate("async () => { try { const r = await BM.Storage.add('apiaries', { name: 'Test Üs Cloud', location: 'Test Konum', lat: 38.5, lng: 40.5, flora: 'Test', notes: 'Cloud test' }); return { success: true, id: r.id }; } catch (e) { return { success: false, error: e.message }; } }")
        print(f"Add result: {add_result}")
        
        await page.wait_for_timeout(2000)
        
        # Now force sync
        print("Forcing sync from cloud...")
        sync_res = await page.evaluate("async () => { if (BM.Storage && BM.Storage.syncFromCloud) { const r = await BM.Storage.syncFromCloud(true); return r; } return 'no syncFromCloud'; }")
        print(f"Force sync result: {sync_res}")
        
        # Check data
        apiaries = await page.evaluate("() => BM.Storage.list('apiaries')")
        print(f"Apiaries after push+sync ({len(apiaries)}):")
        for a in apiaries:
            print(f"  - {a['name']} (id: {a['id']}, lat: {a['lat']}, createdAt: {a['createdAt']})")
        
        await browser.close()

asyncio.run(test_push_then_sync())