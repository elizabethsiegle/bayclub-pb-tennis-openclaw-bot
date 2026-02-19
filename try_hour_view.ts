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
  await page.waitForTimeout(3000);
  
  console.log('Current view...');
  
  // Try to click HOUR VIEW button more forcefully
  const hourViewClicked = await page.evaluate(`
    (function() {
      const buttons = Array.from(document.querySelectorAll('*'));
      for (const btn of buttons) {
        if (btn.textContent && btn.textContent.includes('HOUR VIEW')) {
          btn.click();
          return true;
        }
      }
      return false;
    })()
  `);
  
  console.log('Hour View clicked:', hourViewClicked);
  await page.waitForTimeout(5000);
  
  // Take screenshot
  const screenshot = await page.screenshot();
  fs.writeFileSync('/tmp/hour_view.png', screenshot);
  console.log('Screenshot saved to /tmp/hour_view.png');
  
  // Now search for clickable time slots
  const clickableSlots = await page.evaluate(`
    (function() {
      // After clicking HOUR VIEW, look for the time range elements
      const allDivs = Array.from(document.querySelectorAll('div'));
      const times = [];
      
      for (const div of allDivs) {
        const text = div.textContent?.trim();
        if (text && text.length < 50) {
          // Look for time patterns
          const timeMatch = text.match(/(\d{1,2}:\d{2}\s*[AP]M)/g);
          if (timeMatch && timeMatch.length >= 1) {
            times.push({
              text: text,
              classes: div.className
            });
          }
        }
      }
      
      return times.slice(0, 30);
    })()
  `);
  
  console.log('\nClickable elements after HOUR VIEW:');
  console.log(JSON.stringify(clickableSlots, null, 2));
  
  await bot.close();
}

main().catch(console.error);
