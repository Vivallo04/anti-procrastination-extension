#!/usr/bin/env node

/**
 * FocusGuard - Extension Validator
 *
 * Validates Chrome extension structure and critical files.
 * Catches issues that would prevent the extension from loading.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

let errors = 0;
let warnings = 0;

function error(msg) {
  console.error(`❌ ERROR: ${msg}`);
  errors++;
}

function warn(msg) {
  console.warn(`⚠️  WARNING: ${msg}`);
  warnings++;
}

function success(msg) {
  console.log(`✓ ${msg}`);
}

console.log('\n🔍 FocusGuard Extension Validator\n');

// ==========================================
// 1. Validate manifest.json
// ==========================================
console.log('📋 Validating manifest.json...');
let manifest;
try {
  const manifestPath = path.join(rootDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    error('manifest.json not found');
    process.exit(1);
  }
  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  manifest = JSON.parse(manifestContent);
  success('manifest.json is valid JSON');
} catch (err) {
  error(`manifest.json parse failed: ${err.message}`);
  process.exit(1);
}

// Validate Manifest V3 structure
if (manifest.manifest_version !== 3) {
  error(`Expected manifest_version 3, got ${manifest.manifest_version}`);
}

if (!manifest.name) {
  error('manifest.json missing required field: name');
}

if (!manifest.version) {
  error('manifest.json missing required field: version');
}

if (manifest.manifest_version === 3 && manifest.name && manifest.version) {
  success(`Manifest V3 structure valid (${manifest.name} v${manifest.version})`);
}

// ==========================================
// 2. Validate service worker
// ==========================================
console.log('\n⚙️  Validating service worker...');
if (manifest.background?.service_worker) {
  const swPath = path.join(rootDir, manifest.background.service_worker);
  if (fs.existsSync(swPath)) {
    const stats = fs.statSync(swPath);
    success(`Service worker found: ${manifest.background.service_worker} (${stats.size} bytes)`);
  } else {
    error(`Service worker not found: ${manifest.background.service_worker}`);
  }
} else {
  error('manifest.json missing background.service_worker');
}

// ==========================================
// 3. Validate popup HTML
// ==========================================
console.log('\n🪟 Validating popup...');
if (manifest.action?.default_popup) {
  const popupPath = path.join(rootDir, manifest.action.default_popup);
  if (fs.existsSync(popupPath)) {
    success(`Popup HTML found: ${manifest.action.default_popup}`);
  } else {
    error(`Popup HTML not found: ${manifest.action.default_popup}`);
  }
} else {
  warn('manifest.json missing action.default_popup (optional but recommended)');
}

// ==========================================
// 4. Validate icons
// ==========================================
console.log('\n🎨 Validating icons...');
const iconSizes = ['16', '48', '128'];
let iconsFound = 0;
for (const size of iconSizes) {
  if (manifest.icons?.[size]) {
    const iconPath = path.join(rootDir, manifest.icons[size]);
    if (fs.existsSync(iconPath)) {
      success(`Icon ${size}x${size} found: ${manifest.icons[size]}`);
      iconsFound++;
    } else {
      warn(`Icon ${size}x${size} missing: ${manifest.icons[size]}`);
    }
  } else {
    warn(`Icon ${size}x${size} not specified in manifest`);
  }
}

if (iconsFound === 0) {
  error('No icons found - extension will have no visual identity');
}

// ==========================================
// 5. Validate critical source files
// ==========================================
console.log('\n📁 Validating source files...');
const criticalFiles = [
  'src/background/service-worker.js',
  'src/pages/blocked.html',
  'src/pages/blocked.js',
  'src/pages/popup.html',
  'src/pages/popup.js',
  'src/lib/storage.js',
  'src/lib/constants.js',
  'src/styles/blocked.css',
  'src/styles/popup.css'
];

let filesFound = 0;
for (const file of criticalFiles) {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    filesFound++;
    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      warn(`${file} is empty`);
    }
  } else {
    error(`Missing critical file: ${file}`);
  }
}

if (filesFound === criticalFiles.length) {
  success(`All ${criticalFiles.length} critical files present`);
}

// ==========================================
// 6. Validate permissions
// ==========================================
console.log('\n🔐 Validating permissions...');
const requiredPermissions = [
  'declarativeNetRequest',
  'declarativeNetRequestWithHostAccess',
  'storage',
  'tabs',
  'alarms'
];

const manifestPermissions = manifest.permissions || [];
let permissionsFound = 0;

for (const perm of requiredPermissions) {
  if (manifestPermissions.includes(perm)) {
    permissionsFound++;
  } else {
    warn(`Missing recommended permission: ${perm}`);
  }
}

if (permissionsFound > 0) {
  success(`Found ${permissionsFound}/${requiredPermissions.length} recommended permissions`);
}

// Check host permissions
if (manifest.host_permissions?.includes('<all_urls>')) {
  success('Host permissions configured for blocking');
} else {
  warn('Missing host_permissions: <all_urls> (required for blocking)');
}

// ==========================================
// 7. Summary
// ==========================================
console.log('\n' + '='.repeat(60));

if (errors > 0) {
  console.error(`\n❌ Validation FAILED: ${errors} error(s), ${warnings} warning(s)`);
  console.error('\nThe extension has critical issues that will prevent it from loading.');
  console.error('Fix the errors above before attempting to load the extension.\n');
  process.exit(1);
} else if (warnings > 0) {
  console.warn(`\n⚠️  Validation passed with ${warnings} warning(s)`);
  console.warn('\nThe extension will load, but you should address warnings for production.\n');
  process.exit(0);
} else {
  console.log('\n✅ All validation checks passed!');
  console.log('\nThe extension is ready to be loaded in Chrome.\n');
  process.exit(0);
}
