// FocusGuard - Chrome Storage Wrapper
// Centralized storage access with clean API

import { DEFAULT_BLOCKED_SITES, STORAGE_KEYS } from './constants.js';

function normalizeDomain(domain) {
  if (typeof domain !== 'string') {
    return '';
  }
  return domain.toLowerCase().trim();
}

function getOverrideKey(domain) {
  const normalizedDomain = normalizeDomain(domain);
  if (!normalizedDomain) {
    return null;
  }
  return `override_${normalizedDomain.replace(/\./g, '_')}`;
}

/**
 * Get list of blocked sites
 * @returns {Promise<string[]>} Array of blocked domains
 */
export async function getBlockedSites() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.BLOCKED_SITES);
  return result[STORAGE_KEYS.BLOCKED_SITES] || DEFAULT_BLOCKED_SITES;
}

/**
 * Add a site to the block list
 * @param {string} domain - Domain to block (e.g., "example.com")
 * @returns {Promise<boolean>} True if added, false if already exists
 */
export async function addBlockedSite(domain) {
  const sites = await getBlockedSites();
  const normalizedDomain = domain.toLowerCase().trim();

  if (sites.includes(normalizedDomain)) {
    return false;
  }

  sites.push(normalizedDomain);
  await chrome.storage.local.set({ [STORAGE_KEYS.BLOCKED_SITES]: sites });
  return true;
}

/**
 * Remove a site from the block list
 * @param {string} domain - Domain to unblock
 * @returns {Promise<boolean>} True if removed, false if not found
 */
export async function removeBlockedSite(domain) {
  const sites = await getBlockedSites();
  const normalizedDomain = domain.toLowerCase().trim();
  const filtered = sites.filter(s => s !== normalizedDomain);

  if (filtered.length === sites.length) {
    return false;
  }

  await chrome.storage.local.set({ [STORAGE_KEYS.BLOCKED_SITES]: filtered });
  return true;
}

/**
 * Get current statistics
 * @returns {Promise<Object>} Stats object with blocksByDomain, dailyBlocks, lastReset
 */
export async function getStats() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.STATS);
  return result[STORAGE_KEYS.STATS] || {
    blocksByDomain: {},
    dailyBlocks: 0,
    lastReset: Date.now()
  };
}

/**
 * Increment block count for a domain
 * @param {string} domain - Domain that was blocked
 */
export async function incrementBlockCount(domain) {
  const stats = await getStats();
  const normalizedDomain = normalizeDomain(domain);
  if (!normalizedDomain) {
    return;
  }

  stats.blocksByDomain[normalizedDomain] = (stats.blocksByDomain[normalizedDomain] || 0) + 1;
  stats.dailyBlocks = (stats.dailyBlocks || 0) + 1;

  await chrome.storage.local.set({ [STORAGE_KEYS.STATS]: stats });
}

/**
 * Get number of overrides used today
 * @returns {Promise<number>}
 */
export async function getOverridesToday() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.OVERRIDES_TODAY);
  return result[STORAGE_KEYS.OVERRIDES_TODAY] || 0;
}

/**
 * Increment override count
 * @returns {Promise<number>} New override count
 */
export async function incrementOverrideCount() {
  const current = await getOverridesToday();
  const newCount = current + 1;
  await chrome.storage.local.set({ [STORAGE_KEYS.OVERRIDES_TODAY]: newCount });
  return newCount;
}

/**
 * Get override history
 * @returns {Promise<Array>} Array of override records
 */
export async function getOverrideHistory() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.OVERRIDE_HISTORY);
  return result[STORAGE_KEYS.OVERRIDE_HISTORY] || [];
}

/**
 * Add entry to override history
 * @param {string} domain - Domain that was overridden
 * @param {string} reason - User's stated reason
 */
export async function addOverrideHistory(domain, reason) {
  const history = await getOverrideHistory();
  const normalizedDomain = normalizeDomain(domain);
  history.push({
    domain: normalizedDomain,
    reason,
    timestamp: Date.now()
  });

  // Keep last 100 entries
  const trimmed = history.slice(-100);
  await chrome.storage.local.set({ [STORAGE_KEYS.OVERRIDE_HISTORY]: trimmed });
}

/**
 * Set override expiry time for a domain
 * @param {string} domain - Domain to grant temporary access
 * @param {number} expiryTime - Timestamp when access should be revoked
 */
export async function setOverrideExpiry(domain, expiryTime) {
  const key = getOverrideKey(domain);
  if (!key) {
    console.warn('[FocusGuard] setOverrideExpiry skipped: invalid domain', domain);
    return;
  }
  await chrome.storage.local.set({ [key]: expiryTime });
}

/**
 * Get override expiry time for a domain
 * @param {string} domain - Domain to check
 * @returns {Promise<number|null>} Expiry timestamp or null if not overridden
 */
export async function getOverrideExpiry(domain) {
  const key = getOverrideKey(domain);
  if (!key) {
    return null;
  }
  const result = await chrome.storage.local.get(key);
  return result[key] || null;
}

/**
 * Clear override for a domain
 * @param {string} domain - Domain to re-block
 */
export async function clearOverride(domain) {
  const key = getOverrideKey(domain);
  if (!key) {
    return;
  }
  await chrome.storage.local.remove(key);
}

/**
 * Check if a domain is currently overridden
 * @param {string} domain - Domain to check
 * @returns {Promise<boolean>} True if override is active
 */
export async function isOverrideActive(domain) {
  const expiry = await getOverrideExpiry(domain);
  if (!expiry) return false;

  const now = Date.now();
  if (now >= expiry) {
    await clearOverride(domain);
    return false;
  }

  return true;
}

/**
 * Reset daily statistics (blocks and overrides)
 * Called at midnight each day
 */
export async function resetDailyStats() {
  const stats = await getStats();
  await chrome.storage.local.set({
    [STORAGE_KEYS.OVERRIDES_TODAY]: 0,
    [STORAGE_KEYS.STATS]: {
      blocksByDomain: stats.blocksByDomain || {},
      dailyBlocks: 0,
      lastReset: Date.now()
    }
  });
}

/**
 * Initialize storage with defaults on first install
 */
export async function initializeStorage() {
  const existing = await chrome.storage.local.get(null);

  // Only set defaults if not already present
  if (!existing[STORAGE_KEYS.BLOCKED_SITES]) {
    await chrome.storage.local.set({
      [STORAGE_KEYS.BLOCKED_SITES]: DEFAULT_BLOCKED_SITES
    });
  }

  if (!existing[STORAGE_KEYS.STATS]) {
    await chrome.storage.local.set({
      [STORAGE_KEYS.STATS]: {
        blocksByDomain: {},
        dailyBlocks: 0,
        lastReset: Date.now()
      }
    });
  }

  if (!existing[STORAGE_KEYS.OVERRIDES_TODAY]) {
    await chrome.storage.local.set({
      [STORAGE_KEYS.OVERRIDES_TODAY]: 0
    });
  }

  if (!existing[STORAGE_KEYS.OVERRIDE_HISTORY]) {
    await chrome.storage.local.set({
      [STORAGE_KEYS.OVERRIDE_HISTORY]: []
    });
  }
}
