import asyncio, time
from playwright.async_api import async_playwright

async def test_real_touch():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        iphone = p.devices['iPhone 13']
        ctx = await browser.new_context(**iphone)
        page = await ctx.new_page()

        page.on("console", lambda msg: print(f"[M] {msg.type}: {msg.text}") if msg.type in ('error', 'warning') else None)
        page.on("pageerror", lambda err: print(f"[M ERROR] {err}"))

        # 1) localStorage temizle (cache'te eski state olmasın)
        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle")
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(2000)

        # 2) Login
        await page.click('#auth-btn')
        await page.wait_for_timeout(1500)
        await page.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page.fill('input[type="password"]', "123456")
        await page.click('#modal-submit')
        await page.wait_for_timeout(8000)
        await page.wait_for_function("() => typeof App !== 'undefined'")
        await page.wait_for_timeout(3000)

        # 3) State kontrol
        hives = await page.evaluate("() => BM.Storage.list('hives').length")
        apiaries = await page.evaluate("() => BM.Storage.list('apiaries').length")
        inspections = await page.evaluate("() => BM.Storage.list('inspections').length")
        current_view = await page.evaluate("() => App.currentView")
        user_id = await page.evaluate("() => BM.Auth.getUser()?.id || 'YOK'")

        print(f"=" * 60)
        print(f"LOGIN SONRASI STATE")
        print(f"=" * 60)
        print(f"user_id: {user_id}")
        print(f"current_view: {current_view}")
        print(f"apiaries: {apiaries}, hives: {hives}, inspections: {inspections}")

        # 4) elementFromPoint check - hangi element tepede?
        print(f"\n" + "=" * 60)
        print(f"HER NOKTADA NE VAR?")
        print(f"=" * 60)

        # Viewport boyutu
        vp = page.viewport_size
        print(f"Viewport: {vp}")

        # Header butonları - elementFromPoint
        points = [
            ("Hamburger ☰", 200, 30),
            ("Arama 🔍", 240, 30),
            ("Tema 🌙", 280, 30),
            ("Bildirim 🔔", 320, 30),
            ("Auth 👤", 360, 30),
            ("+Ekle", 380, 30),
            ("bottom-nav:Ana Sayfa", 40, 660),
            ("bottom-nav:Üsler", 105, 660),
            ("bottom-nav:Kovan", 165, 660),
            ("bottom-nav:Muayene", 225, 660),
            ("bottom-nav:Bal", 290, 660),
            ("bottom-nav:Ekle", 355, 660),
        ]

        for label, x, y in points:
            elem = await page.evaluate(f"""() => {{
                const el = document.elementFromPoint({x}, {y});
                if (!el) return null;
                return {{
                    tag: el.tagName,
                    id: el.id,
                    class: (el.className || '').toString().slice(0, 50),
                    text: (el.textContent || '').slice(0, 30).trim()
                }};
            }}""")
            print(f"  ({x:3d},{y:3d}) {label:25s} → {elem}")

        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/touch_test.png', full_page=False)
        await browser.close()

asyncio.run(test_real_touch())
