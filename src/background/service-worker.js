// FocusGuard - Background Service Worker
// Always-on blocking engine using declarativeNetRequest API

import {
  getBlockedSites,
  initializeStorage,
  resetDailyStats,
  getStats,
  incrementBlockCount,
  isOverrideActive,
  clearOverride,
  getOverrideExpiry,
  setOverrideExpiry
} from '../lib/storage.js';

// Initialize on install
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[FocusGuard] Extension installed/updated:', details.reason);

  // Initialize storage with defaults
  await initializeStorage();

  // Set up blocking rules
  await updateBlockingRules();

  // Set up daily reset alarm
  chrome.alarms.create('dailyReset', { periodInMinutes: 60 });

  // Set up override expiry checker
  chrome.alarms.create('checkOverrideExpiry', { periodInMinutes: 1 });

  console.log('[FocusGuard] Initialization complete');
});

chrome.runtime.onStartup.addListener(async () => {
  await updateBlockingRules();
});

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'dailyReset') {
    await checkDailyReset();
  } else if (alarm.name === 'checkOverrideExpiry') {
    await checkAndReblockExpiredOverrides();
  }
});

/**
 * Update declarativeNetRequest rules based on blocked sites list
 */
async function updateBlockingRules() {
  const blockedSites = await getBlockedSites();
  const activeBlockedSites = [];

  for (const domain of blockedSites) {
    const overrideActive = await isOverrideActive(domain);
    if (!overrideActive) {
      activeBlockedSites.push(domain);
    }
  }

  console.log('[FocusGuard] Updating blocking rules for', activeBlockedSites.length, 'sites');

  // Get existing dynamic rules to remove them
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingRuleIds = existingRules.map(rule => rule.id);

  // Create new rules
  const newRules = activeBlockedSites.map((domain, index) => ({
    id: index + 1,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: {
        extensionPath: `/src/pages/blocked.html?domain=${encodeURIComponent(domain)}`
      }
    },
    condition: {
      urlFilter: `*://*.${domain}/*`,
      resourceTypes: ['main_frame']
    }
  }));

  // Also match root domain without subdomain
  const rootDomainRules = activeBlockedSites.map((domain, index) => ({
    id: activeBlockedSites.length + index + 1,
    priority: 1,
    action: {
      type: 'redirect',
      redirect: {
        extensionPath: `/src/pages/blocked.html?domain=${encodeURIComponent(domain)}`
      }
    },
    condition: {
      urlFilter: `*://${domain}/*`,
      resourceTypes: ['main_frame']
    }
  }));

  const allRules = [...newRules, ...rootDomainRules];

  // Update rules
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingRuleIds,
    addRules: allRules
  });

  console.log('[FocusGuard] Blocking rules updated:', allRules.length, 'rules active');
}

/**
 * Check if we've crossed midnight and reset daily stats
 */
async function checkDailyReset() {
  const stats = await getStats();
  const lastReset = stats.lastReset || 0;
  const now = Date.now();

  // Get date boundaries (midnight to midnight)
  const lastResetDate = new Date(lastReset).setHours(0, 0, 0, 0);
  const nowDate = new Date(now).setHours(0, 0, 0, 0);

  if (nowDate > lastResetDate) {
    console.log('[FocusGuard] Daily reset triggered');
    await resetDailyStats();
  }
}

/**
 * Check all active overrides and re-block expired ones
 */
async function checkAndReblockExpiredOverrides() {
  const blockedSites = await getBlockedSites();
  const now = Date.now();
  let expiredOverrideFound = false;

  for (const domain of blockedSites) {
    const expiry = await getOverrideExpiry(domain);

    if (expiry && now >= expiry) {
      expiredOverrideFound = true;
      console.log('[FocusGuard] Override expired for:', domain);
      await clearOverride(domain);

      // Force refresh tabs showing this domain
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (tab.url && isDomainMatch(tab.url, domain)) {
          chrome.tabs.reload(tab.id);
        }
      }
    }
  }

  if (expiredOverrideFound) {
    await updateBlockingRules();
  }
}

/**
 * Check if URL matches a domain
 * @param {string} url - Full URL
 * @param {string} domain - Domain to check
 * @returns {boolean}
 */
function isDomainMatch(url, domain) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    return hostname === domain || hostname.endsWith('.' + domain);
  } catch {
    return false;
  }
}

/**
 * Extract domain from URL
 * @param {string} url - Full URL
 * @returns {string|null} Domain or null if invalid
 *
 * Note: Currently unused but reserved for future features
 */
function _extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

/**
 * Track blocks when user attempts to visit blocked site
 * Note: In Manifest V3, we can't directly intercept before redirect
 * Instead, we track when the blocked.html page is loaded
 */
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if this is our blocked page
    if (tab.url.includes('blocked.html')) {
      const params = new URLSearchParams(tab.url.split('?')[1]);
      const domain = params.get('domain');

      if (domain) {
        // Check if override is active
        const overrideActive = await isOverrideActive(domain);

        if (!overrideActive) {
          // Track the block
          await incrementBlockCount(domain);
          console.log('[FocusGuard] Blocked:', domain);
        } else {
          // Override is active, redirect to actual site
          console.log('[FocusGuard] Override active for:', domain);
          chrome.tabs.update(tabId, { url: `https://${domain}` });
        }
      }
    }
  }
});

// Listen for storage changes (e.g., when user adds/removes sites from popup)
chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName === 'local' && changes.blockedSites) {
    console.log('[FocusGuard] Blocked sites list changed, updating rules');
    await updateBlockingRules();
  }
});

// Handle messages from other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_BLOCKED_STATUS') {
    handleGetBlockedStatus(message.domain)
      .then(sendResponse)
      .catch((error) => {
        console.error('[FocusGuard] GET_BLOCKED_STATUS failed:', error);
        sendResponse({
          success: false,
          error: error?.message || 'Failed to get blocked status'
        });
      });
    return true; // Async response
  }

  if (message.type === 'GRANT_OVERRIDE') {
    handleGrantOverride(message.domain, message.duration)
      .then(sendResponse)
      .catch((error) => {
        console.error('[FocusGuard] GRANT_OVERRIDE failed:', error);
        sendResponse({
          success: false,
          error: error?.message || 'Failed to grant override'
        });
      });
    return true; // Async response
  }
});

async function handleGetBlockedStatus(domain) {
  const blockedSites = await getBlockedSites();
  const isBlocked = blockedSites.some(site => domain === site || domain.endsWith('.' + site));
  const overrideActive = isBlocked ? await isOverrideActive(domain) : false;

  return {
    isBlocked,
    overrideActive,
    expiryTime: overrideActive ? await getOverrideExpiry(domain) : null
  };
}

async function handleGrantOverride(domain, duration) {
  const expiryTime = Date.now() + duration;
  await setOverrideExpiry(domain, expiryTime);
  await updateBlockingRules();

  console.log('[FocusGuard] Override granted for:', domain, 'until', new Date(expiryTime));

  return { success: true, expiryTime };
}

console.log('[FocusGuard] Service worker loaded');
