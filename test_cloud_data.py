import asyncio
from playwright.async_api import async_playwright

async def test_cloud_data():
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
        await page.wait_for_timeout(5000)  # Wait for sync
        
        await page.evaluate("() => BM.Modal && BM.Modal.close()")
        await page.wait_for_timeout(500)
        
        # Check apiaries data
        apiaries = await page.evaluate("() => BM.Storage.list('apiaries')")
        print(f"Apiaries ({len(apiaries)}):")
        for a in apiaries:
            print(f"  - {a['name']} (id: {a['id']}, lat: {a['lat']}, lng: {a['lng']}, createdAt: {a['createdAt']})")
        
        # Check hives
        hives = await page.evaluate("() => BM.Storage.list('hives')")
        print(f"Hives ({len(hives)}):")
        for h in hives[:5]:
            print(f"  - {h['name']} (id: {h['id']}, apiaryId: {h['apiaryId']})")
        
        # Click Arı Üsleri
        apiaries_nav = await page.wait_for_selector('text=Arı Üsleri', timeout=10000)
        await apiaries_nav.click()
        await page.wait_for_timeout(2000)
        
        # Check rendered content
        content = await page.evaluate("() => document.querySelector('#view-apiaries')?.innerHTML || ''")
        print(f"\nRendered content preview: {content[:1000]}")
        
        await browser.close()

asyncio.run(test_cloud_data())