import asyncio, time, json
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        
        # === PC: Add data + check Supabase ===
        ctx1 = await browser.new_context()
        p1 = await ctx1.new_page()
        p1.on("console", lambda m: print("[LOG]", m.text[:200]))

        await p1.goto("https://beemaster-ai.vercel.app/?t=%d" % int(time.time()), wait_until="networkidle")
        await p1.wait_for_timeout(2000)
        await p1.click('#auth-btn'); await p1.wait_for_timeout(1500)
        await p1.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await p1.fill('input[type="password"]', "123456")
        await p1.click('#modal-submit')
        await p1.wait_for_timeout(10000)
        await p1.wait_for_function("() => typeof App !== 'undefined' && BM.Storage._userId()")
        await p1.wait_for_timeout(2000)

        token = await p1.evaluate("() => localStorage.getItem('beemaster-auth-token')")
        uid = await p1.evaluate("() => BM.Storage._userId()")
        client_ok = await p1.evaluate("() => { try { BM.Auth.getClient(); return true; } catch(e) { return false; }}")
        print("\nAuth: uid=%s client=%s" % (uid[:20], client_ok))

        # CLEAN SUPABASE
        print("\n=== TEMIZLIK ===")
        for t in ['apiaries','hives','queens','inspections','frames','feedings','harvests','treatments','diseases','inventory']:
            r = await p1.evaluate("""async function() {
                try {
                    var c = BM.Auth.getClient();
                    var r = await c.from('%s').delete().neq('id','00000000-0000-0000-0000-000000000000');
                    return r.error ? 'ERR:'+r.error.message : 'OK';
                } catch(e) { return 'EXC:'+e.message; }
            }""" % t)
            print("  DELETE %-12s: %s" % (t, r))

        # Clear local
        await p1.evaluate("""() => {
            BM.Storage.state = {apiaries:[],hives:[],queens:[],frames:[],inspections:[],harvests:[],feedings:[],treatments:[],diseases:[],inventory:[]};
            BM.Storage.save();
        }""")

        # === TEST: Write to EACH table via supabase client directly ===
        print("\n=== DIREKT SUPABASE YAZMA TESTI ===")
        
        tests = {
            'apiaries':    {'name':'T1-US', 'lat':38, 'lng':40, 'location':'Test'},
            'hives':       {'name':'T1-KOVAN', 'apiary_id':'PLACEHOLDER', 'strain':'Test', 'frame_count':5},
            'queens':      {'hive_id':'PLACEHOLDER', 'marked_color':'Sari|NAME:T1-ANA', 'birth_date':'2024-01-01'},
            'inspections': {'hive_id':'PLACEHOLDER', 'queen_seen':'seen', 'eggs_pattern':'regular', 'notes':'T1-MUAYENE', 'date':'2024-01-01'},
            'frames':      {'hive_id':'PLACEHOLDER', 'position':1, 'notes':'|TYPE:brood'},
            'feedings':    {'hive_id':'PLACEHOLDER', 'notes':'T1-BESLEME', 'date':'2024-01-01'},
            'harvests':    {'hive_id':'PLACEHOLDER', 'weight':10, 'notes':'T1-HASAT', 'date':'2024-01-01'},
        }

        results = {}
        
        # First: apiary
        r = await p1.evaluate("""async function() {
            var c = BM.Auth.getClient();
            var d = {name:'T1-US', lat:38, lng:40, location:'Test', user_id:'%s'};
            var r = await c.from('apiaries').insert(d).select();
            return {ok:!r.error, data:r.data, error:r.error?.message};
        }""" % uid)
        results['apiaries'] = r
        aid = r.get('data',[{}])[0].get('id','') if r.get('data') else ''
        print("  apiaries: %s id=%s" % ('OK' if r['ok'] else r.get('error','?'), aid[:15]))

        if aid:
            # Hive (with valid apiary_id)
            r = await p1.evaluate("""async function() {
                var c = BM.Auth.getClient();
                var d = {name:'T1-KOVAN', apiary_id:'%s', strain:'Test', frame_count:5, user_id:'%s'};
                var r = await c.from('hives').insert(d).select();
                return {ok:!r.error, data:r.data, error:r.error?.message};
            }""" % (aid, uid))
            results['hives'] = r
            hid = r.get('data',[{}])[0].get('id','') if r.get('data') else ''
            print("  hives: %s id=%s" % ('OK' if r['ok'] else r.get('error','?'), hid[:15]))

            if hid:
                # Remaining tables
                for t, payload in [
                    ('queens', {'hive_id':hid, 'marked_color':'Sari|NAME:T1-ANA', 'birth_date':'2024-01-01', 'user_id':uid}),
                    ('inspections', {'hive_id':hid, 'queen_seen':'seen', 'eggs_pattern':'regular', 'notes':'T1-MUAYENE', 'date':'2024-01-01', 'user_id':uid}),
                    ('frames', {'hive_id':hid, 'position':1, 'notes':'|TYPE:brood', 'user_id':uid}),
                    ('feedings', {'hive_id':hid, 'notes':'T1-BESLEME', 'date':'2024-01-01', 'user_id':uid}),
                    ('harvests', {'hive_id':hid, 'weight':10, 'notes':'T1-HASAT', 'date':'2024-01-01', 'user_id':uid}),
                ]:
                    r2 = await p1.evaluate("""async function() {
                        var c = BM.Auth.getClient();
                        var r = await c.from('%s').insert(%s).select();
                        return {ok:!r.error, data:r.data, error:r.error?.message, details:r.error?.details};
                    }""" % (t, json.dumps(payload)))
                    results[t] = r2
                    print("  %-12s: %s %s" % (t, 'OK' if r2['ok'] else 'FAIL', r2.get('error','') or ''))

        # NOW READ BACK FROM SUPABASE
        print("\n=== SUPABASE OKUMA ===")
        for t in ['apiaries','hives','queens','inspections','frames','feedings','harvests']:
            r = await p1.evaluate("""async function() {
                var c = BM.Auth.getClient();
                var r = await c.from('%s').select('*',{count:'exact',head:true});
                return {ok:!r.error, count:r.count||0, error:r.error?.message};
            }""" % t)
            ok = 'OK' if r['ok'] else 'FAIL'
            print("  %-12s: %s count=%d %s" % (t, ok, r['count'], r.get('error','')))

        # === MOBILE: Separate browser, login, check data ===
        print("\n=== MOBIL (FARKLI BROWSER) ===")
        ctx2 = await browser.new_context(viewport={'width':390,'height':844}, user_agent='Mozilla/5.0 (iPhone)')
        p2 = await ctx2.new_page()
        
        await p2.goto("https://beemaster-ai.vercel.app/?t=%d" % int(time.time()), wait_until="networkidle")
        await p2.evaluate("() => { localStorage.clear(); caches && caches.keys().then(function(ks){ks.forEach(function(k){caches.delete(k)})}); }")
        await p2.reload(wait_until="networkidle")
        await p2.wait_for_timeout(2000)

        await p2.click('#auth-btn'); await p2.wait_for_timeout(1500)
        await p2.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await p2.fill('input[type="password"]', "123456")
        await p2.click('#modal-submit')
        await p2.wait_for_timeout(10000)
        await p2.wait_for_function("() => typeof App !== 'undefined' && App.currentView === 'dashboard'")
        await p2.wait_for_timeout(6000)

        for t in ['apiaries','hives','queens','inspections','frames','feedings','harvests']:
            cnt = await p2.evaluate("() => BM.Storage.list('%s').length" % t)
            status = "✅" if cnt > 0 else "❌"
            print("  %s %-12s: %d" % (status, t, cnt))

        await p2.close()
        await ctx1.close()
        await browser.close()

asyncio.run(main())