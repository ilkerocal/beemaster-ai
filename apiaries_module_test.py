import asyncio
from playwright.async_api import async_playwright
import time

async def test_apiaries_module():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        c...[truncated]