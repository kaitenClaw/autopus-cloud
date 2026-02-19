import asyncio
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
import base64
import os
from datetime import datetime
import json
import re

async def newsletter_research_advanced():
    report_dir = os.path.expanduser('~/ocaas-project/research_reports')
    os.makedirs(report_dir, exist_ok=True)
    
    findings = []
    screenshots = []

    browser_config = BrowserConfig(headless=True)
    
    # Optimization: ensure dynamic content loads
    run_config = CrawlerRunConfig(
        screenshot=True,
        word_count_threshold=50
    )

    # Enhanced Source List
    urls = [
        {
            'title': 'IndieHackers Growth',
            'url': 'https://www.indiehackers.com/group/growth-hacking'
        },
        {
            'title': 'Reddit Entrepreneur Newsletter',
            'url': 'https://www.reddit.com/r/Entrepreneur/search/?q=newsletter+growth&restrict_sr=1'
        },
        {
            'title': 'Substack Resources',
            'url': 'https://on.substack.com/s/resources'
        }
    ]

    async with AsyncWebCrawler(config=browser_config) as crawler:
        for item in urls:
            title = item['title']
            url = item['url']
            print(f'Researching {title}...')
            
            try:
                res = await crawler.arun(url=url, config=run_config)
                
                if res.success:
                    clean_title = re.sub(r"[^a-z0-9]", "_", title.lower())
                    timestamp = datetime.now().strftime("%H%M%S")
                    filename = f'newsletter_adv_{clean_title}_{timestamp}.png'
                    filepath = os.path.join(report_dir, filename)
                    
                    if res.screenshot:
                        with open(filepath, 'wb') as f:
                            f.write(base64.b64decode(res.screenshot))
                        screenshots.append(filepath)
                    
                    # Extract key text
                    summary = res.markdown[:2000] 
                    
                    findings.append({
                        'title': title,
                        'url': url,
                        'screenshot': filepath if res.screenshot else None,
                        'summary': summary
                    })
                else:
                    print(f"Failed to crawl {url}: {res.error_message}")
            except Exception as e:
                print(f"Exception crawling {url}: {e}")

    # Prepare output
    result_data = {'findings': findings, 'screenshots': screenshots}
    print('RESEARCH_RESULT_START')
    print(json.dumps(result_data, ensure_ascii=False))
    print('RESEARCH_RESULT_END')

if __name__ == '__main__':
    asyncio.run(newsletter_research_advanced())
