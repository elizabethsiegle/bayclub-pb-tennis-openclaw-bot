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
  
  // Find clickable cells and map them to times
  const clickableCells = await page.evaluate(`
    (function() {
      const results = [];
      
      // Look for clickable elements that might be court booking cells
      const clickables = Array.from(document.querySelectorAll('[onclick], [class*="booking"], button, a, [role="button"]'));
      
      for (const el of clickables) {
        // Skip navigation elements
        const text = el.textContent?.trim() || '';
        if (text.length > 100 || text.includes('BACK') || text.includes('NEXT')) continue;
        
        // Check if this is near a time label
        const parent = el.closest('tr, div[class*="row"]');
        if (parent) {
          const rowText = parent.textContent || '';
          const timeMatch = rowText.match(/\d{1,2}:\d{2}\s*[AP]M/);
          
          if (timeMatch) {
            // Check if this cell has availability (numbers like " 1" or " 2")
            const cellText = text;
            const hasNumber = /^\s*\d+\s*$/.test(cellText);
            
            results.push({
              time: timeMatch[0],
              cellText: cellText.substring(0, 30),
              hasNumber: hasNumber,
              tag: el.tagName,
              classes: el.className.substring(0, 100)
            });
          }
        }
      }
      
      return results;
    })()
  `);
  
  console.log('Clickable cells associated with times:');
  console.log(JSON.stringify(clickableCells.slice(0, 30), null, 2));
  console.log('\nTotal found:', clickableCells.length);
  
  // Extract unique times from clickable cells
  const uniqueTimes = [...new Set(clickableCells.map((c: any) => c.time))];
  console.log('\nUnique times with clickable cells:', uniqueTimes.length);
  console.log(JSON.stringify(uniqueTimes.slice(0, 20), null, 2));
  
  await bot.close();
}

main().catch(console.error);
