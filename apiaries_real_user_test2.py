import asyncio
from playwright.async_api import async_playwright

async def test_apiaries_with_real_user():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        
        page.on("console", lambda msg: print(f"[CONSOLE] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[PAGE ERROR] {err}"))
        
        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        
        # Click auth button (🔐 icon)
        print("Clicking auth button...")
        auth_btn = await page.wait_for_selector('#auth-btn', timeout=10000)
        await auth_btn.click()
        await page.wait_for_timeout(1000)
        
        # Check modal
        modal = await page.evaluate("() => document.querySelector('.modal-overlay') ? 'VISIBLE' : 'HIDDEN'")
        print(f"Modal: {modal}")
        
        # Find email/password inputs
        email_input = await page.wait_for_selector('input[type="email"], input[name="email"], #modal-email', timeout=5000)
        pass_input = await page.wait_for_selector('input[type="password"], input[name="password"], #modal-password', timeout=5000)
        
        print("Filling credentials...")
        await email_input.fill("adnanmurat021@gmail.com")
        await pass_input.fill("123456")
        
        # Click submit
        submit_btn = await page.wait_for_selector('#modal-submit', timeout=5000)
        await submit_btn.click()
        await page.wait_for_timeout(3000)
        
        # Check auth after login
        auth = await page.evaluate("() => BM.Storage.getAuth ? BM.Storage.getAuth() : (BM.Auth ? BM.Auth.getState() : 'no auth')")
        print(f"After login auth: {auth}")
        
        # Close any remaining modal
        await page.evaluate("() => BM.Modal && BM.Modal.close()")
        await page.wait_for_timeout(500)
        
        # Click "Arı Üsleri" nav item (text-based)
        print("Clicking Arı Üsleri...")
        apiaries_nav = await page.wait_for_selector('text=Arı Üsleri', timeout=10000)
        await apiaries_nav.click()
        await page.wait_for_timeout(2000)
        
        # Check what's visible
        content = await page.evaluate("() => document.querySelector('#main-content')?.innerHTML || 'no main-content'")
        print(f"Main content after click: {content[:500]}...")
        
        # Check for apiaries module section
        apiaries_section = await page.evaluate("() => document.querySelector('#apiaries-section') ? 'FOUND' : 'NOT FOUND'")
        print(f"Apiaries section: {apiaries_section}")
        
        # Check all sections
        sections = await page.evaluate("() => Array.from(document.querySelectorAll('[id$=\"-section\"]')).map(s => s.id)")
        print(f"All sections: {sections}")
        
        # Check BM.Modules
        modules = await page.evaluate("() => BM.Modules ? Object.keys(BM.Modules) : 'no BM.Modules'")
        print(f"BM.Modules: {modules}")
        
        # Check if apiary module is loaded
        apiary_mod = await page.evaluate("() => BM.Modules?.apiary ? 'LOADED' : 'NOT LOADED'")
        print(f"Apiary module: {apiary_mod}")
        
        await page.wait_for_timeout(2000)
        await browser.close()

asyncio.run(test_apiaries_with_real_user())