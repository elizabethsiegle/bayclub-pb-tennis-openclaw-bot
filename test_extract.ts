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
  
  // Simpler approach: just find all times shown on the page
  const allTimes = await page.evaluate(`
    (function() {
      const text = document.body.innerText;
      const timePattern = /\d{1,2}:\d{2}\s*[AP]M/g;
      const matches = text.match(timePattern) || [];
      return [...new Set(matches)];
    })()
  `);
  
  console.log('All times found on page:');
  console.log(JSON.stringify(allTimes, null, 2));
  
  await bot.close();
}

main().catch(console.error);
