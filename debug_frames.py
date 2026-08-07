import asyncio
from playwright.async_api import async_playwright

async def debug_frames():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)

        # Desktop context
        ctx = await browser.new_context()
        page = await ctx.new_page()
        page.on("console", lambda msg: print(f"[D] {msg.type}: {msg.text}") if msg.type in ('error', 'warning') else None)
        page.on("pageerror", lambda err: print(f"[D ERROR] {err}"))

        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle")
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(2000)

        print("=" * 60)
        print("DEBUG: Frame sorunu")
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

        # Check local data
        apiaries = await page.evaluate("() => BM.Storage.list('apiaries')")
        hives = await page.evaluate("() => BM.Storage.list('hives')")
        frames = await page.evaluate("() => BM.Storage.list('frames')")
        queens = await page.evaluate("() => BM.Storage.list('queens')")
        inspections = await page.evaluate("() => BM.Storage.list('inspections')")
        harvests = await page.evaluate("() => BM.Storage.list('harvests')")
        feedings = await page.evaluate("() => BM.Storage.list('feedings')")
        treatments = await page.evaluate("() => BM.Storage.list('treatments')")
        diseases = await page.evaluate("() => BM.Storage.list('diseases')")
        inventory = await page.evaluate("() => BM.Storage.list('inventory')")

        print(f"[D] Apiaries: {len(apiaries)}, Hives: {len(hives)}, Frames: {len(frames)}")
        print(f"[D] Queens: {len(queens)}, Inspections: {len(inspections)}")
        print(f"[D] Harvests: {len(harvests)}, Feedings: {len(feedings)}")
        print(f"[D] Treatments: {len(treatments)}, Diseases: {len(diseases)}, Inventory: {len(inventory)}")

        if apiaries:
            print(f"\n[D] First apiary: {apiaries[0].get('name')}")
            apiary_id = apiaries[0]['id']

            # Show all hives
            print(f"\n[D] Hives:")
            for h in hives[:10]:
                print(f"  - {h.get('name')} (apiary: {h.get('apiaryId')}, frameCount: {h.get('frameCount')}, id: {h.get('id')})")

            # Check frames
            print(f"\n[D] Frames:")
            for f in frames[:10]:
                print(f"  - {f.get('id')} (hive: {f.get('hiveId')}, type: {f.get('frameType')})")

        # ============ ADD NEW HIVE TEST ============
        print("\n" + "=" * 60)
        print("ADD NEW HIVE TEST")
        print("=" * 60)

        # Try to add a hive via UI
        await page.click('[data-view="apiaries"]', timeout=5000)
        await page.wait_for_timeout(2000)

        await page.click('[data-view="hives"]', timeout=5000)
        await page.wait_for_timeout(2000)

        # Click + Yeni Kovan
        new_hive_btn = await page.wait_for_selector('text=+ Yeni Kovan', timeout=5000)
        await new_hive_btn.click()
        await page.wait_for_timeout(1000)

        # Fill name
        name_input = await page.wait_for_selector('input[name="name"]', timeout=5000)
        await name_input.fill("Test Yeni Kovan")

        # Set frame count
        frame_input = await page.wait_for_selector('input[name="frameCount"]', timeout=5000)
        await frame_input.fill("8")

        # Submit
        submit_btn = await page.wait_for_selector('#modal-submit', timeout=5000)
        await submit_btn.click()
        await page.wait_for_timeout(3000)

        # Check if frames were created
        hives_after = await page.evaluate("() => BM.Storage.list('hives')")
        frames_after = await page.evaluate("() => BM.Storage.list('frames')")
        new_hive = [h for h in hives_after if h.get('name') == 'Test Yeni Kovan']
        print(f"[D] After add - Hives: {len(hives_after)}, Frames: {len(frames_after)}")
        if new_hive:
            print(f"[D] New hive: {new_hive[0]}")
            new_hive_id = new_hive[0]['id']
            new_hive_frames = [f for f in frames_after if f.get('hiveId') == new_hive_id]
            print(f"[D] Frames for new hive: {len(new_hive_frames)}")
            if new_hive_frames:
                print(f"✅ Yeni kovan için {len(new_hive_frames)} frame oluşturuldu")
            else:
                print(f"❌ Yeni kovan için frame oluşturulMADI!")

        # ============ HIVE DETAIL TEST ============
        print("\n" + "=" * 60)
        print("HIVE DETAIL TEST")
        print("=" * 60)

        if new_hive:
            # Open hive detail
            await page.evaluate("() => BM.hives.detail('" + new_hive_id + "')")
            await page.wait_for_timeout(2000)

            content = await page.evaluate("() => document.querySelector('#view-hive-detail')?.innerHTML || ''")
            print(f"[D] Detail content length: {len(content)}")
            print(f"[D] Has 'Çerçeveler' tab: {'Çerçeveler' in content}")
            print(f"[D] Has frame grid: {'frame-grid' in content}")
            print(f"[D] Has '← Kovanlar' back link: {'Kovanlar' in content}")

            # Try clicking back link
            back_link = await page.query_selector('#view-hive-detail a[onclick*=\"App.render(\\\"hives\\\")\"]')
            if back_link:
                onclick_attr = await back_link.get_attribute('onclick')
                print(f"[D] Back link onclick: {onclick_attr}")
                await back_link.click()
                await page.wait_for_timeout(2000)

                current_view = await page.evaluate("() => App.currentView")
                print(f"[D] After back click, currentView: {current_view}")

        await browser.close()

asyncio.run(debug_frames())