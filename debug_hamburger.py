import asyncio
from playwright.async_api import async_playwright

async def test_hamburger():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)

        # Gerçek mobil boyut
        iphone = p.devices['iPhone 13']
        ctx = await browser.new_context(**iphone)
        page = await ctx.new_page()

        page.on("console", lambda msg: print(f"[M] {msg.type}: {msg.text}") if msg.type in ('error', 'warning') else None)
        page.on("pageerror", lambda err: print(f"[M ERROR] {err}"))

        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle")
        await page.wait_for_timeout(2000)

        print("=" * 60)
        print("HAMBURGER PANEL DEBUG")
        print("=" * 60)

        # 1) Hamburger button var mı, görünür mü?
        hamburger_info = await page.evaluate("""() => {
            const btn = document.querySelector('.sidebar-toggle');
            if (!btn) return { exists: false };
            const rect = btn.getBoundingClientRect();
            const style = window.getComputedStyle(btn);
            return {
                exists: true,
                display: style.display,
                visibility: style.visibility,
                offsetWidth: btn.offsetWidth,
                offsetHeight: btn.offsetHeight,
                boundingTop: rect.top,
                boundingLeft: rect.left,
                onclick: btn.getAttribute('onclick'),
                inViewport: rect.top >= 0 && rect.left >= 0 && rect.top < window.innerHeight
            };
        }""")
        print(f"\n[1] Hamburger button: {hamburger_info}")

        # 2) Sidebar initial state
        sidebar_info = await page.evaluate("""() => {
            const sb = document.getElementById('app-sidebar');
            if (!sb) return { exists: false };
            const rect = sb.getBoundingClientRect();
            const style = window.getComputedStyle(sb);
            return {
                exists: true,
                display: style.display,
                visibility: style.visibility,
                pointerEvents: style.pointerEvents,
                position: style.position,
                left: style.left,
                width: style.width,
                boundingLeft: rect.left,
                boundingTop: rect.top,
                hasOpenClass: sb.classList.contains('sidebar--open')
            };
        }""")
        print(f"\n[2] Sidebar initial: {sidebar_info}")

        # 3) Viewport size
        vp = await page.evaluate("() => ({ width: window.innerWidth, height: window.innerHeight })")
        print(f"\n[3] Viewport: {vp}")

        # 4) Try to click hamburger
        print("\n[4] Hamburger click test...")
        try:
            hamburger = await page.query_selector('.sidebar-toggle')
            if hamburger:
                is_visible = await hamburger.is_visible()
                print(f"  Visible: {is_visible}")

                if is_visible:
                    await hamburger.click()
                    await page.wait_for_timeout(500)

                    # Check sidebar after click
                    after_click = await page.evaluate("""() => {
                        const sb = document.getElementById('app-sidebar');
                        const rect = sb.getBoundingClientRect();
                        return {
                            hasOpenClass: sb.classList.contains('sidebar--open'),
                            boundingLeft: rect.left,
                            visibility: getComputedStyle(sb).visibility
                        };
                    }""")
                    print(f"  After click: {after_click}")

                    # Take screenshot
                    await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/debug_hamburger_clicked.png', full_page=True)
                    print("  Screenshot: debug_hamburger_clicked.png")
                else:
                    print("  Hamburger not visible - CSS display/visibility issue")
            else:
                print("  Hamburger element NOT FOUND in DOM")
        except Exception as e:
            print(f"  Click error: {e}")

        # 5) Try App.toggleSidebar() directly
        print("\n[5] App.toggleSidebar() direct test...")
        try:
            result = await page.evaluate("""() => {
                if (typeof App !== 'undefined' && typeof App.toggleSidebar === 'function') {
                    App.toggleSidebar();
                    return { ok: true };
                }
                return { ok: false, reason: 'App.toggleSidebar not found' };
            }""")
            print(f"  toggleSidebar result: {result}")
            await page.wait_for_timeout(500)

            after = await page.evaluate("""() => {
                const sb = document.getElementById('app-sidebar');
                return {
                    hasOpenClass: sb.classList.contains('sidebar--open'),
                    boundingLeft: sb.getBoundingClientRect().left
                };
            }""")
            print(f"  After toggle: {after}")
            await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/debug_after_toggle.png', full_page=True)
            print("  Screenshot: debug_after_toggle.png")
        except Exception as e:
            print(f"  Error: {e}")

        # 6) Check all clickable elements in header
        print("\n[6] Header buttons:")
        header_btns = await page.evaluate("""() => {
            const header = document.querySelector('.app__header');
            if (!header) return null;
            return Array.from(header.querySelectorAll('button')).map(b => ({
                id: b.id,
                class: b.className,
                text: b.textContent.trim(),
                onclick: b.getAttribute('onclick')?.slice(0, 50),
                visible: b.offsetWidth > 0 && b.offsetHeight > 0
            }));
        }""")
        print(f"  {header_btns}")

        await browser.close()

asyncio.run(test_hamburger())