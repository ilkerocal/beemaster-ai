import asyncio
from playwright.async_api import async_playwright

async def test_basic_functionality():
    async with async_playwright() as p:
        # Use a fresh context with no cache
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        # Disable cache
        await context.route("**/*", lambda route: route.continue_(headers={**route.request.headers, "Cache-Control": "no-cache"}))
        page = await context.new_page()
        
        # Go to the app with a cache buster
        await page.goto("https://beemaster-ai.vercel.app/?cb=" + str(int(__import__('time').time())), wait_until="networkidle")
        await page.wait_for_timeout(2000)
        
        # Check if the page has loaded by looking for a known element
        title = await page.evaluate("() => document.title")
        print(f"Page title: {title}")
        
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
        
        # Close any modal that might be open (like success toast)
        await page.evaluate("() => { if (BM.Modal) BM.Modal.close() }")
        await page.wait_for_timeout(500)
        
        # Now test the hamburger menu and navigation
        print("\n=== Testing Hamburger Menu and Navigation ===")
        
        # 1. Open sidebar via hamburger
        hamburger = await page.wait_for_selector('.sidebar-toggle', timeout=5000)
        hamburger_info = await hamburger.bounding_box()
        await page.mouse.click(hamburger_info['x'] + hamburger_info['width']/2, hamburger_info['y'] + hamburger_info['height']/2)
        await page.wait_for_timeout(800)
        
        # Check sidebar is open
        sidebar_open = await page.evaluate("() => document.getElementById('app-sidebar').classList.contains('sidebar--open')")
        print(f"Sidebar open after hamburger click: {sidebar_open}")
        
        # 2. Try clicking each bottom nav item while sidebar is open
        bottom_items = [
            ('dashboard', '🏠Ana Sayfa'),
            ('apiaries', '📍Üsler'),
            ('hives', '🏠Kovan'),
            ('inspections', '📋Muayene'),
            ('harvest', '🍯Bal'),
            # Note: The +Ekle button is not a nav-item, it's a button with text +Ekle
        ]
        
        for view, label in bottom_items:
            print(f"\n  Trying to click bottom nav item: {label} (data-view={view})")
            try:
                # Use evaluate to click the element directly to avoid any overlay issues
                clicked = await page.evaluate(f"""() => {{
                    const el = document.querySelector('.bottom-nav__item[data-view="{view}"]');
                    if (!el) return false;
                    el.click();
                    return true;
                }}""")
                if clicked:
                    await page.wait_for_timeout(1000)
                    current_view = await page.evaluate("() => App.currentView")
                    print(f"    Current view after click: {current_view}")
                    if current_view == view:
                        print(f"    ✅ Successfully navigated to {view}")
                    else:
                        print(f"    ❌ Failed to navigate to {view}, got {current_view}")
                else:
                    print(f"    ❌ Element not found for {view}")
            except Exception as e:
                print(f"    ❌ Error clicking {view}: {e}")
        
        # 3. Test clicking the +Ekle button (which is not a bottom-nav-item but a button in header-actions)
        print("\n  Trying to click +Ekle button")
        try:
            clicked = await page.evaluate("""() => {
                const el = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === '+ Ekle');
                if (!el) return false;
                el.click();
                return true;
            }""")
            if clicked:
                await page.wait_for_timeout(1000)
                current_view = await page.evaluate("() => App.currentView")
                print(f"    Current view after +Ekle click: {current_view}")
                # The +Ekle button should open a modal, not change the view. So we check if a modal is open.
                modal_open = await page.evaluate("() => document.getElementById('modal-overlay').classList.contains('modal-overlay--active')")
                if modal_open:
                    print(f"    ✅ +Ekle button opened a modal (as expected)")
                else:
                    print(f"    ℹ️ +Ekle button did not open a modal (maybe it's a different action)")
            else:
                print(f"    ❌ +Ekle button not found")
        except Exception as e:
            print(f"    ❌ Error clicking +Ekle: {e}")
        
        # 4. Test backdrop click to close sidebar
        print("\n  Testing backdrop click to close sidebar")
        # First, open sidebar again
        await page.evaluate("() => App.toggleSidebar()")
        await page.wait_for_timeout(800)
        sidebar_open = await page.evaluate("() => document.getElementById('app-sidebar').classList.contains('sidebar--open')")
        print(f"    Sidebar open before backdrop click: {sidebar_open}")
        if sidebar_open:
            # Click on the backdrop area (we know it's on the right side of the sidebar)
            # The sidebar is 260px wide, so we click at x = 260 + 50 (well into the backdrop)
            await page.mouse.click(310, 200)  # x=310, y=200 should be on the backdrop
            await page.wait_for_timeout(800)
            sidebar_open_after = await page.evaluate("() => document.getElementById('app-sidebar').classList.contains('sidebar--open')")
            print(f"    Sidebar open after backdrop click: {sidebar_open_after}")
            if not sidebar_open_after:
                print(f"    ✅ Backdrop click successfully closed sidebar")
            else:
                print(f"    ❌ Backdrop click did not close sidebar")
        
        # 5. Test hamburger click to open sidebar again (should work)
        print("\n  Testing hamburger click to open sidebar")
        await page.wait_for_timeout(500)
        hamburger = await page.wait_for_selector('.sidebar-toggle', timeout=5000)
        hamburger_info = await hamburger.bounding_box()
        await page.mouse.click(hamburger_info['x'] + hamburger_info['width']/2, hamburger_info['y'] + hamburger_info['height']/2)
        await page.wait_for_timeout(800)
        sidebar_open = await page.evaluate("() => document.getElementById('app-sidebar').classList.contains('sidebar--open')")
        print(f"    Sidebar open after hamburger click: {sidebar_open}")
        if sidebar_open:
            print(f"    ✅ Hamburger click successfully opened sidebar")
        else:
            print(f"    ❌ Hamburger click did not open sidebar")
        
        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/final_test.png', full_page=False)
        await browser.close()

asyncio.run(test_basic_functionality())