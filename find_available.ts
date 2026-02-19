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
  
  // Find slots that actually have availability (court numbers next to them)
  const availableSlots = await page.evaluate(`
    (function() {
      const results = [];
      
      // Get all time slot elements
      const timeSlots = Array.from(document.querySelectorAll('.booking-calendar-time-slot'));
      
      for (const slot of timeSlots) {
        const timeText = slot.textContent?.trim();
        const timeMatch = timeText?.match(/\\d{1,2}:\\d{2}\\s*[AP]M/);
        
        if (timeMatch) {
          const time = timeMatch[0];
          
          // Check if this slot's parent row has any availability indicators
          // Look for siblings or nearby elements with numbers indicating available courts
          const parent = slot.closest('div[class*="row"]') || slot.parentElement;
          if (parent) {
            const parentText = parent.textContent || '';
            
            // Check if there are court availability numbers in this row
            // Look for standalone numbers like " 1", " 2", etc.
            const hasAvailability = /\\s+\\d+\\s+/.test(parentText) && 
                                   !parentText.includes('Lesson') ||
                                   parentText.includes('Guest');
            
            // Also check for clickable/interactive indicators
            const hasClickableCell = parent.querySelector('[class*="available"], [class*="open"], [onclick]');
            
            if (hasAvailability || hasClickableCell) {
              results.push({
                time: time,
                parentText: parentText.substring(0, 100)
              });
            }
          }
        }
      }
      
      // Remove duplicates
      const uniqueTimes = [...new Set(results.map(r => r.time))];
      return uniqueTimes.sort((a, b) => {
        const parseTime = (t) => {
          const [time, period] = t.split(' ');
          const [hours, mins] = time.split(':').map(Number);
          let h = hours;
          if (period === 'PM' && h !== 12) h += 12;
          if (period === 'AM' && h === 12) h = 0;
          return h * 60 + mins;
        };
        return parseTime(a) - parseTime(b);
      });
    })()
  `);
  
  console.log('Actually available/bookable slots for Friday:');
  console.log(JSON.stringify(availableSlots, null, 2));
  console.log('\nTotal slots:', availableSlots.length);
  
  if (availableSlots.length > 0) {
    console.log('First slot:', availableSlots[0]);
    console.log('Last slot:', availableSlots[availableSlots.length - 1]);
  }
  
  await bot.close();
}

main().catch(console.error);
