import asyncio
from playwright.async_api import async_playwright

async def test_hamburger_lock():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        iphone = p.devices['iPhone 13']
        ctx = await browser.new_context(**iphone)
        page = await ctx.new_page()

        page.on("console", lambda msg: print(f"[M] {msg.type}: {msg.text}") if msg.type in ('error', 'warning') else None)

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
        print("HAMBURGER LOCK TEST")
        print("=" * 60)

        # Check what elements exist on page
        all_overlays = await page.evaluate("""() => {
            const all = document.querySelectorAll('*');
            const overlays = [];
            all.forEach(el => {
                const cs = getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                if (cs.position === 'fixed' && rect.width > 100 && rect.height > 100) {
                    overlays.push({
                        tag: el.tagName,
                        id: el.id,
                        class: (el.className || '').toString().slice(0, 50),
                        zIndex: cs.zIndex,
                        pointerEvents: cs.pointerEvents,
                        display: cs.display,
                        visibility: cs.visibility,
                        width: rect.width,
                        height: rect.height,
                        top: rect.top,
                        left: rect.left,
                        opacity: cs.opacity
                    });
                }
            });
            return overlays;
        }""")
        print(f"\n[A] Fixed-position overlays on page (before hamburger):")
        for o in all_overlays:
            print(f"   {o}")

        # Click hamburger via Playwright (real tap simulation)
        print("\n[B] Tapping hamburger button...")
        hamburger = await page.wait_for_selector('.sidebar-toggle', timeout=5000)
        hb_info = await hamburger.bounding_box()
        print(f"   Hamburger bbox: {hb_info}")

        # Use tap (mobile touch)
        await page.mouse.click(hb_info['x'] + hb_info['width']/2, hb_info['y'] + hb_info['height']/2)
        await page.wait_for_timeout(1000)

        # Check state after hamburger click
        after_click = await page.evaluate("""() => {
            const sb = document.getElementById('app-sidebar');
            const bd = document.getElementById('sidebar-backdrop');
            const hb = document.querySelector('.sidebar-toggle');
            return {
                sidebarOpen: sb ? sb.classList.contains('sidebar--open') : null,
                sidebarRect: sb ? sb.getBoundingClientRect() : null,
                sidebarPointerEvents: sb ? getComputedStyle(sb).pointerEvents : null,
                sidebarZIndex: sb ? getComputedStyle(sb).zIndex : null,
                sidebarDisplay: sb ? getComputedStyle(sb).display : null,
                sidebarVisibility: sb ? getComputedStyle(sb).visibility : null,
                backdrop: bd ? {
                    display: getComputedStyle(bd).display,
                    pointerEvents: getComputedStyle(bd).pointerEvents,
                    zIndex: getComputedStyle(bd).zIndex,
                    width: bd.offsetWidth,
                    height: bd.offsetHeight
                } : null,
                hamburger: hb ? {
                    display: getComputedStyle(hb).display,
                    offsetWidth: hb.offsetWidth
                } : null,
                bodyClass: document.body.classList.contains('sidebar-open')
            };
        }""")
        print(f"\n[C] State after hamburger tap: {after_click}")

        # Now check what is at various points on screen
        print(f"\n[D] elementFromPoint at different locations:")
        for y in [100, 200, 300, 400, 500, 600]:
            for x in [50, 200, 350]:
                elem = await page.evaluate(f"""() => {{
                    const el = document.elementFromPoint({x}, {y});
                    if (!el) return null;
                    return {{
                        tag: el.tagName,
                        id: el.id,
                        class: (el.className || '').toString().slice(0, 40),
                        text: (el.textContent || '').slice(0, 20)
                    }};
                }}""")
                print(f"   ({x},{y}): {elem}")

        # Try clicking bottom nav
        print(f"\n[E] Try tapping bottom nav (Dashboard)...")
        try:
            nav_items = await page.evaluate("""() => {
                return Array.from(document.querySelectorAll('.bottom-nav__item')).map(item => {
                    const rect = item.getBoundingClientRect();
                    return {
                        dataView: item.getAttribute('data-view'),
                        text: item.textContent.trim().slice(0, 15),
                        x: rect.left + rect.width/2,
                        y: rect.top + rect.height/2,
                        visible: rect.width > 0 && rect.height > 0,
                        atPoint: (() => {
                            const ep = document.elementFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
                            return ep ? ep.tagName + '.' + (ep.className || '').toString().slice(0, 30) : null;
                        })()
                    };
                });
            }""")
            for n in nav_items:
                print(f"   {n}")
        except Exception as e:
            print(f"   Error: {e}")

        # Take screenshot
        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/hamburger_lock.png', full_page=False)
        print(f"\n   Screenshot: hamburger_lock.png")

        await browser.close()

asyncio.run(test_hamburger_lock())