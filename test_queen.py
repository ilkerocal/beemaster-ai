import asyncio, time
from playwright.async_api import async_playwright

async def test_queen_fix():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        iphone = p.devices['iPhone 13']
        ctx = await browser.new_context(**iphone)
        page = await ctx.new_page()

        page.on("console", lambda msg: print(f"[M] {msg.type}: {msg.text}") if msg.type in ('error', 'warning') else None)
        page.on("pageerror", lambda err: print(f"[M ERROR] {err}"))

        await page.goto(f"https://beemaster-ai.vercel.app/?t={int(time.time())}", wait_until="networkidle")
        await page.wait_for_timeout(3000)

        # Login
        auth_btn = await page.wait_for_selector('#auth-btn', timeout=10000)
        await auth_btn.click()
        await page.wait_for_timeout(1500)
        email_input = await page.wait_for_selector('input[type="email"]', timeout=5000)
        pass_input = await page.wait_for_selector('input[type="password"]', timeout=5000)
        await email_input.fill("adnanmurat021@gmail.com")
        await pass_input.fill("123456")
        submit_btn = await page.wait_for_selector('#modal-submit', timeout=5000)
        await submit_btn.click()
        await page.wait_for_timeout(5000)
        await page.evaluate("() => BM.Modal && BM.Modal.close()")
        await page.wait_for_timeout(1000)

        # Wait App
        await page.wait_for_function("() => typeof App !== 'undefined' && typeof BM !== 'undefined'", timeout=10000)

        print("=" * 60)
        print("QUEEN FIX TEST")
        print("=" * 60)

        # Check existing inspections for queenSeen type
        print("\n[1] Mevcut muayenelerin queenSeen tipi...")
        existing = await page.evaluate("""() => {
            return BM.Storage.list('inspections').slice(0, 5).map(i => ({
                date: i.date,
                queenSeen: i.queenSeen,
                queenSeenType: typeof i.queenSeen,
                queenSeenValue: i.queenSeen === true ? 'TRUE(boolean)'
                    : i.queenSeen === false ? 'FALSE(boolean)'
                    : i.queenSeen === 'seen' ? 'seen(string)'
                    : i.queenSeen === 'absent' ? 'absent'
                    : 'unknown'
            }));
        }""")
        for e in existing:
            print(f"   {e['date']}: queenSeen={e['queenSeen']} type={e['queenSeenType']} → {e['queenSeenValue']}")

        # Add a new inspection with "Gördüm" selected (queenSeen=seen)
        print("\n[2] Yeni muayene ekleme wizard testi...")
        # Go to inspections
        await page.evaluate("""() => App.nav('inspections')""")
        await page.wait_for_timeout(1500)

        # Click + Yeni Muayene
        await page.evaluate("""() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Yeni Muayene'));
            if (btn) btn.click();
        }""")
        await page.wait_for_timeout(2000)

        # Wizard should be open. Step 1: Kovan & Tarih. Click İleri
        for step in range(6):
            step_info = await page.evaluate("""() => {
                const wizard = document.querySelector('.modal__content');
                if (!wizard) return null;
                const text = wizard.textContent.slice(0, 100);
                const selects = wizard.querySelectorAll('select');
                const inputs = wizard.querySelectorAll('input');
                return { text, selects: selects.length, inputs: inputs.length };
            }""")
            print(f"   Step {step + 1}: {step_info}")

            # If wizard has Ana Arı select (queenSeen), choose 'seen'
            if step_info and 'Ana Ar' in (step_info.get('text') or ''):
                print(f"   → Ana Arı select var, 'Gördüm' seçiliyor...")
                await page.evaluate("""() => {
                    const sel = document.getElementById('w-queenSeen');
                    if (sel) { sel.value = 'seen'; sel.dispatchEvent(new Event('change', {bubbles: true})); }
                }""")
                await page.wait_for_timeout(300)

            # Click İleri/Tamamla
            clicked = await page.evaluate("""() => {
                const btns = Array.from(document.querySelectorAll('button'));
                const ileri = btns.find(b => b.textContent.match(/^(İleri|Sonraki|Next|→)/));
                if (ileri) { ileri.click(); return 'ileri'; }
                const tamamla = btns.find(b => /Tamamla|Kaydet|Bitir/i.test(b.textContent));
                if (tamamla) { tamamla.click(); return 'tamamla'; }
                return null;
            }""")
            if not clicked:
                print(f"   → İleri butonu yok, çıkılıyor")
                break
            print(f"   → Tıklandı: {clicked}")
            await page.wait_for_timeout(800)
            if clicked == 'tamamla':
                break

        await page.wait_for_timeout(2000)

        # Verify the saved inspection
        print("\n[3] Kaydedilen son muayeneyi kontrol et...")
        last_inspection = await page.evaluate("""() => {
            const all = BM.Storage.list('inspections');
            if (!all.length) return null;
            const sorted = all.sort((a, b) => b.date.localeCompare(a.date));
            const last = sorted[0];
            return {
                id: last.id,
                date: last.date,
                queenSeen: last.queenSeen,
                queenSeenType: typeof last.queenSeen,
                aiAnomalies: last.aiAnomalies,
                mode: last.mode
            };
        }""")
        print(f"   Last inspection: {last_inspection}")

        # Now check the timeline display
        print("\n[4] Timeline'da görünüm...")
        await page.evaluate("() => App.nav('inspections')")
        await page.wait_for_timeout(2000)

        # Re-render and check
        timeline_info = await page.evaluate("""() => {
            const items = document.querySelectorAll('.timeline__item');
            const last = items[0];
            if (!last) return null;
            return {
                total: items.length,
                firstText: last.textContent.replace(/\\s+/g, ' ').slice(0, 200)
            };
        }""")
        print(f"   Timeline: {timeline_info}")

        # Click detail button for last inspection
        print("\n[5] Detay modalda queenSeen kontrolü...")
        try:
            await page.evaluate("""() => {
                const btn = document.querySelector('.timeline__item button[title="Detay Görüntüle"]');
                if (btn) btn.click();
            }""")
            await page.wait_for_timeout(1500)

            modal_text = await page.evaluate("""() => {
                const m = document.querySelector('.modal__content');
                if (!m) return null;
                return {
                    queenSeenDisplay: m.textContent.match(/Ana Ar.{0,2}[:\s]+([^\n|]+)/)?.[1]?.trim(),
                    hasAIBadge: m.textContent.includes('AI Anomali')
                };
            }""")
            print(f"   Modal: {modal_text}")
        except Exception as e:
            print(f"   Error: {e}")

        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/queen_test.png', full_page=True)
        await browser.close()

asyncio.run(test_queen_fix())