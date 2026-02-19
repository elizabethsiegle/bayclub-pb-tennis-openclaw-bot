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
  
  // Find available time slots by identifying span.ml-1 clickable elements
  const times = await page.evaluate(() => {
    // Find all availability indicators
    const availSpans = Array.from(document.querySelectorAll('span.ml-1'));
    const clickableSpans = availSpans.filter(span => {
      const style = window.getComputedStyle(span);
      return style.cursor === 'pointer';
    });
    
    const times: string[] = [];
    
    for (const span of clickableSpans) {
      // Walk up to find the time context
      let current: Element | null = span;
      let depth = 0;
      let foundTime = '';
      
      while (current && depth < 15 && !foundTime) {
        // Look for time in siblings or parent's siblings
        const parent = current.parentElement;
        if (parent) {
          // Check all children for time info
          for (const sibling of Array.from(parent.children)) {
            const text = sibling.textContent || '';
            const match = text.match(/\b(\d{1,2}:\d{2}\s*[AP]M)\b/);
            if (match) {
              foundTime = match[1];
              break;
            }
          }
          
          // Check parent's own text (not from children)
          if (!foundTime) {
            const parentOwnText = Array.from(parent.childNodes)
              .filter(n => n.nodeType === 3)
              .map(n => n.textContent)
              .join('');
            const match = parentOwnText.match(/\b(\d{1,2}:\d{2}\s*[AP]M)\b/);
            if (match) {
              foundTime = match[1];
            }
          }
        }
        
        current = parent;
        depth++;
      }
      
      if (foundTime && !times.includes(foundTime)) {
        times.push(foundTime);
      }
    }
    
    // Sort times
    const parseTime = (t: string) => {
      const [time, period] = t.split(' ');
      const [hours, mins] = time.split(':').map(Number);
      let h = hours;
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return h * 60 + mins;
    };
    
    return times.sort((a, b) => parseTime(a) - parseTime(b));
  });
  
  console.log(`\nFound ${times.length} available times:`);
  console.log(JSON.stringify(times, null, 2));
  
  await bot.close();
}

main().catch(console.error);
