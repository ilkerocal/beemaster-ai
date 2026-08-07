import asyncio, time
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        ctx = await browser.new_context()
        page = await ctx.new_page()

        # hook console.error
        page.on("console", lambda msg: print(f"[CONSOLE {msg.type}] {msg.text}") if msg.type in ('error', 'warning') else None)
        page.on("pageerror", lambda err: print(f"[PAGEERROR] {err}"))

        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle")
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(2000)

        # Login
        await page.click('#auth-btn')
        await page.wait_for_timeout(1500)
        await page.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page.fill('input[type="password"]', "123456")
        await page.click('#modal-submit')
        await page.wait_for_timeout(8000)
        await page.wait_for_function("() => typeof App !== 'undefined'")
        await page.wait_for_timeout(3000)

        # ========== PHASE 1: ADD AN APIARY + HIVE ON "DESKTOP" ==========
        print("\n=== DESKTOP: Adding apiary + hive ===")
        
        # Add apiary
        await page.evaluate("() => { BM.apiaries.add(); return true; }")
        await page.wait_for_timeout(500)
        await page.fill('input[name="name"]', 'Test Üssü')
        keys = await page.evaluate("() => BM.Storage.list('apiaries').length")
        print(f"apiaries count: {keys}")
        
        await page.keyboard.press('Escape')  # close modal
        await page.wait_for_timeout(500)
        
        # Reset için güvenli: doğrudan Storage.add ile kovan ekleyelim
        add_result = await page.evaluate("""() => {
            try {
                // Önce üs ekle
                if (!BM.Storage.list('apiaries').length) {
                    BM.Storage.add('apiaries', { name: 'TEST-ÜS', address: 'Diyarbakır' });
                }
                await new Promise(r => setTimeout(r, 200));
                const apiary = BM.Storage.list('apiaries')[0];
                if (!apiary) return 'no apiary';
                
                await BM.Storage.add('hives', { 
                    name: 'TEST-Kovan', 
                    apiaryId: apiary.id, 
                    strain: 'Anadolu',
                    boxType: 'Langstroth',
                    frameCount: 10
                });
                await BM.Storage.add('queens', {
                    name: 'Kraliçe Test',
                    hiveId: BM.Storage.list('hives')[0].id,
                    apiaryId: apiary.id,
                    birthDate: new Date().toISOString(),
                    markedColor: 'Kırmızı'
                });
                return 'ok: ' + BM.Storage.list('hives').length + ' hives, ' + BM.Storage.list('queens').length + ' queens';
            } catch(e) {
                return 'error: ' + e.message;
            }
        }""")
        print("add_result:", add_result)

        await page.wait_for_timeout(1000)

        # State
        hives_count = await page.evaluate("() => BM.Storage.list('hives').length")
        apiaries_count = await page.evaluate("() => BM.Storage.list('apiaries').length") 
        queens_count = await page.evaluate("() => BM.Storage.list('queens').length")
        print(f"Local: {apiaries_count} apiaries, {hives_count} hives, {queens_count} queens")

        # Sync to cloud
        sync_result = await page.evaluate("""() => {
            try {
                return BM.Storage.syncFromCloud().then(r => 'sync:' + r);
            } catch(e) {
                return 'sync error: ' + e.message;
            }
        }""")
        print("sync result:", await page.evaluate("() => BM.Storage.syncFromCloud(true).then(r => r).catch(e => e.message)"))

        await page.close()
        await browser.close()

asyncio.run(main())