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
  
  const result = await page.evaluate(() => {
    const clickableTimeSlots = document.querySelectorAll('.clickable.time-slot');
    const withLowercase = Array.from(clickableTimeSlots).filter(el => 
      el.querySelector('.text-lowercase') !== null
    );
    
    return {
      totalClickableTimeSlots: clickableTimeSlots.length,
      withTextLowercase: withLowercase.length,
      samples: withLowercase.slice(0, 5).map(el => ({
        html: el.innerHTML.substring(0, 200),
        text: el.textContent?.trim().substring(0, 100),
      })),
    };
  });
  
  console.log('\nDebug results:');
  console.log(JSON.stringify(result, null, 2));
  
  await bot.close();
}

main().catch(console.error);
