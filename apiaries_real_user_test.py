import asyncio
from playwright.async_api import async_playwright
import time

async def test_apiaries_with_real_user():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        
        # Listen to console
        page.on("console", lambda msg: print(f"[CONSOLE] {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"[PAGE ERROR] {err}"))
        
        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        
        # Check initial auth state
        auth = await page.evaluate("() => BM.Storage.getAuth ? BM.Storage.getAuth() : 'no getAuth'")
        print(f"Initial auth: {auth}")
        
        # Click login button to open modal
        login_btn = await page.wait_for_selector('#btn-login', timeout=10000)
        await login_btn.click()
        await page.wait_for_timeout(1000)
        
        # Fill login form inside modal
        email_input = await page.wait_for_selector('#modal-email', timeout=5000)
        pass_input = await page.wait_for_selector('#modal-password', timeout=5000)
        
        await email_input.fill("adnanmurat021@gmail.com")
        await pass_input.fill("123456")
        
        # Click submit
        submit_btn = await page.wait_for_selector('#modal-form button[type="submit"]', timeout=5000)
        await submit_btn.click()
        await page.wait_for_timeout(3000)
        
        # Check auth after login
        auth = await page.evaluate("() => BM.Storage.getAuth ? BM.Storage.getAuth() : 'no getAuth'")
        print(f"After login auth: {auth}")
        
        # Close any remaining modal
        await page.evaluate("() => BM.Modal && BM.Modal.close()")
        await page.wait_for_timeout(500)
        
        # Now click Apiaries (Arı Üsleri) in sidebar
        print("Clicking Apiaries menu...")
        apiaries_btn = await page.wait_for_selector('#nav-apiaries', timeout=10000)
        await apiaries_btn.click()
        await page.wait_for_timeout(2000)
        
        # Check what's visible
        content = await page.evaluate("() => document.querySelector('#main-content')?.innerHTML || 'no main-content'")
        print(f"Main content after click: {content[:500]}...")
        
        # Check for apiaries module
        apiaries_section = await page.evaluate("() => document.querySelector('#apiaries-section') ? 'FOUND' : 'NOT FOUND'")
        print(f"Apiaries section: {apiaries_section}")
        
        # Check all sections
        sections = await page.evaluate("() => Array.from(document.querySelectorAll('[id$=\"-section\"]')).map(s => s.id)")
        print(f"All sections: {sections}")
        
        # Check console for errors
        await page.wait_for_timeout(2000)
        
        await browser.close()

asyncio.run(test_apiaries_with_real_user())