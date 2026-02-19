import { BayClubBot } from './BayClubBot';
import * as fs from 'fs';

async function main() {
  const bot = new BayClubBot(
    process.env.BAYCLUB_USERNAME!,
    process.env.BAYCLUB_PASSWORD!
  );
  
  await bot.init();
  await bot.login();
  
  const page = (bot as any).page;
  
  console.log('Before navigation, URL:', page.url());
  
  await bot.navigateToBooking('tennis', 'friday');
  
  console.log('After navigation, URL:', page.url());
  
  // Wait extra time for dynamic content
  console.log('Waiting 10 seconds for content to load...');
  await page.waitForTimeout(10000);
  
  // Take another screenshot
  const screenshot2 = await page.screenshot();
  fs.writeFileSync('/tmp/bayclub_after_wait.png', screenshot2);
  console.log('Screenshot saved to /tmp/bayclub_after_wait.png');
  
  // Get page title
  const title = await page.title();
  console.log('Page title:', title);
  
  // Check what's visible on screen
  const visibleText = await page.evaluate(`document.body.innerText.substring(0, 1000)`);
  console.log('\nVisible text on page:');
  console.log(visibleText);
  
  await bot.close();
}

main().catch(console.error);
