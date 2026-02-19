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
  
  // Extract available times from the Friday column
  const result = await page.evaluate(() => {
    // The calendar is a grid structure
    // Find the column headers to identify Friday's position
    const dayHeaders = Array.from(document.querySelectorAll('[class*="day"], [class*="column"], [class*="header"]'));
    
    // Find all elements that might be grid cells with availability numbers
    const allElements = Array.from(document.querySelectorAll('div, span'));
    
    // Look for cells that:
    // 1. Contain a single digit or small number (court availability)
    // 2. Are clickable (cursor: pointer, has click handler, etc.)
    const clickableCells = allElements.filter(el => {
      const text = el.textContent?.trim() || '';
      const isNumber = /^\d+$/.test(text) && parseInt(text) > 0 && parseInt(text) < 10;
      const style = window.getComputedStyle(el);
      const isClickable = style.cursor === 'pointer' || el.classList.contains('clickable');
      
      return isNumber && isClickable;
    });
    
    console.log(`Found ${clickableCells.length} clickable cells with numbers`);
    
    // For each clickable cell, try to find its time context
    const slots: Array<{time: string, courts: string, element: string}> = [];
    
    for (const cell of clickableCells.slice(0, 50)) { // Limit to first 50
      const courts = cell.textContent?.trim() || '';
      
      // Walk up the DOM to find time context
      let current: Element | null = cell;
      let foundTime = '';
      let depth = 0;
      
      while (current && depth < 10) {
        // Check siblings for time info
        if (current.previousElementSibling) {
          const siblingText = current.previousElementSibling.textContent || '';
          const timeMatch = siblingText.match(/\b(\d{1,2}:\d{2}\s*[AP]M)\b/);
          if (timeMatch) {
            foundTime = timeMatch[1];
            break;
          }
        }
        
        // Check the element's own text content excluding children
        const ownText = Array.from(current.childNodes)
          .filter(n => n.nodeType === 3) // Text nodes only
          .map(n => n.textContent)
          .join('');
        const timeMatch = ownText.match(/\b(\d{1,2}:\d{2}\s*[AP]M)\b/);
        if (timeMatch) {
          foundTime = timeMatch[1];
          break;
        }
        
        current = current.parentElement;
        depth++;
      }
      
      if (foundTime) {
        slots.push({
          time: foundTime,
          courts,
          element: cell.className
        });
      }
    }
    
    return slots;
  });
  
  console.log('\nFound slots:');
  console.log(JSON.stringify(result, null, 2));
  
  await bot.close();
}

main().catch(console.error);
