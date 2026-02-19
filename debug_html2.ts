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
  
  // Get all text content that looks like times
  const allTimes = await page.evaluate(`
    (function() {
      const all = Array.from(document.querySelectorAll('*'))
        .filter(el => el.textContent && el.textContent.match(/\d{1,2}:\d{2}/))
        .slice(0, 20);
      return all.map(el => ({
        tag: el.tagName,
        text: el.textContent.trim().substring(0, 80),
        classes: el.className
      }));
    })()
  `);
  
  console.log('Elements with time patterns:');
  console.log(JSON.stringify(allTimes, null, 2));
  
  // Check the page body for app-court keywords
  const bodyText = await page.evaluate(`document.body.outerHTML.substring(0, 5000)`);
  const hasAppCourt = bodyText.includes('app-court');
  console.log('\nPage contains "app-court":', hasAppCourt);
  
  if (hasAppCourt) {
    const matches = bodyText.match(/<app-court[^>]*>/g);
    console.log('Found app-court tags:', matches?.slice(0, 5));
  }
  
  await bot.close();
}

main().catch(console.error);
