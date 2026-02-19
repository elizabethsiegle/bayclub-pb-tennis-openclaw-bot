import { BayClubBot } from './BayClubBot';
import * as fs from 'fs';

async function main() {
  const bot = new BayClubBot(
    process.env.BAYCLUB_USERNAME!,
    process.env.BAYCLUB_PASSWORD!
  );
  
  await bot.init();
  await bot.login();
  await bot.navigateToBooking('tennis', 'sunday');
  
  const page = (bot as any).page;
  
  // Click Hour View
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const hourView = all.find(el => el.textContent?.trim() === 'HOUR VIEW');
    if (hourView) (hourView as HTMLElement).click();
  });
  await page.waitForTimeout(3000);
  
  // Take screenshot before clicking time slot
  await page.screenshot({ path: 'before_slot_click.png', fullPage: true });
  console.log('✓ Saved before_slot_click.png');
  
  // Click 6:00 PM time slot
  const clicked = await page.evaluate(() => {
    const timeSlots = Array.from(document.querySelectorAll('.clickable.time-slot'));
    for (const slot of timeSlots) {
      const text = slot.querySelector('.text-lowercase')?.textContent?.trim() || '';
      if (text.startsWith('6:00')) {
        (slot as HTMLElement).click();
        console.log('Clicked time slot:', text);
        return text;
      }
    }
    return null;
  });
  
  console.log('Slot clicked:', clicked);
  await page.waitForTimeout(3000);
  
  // Take screenshot after clicking
  await page.screenshot({ path: 'after_slot_click.png', fullPage: true });
  console.log('✓ Saved after_slot_click.png');
  
  // Check page state
  const state = await page.evaluate(() => {
    const nextButtons = Array.from(document.querySelectorAll('button')).filter(b => 
      b.textContent?.includes('Next') || b.textContent?.includes('NEXT')
    );
    
    return {
      bodyText: document.body.innerText.substring(0, 800),
      nextButtons: nextButtons.map(b => ({
        text: b.textContent?.trim(),
        disabled: (b as HTMLButtonElement).disabled,
        classes: Array.from(b.classList),
      })),
    };
  });
  
  console.log('\nPage state after clicking slot:');
  console.log(JSON.stringify(state, null, 2));
  
  await bot.close();
}

main().catch(console.error);
