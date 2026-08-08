import asyncio, time
from playwright.async_api import async_playwright
import json

async def test_ai_anomaly():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        iphone = p.devices['iPhone 13']
        ctx = await browser.new_context(**iphone)
        page = await ctx.new_page()

        page.on("console", lambda msg: print(f"[M] {msg.type}: {msg.text}") if msg.type in ('error', 'warning') else None)
        page.on("pageerror", lambda err: print(f"[M ERROR] {err}"))

        await page.goto(f"https://beemaster-ai.vercel.app/?t={int(time.time())}", wait_until="networkidle")
        await page.wait_for_timeout(2000)

        # Login
        auth_btn = await page.wait_for_selector('#auth-btn', timeout=10000)
        await auth_btn.click()
        await page.wait_for_timeout(1500)
        await page.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page.fill('input[type="password"]', "123456")
        submit_btn = await page.wait_for_selector('#modal-submit', timeout=5000)
        await submit_btn.click()
        await page.wait_for_timeout(8000)

        await page.wait_for_function("() => typeof App !== 'undefined' && typeof BM !== 'undefined'", timeout=10000)
        await page.wait_for_timeout(3000)

        print("=" * 60)
        print("AI ANOMALY TEST - Ana arı YOK + Yumurta YOK")
        print("=" * 60)

        # Check login + state cleared
        await page.evaluate("() => App.nav('hives')")
        await page.wait_for_timeout(2000)
        hives_count = await page.evaluate("() => BM.Storage.list('hives').length")
        print(f"\n[1] Login sonrası kovan sayısı: {hives_count}")
        if hives_count != 0:
            print(f"   ⚠️ Beklenen 0, ama {hives_count} var!")

        # Add a hive
        print("\n[2] Yeni üs + kovan ekle...")
        # Use BM.Storage directly to avoid modal timing
        ap_id = await page.evaluate("""async () => {
            const ap = await BM.Storage.add('apiaries', { name: 'Test Üs', lat: 37.85, lng: 40.2, status: 'active' });
            const h = await BM.Storage.add('hives', {
                name: 'Test Kovan',
                apiaryId: ap.id,
                strain: 'anatolian',
                boxType: 'langstroth',
                status: 'active',
                frameCount: 10
            });
            // Frames
            for (let p = 1; p <= 10; p++) {
                await BM.Storage.add('frames', {
                    hiveId: h.id, position: p,
                    frameType: p <= 3 ? 'brood' : (p <= 6 ? 'honey' : 'foundation'),
                    foundationType: 'wax', status: 'in_use'
                });
            }
            return { ap_id: ap.id, h_id: h.id };
        }""")
        await page.wait_for_timeout(2000)
        print(f"   apiary: {ap_id['ap_id']}, hive: {ap_id['h_id']}")

        # Now navigate to inspections, open wizard
        print("\n[3] Wizard: Ana arı YOK + Yumurta YOK seç...")
        await page.evaluate(f"() => BM.inspections.add('{ap_id['h_id']}')")
        await page.wait_for_timeout(1500)

        # Wait for wizard
        await page.wait_for_selector('#w-hiveId', timeout=5000)

        for step in range(8):
            await page.wait_for_timeout(500)

            # Ana arı seç
            queen_sel = await page.evaluate("""() => {
                const sel = document.getElementById('w-queenSeen');
                if (sel) { sel.value = 'absent'; sel.dispatchEvent(new Event('change', {bubbles: true})); return true; }
                return false;
            }""")
            if queen_sel:
                print(f"   Step {step+1}: Ana Arı → YOK")

            # Yumurta seç
            egg_sel = await page.evaluate("""() => {
                const sel = document.getElementById('w-eggsPattern');
                if (sel) { sel.value = 'absent'; sel.dispatchEvent(new Event('change', {bubbles: true})); return true; }
                return false;
            }""")
            if egg_sel:
                print(f"   Step {step+1}: Yumurta → YOK")

            # İleri / Tamamla
            clicked = await page.evaluate("""() => {
                const btns = Array.from(document.querySelectorAll('button'));
                for (const b of btns) {
                    if (/^(İleri|Sonraki|Next|→)/i.test(b.textContent.trim())) { b.click(); return 'ileri'; }
                    if (/Tamamla|Kaydet|Bitir/i.test(b.textContent)) { b.click(); return 'tamamla'; }
                }
                return null;
            }""")
            if not clicked:
                break
            if clicked == 'tamamla':
                print(f"   Step {step+1}: Tamamla")
                break

        await page.wait_for_timeout(3000)

        # Check saved inspection
        last = await page.evaluate("""() => {
            const all = BM.Storage.list('inspections');
            if (!all.length) return null;
            const sorted = all.sort((a, b) => b.date.localeCompare(a.date));
            const l = sorted[0];
            return {
                queenSeen: l.queenSeen,
                eggsPattern: l.eggsPattern,
                aiAnomaliesType: typeof l.aiAnomalies,
                aiAnomaliesRaw: l.aiAnomalies
            };
        }""")
        print(f"\n[4] Kaydedilen muayene:")
        print(f"   queenSeen: {last['queenSeen']}")
        print(f"   eggsPattern: {last['eggsPattern']}")
        print(f"   aiAnomalies type: {last['aiAnomaliesType']}")
        if last['aiAnomaliesType'] == 'string':
            try:
                parsed = json.loads(last['aiAnomaliesRaw'])
                print(f"   aiAnomalies (parsed, {len(parsed)} items):")
                for a in parsed:
                    print(f"      {a.get('icon')} [{a.get('severity')}] {a.get('title')}: {a.get('explanation')}")
            except:
                print(f"   aiAnomalies (raw): {last['aiAnomaliesRaw'][:300]}")
        elif last['aiAnomaliesType'] == 'number':
            print(f"   aiAnomalies (number): {last['aiAnomaliesRaw']}")

        # Open detail modal
        print("\n[5] Detay modal AI bölümü kontrol...")
        await page.evaluate("() => App.nav('inspections')")
        await page.wait_for_timeout(2000)
        await page.evaluate("""() => {
            const btn = document.querySelector('.timeline__item button[title="Detay Görüntüle"]');
            if (btn) btn.click();
        }""")
        await page.wait_for_timeout(2000)

        ai_html = await page.evaluate("""() => {
            const m = document.querySelector('.modal__content');
            if (!m) return null;
            const text = m.textContent;
            const match = text.match(/AI ANOMAL.{0,500}/);
            return {
                hasAnomali: text.includes('anomali'),
                hasTespitEdilmedi: text.includes('tespit edilmedi'),
                aiSection: match ? match[0].slice(0, 400) : 'BULUNAMADI'
            };
        }""")
        print(f"   AI Modal:")
        for k, v in (ai_html or {}).items():
            print(f"      {k}: {v}")

        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/ai_final_test.png', full_page=True)
        await browser.close()

asyncio.run(test_ai_anomaly())