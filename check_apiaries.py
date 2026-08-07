import asyncio
from playwright.async_api import async_playwright
import time

async def check_apiaries():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        all_logs = []
        page.on("console", lambda msg: all_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: all_logs.append(f"[PAGE_ERROR] {err}"))

        await page.goto(f"https://beemaster-ai.vercel.app/?cb={int(time.time()*1000)}", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(5000)

        # Check if apiaries view exists
        result = await page.evaluate("""
            () => {
                const result = {
                    bm: typeof BM,
                    bmApiaries: typeof BM.apiaries,
                    apiariesMethods: BM.apiaries ? Object.keys(BM.apiaries) : [],
                    viewApiariesExists: !!document.getElementById('view-apiaries'),
                    sidebarHasApiaries: false,
                    navApiariesBtn: null,
                    currentView: App.currentView,
                    authStatus: BM.Auth.isAuthenticated(),
                    user: BM.Auth.getUser()?.email,
                    apiariesCount: BM.Storage.list('apiaries').length,
                    hivesCount: BM.Storage.list('hives').length,
                    apiariesNames: BM.Storage.list('apiaries').map(a => a.name)
                };
                
                // Check sidebar
                const sidebarBtns = document.querySelectorAll('[data-view]');
                result.sidebarBtns = Array.from(sidebarBtns).map(b => b.getAttribute('data-view'));
                
                const apiariesBtn = document.querySelector('[data-view=\"apiaries\"]');
                if (apiariesBtn) {
                    result.sidebarHasApiaries = true;
                    result.navApiariesBtn = apiariesBtn.textContent.trim();
                }
                
                return result;
            }
        """)
        print("=== DIAGNOSTIC ===")
        for k, v in result.items():
            if isinstance(v, list) and len(v) > 5:
                print(f"  {k}: [{len(v)} items] {v[:5]}...")
            else:
                print(f"  {k}: {v}")

        print(f"\n=== LOGS ===")
        for log in all_logs[-20:]:
            print(f"  {log[:250]}")

        await browser.close()

asyncio.run(check_apiaries())