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
  
  // Get all divs/spans with numbers in them
  const result = await page.evaluate(() => {
    // Find ALL elements with just a number
    const allEls = Array.from(document.body.querySelectorAll('*'));
    const numberEls = allEls.filter(el => {
      const text = el.textContent?.trim() || '';
      // Must be ONLY a number, between 1-9
      return /^[1-9]$/.test(text) && el.children.length === 0;
    });
    
    return numberEls.map(el => ({
      tag: el.tagName,
      text: el.textContent,
      class: el.className,
      id: el.id,
      clickable: window.getComputedStyle(el).cursor === 'pointer',
      parent: el.parentElement?.className || '',
      parentTag: el.parentElement?.tagName || '',
    }));
  });
  
  console.log(`\nFound ${result.length} single-digit elements:`);
  console.log(JSON.stringify(result.slice(0, 20), null, 2));
  
  await bot.close();
}

main().catch(console.error);
