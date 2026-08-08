import asyncio
from playwright.async_api import async_playwright

async def test_login_debug():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        
        page.on("console", lambda msg: print(f"[CONSOLE] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[PAGE ERROR] {err}"))
        
        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        
        # Check what auth functions exist
        auth_check = await page.evaluate("() => ({ getAuth: typeof BM.Storage.getAuth, getUser: typeof BM.Auth.getUser, isAuth: typeof BM.Auth.isAuthenticated, user: BM.Auth.getUser?.() })")
        print(f"Auth functions: {auth_check}")
        
        # Click auth button
        print("Clicking auth button...")
        auth_btn = await page.wait_for_selector('#auth-btn', timeout=10000)
        await auth_btn.click()
        await page.wait_for_timeout(1000)
        
        # Fill login
        email_input = await page.wait_for_selector('input[type="email"]', timeout=5000)
        pass_input = await page.wait_for_selector('input[type="password"]', timeout=5000)
        
        print("Filling credentials...")
        await email_input.fill("adnanmurat021@gmail.com")
        await pass_input.fill("123456")
        
        # Click submit
        submit_btn = await page.wait_for_selector('#modal-submit', timeout=5000)
        await submit_btn.click()
        await page.wait_for_timeout(4000)
        
        # Check auth after login
        auth = await page.evaluate("() => ({ user: BM.Auth.getUser?.(), isAuth: BM.Auth.isAuthenticated?.(), token: localStorage.getItem('beemaster-auth-token') })")
        print(f"After login: {auth}")
        
        # Close modal
        await page.evaluate("() => BM.Modal && BM.Modal.close()")
        await page.wait_for_timeout(500)
        
        # Click "Arı Üsleri"
        print("Clicking Arı Üsleri...")
        apiaries_nav = await page.wait_for_selector('text=Arı Üsleri', timeout=10000)
        await apiaries_nav.click()
        await page.wait_for_timeout(3000)
        
        # Check what's visible
        content = await page.evaluate("() => document.querySelector('#main-content')?.innerHTML || 'no main-content'")
        print(f"Main content: {content[:300]}...")
        
        # Check if apiary module loaded
        apiary_check = await page.evaluate("() => ({ apiaryModule: !!BM.apiaries, hasRender: BM.apiaries?.render })")
        print(f"Apiary module: {apiary_check}")
        
        await browser.close()

asyncio.run(test_login_debug())