import asyncio
from playwright.async_api import async_playwright
import time

async def test_apiaries_module():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        errors = []
        page.on("console", lambda msg: errors.append(f"[{msg.type}] {msg.text}") if msg.type == "error" else None)

        await page.goto("https://beemaster-ai.vercel.app/?v=fix" + str(int(time.time())), wait_until="networkidle", timeout=30000)
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(3000)

        # Login
        await page.evaluate("async () => { await BM.Auth.signIn('adnanmurat021@gmail.com', '123456'); }")
        await page.wait_for_timeout(8000)

        # Go to apiaries view
        await page.evaluate("() => App.nav('apiaries')")
        await page.wait_for_timeout(2000)

        # Screenshot
        await page.screenshot(path="apiaries_view.png")

        # Check what's in the view
        info = await page.evaluate("""
            () => {
                const view = document.getElementById('view-apiaries');
                const content = view ? view.innerHTML.substring(0, 500) : 'NOT FOUND';
                const buttons = Array.from(document.querySelectorAll('#view-apiaries button')).map(b => b.textContent.trim());
                return {
                    viewExists: !!view,
                    viewVisible: view ? getComputedStyle(view).display !== 'none' : false,
                    content: content,
                    buttons: buttons,
                    apiariesInStorage: BM.Storage.list('apiaries').map(a => a.name),
                    apiariesModuleExists: !!BM.apiaries,
                    apiariesViewExists: !!BM.apiaries?.view
                };
            }
        """)
        print("=== APIARIES MODULE TEST ===")
        for k, v in info.items():
            print(f"  {k}: {v}")

        # Try clicking "Yeni Üs" button
        add_result = await page.evaluate("""
            async () => {
                const btns = document.querySelectorAll('#view-apiaries button');
                for (const b of btns) {
                    if (b.textContent.includes('Yeni') || b.textContent.includes('Üs')) {
                        b.click();
                        await new Promise(r => setTimeout(r, 1000));
                        const modal = document.getElementById('modal-overlay');
                        const modalVisible = modal ? getComputedStyle(modal).display !== 'none' : false;
                        const modalContent = modal ? modal.innerHTML.substring(0, 300) : '';
                        return { clicked: b.textContent, modalVisible, modalContent };
                    }
                }
                return { clicked: 'NO BUTTON FOUND' };
            }
        """)
        print(f"\n  Add button: {add_result}")

        if errors:
            print(f"\n=== ERRORS ===")
            for e in errors[:5]:
                print(f"  {e[:200]}")

        await browser.close()

asyncio.run(test_apiaries_module())