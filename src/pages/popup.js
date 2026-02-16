// FocusGuard - Popup Logic

import { getStats, getOverridesToday, getBlockedSites, getOverrideHistory } from '../lib/storage.js';

// Load stats on popup open
document.addEventListener('DOMContentLoaded', async () => {
  await loadStats();

  // Set up button handlers
  document.getElementById('manage-sites').addEventListener('click', handleManageSites);
  document.getElementById('view-activity').addEventListener('click', handleViewActivity);
});

/**
 * Load and display current statistics
 */
async function loadStats() {
  try {
    const stats = await getStats();
    const overridesToday = await getOverridesToday();

    document.getElementById('blocks-today').textContent = stats.dailyBlocks || 0;
    document.getElementById('overrides-today').textContent = overridesToday || 0;
  } catch (error) {
    console.error('[FocusGuard] Error loading stats:', error);
  }
}

/**
 * Handle Manage Sites button
 * MVP: Show alert with current sites
 * Post-MVP: Open full options page
 */
async function handleManageSites() {
  try {
    const sites = await getBlockedSites();
    if (!Array.isArray(sites) || sites.length === 0) {
      alert('No blocked sites.\n\nPost-MVP: Full site management UI will be added here.');
      return;
    }

    const siteList = sites.join('\n- ');

    alert(`Currently Blocked Sites:\n\n- ${siteList}\n\nPost-MVP: Full site management UI will be added here.`);
  } catch (error) {
    console.error('[FocusGuard] Error loading sites:', error);
    alert('Error loading blocked sites.');
  }
}

/**
 * Handle View Activity button
 * MVP: Show simple list
 * Post-MVP: Rich timeline view
 */
async function handleViewActivity() {
  try {
    const history = await getOverrideHistory();

    if (history.length === 0) {
      alert('No override history yet.\n\nOverrides will appear here when you request access to blocked sites.');
      return;
    }

    // Format history for display
    const recent = history.slice(-10).reverse(); // Last 10 entries, newest first
    const formatted = recent.map(entry => {
      const date = new Date(entry.timestamp);
      const time = date.toLocaleTimeString();
      return `${time} - ${entry.domain}\nReason: ${entry.reason}`;
    }).join('\n\n');

    alert(`Recent Override Activity:\n\n${formatted}\n\nPost-MVP: Rich timeline view will be added.`);
  } catch (error) {
    console.error('[FocusGuard] Error loading history:', error);
    alert('Error loading activity.');
  }
}

// Refresh stats every 2 seconds while popup is open
setInterval(loadStats, 2000);
