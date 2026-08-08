import asyncio
from playwright.async_api import async_playwright
import time

async def full_module_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        all_logs = []
        page.on("console", lambda msg: all_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: all_logs.append(f"[PAGE_ERROR] {err}"))

        print("=" * 70)
        print("FULL MODULE TEST - Login flow")
        print("=" * 70)

        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle", timeout=30000)
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(4000)

        print("\n[1] Initial state (guest)")
        state = await page.evaluate("""
            () => ({
                bm: typeof BM,
                auth: BM.Auth.isAuthenticated(),
                apiaries: BM.Storage.list('apiaries').length,
                hives: BM.Storage.list('hives').length,
                sidebarItems: Array.from(document.querySelectorAll('[data-view]')).map(n => n.getAttribute('data-view'))
            })
        """)
        print(f"  bm={state['bm']}, auth={state['auth']}, apiaries={state['apiaries']}, hives={state['hives']}")
        print(f"  Sidebar views: {state['sidebarItems']}")

        print("\n[2] Login as adnanmurat021@gmail.com")
        await page.evaluate("async () => { await BM.Auth.signIn('adnanmurat021@gmail.com', '123456'); }")
        await page.wait_for_timeout(8000)

        state = await page.evaluate("""
            () => ({
                auth: BM.Auth.isAuthenticated(),
                user: BM.Auth.getUser()?.email,
                apiaries: BM.Storage.list('apiaries').length,
                hives: BM.Storage.list('hives').length,
                apiariesNames: BM.Storage.list('apiaries').map(a => a.name)
            })
        """)
        print(f"  After login: {state}")

        # Test each module by navigating
        print("\n[3] Test each sidebar view")
        views_to_test = ['dashboard', 'apiaries', 'hives', 'inspections', 'harvest',
                         'feeding', 'treatments', 'diseases', 'queens', 'inventory',
                         'analytics', 'reports', 'settings']

        for view in views_to_test:
            try:
                await page.evaluate(f"() => {{ if(App.nav) App.nav('{view}'); }}")
                await page.wait_for_timeout(800)
                is_active = await page.evaluate(f"() => document.getElementById('view-{view}')?.classList.contains('view--active')")
                has_content = await page.evaluate(f"() => document.getElementById('view-{view}')?.innerHTML?.length || 0")
                text = await page.evaluate(f"() => document.getElementById('view-{view}')?.innerText?.substring(0, 100) || ''")
                print(f"  [{view}] active={is_active}, htmlLen={has_content}, text='{text[:60].strip()}'")
            except Exception as e:
                print(f"  [{view}] ERROR: {e}")

        # Test hive edit modal specifically
        print("\n[4] Test hive edit modal (frameCount)")
        await page.evaluate("() => App.nav('hives')")
        await page.wait_for_timeout(1000)

        # Click first hive's Düzenle
        await page.evaluate("""
            () => {
                const btns = document.querySelectorAll('.hive-card button');
                for (const b of btns) {
                    if (b.textContent.includes('Düzenle')) { b.click(); return true; }
                }
                return false;
            }
        """)
        await page.wait_for_timeout(1500)

        modal_state = await page.evaluate("""
            () => {
                const modal = document.querySelector('.modal-overlay--active');
                if (!modal) return { active: false };
                const inputs = modal.querySelectorAll('input,select');
                return {
                    active: true,
                    inputCount: inputs.length,
                    frameCountInput: !!modal.querySelector('input[name=\"frameCount\"]'),
                    modalTitle: document.getElementById('modal-title')?.textContent
                };
            }
        """)
        print(f"  Modal: {modal_state}")

        # Test apiary add modal
        print("\n[5] Test apiary add modal")
        await page.evaluate("() => { const m = document.querySelector('.modal-overlay--active'); if(m) m.classList.remove('modal-overlay--active'); }")
        await page.evaluate("() => App.nav('apiaries')")
        await page.wait_for_timeout(1000)

        apiaries_content = await page.evaluate("""
            () => {
                const v = document.getElementById('view-apiaries');
                return {
                    text: v?.innerText?.substring(0, 200),
                    htmlLen: v?.innerHTML?.length || 0
                };
            }
        """)
        print(f"  Apiaries view: {apiaries_content}")

        # Test adding apiary
        await page.evaluate("""
            () => {
                const btns = document.querySelectorAll('button');
                for (const b of btns) {
                    if (b.textContent.includes('Yeni') && b.textContent.includes('Üs')) { b.click(); return true; }
                }
                // Try Yeni Üs or + button
                for (const b of btns) {
                    if (b.textContent.includes('+ Yeni')) { b.click(); return true; }
                }
                return false;
            }
        """)
        await page.wait_for_timeout(1500)

        modal_state = await page.evaluate("""
            () => {
                const modal = document.querySelector('.modal-overlay--active');
                if (!modal) return { active: false };
                return {
                    active: true,
                    title: document.getElementById('modal-title')?.textContent,
                    hasNameInput: !!modal.querySelector('input[name=\"name\"]')
                };
            }
        """)
        print(f"  Add apiary modal: {modal_state}")

        print("\n[6] BM module check")
        modules = await page.evaluate("""
            () => {
                const mods = ['apiaries', 'hives', 'queens', 'inspections', 'feedings', 'harvest',
                              'treatments', 'diseases', 'inventory', 'dashboard', 'analytics',
                              'reports', 'settings', 'weather', 'bio', 'frames'];
                return mods.map(m => ({
                    name: m,
                    exists: typeof BM[m] !== 'undefined',
                    hasRender: typeof BM[m]?.render === 'function',
                    methodCount: BM[m] ? Object.keys(BM[m]).length : 0
                }));
            }
        """)
        for m in modules:
            status = "✅" if m['exists'] and m['hasRender'] else "❌" if not m['exists'] else "⚠️ no render"
            print(f"  {status} {m['name']}: exists={m['exists']}, render={m['hasRender']}, methods={m['methodCount']}")

        print(f"\n[7] Errors during test:")
        errors = [l for l in all_logs if 'PAGE_ERROR' in l or '[error]' in l]
        for e in errors[:10]:
            print(f"  {e[:200]}")

        await browser.close()

asyncio.run(full_module_test())