import { BayClubBot, Sport } from './BayClubBot';

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
