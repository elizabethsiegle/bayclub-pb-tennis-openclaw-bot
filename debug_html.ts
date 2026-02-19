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
  
  // Get sample HTML from slot elements
  const sampleHtml = await page.evaluate(`
    const slots = Array.from(document.querySelectorAll('div[class*="slot"]')).slice(0, 5);
    return slots.map(el => ({
      outerHTML: el.outerHTML.substring(0, 500),
      classes: el.className,
      text: el.textContent?.trim()?.substring(0, 100)
    }));
  `);
  
  console.log('Sample slot elements:');
  console.log(JSON.stringify(sampleHtml, null, 2));
  
  // Check for clickable time elements
  const timeElements = await page.evaluate(`
    const times = Array.from(document.querySelectorAll('[class*="available"], button[class*="time"], div[class*="time"]'))
      .filter(el => el.textContent && el.textContent.includes(':'))
      .slice(0, 10);
    return times.map(el => ({
      tag: el.tagName,
      classes: el.className,
      text: el.textContent?.trim()?.substring(0, 50),
      clickable: el.tagName === 'BUTTON' || el.onclick !== null
    }));
  `);
  
  console.log('\nTime elements with colons:');
  console.log(JSON.stringify(timeElements, null, 2));
  
  await bot.close();
}

main().catch(console.error);
