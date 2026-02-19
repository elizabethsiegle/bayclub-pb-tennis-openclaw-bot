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
  
  // Try harder to click Hour View
  console.log('\nAttempting to click HOUR VIEW...');
  
  try {
    // Method 1: Direct click on text
    await page.click('text=HOUR VIEW', { timeout: 5000 });
    console.log('✓ Clicked via text selector');
  } catch (e1) {
    console.log('✗ Text selector failed');
    
    try {
      // Method 2: Find button containing the text
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, span, div'));
        const hourViewBtn = buttons.find(b => b.textContent?.includes('HOUR VIEW'));
        if (hourViewBtn) {
          (hourViewBtn as HTMLElement).click();
        } else {
          throw new Error('Hour View button not found');
        }
      });
      console.log('✓ Clicked via evaluate');
    } catch (e2) {
      console.log('✗ Evaluate method failed:', e2);
    }
  }
  
  await page.waitForTimeout(3000);
  
  // Now check what we see
  const structure = await page.evaluate(() => {
    const allText = document.body.textContent || '';
    return {
      hasCourtView: allText.includes('COURT VIEW'),
      hasHourView: allText.includes('HOUR VIEW'),
      hasTimeSlots: document.querySelectorAll('app-court-time-slot-item').length > 0,
      hasTextLowercase: document.querySelectorAll('.text-lowercase').length > 0,
    };
  });
  
  console.log('\nCurrent page state:');
  console.log(JSON.stringify(structure, null, 2));
  
  await bot.close();
}

main().catch(console.error);
