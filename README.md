# Bay Club Court Booking Bot

Automated tennis and pickleball court booking for Bay Club Connect using Stagehand.

## Features

- 🎾 Tennis court availability checking and booking
- 🏓 Pickleball court availability checking and booking
- 🤖 Automated browser control via Stagehand
- 📅 Supports booking for today, tomorrow, or specific days of the week

## Prerequisites

- Node.js 18+
- Bay Club Connect account credentials

## Installation

```bash
npm install
```

## Configuration

Set your Bay Club credentials as environment variables:

```bash
export BAYCLUB_USERNAME="your-username"
export BAYCLUB_PASSWORD="your-password"
```

## Usage

### Check Availability

```bash
# Check tennis availability for today
npx ts-node cli.ts check tennis today

# Check pickleball availability for saturday
npx ts-node cli.ts check pickleball saturday
```

### Book a Court

```bash
# Book a tennis court
npx ts-node cli.ts book tennis sunday "5:00 PM - 6:30 PM"

# Book a pickleball court
npx ts-node cli.ts book pickleball saturday "12:30 PM - 1:30 PM"
```

## OpenClaw Integration

This bot is designed to work as an OpenClaw skill. See `SKILL.md` for integration details.

## How It Works

1. Authenticates with Bay Club Connect
2. Navigates to the booking interface
3. Selects sport (tennis/pickleball) and duration
4. Finds available time slots or books a specific time
5. Handles confirmation flow automatically

## Files

- `cli.ts` - Command-line interface
- `bayclub_skills.ts` - OpenClaw skill exports
- `BayClubBot.ts` - Main browser automation logic
- `SKILL.md` - OpenClaw skill definition

## License

MIT
