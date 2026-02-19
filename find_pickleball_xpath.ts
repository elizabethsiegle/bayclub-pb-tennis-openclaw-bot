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
  
  // Try different div indices for pickleball
  for (let i = 1; i <= 6; i++) {
    console.log(`\n=== Trying div[${i}] ===`);
    const xpath = `xpath=/html/body/app-root/div/ng-component/app-racquet-sports-filter/div[1]/div[1]/div/div/app-court-booking-category-select/div/div[1]/div/div[${i}]`;
    
    try {
      const text = await page.locator(xpath).textContent({ timeout: 1000 });
      console.log(`div[${i}] text:`, text?.trim());
      
      await page.locator(xpath).click({ timeout: 1000 });
      await page.waitForTimeout(1500);
      
      // Check if duration selector appeared
      const hasDuration = await page.evaluate(() => !!document.querySelector('app-button-select'));
      console.log(`Has duration selector: ${hasDuration}`);
      
      // Reset by clicking tennis
      const tennisXpath = 'xpath=/html/body/app-root/div/ng-component/app-racquet-sports-filter/div[1]/div[1]/div/div/app-court-booking-category-select/div/div[1]/div/div[2]';
      await page.locator(tennisXpath).click();
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log(`div[${i}] not found or not clickable`);
    }
  }
  
  await bot.close();
}

main().catch(console.error);
