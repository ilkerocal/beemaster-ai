import asyncio, time, os, tempfile, shutil
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        # === TAMAMEN AYRI İKİ CHROME ===
        dir1 = os.path.join(tempfile.gettempdir(), "bm_pc_%d" % int(time.time()))
        dir2 = os.path.join(tempfile.gettempdir(), "bm_phone_%d" % int(time.time()))

        # PC - VERİ GİR
        b1 = await p.chromium.launch_persistent_context(dir1, headless=False, viewport={'width':1440,'height':900})
        p1 = await b1.new_page()
        
        p1.on("console", lambda m: print("[PC]", m.text[:120]) if 'DEBUG' in m.text or 'CloudSync' in m.text or 'add error' in m.text else None)

        await p1.goto("https://beemaster-ai.vercel.app/?t=%d" % int(time.time()), wait_until="networkidle")
        await p1.wait_for_timeout(2000)
        
        await p1.click('#auth-btn'); await p1.wait_for_timeout(1500)
        await p1.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await p1.fill('input[type="password"]', "123456")
        await p1.click('#modal-submit')
        await p1.wait_for_timeout(10000)
        await p1.wait_for_function("() => typeof App !== 'undefined' && App.currentView === 'dashboard'")
        await p1.wait_for_timeout(3000)

        # Önce bulutu temizle
        token = await p1.evaluate("() => localStorage.getItem('beemaster-auth-token')")
        uid = await p1.evaluate("() => BM.Storage._userId()")
        print("User:", uid[:20])
        
        # Eski verileri sil
        tables = ['apiaries','hives','queens','inspections','frames','feedings','harvests','treatments','diseases','inventory']
        for t in tables:
            r = await p1.evaluate("""async function() {
                var r = await fetch('https://assfwtjbvuuxclioqsih.supabase.co/rest/v1/%s?user_id=neq.00000000-0000-0000-0000-000000000000', {
                    method: 'DELETE',
                    headers: { 'apikey': 'sb_publishable_3j7uCLoJRximHZjlAi4Frw_7HCwHm6M', 'Authorization': 'Bearer %s' }
                });
                return r.status;
            }""" % (t, token))
            print("  DELETE %s: %s" % (t, r))

        # Local temizle
        await p1.evaluate("""() => {
            BM.Storage.state = {apiaries:[],hives:[],queens:[],frames:[],inspections:[],harvests:[],feedings:[],treatments:[],diseases:[],inventory:[]};
            BM.Storage.save();
            location.reload();
        }""")
        await p1.wait_for_timeout(3000)
        await p1.wait_for_function("() => typeof App !== 'undefined'")
        await p1.wait_for_timeout(2000)

        # Şimdi VERİ EKLE
        await p1.evaluate("""async () => {
            // Login tekrar
            await BM.Storage.add('apiaries', { name: 'FINAL-TEST', lat: 38, lng: 40, location: 'Egil' });
            var a = BM.Storage.list('apiaries')[0];
            await BM.Storage.add('hives', { name: 'FINAL-KOVAN', apiaryId: a.id, strain: 'Kafkas', frameCount: 10 });
            var h = BM.Storage.list('hives')[0];
            await BM.Storage.add('queens', { name: 'FINAL-ANA-ARI', hiveId: h.id, apiaryId: a.id, markingColor: 'Sari', birthDate: new Date().toISOString() });
            await BM.Storage.add('inspections', { hiveId: h.id, apiaryId: a.id, date: new Date().toISOString(), queenSeen: 'seen', eggsPattern: 'regular', notes: 'FINAL MUAYENE' });
            await BM.Storage.add('feedings', { hiveId: h.id, apiaryId: a.id, date: new Date().toISOString(), type: 'sugar_syrup', notes: 'FINAL BESLEME' });
        }""")
        await p1.wait_for_timeout(3000)

        # Supabase check
        print("\n=== PC ADDED → SUPABASE ===")
        for t in ['apiaries','hives','queens','inspections','feedings']:
            cnt = await p1.evaluate("""async function() {
                var r = await fetch('https://assfwtjbvuuxclioqsih.supabase.co/rest/v1/%s?select=id&user_id=eq.%s', {
                    headers: { 'apikey': 'sb_publishable_3j7uCLoJRximHZjlAi4Frw_7HCwHm6M', 'Authorization': 'Bearer %s' }
                });
                var d = await r.json();
                return d.length;
            }""" % (t, uid, token))
            print("  %s: %d" % (t, cnt))

        await p1.close()
        await b1.close()

        await asyncio.sleep(5)

        # === TAMAMEN FARKLI BROWSER (TELEFON) ===
        b2 = await p.chromium.launch_persistent_context(dir2, headless=False, viewport={'width':390,'height':844}, user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')
        p2 = await b2.new_page()

        await p2.goto("https://beemaster-ai.vercel.app/?t=%d" % int(time.time()), wait_until="networkidle")
        await p2.wait_for_timeout(2000)

        await p2.click('#auth-btn'); await p2.wait_for_timeout(1500)
        await p2.fill('input[type="email"]', "adnanmurat021@gmail.com")
        await p2.fill('input[type="password"]', "123456")
        await p2.click('#modal-submit')
        await p2.wait_for_timeout(10000)
        await p2.wait_for_function("() => typeof App !== 'undefined' && App.currentView === 'dashboard'")
        await p2.wait_for_timeout(5000)

        print("\n=== TELEFON (FARKLI BROWSER) ===")
        for coll in ['apiaries','hives','queens','inspections','feedings']:
            cnt = await p2.evaluate("() => BM.Storage.list('%s').length" % coll)
            if coll == 'queens' and cnt > 0:
                names = await p2.evaluate("() => BM.Storage.list('queens').map(function(q){return q.name || '(isimsiz)'}).join(', ')")
                print("  %s: %d → %s" % (coll, cnt, names))
            elif coll == 'inspections' and cnt > 0:
                notes = await p2.evaluate("() => BM.Storage.list('inspections').map(function(i){return i.notes || '(notsuz)'}).join(', ')")
                print("  %s: %d → %s" % (coll, cnt, notes))
            else:
                print("  %s: %d" % (coll, cnt))

        await p2.close()
        await b2.close()

        shutil.rmtree(dir1, ignore_errors=True)
        shutil.rmtree(dir2, ignore_errors=True)

asyncio.run(main())