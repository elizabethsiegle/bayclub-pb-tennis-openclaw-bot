import { BayClubBot } from './BayClubBot';

async function main() {
  const bot = new BayClubBot(
    process.env.BAYCLUB_USERNAME!,
    process.env.BAYCLUB_PASSWORD!
  );
  
  await bot.init();
  await bot.login();
  await bot.navigateToBooking('tennis', 'friday');
  
  // Debug: Check what elements exist on the page
  const page = (bot as any).page;
  
  console.log('\n=== Checking for time slot elements ===');
  const slotCount = await page.evaluate(`document.querySelectorAll('app-court-time-slot-item').length`);
  console.log('Found', slotCount, 'app-court-time-slot-item elements');
  
  // Check what's actually in those elements
  const allSlots = await page.evaluate(`
    Array.from(document.querySelectorAll('app-court-time-slot-item')).map((el, i) => ({
      index: i,
      text: el.textContent?.trim(),
      html: el.innerHTML.substring(0, 200)
    }))
  `);
  
  console.log('\nFirst 10 slot elements:');
  console.log(JSON.stringify(allSlots.slice(0, 10), null, 2));
  
  // Check if there are other possible selectors
  console.log('\n=== Checking alternative selectors ===');
  const alternatives = await page.evaluate(`({
    'div[class*="time"]': document.querySelectorAll('div[class*="time"]').length,
    'div[class*="slot"]': document.querySelectorAll('div[class*="slot"]').length,
    'div[class*="court"]': document.querySelectorAll('div[class*="court"]').length,
    '[class*="available"]': document.querySelectorAll('[class*="available"]').length,
  })`);
  
  console.log(JSON.stringify(alternatives, null, 2));
  
  // Take a screenshot
  const screenshot = await page.screenshot();
  require('fs').writeFileSync('/tmp/bayclub_debug.png', screenshot);
  console.log('\nScreenshot saved to /tmp/bayclub_debug.png');
  
  await bot.close();
}

main().catch(console.error);
