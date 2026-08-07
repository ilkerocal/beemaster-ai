import asyncio
from playwright.async_api import async_playwright
import time

async def diagnose():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        all_logs = []
        page.on("console", lambda msg: all_logs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: all_logs.append(f"[PAGE_ERROR] {err}"))

        await page.goto(f"https://beemaster-ai.vercel.app/?cb={int(time.time()*1000)}", wait_until="networkidle", timeout=30000)
        await page.wait_for_timeout(5000)

        # Diagnose Supabase connection
        diag = await page.evaluate("""
            () => {
                const result = {
                    supabaseLoaded: !!window.supabase,
                    supabaseUrl: window.__SUPABASE_URL__,
                    hasAnonKey: !!window.__SUPABASE_ANON_KEY__,
                    anonKeyPrefix: window.__SUPABASE_ANON_KEY__?.substring(0, 20),
                    bmAuthExists: !!BM.Auth,
                    authConfigured: BM.Auth?.isConfigured ? BM.Auth.isConfigured() : false,
                    currentUser: BM.Auth?.getUser ? BM.Auth.getUser() : null,
                    sessionExists: !!BM.Auth?.getSession,
                    session: null,
                    hivesInState: BM.Storage?.list('hives')?.length || 0,
                    apiariesInState: BM.Storage?.list('apiaries')?.length || 0,
                    supabaseClientExists: false,
                    clientInfo: null
                };
                if (BM.Auth?.getClient) {
                    const client = BM.Auth.getClient();
                    result.supabaseClientExists = !!client;
                    if (client) {
                        result.clientInfo = {
                            url: client.supabaseUrl,
                            hasKey: !!client.supabaseKey,
                            keyPrefix: client.supabaseKey?.substring(0, 20)
                        };
                    }
                }
                return result;
            }
        """)
        print("=== DIAGNOSTIC ===")
        for k, v in diag.items():
            print(f"  {k}: {v}")

        # Check if localStorage has bm-auth-session
        ls_check = await page.evaluate("""
            () => {
                return {
                    authSession: localStorage.getItem('bm-auth-session'),
                    beemasterV4: !!localStorage.getItem('beemaster-v4')
                };
            }
        """)
        print(f"\n=== localStorage ===")
        for k, v in ls_check.items():
            print(f"  {k}: {str(v)[:100]}")

        print(f"\n=== Logs ===")
        for log in all_logs:
            print(f"  {log[:300]}")

        await browser.close()

asyncio.run(diagnose())