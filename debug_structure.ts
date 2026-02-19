import { BayClubBot } from './BayClubBot';

async function main() {
  const bot = new BayClubBot(
    process.env.BAYCLUB_USERNAME!,
    process.env.BAYCLUB_PASSWORD!
  );
  
  await bot.init();
  await bot.login();
  await bot.navigateToBooking('tennis', 'friday');
  
  // Debug: find ALL elements that might represent time slots
  const debug = await (bot as any).page.evaluate(() => {
    const allDivs = Array.from(document.querySelectorAll('div'));
    
    // Find divs that contain times (e.g., "6:00 AM", "12:30 PM")
    const timeDivs = allDivs.filter(div => {
      const text = div.textContent?.trim() || '';
      return /\d{1,2}:\d{2}\s*[AP]M/.test(text);
    });
    
    // Find elements with "text-lowercase" class
    const lowercaseElements = Array.from(document.querySelectorAll('.text-lowercase'));
    
    return {
      totalDivs: allDivs.length,
      timeDivsCount: timeDivs.length,
      sampleTimeDivs: timeDivs.slice(0, 3).map(d => ({
        text: d.textContent?.trim().substring(0, 100),
        classes: Array.from(d.classList),
        tagName: d.tagName,
      })),
      lowercaseCount: lowercaseElements.length,
      sampleLowercase: lowercaseElements.slice(0, 3).map(el => ({
        text: el.textContent?.trim().substring(0, 100),
        parent: el.parentElement?.tagName,
        parentClasses: Array.from(el.parentElement?.classList || []),
      })),
    };
  });
  
  console.log('\nPage structure:');
  console.log(JSON.stringify(debug, null, 2));
  
  await bot.close();
}

main().catch(console.error);
