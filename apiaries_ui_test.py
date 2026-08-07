import asyncio
from playwright.async_api import async_playwright
import time

async def test_apiaries_via_ui():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        errors = []
        page.on("console", lambda msg: errors.append(f"[{msg.type}] {msg.text}"))

        # Open with cache-bust
        await page.goto("https://beemaster-ai.vercel.app/?v=" + str(int(time.time())), wait_until="networkidle", timeout=30000)
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(3000)

        # Screenshot before login
        await page.screenshot(path="before_login.png")

        # Login via UI - click login button
        login_btn = await page.query_selector("text=Giriş Yap")
        if login_btn:
            await login_btn.click()
            await page.wait_for_timeout(1000)

            # Fill login form
            email_input = await page.query_selector("input[name='email']")
            pass_input = await page.query_selector("input[name='password']")
            if email_input and pass_input:
                await email_input.fill("adnanmurat021@gmail.com")
                await pass_input.fill("123456")
                await page.wait_for_timeout(500)

                # Click submit
                submit = await page.query_selector("#modal-submit")
                if submit:
                    await submit.click()
                    await page.wait_for_timeout(8000)
                    print("Login via UI: done")
                else:
                    print("No submit button found")
            else:
                print(f"Email: {email_input}, Pass: {pass_input}")
                # Maybe different form structure
                modal = await page.query_selector("#modal-overlay")
                if modal:
                    html = await modal.inner_html()
                    print(f"Modal HTML: {html[:500]}")
        else:
            print("No 'Giriş Yap' button found")
            # Try direct login
            await page.evaluate("async () => { await BM.Auth.signIn('adnanmurat021@gmail.com', '123456'); }")
            await page.wait_for_timeout(8000)
            print("Login via JS: done")

        await page.wait_for_timeout(2000)
        await page.screenshot(path="after_login.png")

        # Check auth
        auth = await page.evaluate("() => ({ auth: BM.Auth.isAuthenticated(), user: BM.Auth.getUser()?.email })")
        print(f"Auth: {auth}")

        # Navigate to apiaries via sidebar
        sidebar_btn = await page.query_selector("text=Arı Üsleri")
        if sidebar_btn:
            await sidebar_btn.click()
            await page.wait_for_timeout(2000)
            print("Clicked 'Arı Üsleri' in sidebar")
        else:
            print("'Arı Üsleri' button not found in sidebar, trying nav()")
            await page.evaluate("() => App.nav('apiaries')")
            await page.wait_for_timeout(2000)

        await page.screenshot(path="apiaries_view.png")

        # Check view
        view_info = await page.evaluate("""
            () => {
                const view = document.getElementById('view-apiaries');
                if (!view) return { exists: false };
                const style = getComputedStyle(view);
                return {
                    exists: true,
                    display: style.display,
                    visibility: style.visibility,
                    hasContent: view.innerHTML.length,
                    contentPreview: view.innerHTML.substring(0, 300),
                    buttons: Array.from(view.querySelectorAll('button')).map(b => b.textContent.trim())
                };
            }
        """)
        print(f"\nApiaries view: {view_info}")

        # Try clicking + Yeni Üs
        add_btn = await page.query_selector("text=+ Yeni Üs")
        if add_btn:
            await add_btn.click()
            await page.wait_for_timeout(1500)
            modal_info = await page.evaluate("""
                () => {
                    const modal = document.getElementById('modal-overlay');
                    if (!modal) return { exists: false };
                    return {
                        exists: true,
                        display: getComputedStyle(modal).display,
                        title: document.getElementById('modal-title')?.textContent,
                        hasForm: !!document.getElementById('modal-form')
                    };
                }
            """)
            print(f"Add modal: {modal_info}")
            await page.screenshot(path="add_apiary_modal.png")
        else:
            print("No '+ Yeni Üs' button")

        if errors:
            print(f"\n=== JS ERRORS ===")
            for e in errors[:10]:
                print(f"  {e[:200]}")

        await browser.close()

asyncio.run(test_apiaries_via_ui())