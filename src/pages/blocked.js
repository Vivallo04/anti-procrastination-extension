// FocusGuard - Blocked Page Logic
// Week 1: Basic page display and stats
// Week 2: Full override flow implementation

import { getStats, getOverridesToday } from '../lib/storage.js';

// Extract blocked domain from URL
const params = new URLSearchParams(window.location.search);
const blockedDomain = params.get('domain');

// Update UI on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Display blocked domain
  if (blockedDomain) {
    document.getElementById('blocked-domain').textContent = blockedDomain;
  }

  // Load and display stats
  await loadStats();

  // Set up event listener for Request Access button
  document.getElementById('request-access').addEventListener('click', handleRequestAccess);
});

/**
 * Load and display current statistics
 */
async function loadStats() {
  try {
    const stats = await getStats();
    const overridesToday = await getOverridesToday();

    // Update blocks today
    document.getElementById('blocks-today').textContent = stats.dailyBlocks || 0;

    // Update overrides used
    document.getElementById('overrides-today').textContent = overridesToday || 0;
  } catch (error) {
    console.error('[FocusGuard] Error loading stats:', error);
  }
}

/**
 * Handle Request Access button click
 * Week 1: Show alert
 * Week 2: Launch override modal flow
 */
async function handleRequestAccess() {
  const overridesToday = await getOverridesToday();
  const MAX_OVERRIDES = 3;

  if (overridesToday >= MAX_OVERRIDES) {
    alert(`Override limit reached (${MAX_OVERRIDES} per day). Try again tomorrow.`);
    return;
  }

  // Week 1: Placeholder
  alert('Override flow will be implemented in Week 2.\n\nThis will include:\n- Friction challenge (typing/math/spacebar)\n- Intent confirmation\n- Final confirmation');

  // Week 2: Will show modal and start 3-step flow
  // _showOverrideModal();
}

/**
 * Show override modal
 * Week 2 implementation
 *
 * Note: Currently unused - will be activated in Week 2
 */
function _showOverrideModal() {
  const modal = document.getElementById('override-modal');
  modal.classList.remove('hidden');

  // Start with Step 1: Challenge
  showStep('step-challenge');
  _initializeFrictionChallenge();
}

/**
 * Show specific step in modal
 */
function showStep(stepId) {
  // Hide all steps
  document.querySelectorAll('.step').forEach(step => {
    step.classList.add('hidden');
  });

  // Show requested step
  const stepEl = document.getElementById(stepId);
  if (stepEl) {
    stepEl.classList.remove('hidden');
  } else {
    console.warn('[FocusGuard] Step element not found:', stepId);
  }
}

/**
 * Initialize friction challenge (random selection)
 * Week 2 implementation
 *
 * Note: Currently unused - will be activated in Week 2
 */
function _initializeFrictionChallenge() {
  // Randomly select challenge type
  const challengeTypes = ['typing', 'math', 'hold'];
  const selectedType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];

  console.log('[FocusGuard] Challenge type:', selectedType);

  // Week 2: Initialize specific challenge
  // - Typing: Generate paragraph and validate input
  // - Math: Generate sequence and validate answer
  // - Hold: Track spacebar hold duration
}

// Refresh stats every 5 seconds
setInterval(loadStats, 5000);
