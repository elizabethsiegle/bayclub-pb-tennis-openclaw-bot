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
  
  // Extract the grid data more carefully - focus on Friday column only
  const fridayData = await page.evaluate(`
    (function() {
      // Get the full text and parse it line by line
      const text = document.body.innerText;
      const lines = text.split('\\n');
      
      // Find where times start
      const timePattern = /^\\d{1,2}:\\d{2}\\s*[AP]M$/;
      const timesAndData = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (timePattern.test(line)) {
          // This is a time slot - look at surrounding lines for availability data
          timesAndData.push({
            time: line,
            nextLines: lines.slice(i + 1, i + 8).map(l => l.trim()).filter(l => l)
          });
        }
      }
      
      return timesAndData;
    })()
  `);
  
  console.log('Time slots with context (first 15):');
  console.log(JSON.stringify(fridayData.slice(0, 15), null, 2));
  
  console.log('\n\nTime slots with context (around 5-6 PM):');
  const evening = fridayData.filter((d: any) => d.time.includes('5:') || d.time.includes('6:'));
  console.log(JSON.stringify(evening, null, 2));
  
  await bot.close();
}

main().catch(console.error);
