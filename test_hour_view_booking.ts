import { BayClubBot } from './BayClubBot';

async function main() {
  const bot = new BayClubBot(
    process.env.BAYCLUB_USERNAME!,
    process.env.BAYCLUB_PASSWORD!
  );
  
  await bot.init();
  await bot.login();
  
  const page = (bot as any).page;
  
  // Navigate but manually try Hour View
  await bot.navigateToBooking('tennis', 'sunday');
  
  // Try harder to click Hour View
  console.log('\nAttempting Hour View click...');
  
  const clicked = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const hourView = all.find(el => el.textContent?.trim() === 'HOUR VIEW');
    if (hourView) {
      (hourView as HTMLElement).click();
      return true;
    }
    return false;
  });
  
  console.log('Hour View clicked:', clicked);
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: 'hour_view.png', fullPage: true });
  console.log('Saved hour_view.png');
  
  // Check for clickable time slots
  const slots = await page.evaluate(() => {
    const clickableSlots = Array.from(document.querySelectorAll('.clickable.time-slot'));
    return {
      count: clickableSlots.length,
      samples: clickableSlots.slice(0, 5).map(el => ({
        text: el.querySelector('.text-lowercase')?.textContent?.trim(),
        html: el.innerHTML.substring(0, 200),
      })),
    };
  });
  
  console.log('\nClickable time slots:', JSON.stringify(slots, null, 2));
  
  await bot.close();
}

main().catch(console.error);
