import { BayClubBot } from './BayClubBot';

async function main() {
  const bot = new BayClubBot(
    process.env.BAYCLUB_USERNAME!,
    process.env.BAYCLUB_PASSWORD!
  );
  
  await bot.init();
  await bot.login();
  
  const page = (bot as any).page;
  
  await page.goto('https://bayclubconnect.com/home/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  const clubSelector = 'xpath=/html/body/app-root/div/app-dashboard/div/div/div[1]/div[1]/app-club-context-select/div/span[4]';
  await page.locator(clubSelector).click();
  const gatewayClub = 'xpath=/html/body/modal-container/div[2]/div/app-club-context-select-modal/div[2]/div/app-schedule-visit-club/div/div[1]/div/div[2]/div/div[3]/div[1]/div/div[2]/app-radio-select/div/div[2]/div/div[2]/div/span';
  await page.waitForSelector(gatewayClub);
  await page.locator(gatewayClub).click();
  const saveButton = 'xpath=/html/body/modal-container/div[2]/div/app-club-context-select-modal/div[2]/div/app-schedule-visit-club/div/div[2]/div/div';
  await page.locator(saveButton).click();
  await page.waitForTimeout(2000);
  
  const scheduleActivity = 'xpath=/html/body/app-root/div/app-navbar/nav/div/div/button/span';
  await page.locator(scheduleActivity).click();
  const courtBooking = 'xpath=/html/body/app-root/div/app-schedule-visit/div/div/div[2]/div[1]/div[2]/div/div/img';
  await page.waitForSelector(courtBooking);
  await page.locator(courtBooking).click();
  await page.waitForTimeout(5000);
  
  // Find pickleball element and get its full xpath
  const pickleballInfo = await page.evaluate(() => {
    const allEls = Array.from(document.querySelectorAll('*'));
    const pickleballEl = allEls.find(el => {
      const text = el.textContent?.trim() || '';
      const hasNoChildren = el.children.length === 0;
      return hasNoChildren && text === 'Pickleball';
    });
    
    if (!pickleballEl) return { found: false };
    
    // Build xpath by walking up
    const getXPath = (element: Element): string => {
      if (element.id) return `//*[@id="${element.id}"]`;
      if (element === document.body) return '/html/body';
      
      let ix = 0;
      const siblings = element.parentNode?.childNodes || [];
      for (let i = 0; i < siblings.length; i++) {
        const sibling = siblings[i];
        if (sibling === element) {
          return getXPath(element.parentElement!) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
        }
        if (sibling.nodeType === 1 && (sibling as Element).tagName === element.tagName) {
          ix++;
        }
      }
      return '';
    };
    
    return {
      found: true,
      tag: pickleballEl.tagName,
      text: pickleballEl.textContent?.trim(),
      classes: Array.from(pickleballEl.classList),
      xpath: getXPath(pickleballEl),
    };
  });
  
  console.log('\nPickleball element info:');
  console.log(JSON.stringify(pickleballInfo, null, 2));
  
  await bot.close();
}

main().catch(console.error);
