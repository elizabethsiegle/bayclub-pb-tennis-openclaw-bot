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
  
  // Select pickleball
  await page.evaluate(() => {
    const allElements = Array.from(document.querySelectorAll('div, span, button'));
    const sportElement = allElements.find(el => el.textContent?.trim().toLowerCase() === 'pickleball');
    if (sportElement) (sportElement as HTMLElement).click();
  });
  
  await page.waitForTimeout(3000);
  
  // Get full page text
  const pageText = await page.evaluate(() => document.body.innerText);
  
  console.log('\n=== FULL PAGE TEXT ===');
  console.log(pageText);
  
  await bot.close();
}

main().catch(console.error);
