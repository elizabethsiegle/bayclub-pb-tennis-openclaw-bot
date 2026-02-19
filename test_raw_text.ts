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
  await page.waitForTimeout(5000);
  
  const bodyText = await page.evaluate(`document.body.innerText`);
  
  console.log('First 2000 chars of body text:');
  console.log(bodyText.substring(0, 2000));
  
  console.log('\n\nChecking for "AM" and "PM":');
  console.log('Contains "AM":', bodyText.includes('AM'));
  console.log('Contains "PM":', bodyText.includes('PM'));
  console.log('Contains "5:00":', bodyText.includes('5:00'));
  console.log('Contains "6:00":', bodyText.includes('6:00'));
  
  await bot.close();
}

main().catch(console.error);
