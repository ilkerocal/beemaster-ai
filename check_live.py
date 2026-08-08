import asyncio
from playwright.async_api import async_playwright

async def check_live():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 720})
        page = await context.new_page()

        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))

        await page.goto("https://beemaster-ai.vercel.app/?v=check1", wait_until="domcontentloaded", timeout=30000)
        await page.wait_for_timeout(3000)

        # Check which scripts are loaded
        scripts = await page.evaluate("""() => {
            return Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
        }""")
        print("Script srcs loaded:")
        for s in scripts:
            print(f"  {s}")

        # Check which returned 404
        responses = []
        page2 = await context.new_page()
        page2.on("response", lambda r: responses.append((r.url, r.status)) if r.request.resource_type == "script" else None)
        await page2.goto("https://beemaster-ai.vercel.app/?v=check2", wait_until="domcontentloaded", timeout=30000)
        await page2.wait_for_timeout(3000)
        print("\nScript responses:")
        for url, status in responses:
            marker = " *** 404 ***" if status == 404 else ""
            print(f"  {status} {url.split('/')[-1]}{marker}")

        # Check duplicate declarations
        print(f"\nPage errors ({len(errors)}):")
        for err in errors:
            print(f"  {err}")

        # Check if app.js exists on server
        import urllib.request
        for f in ['js/app.js', 'js/core/utils.js', 'js/core/db.js', 'js/core/auth.js', 'js/core/ui.js',
                   'js/modules/apiaries.js', 'js/modules/hives.js', 'js/modules/frames.js',
                   'js/modules/inspections.js', 'js/modules/queens.js', 'js/modules/feeding.js',
                   'js/modules/harvest.js', 'js/modules/treatments.js', 'js/modules/diseases.js',
                   'js/modules/inventory.js', 'js/modules/dashboard.js', 'js/modules/analytics.js',
                   'js/modules/reports.js', 'js/modules/settings.js', 'js/modules/weather.js',
                   'js/modules/bio.js', 'js/supabase-config.js', 'js/app.bundle.js']:
            url = f"https://beemaster-ai.vercel.app/{f}?v=check"
            try:
                req = urllib.request.Request(url, method='HEAD')
                resp = urllib.request.urlopen(req, timeout=10)
                print(f"  {resp.status} {f}")
            except urllib.error.HTTPError as e:
                print(f"  {e.code} {f} *** MISSING ***")
            except Exception as e:
                print(f"  ERR {f}: {e}")

        await browser.close()

asyncio.run(check_live())
