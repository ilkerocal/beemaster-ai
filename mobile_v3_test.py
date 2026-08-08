import asyncio
from playwright.async_api import async_playwright

async def frame_backfill_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)

        # MOBİL boyut
        iphone = p.devices['iPhone 13']
        ctx = await browser.new_context(**iphone)
        page = await ctx.new_page()
        page.on("console", lambda msg: print(f"[M] {msg.type}: {msg.text}") if msg.type in ('error', 'warning') else None)
        page.on("pageerror", lambda err: print(f"[M ERROR] {err}"))

        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle")
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(2000)

        print("=" * 60)
        print("MOBİL TEST v3.0.3: Frame backfill + back link")
        print("=" * 60)

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
        await page.wait_for_timeout(5000)
        await page.evaluate("() => BM.Modal && BM.Modal.close()")
        await page.wait_for_timeout(500)

        apiaries = await page.evaluate("() => BM.Storage.list('apiaries')")
        hives = await page.evaluate("() => BM.Storage.list('hives')")
        frames = await page.evaluate("() => BM.Storage.list('frames')")
        print(f"[M] Initial: apiaries={len(apiaries)}, hives={len(hives)}, frames={len(frames)}")

        # ============ TEST 1: New hive via UI ============
        print("\n[M] TEST 1: Yeni kovan ekle (UI üzerinden)")
        # Bottom nav'da Kovan (hives) tıkla
        await page.evaluate("() => App.nav('hives')")
        await page.wait_for_timeout(2000)

        # Add a new hive
        new_btn = await page.wait_for_selector('text=+ Yeni Kovan', timeout=5000)
        await new_btn.click()
        await page.wait_for_timeout(1000)

        name_input = await page.wait_for_selector('input[name="name"]', timeout=5000)
        await name_input.fill("Test Mobil Kovan")

        frame_input = await page.wait_for_selector('input[name="frameCount"]', timeout=5000)
        await frame_input.fill("10")

        submit_btn = await page.wait_for_selector('#modal-submit', timeout=5000)
        await submit_btn.click()
        await page.wait_for_timeout(4000)  # Wait for all frames to be created and synced

        hives_after = await page.evaluate("() => BM.Storage.list('hives')")
        frames_after = await page.evaluate("() => BM.Storage.list('frames')")
        new_hive = [h for h in hives_after if h.get('name') == 'Test Mobil Kovan']
        print(f"[M] After add: hives={len(hives_after)}, frames={len(frames_after)}")
        if new_hive:
            new_hive_id = new_hive[0]['id']
            new_hive_frames = [f for f in frames_after if f.get('hiveId') == new_hive_id]
            print(f"[M] New hive '{new_hive[0]['name']}' has {len(new_hive_frames)} frames")
            if len(new_hive_frames) == 10:
                print(f"✅ Yeni kovan 10 frame ile oluşturuldu")
            else:
                print(f"❌ Yeni kovan {len(new_hive_frames)}/10 frame (beklenen 10)")

        # ============ TEST 2: Open hive detail - backfill existing hive ============
        print("\n[M] TEST 2: Mevcut kovan detayını aç")
        # Find first hive without frames
        all_hives = await page.evaluate("() => BM.Storage.list('hives')")
        all_frames = await page.evaluate("() => BM.Storage.list('frames')")
        for h in all_hives:
            h_frames = [f for f in all_frames if f.get('hiveId') == h['id']]
            print(f"  {h.get('name')} (id: {h['id']}, frameCount: {h.get('frameCount')}): {len(h_frames)} frames")

        # Open first hive detail
        first_hive = all_hives[0]
        await page.evaluate(f"() => BM.hives.detail('{first_hive['id']}')")
        await page.wait_for_timeout(3000)

        # Check frames after detail opened
        frames_after_detail = await page.evaluate("() => BM.Storage.list('frames')")
        h_frames_now = [f for f in frames_after_detail if f.get('hiveId') == first_hive['id']]
        print(f"[M] After opening detail '{first_hive.get('name')}': {len(h_frames_now)} frames")
        if len(h_frames_now) > 0:
            print(f"✅ Frame backfill BAŞARILI")
        else:
            print(f"❌ Frame backfill BAŞARISIZ")

        # Take screenshot
        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/mobile_v3_03_detail.png', full_page=True)
        print("[M] Detail screenshot: mobile_v3_03_detail.png")

        # ============ TEST 3: Back link ============
        print("\n[M] TEST 3: Geri linki tıkla")
        back_link = await page.query_selector('#view-hive-detail a')
        if back_link:
            text = await back_link.inner_text()
            print(f"[M] Back link text: '{text}'")
            await back_link.click()
            await page.wait_for_timeout(2000)

            current_view = await page.evaluate("() => App.currentView")
            print(f"[M] After back click, currentView: '{current_view}'")

            active_views = await page.evaluate("""() => {
                return Array.from(document.querySelectorAll('.view')).filter(v => v.classList.contains('view--active')).map(v => v.id);
            }""")
            print(f"[M] Active views: {active_views}")

            if current_view == 'hives' and active_views == ['view-hives']:
                print("✅ Geri linki ÇALIŞIYOR")
            else:
                print(f"❌ Geri linki ÇALIŞMIYOR")
        else:
            print("[M] Back link bulunamadı")

        # Take screenshot
        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/mobile_v3_03_back_to_hives.png', full_page=True)
        print("[M] Back screenshot: mobile_v3_03_back_to_hives.png")

        await browser.close()

asyncio.run(frame_backfill_test())