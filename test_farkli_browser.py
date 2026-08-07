import asyncio, time, tempfile, os
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        # === BROWSER 1: Chrome (Desktop) - Veri ekle ===
        user_dir1 = os.path.join(tempfile.gettempdir(), "bm_test_desktop_%d" % int(time.time()))
        browser1 = await p.chromium.launch_persistent_context(
            user_dir1, headless=False,
            viewport={'width': 1440, 'height': 900}
        )
        page1 = await browser1.new_page()
        page1.on("console", lambda msg: print("[DESKTOP %s] %s" % (msg.type, msg.text)) if msg.type in ('error','warning') else None)

        await page1.goto("https://beemaster-ai.vercel.app/?t=%d" % int(time.time()), wait_until="networkidle")
        await page1.wait_for_timeout(2000)
        await page1.click('#auth-btn'); await page1.wait_for_timeout(1500)
        await page1.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page1.fill('input[type="password"]', "123456")
        await page1.click('#modal-submit')
        await page1.wait_for_timeout(10000)
        await page1.wait_for_function("() => typeof App !== 'undefined'")
        await page1.wait_for_timeout(3000)

        # ADD QUEEN + INSPECTION
        await page1.evaluate("""async () => {
            await BM.Storage.add('apiaries', { name: 'BROWSER1-TEST', lat: 38, lng: 40, location: 'Diyarbakir' });
            return true;
        }""")
        await page1.wait_for_timeout(500)

        await page1.evaluate("""async () => {
            var a = BM.Storage.list('apiaries').filter(function(x){return x.name==='BROWSER1-TEST'})[0];
            await BM.Storage.add('hives', { name: 'B1-KOVAN', apiaryId: a.id, strain: 'Anadolu', frameCount: 8 });
            return true;
        }""")
        await page1.wait_for_timeout(500)

        await page1.evaluate("""async () => {
            var a = BM.Storage.list('apiaries').filter(function(x){return x.name==='BROWSER1-TEST'})[0];
            var h = BM.Storage.list('hives').filter(function(x){return x.name==='B1-KOVAN'})[0];
            await BM.Storage.add('queens', { name: 'B1-ANA-ARI', hiveId: h.id, apiaryId: a.id, markingColor: 'Sari', birthDate: new Date().toISOString() });
            await BM.Storage.add('inspections', { hiveId: h.id, apiaryId: a.id, date: new Date().toISOString(), queenSeen: 'seen', eggsPattern: 'regular', notes: 'Browser-1 test muayenesi' });
            return true;
        }""")
        await page1.wait_for_timeout(2000)

        # Force sync
        await page1.evaluate("() => BM.Storage.syncFromCloud(true)")
        await page1.wait_for_timeout(3000)

        l1 = await page1.evaluate("() => 'Q:' + BM.Storage.list('queens').length + ' I:' + BM.Storage.list('inspections').length")
        print("BROWSER-1 local: %s" % l1)

        await page1.close()
        await browser1.close()

        # === WAIT ===
        await asyncio.sleep(3)

        # === BROWSER 2: Firefox gibi tamamen YENİ Chrome (Mobile view) ===
        user_dir2 = os.path.join(tempfile.gettempdir(), "bm_test_mobile_%d" % int(time.time()))
        browser2 = await p.chromium.launch_persistent_context(
            user_dir2, headless=False,
            viewport={'width': 390, 'height': 844},
            user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
        )
        page2 = await browser2.new_page()
        page2.on("console", lambda msg: print("[MOBILE %s] %s" % (msg.type, msg.text)) if msg.type in ('error','warning') else None)

        await page2.goto("https://beemaster-ai.vercel.app/?t=%d" % int(time.time()), wait_until="networkidle")
        await page2.wait_for_timeout(2000)

        # Login same user
        await page2.click('#auth-btn'); await page2.wait_for_timeout(1500)
        await page2.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page2.fill('input[type="password"]', "123456")
        await page2.click('#modal-submit')
        await page2.wait_for_timeout(10000)
        await page2.wait_for_function("() => typeof App !== 'undefined' && App.currentView === 'dashboard'")
        await page2.wait_for_timeout(5000)

        q2 = await page2.evaluate("() => BM.Storage.list('queens').length")
        i2 = await page2.evaluate("() => BM.Storage.list('inspections').length")
        a2 = await page2.evaluate("() => BM.Storage.list('apiaries').length")
        h2 = await page2.evaluate("() => BM.Storage.list('hives').length")

        print("\n=========================================")
        print("BROWSER-2 (TAMAMEN FARKLI, YENI PROFIL)")
        print("=========================================")
        print("apiaries: %d" % a2)
        print("hives: %d" % h2)
        print("queens: %d" % q2)
        print("inspections: %d" % i2)

        if q2 > 0:
            q_data = await page2.evaluate("""() => {
                return BM.Storage.list('queens').map(function(q) {
                    return { name: q.name, color: q.markingColor, hasHiveId: !!q.hiveId };
                });
            }""")
            print("\nQueen details:")
            for q in q_data:
                print("  name=%s color=%s hasHive=%s" % (q['name'], q['color'], q['hasHiveId']))

        if i2 > 0:
            i_data = await page2.evaluate("""() => {
                return BM.Storage.list('inspections').map(function(i) {
                    return { notes: i.notes, queenSeen: i.queenSeen, date: i.date?.slice(0,10) };
                });
            }""")
            print("\nInspection details:")
            for i in i_data:
                print("  notes=%s queenSeen=%s date=%s" % (i['notes'], i['queenSeen'], i['date']))

        await page2.screenshot(path='C:/Users/hatbi/BeeMaster-AI/v371_farkli_browser.png')
        await page2.close()
        await browser2.close()

        # Clean up temp dirs
        import shutil
        shutil.rmtree(user_dir1, ignore_errors=True)
        shutil.rmtree(user_dir2, ignore_errors=True)

asyncio.run(main())