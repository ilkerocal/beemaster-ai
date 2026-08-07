import asyncio
from playwright.async_api import async_playwright

async def test_v320():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        iphone = p.devices['iPhone 13']
        ctx = await browser.new_context(**iphone)
        page = await ctx.new_page()

        page.on("console", lambda msg: print(f"[M] {msg.type}: {msg.text}") if msg.type in ('error', 'warning') else None)
        page.on("pageerror", lambda err: print(f"[M ERROR] {err}"))

        await page.goto("https://beemaster-ai.vercel.app/?t=" + str(int(__import__('time').time())), wait_until="networkidle")
        await page.wait_for_timeout(2000)

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

        print("=" * 60)
        print("v3.2.0 - Hamburger + Sidebar + Inspection Detail")
        print("=" * 60)

        # 1. Hamburger click
        print("\n[1] Hamburger testi...")
        hamburger = await page.wait_for_selector('.sidebar-toggle', timeout=5000)
        hb_info = await hamburger.bounding_box()
        print(f"   Hamburger: {hb_info}")
        await page.mouse.click(hb_info['x'] + hb_info['width']/2, hb_info['y'] + hb_info['height']/2)
        await page.wait_for_timeout(800)

        sb_state = await page.evaluate("""() => ({
            sidebarOpen: document.getElementById('app-sidebar').classList.contains('sidebar--open'),
            hamburgerDisplay: getComputedStyle(document.querySelector('.sidebar-toggle')).display
        })""")
        print(f"   Sidebar state: {sb_state}")

        # 2. Click bottom nav (sidebar should still work)
        print("\n[2] Sidebar açıkken Üsler tıkla...")
        await page.evaluate("""() => {
            const item = document.querySelector('.nav-item[data-view="apiaries"]');
            if (item) item.click();
        }""")
        await page.wait_for_timeout(1500)
        view = await page.evaluate("() => App.currentView")
        print(f"   View: {view}")
        sb_after = await page.evaluate("() => document.getElementById('app-sidebar').classList.contains('sidebar--open')")
        print(f"   Sidebar hala açık mı: {sb_after}")

        # 3. Backdrop click to close
        print("\n[3] Backdrop tıkla (sidebar'ı kapat)...")
        await page.mouse.click(310, 200)
        await page.wait_for_timeout(800)
        sb_closed = await page.evaluate("() => !document.getElementById('app-sidebar').classList.contains('sidebar--open')")
        print(f"   Sidebar kapalı: {sb_closed}")

        # 4. Navigate to inspections
        print("\n[4] Inspections modülüne git...")
        await page.evaluate("""() => {
            const item = document.querySelector('.bottom-nav__item[data-view="inspections"]');
            if (item) item.click();
        }""")
        await page.wait_for_timeout(2000)

        # Check inspections list
        insp_list = await page.evaluate("""() => {
            const items = document.querySelectorAll('.timeline__item');
            return items.length;
        }""")
        print(f"   Timeline items: {insp_list}")

        # 5. Add a new inspection if none exist
        if insp_list == 0:
            print("   No inspections - adding one...")
            await page.evaluate("() => BM.inspections.add()")
            await page.wait_for_timeout(1000)
            # Fill form (multi-step wizard - go through)
            # Click İleri button to next step
            for i in range(5):
                ileri_btn = await page.evaluate("""() => {
                    const btns = Array.from(document.querySelectorAll('button[type="submit"], .btn--primary'));
                    const ileri = btns.find(b => /ileri|sonraki|next/i.test(b.textContent));
                    if (ileri) { ileri.click(); return true; }
                    return false;
                }""")
                await page.wait_for_timeout(500)
                if not ileri_btn:
                    break
            # Final submit
            await page.evaluate("""() => {
                const btns = Array.from(document.querySelectorAll('button[type="submit"], .btn--primary'));
                const kaydet = btns.find(b => /kaydet|tamamla|bitir/i.test(b.textContent));
                if (kaydet) kaydet.click();
            }""")
            await page.wait_for_timeout(2000)

        # 6. Test detail button
        print("\n[5] İlk muayenenin detay butonu (👁)...")
        detail_result = await page.evaluate("""() => {
            const btn = document.querySelector('.timeline__item button[title="Detay Görüntüle"]');
            if (!btn) return { ok: false, reason: 'no button' };
            btn.click();
            return { ok: true };
        }""")
        print(f"   Detail click: {detail_result}")
        await page.wait_for_timeout(1500)

        modal_state = await page.evaluate("""() => {
            const modal = document.getElementById('modal-overlay');
            if (!modal) return null;
            const content = modal.querySelector('.modal__content');
            return {
                open: modal.classList.contains('modal-overlay--active'),
                title: modal.querySelector('.modal__title')?.textContent,
                bodyText: content?.textContent?.slice(0, 300)
            };
        }""")
        print(f"   Modal: {modal_state}")

        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/v320_inspection_detail.png', full_page=True)

        # Close modal
        await page.evaluate("() => BM.Modal.close()")
        await page.wait_for_timeout(500)

        # 7. Check hives + frames - empty frame removed
        print("\n[6] Kovanlar modülüne git, frame tip kontrolü...")
        await page.evaluate("""() => {
            const item = document.querySelector('.bottom-nav__item[data-view="hives"]');
            if (item) item.click();
        }""")
        await page.wait_for_timeout(1500)

        # Open first hive
        await page.evaluate("""() => {
            const card = document.querySelector('.hive-card');
            if (card) card.click();
        }""")
        await page.wait_for_timeout(2000)

        # Switch to frames tab
        await page.evaluate("""() => {
            const tabs = document.querySelectorAll('#hive-tabs .tabs__item');
            const framesTab = Array.from(tabs).find(t => t.dataset.tab === 'frames');
            if (framesTab) framesTab.click();
        }""")
        await page.wait_for_timeout(1500)

        frame_summary = await page.evaluate("""() => {
            const content = document.getElementById('hive-tab-content');
            return content?.textContent?.match(/(\\d+)\\s+Yumurtalık|(\\d+)\\s+Bal|(\\d+)\\s+Polen|(\\d+)\\s+(Ham Petek|Perga)|(\\d+)\\s+Boş/g);
        }""")
        print(f"   Frame summary: {frame_summary}")

        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/v320_frames.png', full_page=True)

        await browser.close()

asyncio.run(test_v320())