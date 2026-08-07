import asyncio, time
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        ctx = await browser.new_context()
        page = await ctx.new_page()

        await page.goto("https://beemaster-ai.vercel.app/?t=%d" % int(time.time()), wait_until="networkidle")
        await page.wait_for_timeout(2000)
        await page.click('#auth-btn')
        await page.wait_for_timeout(1500)
        await page.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page.fill('input[type="password"]', "123456")
        await page.click('#modal-submit')
        await page.wait_for_timeout(8000)
        await page.wait_for_function("() => typeof App !== 'undefined'")
        await page.wait_for_timeout(3000)

        # queens tablosunun yapısını öğren
        token = await page.evaluate("() => localStorage.getItem('beemaster-auth-token')")
        
        # Try to insert a minimal queen to see what columns are accepted
        result = await page.evaluate("""async function() {
            var token = localStorage.getItem('beemaster-auth-token');
            var r = await fetch('https://assfwtjbvuuxclioqsih.supabase.co/rest/v1/queens?select=*&limit=0', {
                headers: {
                    'apikey': window.__SUPABASE_ANON_KEY__ || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzc2Z3dGpidnV1eGNsaW9xc2loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAxNTc3NjAwMH0.placeholder',
                    'Authorization': 'Bearer ' + token,
                    'Prefer': 'return=minimal'
                }
            });
            return { status: r.status, headers: Object.fromEntries(r.headers.entries()) };
        }""")
        print("Query result:", result)

        # Bir de OPTIONS request ile şemayı alalım
        result2 = await page.evaluate("""async function() {
            var token = localStorage.getItem('beemaster-auth-token');
            var r = await fetch('https://assfwtjbvuuxclioqsih.supabase.co/rest/v1/queens', {
                method: 'OPTIONS',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'apikey': window.__SUPABASE_ANON_KEY__ || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzc2Z3dGpidnV1eGNsaW9xc2loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAxNTc3NjAwMH0.placeholder'
                }
            });
            return { status: r.status };
        }""")
        print("OPTIONS:", result2)

        await browser.close()

asyncio.run(main())