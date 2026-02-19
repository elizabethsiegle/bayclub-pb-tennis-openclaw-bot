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
  
  // Take screenshot before clicking
  await page.screenshot({ path: 'before_click.png', fullPage: true });
  console.log('Saved before_click.png');
  
  // Click on a 6:00 PM cell
  await page.evaluate(() => {
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
    
    if (!targetTimeEl) return false;
    
    const targetTop = targetTimeEl.getBoundingClientRect().top;
    
    const allSlots = Array.from(document.querySelectorAll('.booking-calendar-column-time-slot'));
    const availableSlots = allSlots.filter(slot => 
      !slot.classList.contains('booking-calendar-column-time-slot-unavailable')
    );
    
    const matchingSlots = availableSlots.filter(slot => {
      const slotTop = slot.getBoundingClientRect().top;
      return Math.abs(slotTop - targetTop) < 50;
    });
    
    if (matchingSlots.length === 0) return false;
    
    const slotToClick = matchingSlots[0] as HTMLElement;
    slotToClick.scrollIntoView({ block: 'center' });
    slotToClick.click();
    
    return true;
  });
  
  console.log('Clicked grid cell, waiting...');
  
  // Wait longer
  await page.waitForTimeout(5000);
  
  // Take screenshot after clicking
  await page.screenshot({ path: 'after_click.png', fullPage: true });
  console.log('Saved after_click.png');
  
  // Check page content
  const pageText = await page.evaluate(() => document.body.innerText);
  console.log('\nPage text sample (first 1000 chars):', pageText.substring(0, 1000));
  
  await bot.close();
}

main().catch(console.error);
