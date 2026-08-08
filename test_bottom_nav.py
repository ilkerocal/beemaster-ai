import asyncio, time
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        iphone = p.devices['iPhone 13']
        ctx = await browser.new_context(**iphone)
        page = await ctx.new_page()

        page.on("console", lambda msg: print(f"[M] {msg.type}: {msg.text}") if msg.type in ('error', 'warning') else None)
        page.on("pageerror", lambda err: print(f"[M ERROR] {err}"))

        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle")
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(2000)

        await page.click('#auth-btn')
        await page.wait_for_timeout(1500)
        await page.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page.fill('input[type="password"]', "123456")
        await page.click('#modal-submit')
        await page.wait_for_timeout(8000)
        await page.wait_for_function("() => typeof App !== 'undefined'")
        await page.wait_for_timeout(3000)

        # Bottom-nav'ın gerçek pozisyonunu al
        rect = await page.evaluate("""() => {
            const nav = document.getElementById('app-bottom-nav');
            const r = nav.getBoundingClientRect();
            return { top: r.top, left: r.left, width: r.width, height: r.height };
        }""")
        print(f"Bottom-nav rect: {rect}")

        # Nav'ın orta yüksekliğinde elementFromPoint
        mid_y = int(rect['top'] + rect['height'] / 2)
        print(f"Testing y={mid_y} (nav midpoint)")

        for x in [40, 105, 165, 225, 290, 355]:
            elem = await page.evaluate(f"""() => {{
                const el = document.elementFromPoint({x}, {mid_y});
                if (!el) return null;
                return {{
                    tag: el.tagName,
                    class: (el.className || '').toString().slice(0, 50),
                    text: (el.textContent || '').slice(0, 20).trim()
                }};
            }}""")
            label = {40:'AnaSayfa',105:'Üsler',165:'Kovan',225:'Muayene',290:'Bal',355:'Ekle'}[x]
            has_correct = 'bottom-nav' in str(elem)
            print(f"  x={x} {label:12s}: {elem} {'✅' if has_correct else '❌'}")

        # Gerçek tap testi - her butona tap
        print("\nTAP TEST:")
        for x in [40, 105, 165, 225, 290, 355]:
            await page.evaluate(f"""() => {{ document.elementFromPoint({x}, {mid_y}).click() }}""")
            await page.wait_for_timeout(500)
            view = await page.evaluate("() => App.currentView")
            label = {40:'AnaSayfa→dashboard',105:'Üsler→apiaries',165:'Kovan→hives',
                     225:'Muayene→inspections',290:'Bal→harvest',355:'Ekle→modal'}[x]
            ok = "✅" if (x<355 and view=={40:'dashboard',105:'apiaries',165:'hives',225:'inspections',290:'harvest'}[x]) else "tap"
            print(f"  {label}: view={view} {ok}")

        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/bottom_nav_fix.png')
        await browser.close()

asyncio.run(main())