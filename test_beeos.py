import asyncio, json
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1440, 'height': 900})
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))

        url = 'https://beemaster-ai.vercel.app/?v=v4.0.1'
        await page.goto(url, wait_until='networkidle', timeout=30000)
        await page.wait_for_timeout(3000)

        bm = await page.evaluate('() => typeof BM !== "undefined"')
        print(f"BM loaded: {bm}")

        beeos = await page.evaluate('() => typeof BM !== "undefined" && typeof BM.beeos !== "undefined"')
        print(f"BM.beeos exists: {beeos}")

        nav_items = await page.evaluate("""() => {
            const items = document.querySelectorAll("[data-view]");
            return Array.from(items).map(el => ({
                view: el.getAttribute("data-view"),
                text: el.textContent.trim().substring(0, 30)
            }));
        }""")
        
        beeos_in_nav = any(i.get('view') == 'beeos' for i in nav_items)
        print(f"BeeOS in nav: {beeos_in_nav}")

        if beeos_in_nav:
            await page.click('[data-view="beeos"]')
            await page.wait_for_timeout(2000)
            
            content = await page.evaluate('() => document.getElementById("view-beeos").textContent.substring(0, 300)')
            print(f"BeeOS content: {content}")
            
            form = await page.evaluate('() => !!document.getElementById("beeos-task-form")')
            print(f"Task form: {form}")

        print(f"Console errors: {len(errors)}")
        for e in errors[:5]:
            print(f"  {e[:200]}")
        
        await browser.close()

asyncio.run(main())
