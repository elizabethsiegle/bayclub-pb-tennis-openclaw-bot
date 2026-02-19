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
  
  // Wait for page to fully load
  await page.waitForTimeout(5000);
  
  // Get page info
  const url = page.url();
  const title = await page.title();
  
  console.log('Current URL:', url);
  console.log('Page title:', title);
  
  // Take a full page screenshot
  const screenshot = await page.screenshot({ fullPage: true });
  const screenshotPath = '/home/openclaw/.openclaw/workspace/bayclub_friday.png';
  fs.writeFileSync(screenshotPath, screenshot);
  console.log('Screenshot saved to:', screenshotPath);
  
  await bot.close();
}

main().catch(console.error);
