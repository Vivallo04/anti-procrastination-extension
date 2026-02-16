// FocusGuard - Configuration Constants

export const DEFAULT_BLOCKED_SITES = [
  'instagram.com',
  'facebook.com',
  'twitter.com',
  'x.com',
  'threads.net',
  'tiktok.com',
  'reddit.com',
  'imgur.com',
  '9gag.com',
  'youtube.com',
  'twitch.tv'
];

export const MAX_DAILY_OVERRIDES = 3;
export const OVERRIDE_DURATION_MS = 10 * 60 * 1000; // 10 minutes
export const TYPING_CHALLENGE_WORDS = 25;
export const MATH_CHALLENGE_STEPS = 5;
export const SPACEBAR_HOLD_DURATION_MS = 25000; // 25 seconds

// Word bank for typing challenges - neutral, focus-oriented words
export const WORD_BANK = [
  'focus', 'choice', 'intention', 'awareness', 'mindful', 'present', 'deliberate',
  'conscious', 'attentive', 'purpose', 'clarity', 'discipline', 'commitment',
  'reflection', 'patience', 'persistence', 'balance', 'strength', 'wisdom',
  'courage', 'resilience', 'progress', 'growth', 'learning', 'journey',
  'effort', 'practice', 'routine', 'habit', 'consistency', 'dedication',
  'determination', 'resolve', 'willpower', 'control', 'mastery', 'achievement',
  'success', 'excellence', 'quality', 'improvement', 'development', 'skill',
  'knowledge', 'understanding', 'insight', 'perspective', 'vision', 'goal',
  'objective', 'target', 'milestone', 'step', 'action', 'decision',
  'responsibility', 'accountability', 'ownership', 'agency', 'autonomy', 'freedom',
  'independence', 'capability', 'competence', 'confidence', 'belief', 'trust',
  'reliability', 'integrity', 'honesty', 'authenticity', 'genuine', 'sincere',
  'thoughtful', 'careful', 'considerate', 'measured', 'calculated', 'planned',
  'strategic', 'tactical', 'methodical', 'systematic', 'organized', 'structured',
  'efficient', 'effective', 'productive', 'purposeful', 'meaningful', 'valuable',
  'important', 'essential', 'necessary', 'crucial', 'vital', 'significant',
  'relevant', 'appropriate', 'suitable', 'fitting', 'proper', 'correct',
  'accurate', 'precise', 'exact', 'specific', 'clear', 'distinct'
];

// Storage keys
export const STORAGE_KEYS = {
  BLOCKED_SITES: 'blockedSites',
  OVERRIDES_TODAY: 'overridesToday',
  OVERRIDE_HISTORY: 'overrideHistory',
  STATS: 'stats'
};
