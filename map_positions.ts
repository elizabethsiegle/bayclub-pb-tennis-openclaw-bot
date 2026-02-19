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
    // Strategy: Build a map of position → time, then check which positions have availability
    
    // 1. Get all time labels (should be on the left sidebar)
    const timeElements = Array.from(document.querySelectorAll('*')).filter(el => {
      const text = el.textContent?.trim() || '';
      return /^\d{1,2}:\d{2}\s*[AP]M$/.test(text) && el.children.length === 0;
    });
    
    // 2. Get their vertical positions
    const timePositions = timeElements.map(el => ({
      time: el.textContent?.trim() || '',
      top: el.getBoundingClientRect().top,
    }));
    
    // 3. Get all available (non-unavailable) time slots
    const allSlots = Array.from(document.querySelectorAll('.booking-calendar-column-time-slot'));
    const availableSlots = allSlots.filter(slot => 
      !slot.classList.contains('booking-calendar-column-time-slot-unavailable')
    );
    
    // 4. Get positions of available slots
    const availablePositions = availableSlots.map(slot => ({
      top: slot.getBoundingClientRect().top,
      height: slot.getBoundingClientRect().height,
    }));
    
    // 5. Match available slot positions to times
    const matchedTimes: string[] = [];
    
    for (const pos of availablePositions) {
      // Find closest time label
      let closestTime = '';
      let minDist = Infinity;
      
      for (const timePos of timePositions) {
        const dist = Math.abs(timePos.top - pos.top);
        if (dist < minDist) {
          minDist = dist;
          closestTime = timePos.time;
        }
      }
      
      if (closestTime && minDist < 50 && !matchedTimes.includes(closestTime)) {
        matchedTimes.push(closestTime);
      }
    }
    
    // Sort
    const parseTime = (t: string) => {
      const [time, period] = t.split(' ');
      const [hours, mins] = time.split(':').map(Number);
      let h = hours;
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return h * 60 + mins;
    };
    
    return matchedTimes.sort((a, b) => parseTime(a) - parseTime(b));
  });
  
  console.log(`\nFound ${result.length} available times:`);
  console.log(JSON.stringify(result, null, 2));
  
  await bot.close();
}

main().catch(console.error);
