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
  
  // Find clickable time slots - looking for actual interactive elements
  const clickableSlots = await page.evaluate(`
    (function() {
      const results = [];
      
      // Look for clickable elements that contain time patterns
      const allClickable = Array.from(document.querySelectorAll('button, a, [onclick], [class*="click"], [class*="slot"], div[role="button"]'));
      
      for (const el of allClickable) {
        const text = el.textContent?.trim() || '';
        const timeMatch = text.match(/\\d{1,2}:\\d{2}\\s*[AP]M/);
        
        if (timeMatch) {
          results.push({
            time: timeMatch[0],
            tag: el.tagName,
            classes: el.className,
            clickable: true
          });
        }
      }
      
      // Also look for grid cells that might be clickable
      // The calendar likely has cells with data attributes or specific structures
      const gridCells = Array.from(document.querySelectorAll('[class*="cell"], [class*="slot"], td, [data-time]'));
      
      for (const cell of gridCells) {
        const cellText = cell.textContent?.trim() || '';
        const dataTime = cell.getAttribute('data-time');
        
        // Check if this cell has availability numbers
        if (/^\\s*\\d+\\s*$/.test(cellText) && parseInt(cellText) > 0) {
          // Find the associated time - look at row/column structure
          const row = cell.closest('tr');
          if (row) {
            const cells = Array.from(row.querySelectorAll('td, div'));
            for (const c of cells) {
              const t = c.textContent?.trim();
              const timeMatch = t?.match(/\\d{1,2}:\\d{2}\\s*[AP]M/);
              if (timeMatch) {
                results.push({
                  time: timeMatch[0],
                  courts: cellText,
                  fromGrid: true
                });
                break;
              }
            }
          }
        }
      }
      
      return results;
    })()
  `);
  
  console.log('Clickable/bookable slots found:');
  console.log(JSON.stringify(clickableSlots, null, 2));
  
  // Also get the full DOM structure for one time slot
  const sampleStructure = await page.evaluate(`
    (function() {
      const text = document.body.innerText;
      const lines = text.split('\\n');
      const timeIndex = lines.findIndex(line => line.includes('6:00 AM'));
      
      if (timeIndex >= 0) {
        return {
          context: lines.slice(Math.max(0, timeIndex - 3), timeIndex + 10),
          found: true
        };
      }
      return { found: false };
    })()
  `);
  
  console.log('\nContext around 6:00 AM:');
  console.log(JSON.stringify(sampleStructure, null, 2));
  
  await bot.close();
}

main().catch(console.error);
