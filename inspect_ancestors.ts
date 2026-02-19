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
  
  const result = await page.evaluate(() => {
    const availSpans = Array.from(document.querySelectorAll('span.ml-1'));
    const clickableSpans = availSpans.filter(span => {
      const style = window.getComputedStyle(span);
      return style.cursor === 'pointer';
    });
    
    // Take first clickable span and inspect its ancestors
    const first = clickableSpans[0];
    if (!first) return { error: 'No clickable spans found' };
    
    const ancestors: any[] = [];
    let current: Element | null = first;
    let depth = 0;
    
    while (current && depth < 10) {
      ancestors.push({
        tag: current.tagName,
        classes: Array.from(current.classList),
        id: current.id,
        textSnippet: Array.from(current.childNodes)
          .filter(n => n.nodeType === 3)
          .map(n => n.textContent?.trim())
          .join('').substring(0, 50),
      });
      current = current.parentElement;
      depth++;
    }
    
    return {
      totalClickable: clickableSpans.length,
      firstSpanText: first.textContent,
      ancestors,
    };
  });
  
  console.log('\nDOM structure analysis:');
  console.log(JSON.stringify(result, null, 2));
  
  await bot.close();
}

main().catch(console.error);
