import asyncio, time, subprocess, json

async def check_supabase_direct():
    """Supabase REST API ile tüm tabloları direkt kontrol et"""
    import urllib.request
    
    # Login almak için Playwright kullan
    from playwright.async_api import async_playwright
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        ctx = await browser.new_context()
        page = await ctx.new_page()
        
        await page.goto("https://beemaster-ai.vercel.app/?t=%d" % int(time.time()), wait_until="networkidle")
        await page.wait_for_timeout(2000)
        await page.click('#auth-btn'); await page.wait_for_timeout(1500)
        await page.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await page.fill('input[type="password"]', "123456")
        await page.click('#modal-submit')
        await page.wait_for_timeout(10000)
        await page.wait_for_function("() => typeof App !== 'undefined'")
        await page.wait_for_timeout(2000)

        token = await page.evaluate("() => localStorage.getItem('beemaster-auth-token')")
        uid = await page.evaluate("() => BM.Storage._userId()")
        print("User:", uid)
        print("Token var:", bool(token))
        
        # TÜM TABLOLARI DİREKT SORGULA
        tables = ['apiaries','hives','queens','inspections','frames','harvests','feedings','treatments','diseases','inventory']
        
        print("\n=== SUPABASE DİREKT SORGU (TÜM TABLOLAR) ===")
        for t in tables:
            result = await page.evaluate("""async function() {
                try {
                    var r = await fetch('https://assfwtjbvuuxclioqsih.supabase.co/rest/v1/%s?select=*&user_id=eq.%s', {
                        headers: {
                            'apikey': 'sb_publishable_3j7uCLoJRximHZjlAi4Frw_7HCwHm6M',
                            'Authorization': 'Bearer %s'
                        }
                    });
                    var data = await r.json();
                    return { status: r.status, count: data.length, first: data[0] ? JSON.stringify(data[0]).slice(0,100) : 'empty' };
                } catch(e) {
                    return { status: 'ERR', count: 0, first: e.message.slice(0,80) };
                }
            }""" % (t, uid, token))
            print("  %-12s: status=%s count=%d | %s" % (t, result['status'], result['count'], result['first']))

        # Ayrıca user_id filtresi OLMADAN da dene (RLS sorunu mu?)
        print("\n=== USER_ID FILTRESIZ (RLS test) ===")
        for t in ['apiaries','hives','queens']:
            result = await page.evaluate("""async function() {
                try {
                    var r = await fetch('https://assfwtjbvuuxclioqsih.supabase.co/rest/v1/%s?select=count', {
                        headers: {
                            'apikey': 'sb_publishable_3j7uCLoJRximHZjlAi4Frw_7HCwHm6M',
                            'Authorization': 'Bearer %s',
                            'Prefer': 'count=exact'
                        }
                    });
                    var count = r.headers.get('content-range');
                    return { status: r.status, count: count };
                } catch(e) {
                    return { status: 'ERR', count: e.message.slice(0,50) };
                }
            }""" % (t, token))
            print("  %s: %s" % (t, result))

        await browser.close()

asyncio.run(check_supabase_direct())