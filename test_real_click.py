import asyncio
from playwright.async_api import async_playwright

async def test_real_click_issue():
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

        # === TEST: GERÇEK KULLANICI SENARYOSU ===
        print("=" * 60)
        print("REAL USER SCENARIO TEST")
        print("=" * 60)

        # 1. Hamburger aç
        print("\n[1] Hamburger menu aç...")
        hamburger = await page.wait_for_selector('.sidebar-toggle', timeout=5000)
        await hamburger.click()
        await page.wait_for_timeout(800)

        # 2. Hamburger backdrop durumu
        bd_state = await page.evaluate("""() => {
            const bd = document.getElementById('sidebar-backdrop');
            if (!bd) return null;
            return {
                display: getComputedStyle(bd).display,
                width: bd.offsetWidth,
                height: bd.offsetHeight,
                zIndex: getComputedStyle(bd).zIndex,
                classList: Array.from(bd.classList)
            };
        }""")
        print(f"   Backdrop state: {bd_state}")

        # 3. Tekrar hamburger kapat
        print("\n[2] Hamburger tekrar tıkla (kapat)...")
        await hamburger.click()
        await page.wait_for_timeout(800)

        bd_after_close = await page.evaluate("""() => {
            const bd = document.getElementById('sidebar-backdrop');
            if (!bd) return null;
            const rect = bd.getBoundingClientRect();
            return {
                display: getComputedStyle(bd).display,
                classList: Array.from(bd.classList),
                hasActiveClass: bd.classList.contains('active'),
                width: rect.width,
                height: rect.height
            };
        }""")
        print(f"   Backdrop after 2nd click: {bd_after_close}")

        # 4. Bottom nav tıklamayı dene
        print("\n[3] Bottom nav Kovan tıkla...")
        try:
            # Use force click to bypass overlap check
            await page.click('.bottom-nav__item[data-view="hives"]', timeout=3000, force=True)
            await page.wait_for_timeout(1500)
            current_view = await page.evaluate("() => App.currentView")
            print(f"   Current view: {current_view}")

            if current_view == 'hives':
                print("   ✅ Bottom nav click ÇALIŞIYOR")
            else:
                print(f"   ❌ View değişmedi: {current_view}")
        except Exception as e:
            print(f"   ❌ Bottom nav click başarısız: {e}")

        # 5. Şimdi + Ekle butonunu bul
        print("\n[4] + Ekle butonunu bul ve tıkla...")
        ekle_btn = await page.evaluate("""() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '+ Ekle');
            if (!btn) return null;
            const rect = btn.getBoundingClientRect();
            return {
                text: btn.textContent.trim(),
                visible: rect.width > 0 && rect.height > 0,
                width: rect.width,
                height: rect.height,
                fontSize: getComputedStyle(btn).fontSize,
                padding: getComputedStyle(btn).padding,
                boundingLeft: rect.left,
                boundingTop: rect.top,
                inViewport: rect.top >= 0 && rect.bottom <= window.innerHeight
            };
        }""")
        print(f"   + Ekle butonu: {ekle_btn}")

        # 6. Hızlı işlemler butonları (dashboard)
        print("\n[5] Dashboard hızlı işlem butonları...")
        quick_btns = await page.evaluate("""() => {
            return Array.from(document.querySelectorAll('.btn')).map(b => {
                const rect = b.getBoundingClientRect();
                return {
                    text: b.textContent.trim().slice(0, 30),
                    width: rect.width,
                    height: rect.height,
                    fontSize: getComputedStyle(b).fontSize,
                    padding: getComputedStyle(b).padding
                };
            }).slice(0, 15);
        }""")
        for b in quick_btns:
            print(f"   {b}")

        # 7. Check backdrop is blocking the bottom nav
        print("\n[6] Bottom nav tıklanabilir mi?")
        nav_clickable = await page.evaluate("""() => {
            const items = document.querySelectorAll('.bottom-nav__item');
            const results = [];
            items.forEach(item => {
                const rect = item.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const elAtPoint = document.elementFromPoint(centerX, centerY);
                results.push({
                    dataView: item.getAttribute('data-view'),
                    text: item.textContent.trim().slice(0, 20),
                    atPoint: elAtPoint ? elAtPoint.tagName + '.' + (elAtPoint.className || '').toString().slice(0, 30) : null,
                    isClickable: elAtPoint === item || item.contains(elAtPoint)
                });
            });
            return results;
        }""")
        for r in nav_clickable:
            print(f"   {r}")

        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/click_test_real.png', full_page=True)
        await browser.close()

asyncio.run(test_real_click_issue())