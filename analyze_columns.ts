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
    // Find all booking calendar columns
    const columns = Array.from(document.querySelectorAll('app-booking-calendar-column, .booking-calendar-column'));
    
    // Check day headers
    const dayHeaders = Array.from(document.querySelectorAll('[class*="day"], [class*="header"]'));
    const fridayElements = dayHeaders.filter(el => el.textContent?.includes('Fr') || el.textContent?.includes('FR'));
    
    return {
      totalColumns: columns.length,
      fridayHeadersFound: fridayElements.length,
      fridaySamples: fridayElements.slice(0, 3).map(el => ({
        text: el.textContent?.trim().substring(0, 50),
        tag: el.tagName,
        classes: Array.from(el.classList),
      })),
      columnSamples: columns.slice(0, 3).map((col, idx) => ({
        index: idx,
        classes: Array.from(col.classList),
        hasTimeSlots: col.querySelectorAll('.booking-calendar-column-time-slot').length,
      })),
    };
  });
  
  console.log('\nColumn structure:');
  console.log(JSON.stringify(result, null, 2));
  
  await bot.close();
}

main().catch(console.error);
