import asyncio
import time
from playwright.async_api import async_playwright

async def run_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context()
        page = await ctx.new_page()
        
        # Local HTML dosyasını aç
        await page.goto("file:///C:/Users/hatbi/BeeMaster-AI/index.html")
        await page.wait_for_timeout(1000)
        
        # 1. Test Supabase credentials exist
        configured = await page.evaluate("() => BM.Auth.isConfigured()")
        print("Supabase Configured:", configured)
        
        # 2. Storage mapping ve filtering testi
        test_queen = {
            "hiveId": "hv_1",
            "strain": "caucasian",
            "birthDate": "2024-05-10",
            "markedColor": "yellow",
            "source": "bred",
            "supplier": "Test Supplier",
            "costTry": 450,
            "performanceScore": 0.85,
            "notes": "Test ana arı notu"
        }
        
        queen_payload = await page.evaluate("(q) => BM.Storage._mapToDb('queens', q)", test_queen)
        print("\nQueens _mapToDb payload:")
        print(queen_payload)
        
        test_treatment = {
            "hiveId": "hv_1",
            "date": "2024-08-01",
            "product": "Oksalik Asit",
            "dosage": "5ml",
            "duration": "10 gun",
            "varroaBefore": 7,
            "varroaAfter": 1,
            "status": "completed",
            "notes": "Sonbahar damlatma"
        }
        
        treatment_payload = await page.evaluate("(t) => BM.Storage._mapToDb('treatments', t)", test_treatment)
        print("\nTreatments _mapToDb payload:")
        print(treatment_payload)
        
        test_inspection = {
            "hiveId": "hv_1",
            "date": "2024-08-05",
            "varroaCount": 5,
            "broodFrames": 6,
            "honeyFrames": 3,
            "pollenFrames": 1,
            "population": "strong",
            "eggsPattern": "regular",
            "queenSeen": "seen",
            "weather": "sunny",
            "aiAnomalies": json.dumps([{"icon": "⚡", "title": "Test Anomali"}]),
            "notes": "Test muayene"
        }
        import json
        inspection_payload = await page.evaluate("(i) => BM.Storage._mapToDb('inspections', i)", test_inspection)
        print("\nInspections _mapToDb payload:")
        print(inspection_payload)
        
        # Test reverse mapping (fromDb)
        fake_db_row = {
            "id": "q_test1",
            "hive_id": "hv_1",
            "marked_color": "yellow|NAME:Ana1",
            "birth_date": "2024-05-10",
            "notes": "Test ana arı notu|META:{\"strain\":\"caucasian\",\"status\":\"active\",\"supplier\":\"Test Supplier\",\"cost_try\":450,\"performance_score\":0.85}",
            "user_id": "usr_123"
        }
        
        from_db_result = await page.evaluate("""(row) => {
            var reverseMap = {
                apiary_id: 'apiaryId', hive_id: 'hiveId', queen_id: 'queenId', user_id: 'userId',
                birth_date: 'birthDate', marked_color: 'markedColor',
                performance_score: 'performanceScore'
            };
            function fromDb(row) {
                var obj = {};
                for (var k in row) obj[reverseMap[k] || k] = row[k];
                if (row.marked_color && row.marked_color.indexOf('|NAME:') > -1) {
                    var p = row.marked_color.split('|NAME:');
                    obj.markedColor = p[0]; obj.name = p[1];
                }
                if (row.notes && typeof row.notes === 'string' && row.notes.indexOf('|META:') > -1) {
                    var mp = row.notes.split('|META:');
                    obj.notes = mp[0];
                    try {
                        var meta = JSON.parse(mp[1]);
                        for (var metaKey in meta) {
                            obj[reverseMap[metaKey] || metaKey] = meta[metaKey];
                        }
                    } catch(e) {}
                }
                return obj;
            }
            return fromDb(row);
        }""", fake_db_row)
        
        print("\nFromDb Reverse Mapped Object:")
        print(from_db_result)

        await browser.close()

asyncio.run(run_test())