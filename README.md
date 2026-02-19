# Bay Club Court Booking Bot

Automated tennis and pickleball court booking for Bay Club Connect using Stagehand and OpenClaw.

## Features

- 🎾 Tennis court availability checking and booking
- 🏓 Pickleball court availability checking and booking
- 🤖 Automated browser control via Stagehand
- 📅 Supports booking for today, tomorrow, or specific days of the week
- 💬 WhatsApp integration via OpenClaw - check and book courts from your phone!

## How I Built This

This bot was built using [OpenClaw](https://openclaw.ai), an AI agent framework that lets you control browser automation, run scheduled tasks, and integrate with messaging platforms like WhatsApp.

### Architecture

1. **Stagehand** - Browser automation framework that provides natural language control over web pages
2. **OpenClaw** - Agent framework that orchestrates the bot and provides messaging integrations
3. **DigitalOcean Droplet** - Cloud hosting for 24/7 availability

### Development Process

I built this by:
1. Deploying OpenClaw to a DigitalOcean droplet (1-click install)
2. Creating TypeScript files to automate Bay Club Connect's booking flow
3. Iteratively debugging the web automation using Playwright
4. Packaging it as an OpenClaw skill for easy reuse
5. Connecting WhatsApp so I can book courts from my phone

## Quick Start: Deploy to DigitalOcean

The easiest way to run this bot 24/7 is with a DigitalOcean droplet:

1. **One-Click OpenClaw Deploy**: Follow [this tutorial](https://www.digitalocean.com/community/tutorials/how-to-run-openclaw) to deploy OpenClaw to DigitalOcean
2. **SSH into your droplet**: `ssh root@your-droplet-ip`
3. **Set up the bot**: Follow the "Installation on OpenClaw" section below

## Installation on OpenClaw

Once you have OpenClaw running (either locally or on a droplet):

### 1. Navigate to Skills Directory

```bash
cd ~/.openclaw/workspace/skills
```

### 2. Clone This Repository

```bash
git clone https://github.com/elizabethsiegle/bayclub-pb-tennis-openclaw-bot.git bayclub_manager
cd bayclub_manager
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Bay Club Credentials

Edit your OpenClaw gateway config to add your Bay Club credentials:

```bash
openclaw gateway config.patch
```

Add to the `env` section:

```json
{
  "env": {
    "BAYCLUB_USERNAME": "your-username",
    "BAYCLUB_PASSWORD": "your-password"
  }
}
```

Or export them in your shell:

```bash
export BAYCLUB_USERNAME="your-username"
export BAYCLUB_PASSWORD="your-password"
```

### 5. Test the Bot

```bash
# Check tennis availability
NODE_ENV=development STAGEHAND_ENV=LOCAL HEADLESS=true npx ts-node cli.ts check tennis today

# Book a court
NODE_ENV=development STAGEHAND_ENV=LOCAL HEADLESS=true npx ts-node cli.ts book tennis sunday "5:00 PM - 6:30 PM"
```

### 6. Use via OpenClaw Agent

Once set up as a skill, you can use natural language with your OpenClaw agent:

**Via chat:**
- "Check tennis courts for Sunday"
- "Book pickleball for Saturday at 12:30 PM"
- "What pickleball times are available tomorrow?"

**Via WhatsApp** (if configured):
Just text your OpenClaw number the same commands!

## Command-Line Usage

You can also run the bot directly from the command line:

### Check Availability

```bash
# Check tennis availability for today
NODE_ENV=development STAGEHAND_ENV=LOCAL HEADLESS=true npx ts-node cli.ts check tennis today

# Check pickleball availability for saturday
NODE_ENV=development STAGEHAND_ENV=LOCAL HEADLESS=true npx ts-node cli.ts check pickleball saturday
```

### Book a Court

```bash
# Book a tennis court
NODE_ENV=development STAGEHAND_ENV=LOCAL HEADLESS=true npx ts-node cli.ts book tennis sunday "5:00 PM - 6:30 PM"

# Book a pickleball court
NODE_ENV=development STAGEHAND_ENV=LOCAL HEADLESS=true npx ts-node cli.ts book pickleball saturday "12:30 PM - 1:30 PM"
```

## OpenClaw Skill Integration

This bot is packaged as an OpenClaw skill. Once installed in `~/.openclaw/workspace/skills/bayclub_manager/`, OpenClaw will automatically detect it and you can use it via natural language commands.

See `SKILL.md` for the skill definition.

## Technical Details

### How It Works

1. **Authentication**: Logs into Bay Club Connect using provided credentials
2. **Navigation**: Uses Stagehand to navigate to the booking interface
3. **Sport Selection**: Clicks the appropriate sport (tennis/pickleball) and duration
4. **Time Slot Discovery**: Parses the calendar view to find available slots
5. **Booking Flow**: Automates the multi-step booking confirmation process

### Files

- `cli.ts` - Command-line interface for direct usage
- `bayclub_skills.ts` - OpenClaw skill exports for agent integration
- `BayClubBot.ts` - Main browser automation logic using Stagehand/Playwright
- `SKILL.md` - OpenClaw skill definition
- `package.json` - Dependencies (Stagehand, Playwright, TypeScript)

### Technologies Used

- **[Stagehand](https://github.com/browserbase/stagehand)** - AI-powered browser automation
- **[Playwright](https://playwright.dev/)** - Browser control engine
- **[OpenClaw](https://openclaw.ai)** - Agent framework & orchestration
- **TypeScript** - Type-safe development
- **DigitalOcean** - Cloud hosting

## Why OpenClaw?

OpenClaw makes it easy to:
- ✅ Run browser automation 24/7 in the cloud
- ✅ Integrate with messaging platforms (WhatsApp, Telegram, Discord, etc.)
- ✅ Schedule automated checks and bookings
- ✅ Use natural language instead of remembering CLI commands

## Troubleshooting

### "Invalid username or password"
Double-check your `BAYCLUB_USERNAME` and `BAYCLUB_PASSWORD` environment variables.

### "Timeout waiting for element"
The Bay Club website might have changed. Check the XPath selectors in `BayClubBot.ts`.

### Browser doesn't launch
Make sure you have the required dependencies:
```bash
npx playwright install chromium
```

## Future Enhancements

- [ ] Add scheduling (auto-book weekly tennis at favorite time)
- [ ] Send notifications when new slots open up
- [ ] Support for multiple Bay Club locations
- [ ] Calendar integration (add bookings to Google Calendar)

## Contributing

Pull requests welcome! This was built as a personal automation project but happy to accept improvements.

## License

MIT

---

Built with ❤️ using [OpenClaw](https://openclaw.ai)
