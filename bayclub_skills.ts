import { BayClubBot, Sport } from './BayClubBot';
const { calendarService } = require('./GoogleCalendarService.js');

/**
 * Helper function to instantiate and log in the bot.
 * Pulls credentials from the OpenClaw environment.
 */
async function getAuthenticatedBot() {
  const bot = new BayClubBot(
    process.env.BAYCLUB_USERNAME!,
    process.env.BAYCLUB_PASSWORD!
  );
  await bot.init();
  await bot.login();
  return bot;
}

/**
 * Helper function to parse day string to Date
 */
function parseDayToDate(day: string): Date {
  const today = new Date();
  const normalized = day.toLowerCase();
  
  if (normalized === 'today') {
    return today;
  }
  
  if (normalized === 'tomorrow') {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  
  // Handle day names (monday, tuesday, etc.)
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const targetDayIndex = dayNames.indexOf(normalized);
  
  if (targetDayIndex !== -1) {
    const currentDayIndex = today.getDay();
    let daysToAdd = targetDayIndex - currentDayIndex;
    
    if (daysToAdd <= 0) {
      daysToAdd += 7; // Next week
    }
    
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysToAdd);
    return targetDate;
  }
  
  // Default to today if we can't parse
  return today;
}

/**
 * Skill: Get Availability
 * This function is called by OpenClaw when you ask about open slots.
 */
export async function bayclub_get_availability(params: { sport: Sport; day: string }) {
  console.log(`[OpenClaw] Checking availability for ${params.sport} on ${params.day}`);
  const bot = await getAuthenticatedBot();
  
  try {
    await bot.navigateToBooking(params.sport, params.day);
    const times = await bot.getAvailableTimes(params.sport);
    
    if (times.length === 0) {
      return {
        status: "success",
        message: `No available slots found for ${params.sport} on ${params.day}.`
      };
    }

    return {
      status: "success",
      sport: params.sport,
      day: params.day,
      available_slots: times.join(', ')
    };
  } catch (error: any) {
    console.error("[OpenClaw] Availability Error:", error);
    return { status: "error", message: error instanceof Error ? error.message : String(error) };
  } finally {
    await bot.close();
  }
}

/**
 * Helper to schedule a reminder cron job
 */
async function scheduleReminder(sport: string, day: string, time: string) {
  try {
    // Parse the time to get start time
    const timeMatch = time.match(/^(.+?)\s*-/);
    const startTime = timeMatch ? timeMatch[1].trim() : time;
    
    const bookingDate = parseDayToDate(day);
    const startDateTime = calendarService.parseTimeToDate(bookingDate, startTime);
    
    if (!startDateTime) {
      console.error('[Reminder] Could not parse time:', time);
      return false;
    }
    
    // Calculate 2 hours before
    const reminderTime = new Date(startDateTime.getTime() - 2 * 60 * 60 * 1000);
    
    // Don't schedule if it's in the past
    if (reminderTime < new Date()) {
      console.log('[Reminder] Booking is too soon for a 2-hour reminder');
      return false;
    }
    
    const sportEmoji = sport === 'tennis' ? '🎾' : '🏓';
    const reminderText = `${sportEmoji} Reminder: You have ${sport} at Bay Club in 2 hours (${startTime})`;
    
    console.log('[Reminder] Scheduling reminder for:', reminderTime.toISOString());
    
    // Use exec to call openclaw CLI to create cron job
    const { execSync } = require('child_process');
    
    const cronJob = {
      name: `Court Reminder - ${sport} ${day}`,
      schedule: {
        kind: 'at',
        at: reminderTime.toISOString()
      },
      sessionTarget: 'main',
      payload: {
        kind: 'systemEvent',
        text: reminderText
      }
    };
    
    const result = execSync(
      `openclaw cron add '${JSON.stringify(cronJob)}'`,
      { encoding: 'utf-8' }
    );
    
    console.log('[Reminder] ✓ Scheduled:', result);
    return true;
  } catch (error) {
    console.error('[Reminder] Failed to schedule:', error);
    return false;
  }
}

/**
 * Skill: Book Court
 * This function is called by OpenClaw to finalize a reservation.
 */
export async function bayclub_book_court(params: { sport: Sport; day: string; time: string }) {
  console.log(`[OpenClaw] Attempting to book ${params.sport} for ${params.day} at ${params.time}`);
  const bot = await getAuthenticatedBot();
  
  try {
    await bot.navigateToBooking(params.sport, params.day);
    const success = await bot.bookCourt(params.time);
    
    if (success) {
      // Add to Google Calendar if available
      try {
        await calendarService.init();
        if (calendarService.isAvailable()) {
          const bookingDate = parseDayToDate(params.day);
          const calendarAdded = await calendarService.addCourtBooking(
            params.sport,
            bookingDate,
            params.time
          );
          
          if (calendarAdded) {
            console.log('[OpenClaw] ✓ Added to Google Calendar');
          }
        }
      } catch (calError) {
        console.error('[OpenClaw] Calendar integration failed (booking still successful):', calError);
      }
      
      // Schedule 2-hour reminder
      try {
        await scheduleReminder(params.sport, params.day, params.time);
      } catch (reminderError) {
        console.error('[OpenClaw] Reminder scheduling failed (booking still successful):', reminderError);
      }
      
      return {
        status: "success",
        message: `Successfully booked your ${params.sport} court for ${params.day} at ${params.time}.`
      };
    } else {
      return {
        status: "failure",
        message: `Could not book the ${params.time} slot. It may have been taken or is no longer available.`
      };
    }
  } catch (error: any) {
    console.error("[OpenClaw] Booking Error:", error);
    return { status: "error", message: error instanceof Error ? error.message : String(error) };
  } finally {
    await bot.close();
  }
}
