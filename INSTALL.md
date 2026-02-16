# FocusGuard - Installation Guide

## Quick Start (5 minutes)

### Step 1: Open Chrome Extensions
1. Open Google Chrome
2. Type `chrome://extensions/` in the address bar and press Enter
3. Enable **Developer mode** (toggle switch in top-right corner)

### Step 2: Load the Extension
1. Click **"Load unpacked"** button
2. Navigate to your project directory: `/path/to/anti-procrastination-extension`
3. Click **"Select"**

### Step 3: Verify Installation
1. You should see the FocusGuard extension card appear
2. Look for the 🔒 icon in your Chrome toolbar
3. Try visiting `reddit.com` or `instagram.com`
4. You should see the FocusGuard blocked page

**Time to protection: < 30 seconds**

## Testing the Extension

### Test 1: Basic Blocking
```
1. Visit: https://reddit.com
2. Expected: FocusGuard blocked page shows
3. Check: "Blocked today" counter increments
```

### Test 2: Popup Stats
```
1. Click the 🔒 icon in Chrome toolbar
2. Expected: Popup shows current stats
3. Check: "Blocks Today" matches your attempts
```

### Test 3: Multiple Sites
```
1. Try visiting each default blocked site:
   - instagram.com
   - facebook.com
   - twitter.com
   - youtube.com
   - tiktok.com

2. Expected: All redirect to blocked page
3. Check: Stats increment for each attempt
```

## Troubleshooting

### Extension doesn't appear
- Verify Developer mode is ON
- Check that you selected the correct directory
- Look for errors in the extension card

### Sites aren't blocked
- Check extension is enabled (toggle switch is ON)
- Refresh the site (Cmd+R / Ctrl+R)
- Check browser console for errors (F12)

### Blocked page doesn't load
- Verify `src/pages/blocked.html` exists
- Check for JavaScript errors (F12 → Console)
- Try unloading and reloading the extension

### Stats don't update
- Check browser console for storage errors
- Verify Chrome storage permissions in manifest
- Try clicking the popup icon to refresh

## Viewing Console Logs

To see what FocusGuard is doing:

1. Go to `chrome://extensions/`
2. Find FocusGuard card
3. Click **"service worker"** link
4. Console will show logs like:
   ```
   [FocusGuard] Extension installed/updated: install
   [FocusGuard] Updating blocking rules for 11 sites
   [FocusGuard] Blocking rules updated: 22 rules active
   [FocusGuard] Blocked: reddit.com
   ```

## Making Changes

After editing code:

1. Go to `chrome://extensions/`
2. Click the **refresh icon** ↻ on FocusGuard card
3. Reload any tabs showing blocked sites

**No build step required!** Changes take effect immediately after refresh.

## Uninstalling

If you want to remove FocusGuard:

1. Go to `chrome://extensions/`
2. Find FocusGuard card
3. Click **"Remove"**
4. All local data will be cleared

## Next Steps

Week 1 MVP is complete! Next up:

**Week 2: Friction Override System**
- Implement typing/math/spacebar challenges
- Add 3-step override flow
- Enable 10-minute temporary access
- Enforce 3-override daily limit

**Week 3: UI Polish**
- Enhanced statistics
- Override history timeline
- Refined styling

**Week 4: Chrome Web Store Launch**
- Production icons
- Edge case testing
- Store listing materials
- Public release

## Support

For issues or questions:
- Check the [README.md](README.md) for architecture details
- Review console logs for debugging
- File an issue on GitHub (once public)

---

**Welcome to FocusGuard. Your focus is protected.** 🔒
