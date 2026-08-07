import asyncio
from playwright.async_api import async_playwright
import time

async def test_add_with_frames():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        all_logs = []
        page.on("console", lambda msg: all_logs.append(f"[{msg.type}] {msg.text}"))

        await page.goto("https://beemaster-ai.vercel.app/", wait_until="networkidle", timeout=30000)
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(3000)

        # Login
        await page.evaluate("async () => { await BM.Auth.signIn('adnanmurat021@gmail.com', '123456'); }")
        await page.wait_for_timeout(8000)

        # Go to hives
        await page.evaluate("() => App.nav('hives')")
        await page.wait_for_timeout(1000)

        before = await page.evaluate("""
            () => ({
                hives: BM.Storage.list('hives').length,
                frames: BM.Storage.list('frames').length
            })
        """)
        print(f"Before: hives={before['hives']}, frames={before['frames']}")

        # Click + Yeni Kovan
        await page.evaluate("""
            () => {
                const btns = document.querySelectorAll('button');
                for (const b of btns) {
                    if (b.textContent.includes('+ Yeni Kovan')) { b.click(); return; }
                }
            }
        """)
        await page.wait_for_timeout(1500)

        # Set frameCount to 3
        fc_input = await page.query_selector("input[name='frameCount']")
        if fc_input:
            await fc_input.click()
            await fc_input.select_text()
            await fc_input.type("3", delay=100)
            await page.wait_for_timeout(300)

        # Set name
        name_input = await page.query_selector("input[name='name']")
        if name_input:
            await name_input.click()
            await name_input.select_text()
            await name_input.type("TEST 3 CERCEVE", delay=50)

        # Submit
        submit_btn = await page.query_selector("#modal-submit")
        await submit_btn.click()
        await page.wait_for_timeout(5000)  # Wait for async

        after = await page.evaluate("""
            () => ({
                hives: BM.Storage.list('hives').length,
                frames: BM.Storage.list('frames').length,
                newHive: BM.Storage.list('hives').find(h => h.name === 'TEST 3 CERCEVE'),
                framesForNew: BM.Storage.list('frames').filter(f => {
                    const h = BM.Storage.list('hives').find(x => x.name === 'TEST 3 CERCEVE');
                    return h && f.hiveId === h.id;
                }).length
            })
        """)
        print(f"\nAfter add:")
        print(f"  hives: {after['hives']}")
        print(f"  total frames: {after['frames']}")
        print(f"  new hive: {after['newHive']}")
        print(f"  frames for new hive: {after['framesForNew']}")

        # Reload to check persistence
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(8000)

        reloaded = await page.evaluate("""
            () => {
                const newHive = BM.Storage.list('hives').find(h => h.name === 'TEST 3 CERCEVE');
                const frames = newHive ? BM.Storage.list('frames').filter(f => f.hiveId === newHive.id) : [];
                return {
                    hive: newHive ? { name: newHive.name, frameCount: newHive.frameCount } : null,
                    frameCount: frames.length
                };
            }
        """)
        print(f"\nAfter reload:")
        print(f"  new hive: {reloaded['hive']}")
        print(f"  frame records: {reloaded['frameCount']}")

        if reloaded['frameCount'] == 3:
            print("\n*** 3 FRAMES CREATED AND PERSISTED ***")
        elif reloaded['frameCount'] == 0:
            print("\n*** BUG: No frames created ***")
        else:
            print(f"\n*** PARTIAL: {reloaded['frameCount']} frames (expected 3) ***")

        # Cleanup test hive
        await page.evaluate("""
            () => {
                const h = BM.Storage.list('hives').find(x => x.name === 'TEST 3 CERCEVE');
                if (h) BM.Storage.remove('hives', h.id);
            }
        """)

        await browser.close()

asyncio.run(test_add_with_frames())