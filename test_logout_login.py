import asyncio
from playwright.async_api import async_playwright

async def test_logout_login():
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
        
        # Add a NEW apiary
        print("Adding new apiary...")
        add_result = await page.evaluate("async () => { try { const r = await BM.Storage.add('apiaries', { name: 'Logout Test Üs', location: 'Test Konum', lat: 38.7, lng: 40.7, flora: 'Test', notes: 'Logout test' }); return { success: true, id: r.id }; } catch (e) { return { success: false, error: e.message }; } }")
        print(f"Add result: {add_result}")
        await page.wait_for_timeout(2000)
        
        # LOGOUT
        print("Logging out...")
        await page.evaluate("() => BM.Auth.doLogout()")
        await page.wait_for_timeout(3000)
        
        # Verify logged out
        auth_check = await page.evaluate("() => ({ isAuth: BM.Auth.isAuthenticated?.(), user: BM.Auth.getUser?.() })")
        print(f"After logout: {auth_check}")
        
        # LOGIN AGAIN
        print("Logging in again...")
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
        
        # Force sync
        print("Syncing from cloud...")
        sync_res = await page.evaluate("async () => { if (BM.Storage && BM.Storage.syncFromCloud) { const r = await BM.Storage.syncFromCloud(true); return r; } return 'no syncFromCloud'; }")
        print(f"Sync result: {sync_res}")
        
        # Check if our test apiary is still there
        apiaries = await page.evaluate("() => BM.Storage.list('apiaries')")
        print(f"Apiaries after logout/login/sync ({len(apiaries)}):")
        for a in apiaries:
            print(f"  - {a['name']} (id: {a['id']}, lat: {a['lat']}, createdAt: {a['createdAt']})")
        
        # Find our test apiary
        test_apiary = [a for a in apiaries if 'Logout Test' in a['name']]
        if test_apiary:
            print("✅ TEST PASSED: Logout test apiary persisted!")
        else:
            print("❌ TEST FAILED: Logout test apiary LOST!")
        
        await browser.close()

asyncio.run(test_logout_login())