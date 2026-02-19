import { BayClubBot } from './BayClubBot';

async function main() {
  const bot = new BayClubBot(
    process.env.BAYCLUB_USERNAME!,
    process.env.BAYCLUB_PASSWORD!
  );
  
  await bot.init();
  await bot.login();
  await bot.navigateToBooking('tennis', 'friday');
  
  // Debug: inspect the page structure
  const debug = await (bot as any).page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('app-court-time-slot-item'));
    
    return items.slice(0, 5).map(el => ({
      html: el.innerHTML.substring(0, 500),
      text: el.textContent?.trim().substring(0, 200),
      hasLowercase: el.querySelector('.text-lowercase') !== null,
      classList: Array.from(el.classList),
    }));
  });
  
  console.log('\nFirst 5 time slot items:');
  console.log(JSON.stringify(debug, null, 2));
  
  await bot.close();
}

main().catch(console.error);
