import asyncio, time
from playwright.async_api import async_playwright

async def main():
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
        print("Token:", token[:30] + "...")
        print("User:", uid)

        # SUPABASE CLIENT ile temizle
        print("\n=== TEMIZLENIYOR ===")
        tables = ['apiaries','hives','queens','inspections','frames','harvests','feedings','treatments','diseases','inventory']
        
        for t in tables:
            r = await page.evaluate("""async function() {
                try {
                    var client = BM.Auth.getClient();
                    var r = await client.from('%s').delete().neq('user_id', '00000000-0000-0000-0000-000000000000');
                    return { ok: !r.error, error: r.error ? r.error.message : null };
                } catch(e) {
                    return { ok: false, error: e.message };
                }
            }""" % t)
            print("  %s: %s" % (t, "OK" if r['ok'] else r.get('error','FAIL')))

        # Local temizle
        await page.evaluate("""() => {
            BM.Storage.state = {apiaries:[],hives:[],queens:[],frames:[],inspections:[],harvests:[],feedings:[],treatments:[],diseases:[],inventory:[]};
            BM.Storage.save();
        }""")

        # Verify clean
        await page.wait_for_timeout(2000)
        print("\n=== DOGRULAMA ===")
        for t in ['apiaries','hives','queens','inspections']:
            cnt = await page.evaluate("""async function() {
                var client = BM.Auth.getClient();
                var r = await client.from('%s').select('*', { count: 'exact', head: true });
                return r.count || 0;
            }""" % t)
            print("  %s: %d" % (t, cnt))

        await browser.close()

asyncio.run(main())