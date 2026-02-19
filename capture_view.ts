import { BayClubBot } from './BayClubBot';
import * as fs from 'fs';

async function main() {
  const bot = new BayClubBot(
    process.env.BAYCLUB_USERNAME!,
    process.env.BAYCLUB_PASSWORD!
  );
  
  await bot.init();
  await bot.login();
  await bot.navigateToBooking('tennis', 'friday');
  
  const page = (bot as any).page;
  
  // Take screenshot
  console.log('\nTaking screenshot...');
  const screenshot = await page.screenshot({ fullPage: true });
  fs.writeFileSync('friday_view.png', screenshot);
  console.log('✓ Saved to friday_view.png');
  
  // Get the actual HTML of the main content area
  const html = await page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    return main.innerHTML.substring(0, 5000);
  });
  
  fs.writeFileSync('friday_view.html', html);
  console.log('✓ Saved HTML to friday_view.html');
  
  await bot.close();
}

main().catch(console.error);
