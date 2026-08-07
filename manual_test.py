import asyncio
from playwright.async_api import async_playwright
import time

async def manual_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()

        all_logs = []
        page.on("console", lambda msg: all_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: all_logs.append(f"[PAGE_ERROR] {err}"))

        await page.goto(f"https://beemaster-ai.vercel.app/?cb={int(time.time())}", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(5000)

        # Direct test: call update with sync logic manually
        result = await page.evaluate("""
            async () => {
                const hid = 'hv_1';
                const before = BM.Storage.list('frames').filter(f => f.hiveId === hid).length;
                const h_before = BM.Storage.get('hives', hid).frameCount;
                
                console.log('Before:', { h_before, before });
                
                try {
                    // Simulate what the callback does
                    await BM.Storage.update('hives', hid, { frameCount: 5 });
                    const h_after = BM.Storage.get('hives', hid).frameCount;
                    console.log('After hive update:', h_after);
                    
                    const existingFrames = BM.Storage.list('frames').filter(f => f.hiveId === hid).sort((a, b) => a.position - b.position);
                    console.log('Existing frames:', existingFrames.length);
                    
                    const oldCount = existingFrames.length;
                    const newCount = 5;
                    if (newCount < oldCount) {
                        const toRemove = existingFrames.slice(newCount);
                        console.log('To remove:', toRemove.length, 'frames');
                        for (const f of toRemove) {
                            await BM.Storage.remove('frames', f.id);
                        }
                    }
                    
                    const after = BM.Storage.list('frames').filter(f => f.hiveId === hid).length;
                    console.log('After sync:', after);
                    
                    return { h_before, h_after, before, after };
                } catch (e) {
                    return { error: e.message, stack: e.stack };
                }
            }
        """)
        print(f"Result: {result}")

        print(f"\nAll logs:")
        for log in all_logs:
            print(f"  {log[:300]}")

        await browser.close()

asyncio.run(manual_test())