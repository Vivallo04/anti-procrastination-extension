# FocusGuard

**Friction-based commitment device for Chrome**

FocusGuard is an always-on distraction blocker designed as a commitment device. Unlike timer-based productivity tools, FocusGuard uses continuous blocking with active friction challenges that interrupt autopilot behavior and convert unconscious scrolling into conscious decisions.

## Philosophy

> "If you want to procrastinate, you must make a deliberate choice."

FocusGuard doesn't rely on motivation. It protects your original intention when you installed it. The goal is not punishment—it's to make you pause and think before accessing distracting sites.

## Features

### ✅ Week 1 - MVP Core (Current)

- **Always-On Blocking**: No schedules, no timers, just protection
- **Instant Activation**: Blocking starts within 30 seconds of installation
- **Default Block List**: Pre-configured with common distracting sites
  - Social: Instagram, Facebook, Twitter/X, Threads, TikTok
  - Entertainment: Reddit, Imgur, 9GAG
  - Video: YouTube, Twitch
- **Local Stats Tracking**: Blocks per day, override usage
- **Clean Blocked Page**: Minimal, grayscale design

### 🚧 Week 2 - Friction Override System (Coming Soon)

- **Active Friction Challenges** (not passive waiting):
  - Typing Challenge: Re-type 20-30 word paragraph exactly
  - Math Challenge: Solve 5-step arithmetic sequence
  - Spacebar Hold: Hold spacebar continuously for 25 seconds
- **Intent Confirmation**: Explain why you need access (15+ chars)
- **Final Confirmation**: Type "I choose to continue"
- **Temporary Access**: 10-minute unlock, then automatic re-block
- **Daily Limit**: Maximum 3 overrides per 24 hours

### 📋 Week 3 - UI & Stats (Planned)

- Enhanced statistics display
- Override history tracking
- Polished UI styling

### 🚀 Week 4 - Polish & Launch (Planned)

- Production icons
- Edge case testing
- Chrome Web Store submission

## Installation (Developer Mode)

Since this is an MVP in development, install via Chrome's developer mode:

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vivallo04/anti-procrastination-extension.git
   cd anti-procrastination-extension
   ```

2. **Open Chrome Extensions**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)

3. **Load the extension**
   - Click "Load unpacked"
   - Select the `anti-procrastination-extension` directory

4. **Verify activation**
   - Try visiting `reddit.com` or `instagram.com`
   - You should see the FocusGuard blocked page
   - Time to protection: < 30 seconds

## How It Works

### Architecture

- **Manifest V3**: Future-proof Chrome extension
- **declarativeNetRequest**: High-performance blocking engine
- **No backend**: 100% local, zero tracking
- **No bundler**: Vanilla JavaScript for simplicity

### Data Model

All data stored locally in Chrome storage:

```javascript
{
  blockedSites: ['instagram.com', 'reddit.com', ...],
  overridesToday: 0,
  stats: {
    blocksByDomain: { 'reddit.com': 45, ... },
    dailyBlocks: 68,
    lastReset: timestamp
  },
  overrideHistory: [
    { domain, timestamp, reason }
  ]
}
```

### Blocking Flow

1. User attempts to visit blocked site (e.g., `reddit.com`)
2. Manifest V3 DNR rule redirects to `blocked.html`
3. Blocked page shows stats and "Request Access" button
4. **(Week 2)** Clicking button triggers 3-step override flow
5. **(Week 2)** On completion, 10-minute access granted
6. **(Week 2)** After 10 minutes, automatic re-block

## Development & CI

### Continuous Integration

FocusGuard includes automated CI validation via GitHub Actions:

- **Manifest Validation**: JSON syntax, Manifest V3 structure
- **File Integrity**: All critical files exist
- **JavaScript Linting**: ESLint checks for syntax errors and code quality
- **Performance**: Full CI runs in ~6 seconds

### Local Development

```bash
# Install dependencies
npm install

# Run validation
npm run validate

# Run linter
npm run lint

# Run full CI suite
npm run ci
```

### CI Checks

✅ Manifest JSON syntax and structure
✅ Service worker exists and is valid
✅ All HTML pages exist
✅ All icons present
✅ JavaScript syntax validation
✅ No undefined variables
✅ No unused imports

## Project Structure

```
anti-procrastination-extension/
├── manifest.json                    # Manifest V3 configuration
├── package.json                     # npm config (ESLint only)
├── .eslintrc.json                   # ESLint configuration
├── .github/workflows/ci.yml         # GitHub Actions CI
├── scripts/
│   └── validate-extension.js        # Custom validator
├── src/
│   ├── background/
│   │   └── service-worker.js       # Blocking logic, DNR rules
│   ├── pages/
│   │   ├── blocked.html            # Blocked page UI
│   │   ├── blocked.js              # Blocked page logic
│   │   ├── popup.html              # Extension popup
│   │   └── popup.js                # Popup logic
│   ├── lib/
│   │   ├── storage.js              # Chrome storage wrapper
│   │   ├── friction.js             # Challenge generators (Week 2)
│   │   └── constants.js            # Default block list, configs
│   └── styles/
│       ├── blocked.css             # Blocked page styles
│       └── popup.css               # Popup styles
├── icons/                          # Extension icons
├── LICENSE                         # MIT License
└── README.md                       # This file
```

## Usage

### Viewing Stats

Click the FocusGuard icon in your Chrome toolbar to see:
- Blocks today
- Overrides used (0/3)

### Managing Block List

*Week 1 MVP:* Click "Manage Block List" in popup to view current sites.

*Post-MVP:* Full UI for adding/removing custom domains.

### Viewing Activity

*Week 1 MVP:* Click "View Activity" to see override history (placeholder).

*Post-MVP:* Rich timeline view with filtering.

## Privacy & Security

- **No telemetry**: Zero tracking, analytics, or phone-home
- **No accounts**: No login, no cloud sync
- **Local-only**: All data stays on your machine
- **Open source**: Fully inspectable code
- **MIT License**: Free and transparent

## Important Notes

### What FocusGuard CAN Do

✅ Block distracting websites continuously
✅ Require active effort to override blocks
✅ Track your block/override patterns locally
✅ Re-block sites after temporary access
✅ Reset daily stats at midnight

### What FocusGuard CANNOT Do

❌ Prevent extension uninstall (Chrome limitation)
❌ Block access in other browsers
❌ Prevent DevTools bypass
❌ Detect VPN usage
❌ Provide unbreakable enforcement

**FocusGuard is a commitment device, not a jail.** It creates friction to interrupt impulse, not force. If you want to disable it, you can—but that requires a conscious choice.

## Development

### Running Locally

No build step required! Just load the extension in developer mode and refresh after code changes.

### Testing Checklist

- [ ] Extension loads without errors
- [ ] Blocked sites redirect to `blocked.html`
- [ ] Stats update correctly
- [ ] Popup displays current data
- [ ] Daily reset works at midnight

## Roadmap

### v1.0.0 - MVP (4 weeks)
- ✅ Week 1: Core blocking infrastructure
- ⏳ Week 2: Friction override system
- ⏳ Week 3: UI & stats polish
- ⏳ Week 4: Chrome Web Store launch

### Post-MVP
- Options page with full site management
- Regex/keyword blocking
- CSV export
- Browser disable detection
- Mobile companion app (maybe)

## Contributing

This is currently a personal MVP project. Once v1.0 ships, contributions will be welcome!

## License

MIT License - see [LICENSE](LICENSE) file.

## Philosophy

FocusGuard is built on a simple idea: **friction beats force**.

We don't shame you. We don't track you. We don't lock you out permanently.

We just make you stop and think before you click.

That's usually enough.

---

**Built with intentionality, not punishment.**
