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
  
  // Try tennis xpath first to see if it works
  console.log('\n=== TESTING TENNIS ===');
  const tennisXpath = 'xpath=/html/body/app-root/div/ng-component/app-racquet-sports-filter/div[1]/div[1]/div/div/app-court-booking-category-select/div/div[1]/div/div[2]';
  
  try {
    await page.locator(tennisXpath).click({ timeout: 3000 });
    console.log('✓ Tennis clicked');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'after_tennis.png' });
    
    // Check for duration selector
    const hasDuration = await page.evaluate(() => {
      return !!document.querySelector('app-button-select');
    });
    console.log('Has duration selector after tennis:', hasDuration);
    
    // Now try pickleball - try div[4] (4th option)
    console.log('\n=== TESTING PICKLEBALL ===');
    const pickleballXpath = 'xpath=/html/body/app-root/div/ng-component/app-racquet-sports-filter/div[1]/div[1]/div/div/app-court-booking-category-select/div/div[1]/div/div[4]';
    await page.locator(pickleballXpath).click({ timeout: 3000 });
    console.log('✓ Pickleball clicked');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'after_pickleball.png' });
    
    // Check for duration selector
    const hasDurationPB = await page.evaluate(() => {
      const buttonSelect = document.querySelector('app-button-select');
      return {
        exists: !!buttonSelect,
        html: buttonSelect?.innerHTML.substring(0, 500) || 'NONE',
      };
    });
    console.log('Duration selector after pickleball:', JSON.stringify(hasDurationPB, null, 2));
    
  } catch (err) {
    console.error('Error:', err);
  }
  
  await bot.close();
}

main().catch(console.error);
