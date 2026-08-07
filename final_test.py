import asyncio
from playwright.async_api import async_playwright

async def test_hamburger_and_nav():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        # Disable cache to ensure we get the latest version
        await context.route("**/*", lambda route: route.continue_(headers={**request.headers, "Cache-Control": "no-cache"}))
        page = await context.new_page()
        
        # Go to the app with a cache buster
        await page.goto("https://beemaster-ai.vercel.app/?cb=" + str(int(__import__('time').time())), wait_until="networkidle")
        await page.wait_for_timeout(3000)
        
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
        
        # Close any modal
        await page.evaluate("() => { if (BM.Modal) BM.Modal.close() }")
        await page.wait_for_timeout(500)
        
        # Wait for App to be defined
        await page.wait_for_function("() => typeof App !== 'undefined'", timeout=10000)
        print("App is ready")
        
        # Test 1: Hamburger menu opens and closes
        print("\n=== Test 1: Hamburger Menu ===")
        hamburger = await page.wait_for_selector('.sidebar-toggle', timeout=5000)
        hamburger_box = await hamburger.bounding_box()
        await page.mouse.click(hamburger_box['x'] + hamburger_box['width']/2, hamburger_box['y'] + hamburger_box['height']/2)
        await page.wait_for_timeout(800)
        
        sidebar_open = await page.evaluate("() => document.getElementById('app-sidebar').classList.contains('sidebar--open')")
        hamburger_display = await page.evaluate("() => getComputedStyle(document.querySelector('.sidebar-toggle')).display")
        print(f"Sidebar open after hamburger click: {sidebar_open}")
        print(f"Hamburger display: {hamburger_display}")
        
        # Test 2: Click bottom nav items while sidebar is open
        print("\n=== Test 2: Bottom Nav with Sidebar Open ===")
        bottom_items = ['dashboard', 'apiaries', 'hives', 'inspections']
        for view in bottom_items:
            print(f"  Trying {view}...")
            try:
                result = await page.evaluate(f"""() => {{
                    const el = document.querySelector('.bottom-nav__item[data-view="{view}"]');
                    if (!el) return false;
                    el.click();
                    return true;
                }}""")
                if result:
                    await page.wait_for_timeout(1000)
                    current_view = await page.evaluate("() => App.currentView")
                    print(f"    Current view: {current_view}")
                    if current_view == view:
                        print(f"    ✅ Success: Navigated to {view}")
                    else:
                        print(f"    ❌ Failed: Expected {view}, got {current_view}")
                else:
                    print(f"    ❌ Element not found for {view}")
            except Exception as e:
                print(f"    ❌ Error: {e}")
        
        # Test 3: Backdrop click closes sidebar
        print("\n=== Test 3: Backdrop Click ===")
        await page.evaluate("() => App.toggleSidebar()")  # Open sidebar
        await page.wait_for_timeout(800)
        sidebar_open_before = await page.evaluate("() => document.getElementById('app-sidebar').classList.contains('sidebar--open')")
        print(f"Sidebar open before backdrop click: {sidebar_open_before}")
        
        # Click on backdrop (right side of sidebar)
        await page.mouse.click(300, 200)  # x=300 should be in backdrop when sidebar is open (sidebar is 260px wide)
        await page.wait_for_timeout(800)
        sidebar_open_after = await page.evaluate("() => document.getElementById('app-sidebar').classList.contains('sidebar--open')")
        print(f"Sidebar open after backdrop click: {sidebar_open_after}")
        
        if sidebar_open_before and not sidebar_open_after:
            print("  ✅ Backdrop click closed sidebar")
        else:
            print("  ❌ Backdrop click did not close sidebar")
        
        # Test 4: Hamburger click opens sidebar again
        print("\n=== Test 4: Hamburger Click Again ===")
        hamburger = await page.wait_for_selector('.sidebar-toggle', timeout=5000)
        hamburger_box = await hamburger.bounding_box()
        await page.mouse.click(hamburger_box['x'] + hamburger_box['width']/2, hamburger_box['y'] + hamburger_box['height']/2)
        await page.wait_for_timeout(800)
        sidebar_open_again = await page.evaluate("() => document.getElementById('app-sidebar').classList.contains('sidebar--open')")
        print(f"Sidebar open after second hamburger click: {sidebar_open_again}")
        
        if sidebar_open_again:
            print("  ✅ Hamburger click opened sidebar")
        else:
            print("  ❌ Hamburger click did not open sidebar")
        
        # Test 5: Frame edit functionality (quick test)
        print("\n=== Test 5: Frame Edit (Quick) ===")
        # We'll just check if we can open a frame edit modal - this requires a hive with frames
        # For now, let's just verify the basic JS is working
        try:
            result = await page.evaluate("() => typeof BM !== 'undefined' && typeof BM.hives !== 'undefined' && typeof BM.frames !== 'undefined'")
            print(f"  BM modules loaded: {result}")
        except Exception as e:
            print(f"  Error checking BM: {e}")
        
        await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/final_verification.png', full_page=False)
        await browser.close()