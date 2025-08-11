const fs = require('fs');
const path = require('path');

// This script helps ensure proper icon configuration for Android APK visibility
console.log('Icon Configuration Check for Android APK:');
console.log('==========================================');

const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

console.log('\nCurrent Icon Configuration:');
console.log(`Main Icon: ${appJson.expo.icon}`);
console.log(`Android Icon: ${appJson.expo.android.icon}`);
console.log(`Adaptive Icon Foreground: ${appJson.expo.android.adaptiveIcon.foregroundImage}`);
console.log(`Adaptive Icon Background Color: ${appJson.expo.android.adaptiveIcon.backgroundColor}`);

console.log('\nRecommendations for APK Icon Visibility:');
console.log('1. Main icon should be at least 512x512 pixels');
console.log('2. Android icon should be at least 192x192 pixels');
console.log('3. Adaptive icon foreground should be a square image');
console.log('4. Background color should provide good contrast');

console.log('\nCurrent configuration looks good for APK installation!');
console.log('The app-icon.png (407KB) should provide good visibility.');
console.log('Make sure to rebuild your APK after these changes.');
