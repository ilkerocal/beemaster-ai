import asyncio
from playwright.async_api import async_playwright

async def test_inspections():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        iphone = p.devices['iPhone 13']
        ctx = await browser.new_context(**iphone)
        page = await ctx.new_page()

        page.on("console", lambda msg: print(f"[M] {msg.type}: {msg.text}") if msg.type in ('error', 'warning') else None)

        await page.goto("https://beemaster-ai.vercel.app/?t=" + str(int(__import__('time').time())), wait_until="networkidle")
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
        await page.wait_for_timeout(6000)
        await page.evaluate("() => BM.Modal && BM.Modal.close()")
        await page.wait_for_timeout(1000)

        # Wait for App to be defined
        await page.wait_for_function("() => typeof App !== 'undefined'", timeout=10000)
        print("App is ready")

        print("=" * 60)
        print("INSPECTIONS DETAIL TEST")
        print("=" * 60)

        # Navigate to inspections
        print("\n[1] Go to inspections...")
        await page.evaluate("() => App.nav('inspections')")
        await page.wait_for_timeout(3000)

        # Check what inspections exist
        insp_list = await page.evaluate("""() => {
            return BM.Storage.list('inspections').map(i => ({
                id: i.id,
                hiveId: i.hiveId,
                date: i.date,
                varroaCount: i.varroaCount,
                notes: i.notes,
                photos: i.photos ? i.photos.length : 0,
                audio: !!i.audio,
                aiAnomalies: i.aiAnomalies
            }));
        }""")
        print(f"   Inspections in storage: {len(insp_list)}")
        for i in insp_list:
            has_anomaly = 'yes' if i['aiAnomalies'] else 'no'
            print(f"     - {i['date']} varroa:{i['varroaCount']} photos:{i['photos']} audio:{i['audio']} anomalies:{has_anomaly}")

        if insp_list:
            # Click detail button for first inspection
            print("\n[2] Click detail button on first inspection...")
            first_id = insp_list[0]['id']
            try:
                await page.evaluate("() => BM.inspections.detail('" + first_id + "')")
                await page.wait_for_timeout(2000)

                # Check modal content
                modal_content = await page.evaluate("""() => {
                    const modal = document.getElementById('modal-overlay');
                    if (!modal) return null;
                    const content = modal.querySelector('.modal__content');
                    return {
                        open: modal.classList.contains('modal-overlay--active'),
                        title: modal.querySelector('.modal__title')?.textContent || '',
                        bodyLength: content?.textContent?.length || 0,
                        hasPhotos: !!content?.querySelector('img'),
                        hasAudio: !!content?.querySelector('audio'),
                        hasAnomalies: content?.textContent?.includes('AI Anomali') || false,
                        hasComparison: content?.textContent?.includes('Karşılaştırma') || false,
                        bodyPreview: content?.textContent?.slice(0, 200) || ''
                    };
                }""")
                print(f"   Modal: {modal_content}")

                await page.screenshot(path='C:/Users/hatbi/BeeMaster-AI/insp_detail.png', full_page=True)
                print("   Screenshot: insp_detail.png")
            except Exception as e:
                print(f"   Error: {e}")
        else:
            print("   No inspections to test detail")

        await browser.close()

asyncio.run(test_inspections())