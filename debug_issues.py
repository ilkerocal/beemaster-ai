import asyncio
from playwright.async_api import async_playwright

async def test_issues():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        iphone = p.devices['iPhone 13']
        ctx = await browser.new_context(**iphone)
        page = await ctx.new_page()
        page.on("console", lambda msg: print(f"[M] {msg.type}: {msg.text}") if msg.type in ('error', 'warning') else None)

        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle")
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(2000)

        print("=" * 60)
        print("MOBİL ISSUES DEBUG")
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

        # Add an apiary
        apiary_add = await page.evaluate("""async () => {
            const r = await BM.Storage.add('apiaries', { name: 'Test Üs', location: 'Test', lat: 38, lng: 40, flora: 'test', notes: 'test' });
            window.__apiaryId = r.id;
            return { id: r.id };
        }""")
        print(f"[M] Apiary: {apiary_add}")

        # Add hive
        hive_add = await page.evaluate("""async () => {
            const r = await BM.Storage.add('hives', {
                name: 'Test Kovan', apiaryId: window.__apiaryId, strain: 'carniolan',
                boxType: 'langstroth', frameCount: 10, positionInApiary: 1,
                installedAt: '2026-08-05', status: 'active'
            });
            window.__hiveId = r.id;
            return { id: r.id, frames: BM.Storage.list('frames').filter(f => f.hiveId === r.id).length };
        }""")
        print(f"[M] Hive: {hive_add}")

        await page.wait_for_timeout(1000)

        # Open hive detail
        await page.evaluate(f"() => BM.hives.detail(window.__hiveId)")
        await page.wait_for_timeout(3000)

        # Take screenshot of detail
        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/issue_detail.png', full_page=True)

        # Test 1: Frame edit - click first frame
        print("\n[1] Frame edit test...")
        frames_before = await page.evaluate("() => BM.Storage.list('frames').filter(f => f.hiveId === window.__hiveId)")
        print(f"   Frames before: {len(frames_before)}")
        for f in frames_before[:3]:
            print(f"     - {f.get('frameType')} pos:{f.get('position')} cycles:{f.get('cyclesCompleted')}")

        # Click on first frame
        frame_div = await page.query_selector('.frame-grid .frame')
        if frame_div:
            await frame_div.click()
            await page.wait_for_timeout(1500)

            # Change cyclesCompleted to 3
            cycles_input = await page.query_selector('input[name="cyclesCompleted"]')
            if cycles_input:
                await cycles_input.fill('3')
                print(f"   Cycles input filled to 3")

                # Submit
                submit = await page.query_selector('#modal-submit')
                if submit:
                    await submit.click()
                    await page.wait_for_timeout(3000)

                    frames_after = await page.evaluate("() => BM.Storage.list('frames').filter(f => f.hiveId === window.__hiveId)")
                    print(f"   Frames after: {len(frames_after)}")
                    for f in frames_after[:3]:
                        print(f"     - {f.get('frameType')} pos:{f.get('position')} cycles:{f.get('cyclesCompleted')}")

                    # Check if UI updated
                    ui_cycles = await page.evaluate("""() => {
                        const frames = document.querySelectorAll('.frame-grid .frame');
                        if (!frames.length) return null;
                        return Array.from(frames).slice(0, 3).map(f => f.querySelector('.frame__cycle')?.textContent);
                    }""")
                    print(f"   UI shows cycles: {ui_cycles}")

                    await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/issue_frame_edit.png', full_page=True)

        # Test 2: + Ekle button size
        print("\n[2] + Ekle button size check...")
        await page.evaluate("() => App.nav('dashboard')")
        await page.wait_for_timeout(2000)
        ekle_btn = await page.evaluate("""() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('+ Ekle'));
            if (!btn) return null;
            const rect = btn.getBoundingClientRect();
            return {
                text: btn.textContent.trim(),
                width: rect.width,
                height: rect.height,
                fontSize: getComputedStyle(btn).fontSize,
                padding: getComputedStyle(btn).padding
            };
        }""")
        print(f"   + Ekle button: {ekle_btn}")

        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/issue_ekle_button.png', full_page=True)

        # Test 3: Sidebar backdrop click
        print("\n[3] Backdrop click test...")
        # Open sidebar
        await page.evaluate("() => App.toggleSidebar()")
        await page.wait_for_timeout(500)
        sidebar_open = await page.evaluate("() => document.getElementById('app-sidebar').classList.contains('sidebar--open')")
        print(f"   Sidebar open: {sidebar_open}")

        backdrop_exists = await page.evaluate("() => !!document.getElementById('sidebar-backdrop')")
        print(f"   Backdrop exists: {backdrop_exists}")

        if backdrop_exists:
            backdrop_info = await page.evaluate("""() => {
                const bd = document.getElementById('sidebar-backdrop');
                const rect = bd.getBoundingClientRect();
                return {
                    visible: getComputedStyle(bd).display !== 'none',
                    hasActiveClass: bd.classList.contains('active'),
                    onclick: bd.onclick?.toString(),
                    width: rect.width,
                    height: rect.height
                };
            }""")
            print(f"   Backdrop info: {backdrop_info}")

        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/issue_sidebar_open.png', full_page=True)

        await browser.close()

asyncio.run(test_issues())