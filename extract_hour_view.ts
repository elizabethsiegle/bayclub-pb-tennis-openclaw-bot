import { BayClubBot } from './BayClubBot';

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
  
  // Click HOUR VIEW
  await page.evaluate(`
    (function() {
      const buttons = Array.from(document.querySelectorAll('*'));
      for (const btn of buttons) {
        if (btn.textContent && btn.textContent.includes('HOUR VIEW')) {
          btn.click();
          return true;
        }
      }
    })()
  `);
  
  await page.waitForTimeout(5000);
  
  // Get the visible text and parse it
  const bodyText = await page.evaluate(`document.body.innerText`);
  
  console.log('Body text (first 3000 chars):');
  console.log(bodyText.substring(0, 3000));
  
  // Extract start times from time ranges
  const lines = bodyText.split('\n');
  const timeRanges = [];
  const timeRangePattern = /(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*\d{1,2}:\d{2}\s*[AP]M/;
  
  for (const line of lines) {
    const match = line.match(timeRangePattern);
    if (match) {
      timeRanges.push(match[1]);
    }
  }
  
  console.log('\n\nExtracted start times:');
  console.log(JSON.stringify([...new Set(timeRanges)], null, 2));
  
  await bot.close();
}

main().catch(console.error);
