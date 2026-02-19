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
  
  // Click 6:00 PM time slot
  await page.evaluate(() => {
    const timeSlots = Array.from(document.querySelectorAll('.clickable.time-slot'));
    for (const slot of timeSlots) {
      const text = slot.querySelector('.text-lowercase')?.textContent?.trim() || '';
      if (text.startsWith('6:00')) {
        (slot as HTMLElement).click();
        console.log('Clicked:', text);
        break;
      }
    }
  });
  await page.waitForTimeout(2000);
  
  // Click Next
  try {
    await page.locator('button:has-text("Next")').click({ timeout: 5000 });
  } catch {
    const nextXpath = 'xpath=/html/body/app-root/div/ng-component/app-racquet-sports-time-slot-select/div[2]/app-racquet-sports-reservation-summary/div/div/div/div[2]/button';
    await page.locator(nextXpath).click();
  }
  await page.waitForTimeout(3000);
  
  // Take screenshot at buddy selection page
  await page.screenshot({ path: 'buddy_page.png', fullPage: true });
  console.log('✓ Saved buddy_page.png');
  
  // Analyze what's on the page
  const pageInfo = await page.evaluate(() => {
    const allText = document.body.innerText;
    const buddyElements = Array.from(document.querySelectorAll('app-racquet-sports-person, [class*="person"], [class*="buddy"]'));
    const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
    const confirmButtons = Array.from(document.querySelectorAll('button')).filter(b => 
      b.textContent?.includes('Confirm')
    );
    
    return {
      bodyTextSample: allText.substring(0, 1000),
      buddyCount: buddyElements.length,
      buddySamples: buddyElements.slice(0, 3).map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim().substring(0, 100),
        classes: Array.from(el.classList),
      })),
      checkboxCount: checkboxes.length,
      checkboxDetails: checkboxes.map(cb => ({
        checked: (cb as HTMLInputElement).checked,
        id: cb.id,
        name: (cb as HTMLInputElement).name,
      })),
      confirmButtonCount: confirmButtons.length,
      confirmButtonStates: confirmButtons.map(b => ({
        text: b.textContent?.trim().substring(0, 50),
        disabled: (b as HTMLButtonElement).disabled,
      })),
    };
  });
  
  console.log('\nPage analysis:');
  console.log(JSON.stringify(pageInfo, null, 2));
  
  await bot.close();
}

main().catch(console.error);
