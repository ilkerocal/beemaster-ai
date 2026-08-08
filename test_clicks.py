import asyncio
from playwright.async_api import async_playwright

async def test_clicks():
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

        print("=" * 60)
        print("CLICK TEST")
        print("=" * 60)

        # Initial state - what is blocking clicks?
        overlay_check = await page.evaluate("""() => {
            const bd = document.getElementById('sidebar-backdrop');
            const sb = document.getElementById('app-sidebar');
            const mo = document.getElementById('modal-overlay');
            return {
                backdrop: bd ? {
                    display: getComputedStyle(bd).display,
                    pointerEvents: getComputedStyle(bd).pointerEvents,
                    zIndex: getComputedStyle(bd).zIndex,
                    width: bd.offsetWidth,
                    height: bd.offsetHeight
                } : null,
                sidebar: sb ? {
                    display: getComputedStyle(sb).display,
                    pointerEvents: getComputedStyle(sb).pointerEvents,
                    hasOpenClass: sb.classList.contains('sidebar--open')
                } : null,
                modal: mo ? {
                    display: getComputedStyle(mo).display,
                    visibility: getComputedStyle(mo).visibility,
                    classes: mo.className
                } : null
            };
        }""")
        print(f"Initial overlay state: {overlay_check}")

        # Login
        auth_btn = await page.wait_for_selector('#auth-btn', timeout=10000)
        await auth_btn.click()
        await page.wait_for_timeout(1500)

        # Check after login modal opens
        print("\n[1] Login modal açıldı mı?")
        modal_state = await page.evaluate("""() => {
            const mo = document.getElementById('modal-overlay');
            return {
                display: getComputedStyle(mo).display,
                visibility: getComputedStyle(mo).visibility,
                classes: mo.className,
                pointerEvents: getComputedStyle(mo).pointerEvents
            };
        }""")
        print(f"Modal: {modal_state}")

        email_input = await page.wait_for_selector('input[type="email"]', timeout=5000)
        pass_input = await page.wait_for_selector('input[type="password"]', timeout=5000)
        await email_input.fill("adnanmurat021@gmail.com")
        await pass_input.fill("123456")
        submit_btn = await page.wait_for_selector('#modal-submit', timeout=5000)
        await submit_btn.click()
        await page.wait_for_timeout(5000)

        # Check if modal closed
        modal_after = await page.evaluate("""() => {
            const mo = document.getElementById('modal-overlay');
            return {
                classes: mo.className,
                display: getComputedStyle(mo).display
            };
        }""")
        print(f"After login modal: {modal_after}")

        await page.evaluate("() => BM.Modal && BM.Modal.close()")
        await page.wait_for_timeout(500)

        # After modal close
        print("\n[2] Modal kapatıldıktan sonra state:")
        final_check = await page.evaluate("""() => {
            const bd = document.getElementById('sidebar-backdrop');
            const sb = document.getElementById('app-sidebar');
            const mo = document.getElementById('modal-overlay');
            return {
                backdrop: bd ? {
                    display: getComputedStyle(bd).display,
                    pointerEvents: getComputedStyle(bd).pointerEvents,
                    width: bd.offsetWidth,
                    height: bd.offsetHeight,
                    inDOM: bd.parentElement !== null
                } : null,
                sidebar: sb ? {
                    display: getComputedStyle(sb).display,
                    pointerEvents: getComputedStyle(sb).pointerEvents,
                    hasOpenClass: sb.classList.contains('sidebar--open')
                } : null,
                modal: mo ? {
                    classes: mo.className,
                    display: getComputedStyle(mo).display,
                    visibility: getComputedStyle(mo).visibility
                } : null
            };
        }""")
        print(f"After close: {final_check}")

        # Now try clicking Kovan (hives) in bottom nav
        print("\n[3] Bottom nav Kovan tıklama testi...")
        try:
            await page.click('[data-view="hives"]', timeout=5000)
            await page.wait_for_timeout(2000)
            current_view = await page.evaluate("() => App.currentView")
            print(f"   Current view: {current_view}")
        except Exception as e:
            print(f"   Click failed: {e}")

        # Try clicking another nav item
        print("\n[4] Second click test (Muayeneler)")
        try:
            await page.click('[data-view="inspections"]', timeout=5000)
            await page.wait_for_timeout(2000)
            current_view = await page.evaluate("() => App.currentView")
            print(f"   Current view: {current_view}")
        except Exception as e:
            print(f"   Click failed: {e}")

        # Check what element is at click point
        print("\n[5] Element at click point...")
        elem_info = await page.evaluate("""() => {
            const el = document.elementFromPoint(200, 400);
            return el ? {
                tag: el.tagName,
                id: el.id,
                class: el.className?.toString().slice(0, 50),
                text: el.textContent?.slice(0, 30)
            } : null;
        }""")
        print(f"   Element at (200, 400): {elem_info}")

        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/click_issue.png', full_page=True)

        await browser.close()

asyncio.run(test_clicks())