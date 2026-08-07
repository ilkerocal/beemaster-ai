import asyncio, time
from playwright.async_api import async_playwright

async def test_all_buttons():
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
        await page.click('#auth-btn')
        await page.wait_for_timeout(1500)
        await page.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page.fill('input[type="password"]', "123456")
        await page.click('#modal-submit')
        await page.wait_for_timeout(8000)
        await page.wait_for_function("() => typeof App !== 'undefined' && typeof BM !== 'undefined'")
        await page.wait_for_timeout(3000)

        print("=" * 60)
        print("MOBİLDE ÇALIŞMAYAN BUTONLAR")
        print("=" * 60)

        # Her butonu teker teker tıkla ve state'i kontrol et
        tests = [
            ("bottom-nav:Ana Sayfa", ".bottom-nav__item[data-view=\"dashboard\"]", "dashboard"),
            ("bottom-nav:Üsler", ".bottom-nav__item[data-view=\"apiaries\"]", "apiaries"),
            ("bottom-nav:Kovan", ".bottom-nav__item[data-view=\"hives\"]", "hives"),
            ("bottom-nav:Muayene", ".bottom-nav__item[data-view=\"inspections\"]", "inspections"),
            ("bottom-nav:Bal", ".bottom-nav__item[data-view=\"harvest\"]", "harvest"),
            ("bottom-nav:Ekle", ".bottom-nav__item[onclick*=\"quickAdd\"]", None),
            ("header:Hamburger", ".sidebar-toggle", None),
            ("header:Arama", "button[onclick*=\"App.search\"]", None),
            ("header:Tema", "#theme-toggle", None),
            ("header:Bildirim", "button[onclick*=\"notify.check\"]", None),
            ("header:Auth", "#auth-btn", None),
            ("header:Ekle", "button[onclick*=\"App.quickAdd\"]", None),
        ]

        for name, selector, expected_view in tests:
            try:
                # Modal kapat
                await page.evaluate("() => { const m = document.getElementById('modal-overlay'); if (m) m.classList.remove('modal-overlay--active'); }")
                await page.wait_for_timeout(300)

                # Element var mı
                count = await page.evaluate(f"() => document.querySelectorAll('{selector}').length")
                if count == 0:
                    print(f"\n  ❌ {name}: BULUNAMADI ({selector})")
                    continue

                # İlk önceki view
                before = await page.evaluate("() => App.currentView")
                # Tıkla
                click_result = await page.evaluate(f"""() => {{
                    const el = document.querySelector('{selector}');
                    if (!el) return false;
                    el.click();
                    return true;
                }}""")
                if not click_result:
                    print(f"\n  ❌ {name}: click başarısız")
                    continue

                await page.wait_for_timeout(800)

                after = await page.evaluate("() => App.currentView")
                sidebar_open = await page.evaluate("() => document.getElementById('app-sidebar')?.classList.contains('sidebar--open') || false")
                modal_open = await page.evaluate("() => document.getElementById('modal-overlay')?.classList.contains('modal-overlay--active') || false")

                if expected_view:
                    if after == expected_view:
                        print(f"\n  ✅ {name}: view={after} ✓")
                    else:
                        print(f"\n  ❌ {name}: beklenen={expected_view}, gerçek={after}")
                elif "Hamburger" in name:
                    if sidebar_open:
                        print(f"\n  ✅ {name}: sidebar açıldı ✓")
                    else:
                        print(f"\n  ❌ {name}: sidebar açılmadı")
                elif "Arama" in name:
                    if modal_open:
                        title = await page.evaluate("() => document.querySelector('.modal__title')?.textContent || ''")
                        print(f"\n  ✅ {name}: modal açıldı '{title.strip()[:30]}' ✓")
                    else:
                        print(f"\n  ❌ {name}: modal açılmadı")
                elif "Tema" in name:
                    theme = await page.evaluate("() => document.documentElement.getAttribute('data-theme')")
                    print(f"\n  ✅ {name}: tema={theme} ✓")
                elif "Bildirim" in name:
                    toast = await page.evaluate("() => document.querySelector('.toast')?.textContent || ''")
                    print(f"\n  ✅ {name}: '{toast.strip()[:50]}' ✓")
                elif "Auth" in name:
                    print(f"\n  ✅ {name}: tıklandı (modal state={modal_open})")
                elif "Ekle" in name:
                    if modal_open:
                        title = await page.evaluate("() => document.querySelector('.modal__title')?.textContent || ''")
                        print(f"\n  ✅ {name}: modal açıldı '{title.strip()[:30]}' ✓")
                    else:
                        print(f"\n  ❌ {name}: modal açılmadı")
            except Exception as e:
                print(f"\n  ❌ {name}: {str(e)[:80]}")

        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/all_buttons.png', full_page=False)
        await browser.close()

asyncio.run(test_all_buttons())
