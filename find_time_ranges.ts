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
  await page.waitForTimeout(5000);
  
  // Search for ANY element containing time range patterns
  const timeRanges = await page.evaluate(`
    (function() {
      const allElements = Array.from(document.querySelectorAll('*'));
      const results = [];
      
      for (const el of allElements) {
        const text = el.textContent?.trim();
        // Look for "XX:XX AM/PM - XX:XX AM/PM" pattern
        if (text && text.length < 50) {
          const rangeMatch = text.match(/\d{1,2}:\d{2}\s*[AP]M\s*-\s*\d{1,2}:\d{2}\s*[AP]M/);
          if (rangeMatch) {
            results.push({
              text: text,
              tag: el.tagName,
              classes: el.className,
              parent: el.parentElement?.tagName
            });
          }
        }
      }
      
      return results;
    })()
  `);
  
  console.log('Elements with time range patterns:');
  console.log(JSON.stringify(timeRanges.slice(0, 20), null, 2));
  console.log('\nTotal found:', timeRanges.length);
  
  await bot.close();
}

main().catch(console.error);
