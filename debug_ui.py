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
        
        # Debug: find all buttons
        buttons = await page.evaluate("() => Array.from(document.querySelectorAll('button')).map(b => ({id: b.id, text: b.textContent.trim(), classes: b.className}))")
        print(f"Buttons: {buttons}")
        
        # Find login related elements
        login_elements = await page.evaluate("() => Array.from(document.querySelectorAll('[id*=\"login\"], [id*=\"auth\"], [class*=\"login\"], [class*=\"auth\"]')).map(e => ({id: e.id, tag: e.tagName, text: e.textContent?.trim()?.slice(0,50), classes: e.className}))")
        print(f"Login elements: {login_elements}")
        
        # Check sidebar nav items
        nav_items = await page.evaluate("() => Array.from(document.querySelectorAll('nav a, nav button, .nav a, .nav button, [role=\"navigation\"] a, [role=\"navigation\"] button')).map(e => ({id: e.id, text: e.textContent?.trim(), href: e.href, classes: e.className}))")
        print(f"Nav items: {nav_items}")
        
        await browser.close()

asyncio.run(test_apiaries_with_real_user())