import asyncio
from playwright.async_api import async_playwright

async def test_apiary_module():
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
        await page.wait_for_timeout(4000)
        
        await page.evaluate("() => BM.Modal && BM.Modal.close()")
        await page.wait_for_timeout(500)
        
        # Check BM.apiaries
        apiary_check = await page.evaluate("() => ({ apiaryKeys: Object.keys(BM.apiaries || {}), hasRender: typeof BM.apiaries?.render, render: BM.apiaries?.render?.toString().slice(0, 100) })")
        print(f"Apiary module: {apiary_check}")
        
        # Check if module is registered in BM.Modules or similar
        modules_check = await page.evaluate("() => ({ BMModules: Object.keys(BM.Modules || {}), AppViews: typeof App.render })")
        print(f"Modules: {modules_check}")
        
        # Click "Arı Üsleri"
        print("Clicking Arı Üsleri...")
        apiaries_nav = await page.wait_for_selector('text=Arı Üsleri', timeout=10000)
        await apiaries_nav.click()
        await page.wait_for_timeout(3000)
        
        # Check what view is active
        view_check = await page.evaluate("() => ({ currentView: App.currentView, viewParam: App.viewParam, viewElements: Array.from(document.querySelectorAll('.view')).map(v => ({id: v.id, active: v.classList.contains('view--active')})) })")
        print(f"View state: {view_check}")
        
        # Check content
        content = await page.evaluate("() => document.querySelector('#view-apiaries')?.innerHTML || 'no view-apiaries'")
        print(f"View-apiaries content: {content[:500]}...")
        
        await browser.close()

asyncio.run(test_apiary_module())