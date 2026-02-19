# Bay Club Court Booking Bot

Automated tennis and pickleball court booking for Bay Club Connect using Stagehand and OpenClaw.

## Features

- 🎾 Tennis court availability checking and booking
- 🏓 Pickleball court availability checking and booking
- 🤖 Automated browser control via Stagehand
- 📅 Supports booking for today, tomorrow, or specific days of the week
- 💬 WhatsApp integration via OpenClaw - check and book courts from your phone!

## How I Built This

**This entire bot was built and edited via WhatsApp!** 🤯

I chatted with my OpenClaw agent through WhatsApp to write all the code, debug the automation, clean up files, create this README, and push everything to GitHub - all without touching a traditional code editor.

### Architecture

1. **[Stagehand](https://github.com/browserbase/stagehand)** - AI-powered browser automation using Browserbase
2. **[Browserbase](https://browserbase.com)** - Headless browser infrastructure for running automation in the cloud
3. **[OpenClaw](https://openclaw.ai)** - Agent framework that orchestrates the bot and provides messaging integrations
4. **[DigitalOcean](https://www.digitalocean.com/products/droplets)** - Cloud hosting for 24/7 availability

### Development Process

I built this entirely through WhatsApp by:
1. **Deploying OpenClaw** to a DigitalOcean droplet using the [1-click marketplace app](https://marketplace.digitalocean.com/apps/openclaw)
2. **Connecting WhatsApp** during droplet setup (OpenClaw shows a QR code, scan it, done!)
3. **Writing code via chat** - "Create a TypeScript bot that books Bay Club tennis courts"
4. **Debugging through conversation** - "The pickleball selector isn't working, can you fix the XPath?"
5. **Iterating on features** - "Add support for checking availability", "Clean up debug files"
6. **Publishing to GitHub** - "Create a repo and push this code"
7. **Documenting** - "Update the README with setup instructions"

**No SSH required. No code editor. Just WhatsApp. 📱**

## Quick Start: Deploy to DigitalOcean

The easiest way to run this bot 24/7 is with the [OpenClaw 1-Click App on DigitalOcean](https://marketplace.digitalocean.com/apps/openclaw):

### 1. Deploy OpenClaw Droplet

1. Click **"Create OpenClaw Droplet"** on the [marketplace page](https://marketplace.digitalocean.com/apps/openclaw)
2. Choose your droplet size (Basic $6/month works great)
3. Select a region close to you
4. Click **Create Droplet**

**Full tutorial:** [How to Run OpenClaw on DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-run-openclaw)

### 2. Connect WhatsApp

After your droplet boots up:

1. SSH into your droplet: `ssh root@your-droplet-ip`
2. OpenClaw will automatically show a WhatsApp QR code in the terminal
3. Open WhatsApp → **Settings → Linked Devices → Link a Device**
4. Scan the QR code
5. **Done!** You can now chat with your OpenClaw agent via WhatsApp 📱

Alternatively, you can connect WhatsApp later:
```bash
openclaw gateway config.patch
```

Add WhatsApp channel configuration (see [OpenClaw WhatsApp docs](https://docs.openclaw.ai/channels/whatsapp)).

### 3. Install This Bot

Follow the "Installation on OpenClaw" section below.

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
- `BayClubBot.ts` - Main browser automation logic using Stagehand and Browserbase
- `SKILL.md` - OpenClaw skill definition
- `package.json` - Dependencies (Stagehand, TypeScript)

### Technologies Used

- **[Stagehand](https://github.com/browserbase/stagehand)** - AI-powered browser automation framework
- **[Browserbase](https://browserbase.com)** - Serverless browser infrastructure for reliable automation
- **[OpenClaw](https://openclaw.ai)** - AI agent framework & orchestration ([Docs](https://docs.openclaw.ai) | [GitHub](https://github.com/openclaw/openclaw))
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[DigitalOcean](https://www.digitalocean.com)** - Cloud hosting ([Marketplace App](https://marketplace.digitalocean.com/apps/openclaw))
- **[WhatsApp](https://www.whatsapp.com)** - Messaging interface via OpenClaw integration

## Building via WhatsApp

The coolest part of this project is that **the entire bot was built through WhatsApp conversations**. Here's what that looked like:

<!-- TODO: Add screenshots of WhatsApp conversation -->
<!-- Example conversation flow:
1. Initial request: "check tennis courts for sunday please"
2. Bot checking availability and showing results
3. Booking request: "book 5-6:30pm please"
4. Creating GitHub repo: "can you make a github repo for me"
5. Editing README: "edit the readme to include directions"
-->

### What I Did Through WhatsApp

✅ Wrote all TypeScript code  
✅ Debugged XPath selectors and automation logic  
✅ Ran test commands and verified bookings  
✅ Cleaned up debug files  
✅ Initialized Git repo and created .gitignore  
✅ Set up GitHub credentials  
✅ Pushed code to GitHub  
✅ Wrote and edited this README  

**No traditional coding environment needed - just natural language instructions via WhatsApp!**

## Why OpenClaw?

[OpenClaw](https://openclaw.ai) makes it incredibly easy to:

- ✅ **Build via chat** - Write code through natural conversation (WhatsApp, Telegram, Discord, etc.)
- ✅ **Run 24/7 in the cloud** - Deploy to DigitalOcean with 1-click
- ✅ **Control browsers** - Built-in Stagehand/Browserbase integration
- ✅ **Integrate messaging** - Native WhatsApp, Telegram, iMessage, Signal support
- ✅ **Schedule tasks** - Cron jobs for automated checks and bookings
- ✅ **Use natural language** - No CLI commands to memorize

**Learn more:**
- [OpenClaw Docs](https://docs.openclaw.ai)
- [GitHub Repository](https://github.com/openclaw/openclaw)
- [DigitalOcean Marketplace](https://marketplace.digitalocean.com/apps/openclaw)
- [Community Discord](https://discord.gg/openclaw)

## Troubleshooting

### "Invalid username or password"
Double-check your `BAYCLUB_USERNAME` and `BAYCLUB_PASSWORD` environment variables.

### "Timeout waiting for element"
The Bay Club website might have changed. Check the XPath selectors in `BayClubBot.ts`.

### Browser doesn't launch
Make sure Browserbase is configured correctly. For local development:
```bash
npx playwright install chromium
```

For production, Stagehand uses Browserbase's cloud browser infrastructure automatically.

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
