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
  
  // Click on the Friday cell to see what happens
  await page.click('text=19'); // Click on day 19 (Friday)
  await page.waitForTimeout(2000);
  
  //  After clicking Friday, check what changed
  const result = await page.evaluate(() => {
    // Now check for .clickable.time-slot elements
    const timeSlots = Array.from(document.querySelectorAll('.clickable.time-slot'));
    
    return {
      clickableTimeSlots: timeSlots.length,
      samples: timeSlots.slice(0, 10).map(el => {
        const lowercase = el.querySelector('.text-lowercase');
        return {
          text: lowercase?.textContent?.trim(),
          classes: Array.from(el.classList),
        };
      }),
    };
  });
  
  console.log('\nAfter clicking Friday:');
  console.log(JSON.stringify(result, null, 2));
  
  await bot.close();
}

main().catch(console.error);
