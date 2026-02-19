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
  
  // Find clickable time slots with the format "11:00 AM - 12:30 PM"
  const clickableTimes = await page.evaluate(`
    (function() {
      // Look for elements with class "text-lowercase" that contain time ranges
      const timeElements = Array.from(document.querySelectorAll('.text-lowercase'));
      const times = [];
      
      for (const el of timeElements) {
        const text = el.textContent?.trim();
        // Match patterns like "11:00 AM - 12:30 PM"
        const rangeMatch = text?.match(/(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)/);
        
        if (rangeMatch) {
          times.push({
            startTime: rangeMatch[1],
            endTime: rangeMatch[2],
            fullText: text,
            clickable: true
          });
        }
      }
      
      return times;
    })()
  `);
  
  console.log('Clickable time slots found:');
  console.log(JSON.stringify(clickableTimes, null, 2));
  console.log('\nTotal clickable slots:', clickableTimes.length);
  
  await bot.close();
}

main().catch(console.error);
