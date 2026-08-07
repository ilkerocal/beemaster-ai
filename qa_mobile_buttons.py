import asyncio, time
from playwright.async_api import async_playwright

async def test_mobile_buttons():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        iphone = p.devices['iPhone 13']
        ctx = await browser.new_context(
            **iphone,
            permissions=['geolocation'],
            geolocation={'latitude': 37.85, 'longitude': 40.2},
        )
        page = await ctx.new_page()

        page.on("console", lambda msg: print(f"[M] {msg.type}: {msg.text}") if msg.type in ('error', 'warning') else None)
        page.on("pageerror", lambda err: print(f"[M ERROR] {err}"))

        await page.goto(f"https://beemaster-ai.vercel.app/?t={int(time.time())}", wait_until="networkidle")
        await page.wait_for_timeout(3000)

        # Login
        auth_btn = await page.wait_for_selector('#auth-btn', timeout=10000)
        await auth_btn.click()
        await page.wait_for_timeout(1500)
        await page.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page.fill('input[type="password"]', "123456")
        await page.click('#modal-submit')
        await page.wait_for_timeout(8000)

        await page.wait_for_function("() => typeof App !== 'undefined' && typeof BM !== 'undefined'", timeout=10000)
        await page.wait_for_timeout(2000)

        print("=" * 60)
        print("MOBİL BUTON QA")
        print("=" * 60)

        # Tüm header ve bottom-nav butonlarını tara
        buttons = await page.evaluate("""() => {
            const btns = [];

            // Header buttons
            document.querySelectorAll('.app__header button').forEach((b, i) => {
                const r = b.getBoundingClientRect();
                const cs = getComputedStyle(b);
                btns.push({
                    area: 'header',
                    index: i,
                    text: b.textContent.trim().slice(0, 30),
                    title: b.title,
                    visible: r.width > 0 && r.height > 0,
                    width: Math.round(r.width),
                    height: Math.round(r.height),
                    pointerEvents: cs.pointerEvents,
                    zIndex: cs.zIndex,
                    position: { top: Math.round(r.top), left: Math.round(r.left) }
                };
            });

            // Bottom nav items
            document.querySelectorAll('.bottom-nav__item').forEach((b, i) => {
                const r = b.getBoundingClientRect();
                const cs = getComputedStyle(b);
                btns.push({
                    area: 'bottom-nav',
                    index: i,
                    text: b.textContent.trim().slice(0, 30),
                    title: b.title || b.getAttribute('data-view'),
                    visible: r.width > 0 && r.height > 0,
                    width: Math.round(r.width),
                    height: Math.round(r.height),
                    pointerEvents: cs.pointerEvents,
                    zIndex: cs.zIndex,
                    position: { top: Math.round(r.top), left: Math.round(r.left) }
                });
            });

            return btns;
        }""")

        print(f"\nBulunan butonlar: {len(buttons)}")
        for b in buttons:
            print(f"\n  [{b['area']}] '{b['text']}' title='{b['title']}'")
            print(f"     pos=({b['position']['left']},{b['position']['top']}) size={b['width']}x{b['height']}")
            print(f"     pointer-events={b['pointerEvents']} z-index={b['zIndex']} display={b['display']}")
            if not b['visible']:
                print("     ⚠️ GÖRÜNMÜYOR!")

        # Her butona tıkla (sadece visible olanları)
        print("\n" + "=" * 60)
        print("CLICK TEST")
        print("=" * 60)

        for b in buttons:
            if not b['visible']:
                continue
            area = b['area']
            label = b['text'] or b['title']
            try:
                # Önce modal kapat (varsa)
                await page.evaluate("() => { const m = document.getElementById('modal-overlay'); if (m) m.classList.remove('modal-overlay--active'); }")
                await page.wait_for_timeout(200)

                # Element handle
                selector = ""
                if area == 'header':
                    selector = f".app__header button:nth-child({b['index']+1})"
                else:
                    selector = f".bottom-nav__item:nth-child({b['index']+1})"

                # elementFromPoint test
                el_at_point = await page.evaluate(f"""() => {{
                    const x = {b['position']['left']} + {b['width']}//2;
                    const y = {b['position']['top']} + {b['height']}//2;
                    const el = document.elementFromPoint(x, y);
                    return el ? {{
                        tag: el.tagName,
                        class: (el.className || '').toString().slice(0, 40),
                        text: el.textContent.trim().slice(0, 20)
                    }} : null;
                }}""")
                is_clickable = el_at_point and (label in (el_at_point.get('text', '') or ''))

                await page.click(selector, timeout=2000, force=True)
                await page.wait_for_timeout(500)
                print(f"\n  ✅ [{area}] '{label}' → tıklanabilir, üstündeki el: {el_at_point}")
            except Exception as e:
                err_msg = str(e)[:100]
                if 'intercept' in err_msg or 'outside' in err_msg:
                    print(f"\n  ❌ [{area}] '{label}' → BLOKLANMIŞ: {err_msg}")
                else:
                    print(f"\n  ⚠️ [{area}] '{label}' → Hata: {err_msg}")

        # Şu anki view'i yazdır
        await page.wait_for_timeout(1000)
        current_view = await page.evaluate("() => App.currentView")
        print(f"\n\nŞu anki view: {current_view}")

        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/mobile_buttons_qa.png', full_page=True)
        await browser.close()

asyncio.run(test_mobile_buttons())