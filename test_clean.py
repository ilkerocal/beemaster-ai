import asyncio, time
from playwright.async_api import async_playwright

async def test_clean_login():
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
        email_input = await page.wait_for_selector('input[type="email"]', timeout=5000)
        pass_input = await page.wait_for_selector('input[type="password"]', timeout=5000)
        await email_input.fill("adnanmurat021@gmail.com")
        pass_input.fill("123456")
        await page.wait_for_timeout(300)
        submit_btn = await page.wait_for_selector('#modal-submit', timeout=5000)
        await submit_btn.click()
        await page.wait_for_timeout(8000)

        await page.wait_for_function("() => typeof App !== 'undefined' && typeof BM !== 'undefined'", timeout=10000)

        print("=" * 60)
        print("CLEAN LOGIN + AI ANOMALY TEST")
        print("=" * 60)

        # After login, wait for cloud sync, then check hives count
        await page.wait_for_timeout(3000)
        hives_count = await page.evaluate("() => BM.Storage.list('hives').length")
        print(f"\n[1] Login sonrası kovan sayısı: {hives_count}")

        # Get all inspections
        insp_count = await page.evaluate("() => BM.Storage.list('inspections').length")
        print(f"   Muayene sayısı: {insp_count}")

        # Clean ALL cloud data for this user
        print("\n[2] Cloud verilerini temizle...")
        user_id = "537a2244-42be-4628-b192-32832acbd3bd"

        # Direct API call from browser context
        await page.evaluate(f"""async () => {{
            const tables = ['frames', 'inspections', 'harvests', 'feedings', 'treatments', 'diseases', 'queens', 'hives', 'apiaries'];
            const token = localStorage.getItem('beemaster-auth-token');
            for (const t of tables) {{
                try {{
                    const r = await fetch(`https://assfwtjbvuuxclioqsih.supabase.co/rest/v1/${{t}}?user_id=eq.${{'{user_id}'}}`, {{
                        method: 'DELETE',
                        headers: {{
                            'apikey': window.__SUPABASE_ANON_KEY__,
                            'Authorization': `Bearer ${{token}}`
                        }}
                    }});
                    console.log(`Deleted ${{t}}: ${{r.status}}`);
                }} catch(e) {{
                    console.log(`Error ${{t}}: ${{e.message}}`);
                }}
            }}
        }}""")
        await page.wait_for_timeout(2000)

        # Clear local and re-sync from cloud
        await page.evaluate("() => { BM.Storage.state = {}; BM.Storage.save(); }")
        await page.wait_for_timeout(500)

        # Go to hives
        await page.evaluate("() => App.nav('hives')")
        await page.wait_for_timeout(2000)

        hives_after = await page.evaluate("() => BM.Storage.list('hives').length")
        print(f"   Temizlik sonrası kovan sayısı: {hives_after}")

        # Add a test apiary + hive
        print("\n[3] Test üs + kovan ekle...")
        await page.evaluate("() => BM.apiaries.add()")
        await page.wait_for_timeout(800)
        # Modal açıldı, basit bilgi gir
        await page.evaluate("""() => {
            const form = document.getElementById('modal-form');
            if (!form) return;
            const nameInput = form.querySelector('input[name="name"]');
            if (nameInput) nameInput.value = 'Test Üs';
            // İlk submit
            const submit = document.getElementById('modal-submit');
            if (submit) submit.click();
        }""")
        await page.wait_for_timeout(2000)

        # Now add hive
        await page.evaluate("() => BM.hives.add()")
        await page.wait_for_timeout(800)
        await page.evaluate("""() => {
            const form = document.getElementById('modal-form');
            if (!form) return;
            const nameInput = form.querySelector('input[name="name"]');
            if (nameInput) nameInput.value = 'Test Kovan';
            const submit = document.getElementById('modal-submit');
            if (submit) submit.click();
        }""")
        await page.wait_for_timeout(2500)

        hives_final = await page.evaluate("() => BM.Storage.list('hives').length")
        apiaries_final = await page.evaluate("() => BM.Storage.list('apiaries').length")
        frames_final = await page.evaluate("() => BM.Storage.list('frames').length")
        print(f"   Üs: {apiaries_final}, Kovan: {hives_final}, Çerçeve: {frames_final}")

        # Add inspection with queen absent + eggs absent
        print("\n[4] Ana arı YOK + Yumurta YOK muayene ekle...")
        # Hangi kovan? ilk
        first_hive_id = await page.evaluate("() => BM.Storage.list('hives')[0]?.id")
        print(f"   Hive: {first_hive_id}")

        await page.evaluate(f"() => BM.inspections.add('{first_hive_id}')")
        await page.wait_for_timeout(1500)

        # Wizard'da step'leri geç
        for step in range(6):
            wizard_state = await page.evaluate("""() => {
                const m = document.querySelector('.modal__content');
                if (!m) return null;
                const text = (m.textContent || '').slice(0, 200);
                const hasQueenSelect = !!document.getElementById('w-queenSeen');
                const hasEggsSelect = !!document.getElementById('w-eggsPattern');
                return { text, hasQueenSelect, hasEggsSelect };
            }""")
            print(f"   Step {step+1}: {wizard_state}")

            if wizard_state and wizard_state.get('hasQueenSelect'):
                await page.evaluate("""() => {
                    const sel = document.getElementById('w-queenSeen');
                    if (sel) { sel.value = 'absent'; sel.dispatchEvent(new Event('change', {bubbles: true})); }
                }""")
                print("      → Ana Arı: YOK seçildi")

            if wizard_state and wizard_state.get('hasEggsSelect'):
                await page.evaluate("""() => {
                    const sel = document.getElementById('w-eggsPattern');
                    if (sel) { sel.value = 'absent'; sel.dispatchEvent(new Event('change', {bubbles: true})); }
                }""")
                print("      → Yumurta: YOK seçildi")

            clicked = await page.evaluate("""() => {
                const btns = Array.from(document.querySelectorAll('button'));
                const ileri = btns.find(b => /^(İleri|Sonraki|Next|→)/i.test(b.textContent.trim()));
                if (ileri) { ileri.click(); return 'ileri'; }
                const tamamla = btns.find(b => /Tamamla|Kaydet|Bitir/i.test(b.textContent));
                if (tamamla) { tamamla.click(); return 'tamamla'; }
                return null;
            }""")
            if not clicked:
                print("      → Buton yok")
                break
            print(f"      → {clicked}")
            await page.wait_for_timeout(800)
            if clicked == 'tamamla':
                break

        await page.wait_for_timeout(2000)

        # Check saved inspection
        last_insp = await page.evaluate("""() => {
            const all = BM.Storage.list('inspections');
            if (!all.length) return null;
            const sorted = all.sort((a, b) => b.date.localeCompare(a.date));
            return sorted[0];
        }""")
        print(f"\n[5] Son muayene kaydedildi:")
        print(f"   queenSeen: {last_insp.get('queenSeen')}")
        print(f"   eggsPattern: {last_insp.get('eggsPattern')}")
        print(f"   aiAnomalies type: {type(last_insp.get('aiAnomalies'))}")
        ai_data = last_insp.get('aiAnomalies')
        if isinstance(ai_data, str):
            try:
                parsed = __import__('json').loads(ai_data)
                print(f"   aiAnomalies parsed ({len(parsed)} items):")
                for a in parsed:
                    print(f"      {a.get('icon')} {a.get('title')}: {a.get('explanation')}")
            except:
                print(f"   aiAnomalies (raw): {ai_data[:200]}")
        else:
            print(f"   aiAnomalies (value): {ai_data}")

        # Open detail modal
        print("\n[6] Detay modal aç...")
        await page.evaluate("() => App.nav('inspections')")
        await page.wait_for_timeout(2000)
        await page.evaluate("""() => {
            const btn = document.querySelector('.timeline__item button[title="Detay Görüntüle"]');
            if (btn) btn.click();
        }""")
        await page.wait_for_timeout(2000)

        # Check modal AI section
        ai_section = await page.evaluate("""() => {
            const m = document.querySelector('.modal__content');
            if (!m) return null;
            const text = m.textContent;
            return {
                hasAnomali: text.includes('anomali'),
                hasYok: text.includes('Yumurta yok') || text.includes('Ana arı'),
                hasTespitEdildi: text.includes('tespit edilmedi'),
                aiSection: text.match(/AI ANOMAL.{0,200}/)?.[0] || 'YOK'
            };
        }""")
        print(f"   AI Modal: {ai_section}")

        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/ai_test.png', full_page=True)

        await browser.close()

asyncio.run(test_clean_login())