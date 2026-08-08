import asyncio
from playwright.async_api import async_playwright
import time

async def deep_inspect():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()

        all_logs = []
        page.on("console", lambda msg: all_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: all_logs.append(f"[PAGE_ERROR] {err}"))

        await page.goto(f"https://beemaster-ai.vercel.app/?nocache={int(time.time()*1000)}", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(5000)

        # Inspect BM.Storage.update in detail
        info = await page.evaluate("""
            () => {
                const fn = BM.Storage.update;
                return {
                    isAsync: fn.constructor.name === 'AsyncFunction',
                    name: fn.name,
                    src: fn.toString().substring(0, 500),
                    hasAsyncKeyword: fn.toString().includes('async'),
                    length: fn.length
                };
            }
        """)
        print(f"Update info:")
        for k, v in info.items():
            print(f"  {k}: {v}")

        # Also check BM.Storage.add and BM.Storage.remove
        info2 = await page.evaluate("""
            () => ({
                addIsAsync: BM.Storage.add.constructor.name === 'AsyncFunction',
                addHasAsync: BM.Storage.add.toString().includes('async'),
                removeIsAsync: BM.Storage.remove.constructor.name === 'AsyncFunction',
                removeHasAsync: BM.Storage.remove.toString().includes('async')
            })
        """)
        print(f"\nAdd/remove info:")
        for k, v in info2.items():
            print(f"  {k}: {v}")

        # What bundle is actually loaded?
        scripts = await page.evaluate("""
            () => Array.from(document.scripts).map(s => ({
                src: s.src,
                hasContent: !!s.textContent && s.textContent.length > 100,
                contentSize: s.textContent ? s.textContent.length : 0
            }))
        """)
        print(f"\nLoaded scripts:")
        for s in scripts:
            print(f"  {s}")

        print(f"\nLogs: {all_logs}")

        await browser.close()

asyncio.run(deep_inspect())