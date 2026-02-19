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
    // Find all time slot cells
    const allSlots = Array.from(document.querySelectorAll('.booking-calendar-column-time-slot'));
    
    // Filter to available ones (NOT unavailable)
    const availableSlots = allSlots.filter(slot => 
      !slot.classList.contains('booking-calendar-column-time-slot-unavailable')
    );
    
    return {
      totalSlots: allSlots.length,
      unavailableSlots: allSlots.filter(s => s.classList.contains('booking-calendar-column-time-slot-unavailable')).length,
      availableSlots: availableSlots.length,
      availableSamples: availableSlots.slice(0, 5).map(s => ({
        classes: Array.from(s.classList),
        html: s.innerHTML.substring(0, 200),
      })),
    };
  });
  
  console.log('\nSlot availability:');
  console.log(JSON.stringify(result, null, 2));
  
  await bot.close();
}

main().catch(console.error);
