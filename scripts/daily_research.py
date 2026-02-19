import asyncio
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
import base64
import os
from datetime import datetime
import json

async def get_research_report():
    report_dir = os.path.expanduser("~/ocaas-project/research_reports")
    os.makedirs(report_dir, exist_ok=True)
    
    findings = []
    screenshots_to_attach = []

    browser_config = BrowserConfig(headless=True)
    run_config = CrawlerRunConfig(screenshot=True)

    async with AsyncWebCrawler(config=browser_config) as crawler:
        # GitHub Trending
        url_gh = 'https://github.com/trending'
        print(f"Crawling {url_gh}...")
        res_gh = await crawler.arun(url=url_gh, config=run_config)
        if res_gh.success and res_gh.screenshot:
            filename = f"github_trending_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            filepath = os.path.join(report_dir, filename)
            with open(filepath, 'wb') as f:
                f.write(base64.b64decode(res_gh.screenshot))
            findings.append({
                'title': 'GitHub Trending',
                'href': url_gh,
                'screenshot_path': filepath,
                'markdown_snippet': res_gh.markdown[:1000]
            })
            screenshots_to_attach.append(filepath)

        # Moltbook
        url_mb = 'https://moltbook.com'
        print(f"Crawling {url_mb}...")
        res_mb = await crawler.arun(url=url_mb, config=run_config)
        if res_mb.success and res_mb.screenshot:
            filename = f"moltbook_home_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            filepath = os.path.join(report_dir, filename)
            with open(filepath, 'wb') as f:
                f.write(base64.b64decode(res_mb.screenshot))
            findings.append({
                'title': 'Moltbook Homepage',
                'href': url_mb,
                'screenshot_path': filepath,
                'markdown_snippet': res_mb.markdown[:1000]
            })
            screenshots_to_attach.append(filepath)

        # Zhipu AI (GLM) Pricing Page
        url_glm_pricing = 'https://bigmodel.cn/pricing'
        print(f"Crawling {url_glm_pricing}...")
        res_glm_pricing = await crawler.arun(url=url_glm_pricing, config=run_config)
        if res_glm_pricing.success and res_glm_pricing.screenshot:
            filename = f"glm_pricing_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            filepath = os.path.join(report_dir, filename)
            with open(filepath, 'wb') as f:
                f.write(base64.b64decode(res_glm_pricing.screenshot))
            findings.append({
                'title': 'Zhipu AI (GLM) Pricing',
                'href': url_glm_pricing,
                'screenshot_path': filepath,
                'markdown_snippet': res_glm_pricing.markdown[:1000]
            })
            screenshots_to_attach.append(filepath)

    # Summarize and prepare for email
    email_body = []
    for item in findings:
        email_body.append(f"## {item['title']}")
        email_body.append(f"連結: {item['href']}")
        if 'screenshot_path' in item:
            email_body.append(f"截圖: {os.path.basename(item['screenshot_path'])}") # Only filename for email body
        if 'markdown_snippet' in item:
            email_body.append(f"```markdown\n{item['markdown_snippet']}\n```\n")
        email_body.append("---\n")
    
    print("\nEMAIL_BODY_START\n")
    print('\n'.join(email_body))
    print("\nEMAIL_BODY_END\n")
    print(f"SCREENSHOTS_TO_ATTACH|'''{json.dumps(screenshots_to_attach)}'''") # Escaping for shell

if __name__ == "__main__":
    asyncio.run(get_research_report())
