import { BayClubBot } from './BayClubBot';

async function main() {
  const bot = new BayClubBot(
    process.env.BAYCLUB_USERNAME!,
    process.env.BAYCLUB_PASSWORD!
  );
  
  await bot.init();
  await bot.login();
  await bot.navigateToBooking('tennis', 'sunday');
  
  const page = (bot as any).page;
  
  // Try clicking on a 6:00 PM cell
  const cellClicked = await page.evaluate(() => {
    const parseTime = (t: string) => {
      const [time, period] = t.split(' ');
      const [hours, mins] = time.split(':').map(Number);
      let h = hours;
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return h * 60 + mins;
    };
    
    const timeElements = Array.from(document.querySelectorAll('*')).filter(el => {
      const text = el.textContent?.trim() || '';
      return /^\d{1,2}:\d{2}\s*[AP]M$/.test(text) && el.children.length === 0;
    });
    
    const targetTimeEl = timeElements.find(el => {
      const elTime = el.textContent?.trim() || '';
      return Math.abs(parseTime(elTime) - parseTime('6:00 PM')) < 5;
    });
    
    if (!targetTimeEl) return { clicked: false, reason: 'No time label found' };
    
    const targetTop = targetTimeEl.getBoundingClientRect().top;
    
    const allSlots = Array.from(document.querySelectorAll('.booking-calendar-column-time-slot'));
    const availableSlots = allSlots.filter(slot => 
      !slot.classList.contains('booking-calendar-column-time-slot-unavailable')
    );
    
    const matchingSlots = availableSlots.filter(slot => {
      const slotTop = slot.getBoundingClientRect().top;
      return Math.abs(slotTop - targetTop) < 50;
    });
    
    if (matchingSlots.length === 0) {
      return { clicked: false, reason: 'No available slots at that time' };
    }
    
    const slotToClick = matchingSlots[0] as HTMLElement;
    slotToClick.scrollIntoView({ block: 'center' });
    slotToClick.click();
    
    return { clicked: true, reason: 'Clicked successfully' };
  });
  
  console.log('\nGrid cell click result:', cellClicked);
  
  await page.waitForTimeout(3000);
  
  // Check what appeared
  const modalContent = await page.evaluate(() => {
    const timeSlots = Array.from(document.querySelectorAll('.clickable.time-slot'));
    
    return {
      timeSlotCount: timeSlots.length,
      samples: timeSlots.map(slot => {
        const lowercase = slot.querySelector('.text-lowercase');
        return {
          text: lowercase?.textContent?.trim(),
          classes: Array.from(slot.classList),
        };
      }),
    };
  });
  
  console.log('\nModal content after clicking:', JSON.stringify(modalContent, null, 2));
  
  await bot.close();
}

main().catch(console.error);
