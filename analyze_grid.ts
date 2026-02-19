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
  
  // Map the grid structure
  const times = await page.evaluate(() => {
    // Strategy: Find the day "Fr" in the headers, determine its column index,
    // then extract all times that have clickable availability in that column
    
    // Find all text containing day abbreviations
    const allText = document.body.innerText;
    
    // Find all elements with time patterns
    const allEls = Array.from(document.querySelectorAll('*'));
    const timeEls = allEls.filter(el => {
      const text = el.textContent?.trim() || '';
      // Match time patterns like "6:00 AM" or "12:30 PM"
      return /^\d{1,2}:\d{2}\s*[AP]M$/.test(text) && el.children.length === 0;
    });
    
    const allTimes = timeEls.map(el => el.textContent?.trim()).filter(Boolean) as string[];
    
    // Find all clickable availability indicators
    const availSpans = Array.from(document.querySelectorAll('span.ml-1'));
    const clickableCount = availSpans.filter(span => {
      const style = window.getComputedStyle(span);
      return style.cursor === 'pointer';
    }).length;
    
    return {
      allTimesFound: allTimes.slice(0, 30),
      totalTimeElements: timeEls.length,
      clickableSpans: clickableCount,
      bodyTextSample: allText.substring(0, 500),
    };
  });
  
  console.log('\nGrid analysis:');
  console.log(JSON.stringify(times, null, 2));
  
  await bot.close();
}

main().catch(console.error);
