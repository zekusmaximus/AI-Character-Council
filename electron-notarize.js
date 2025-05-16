// electron-notarize.js
require('dotenv').config();
const { notarize } = require('electron-notarize');
const path = require('path');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;  
  
  // Skip notarization for non-macOS platforms
  if (electronPlatformName !== 'darwin') {
    return;
  }

  // Skip notarization if environment variables are not set
  if (!process.env.APPLE_ID || !process.env.APPLE_ID_PASSWORD || !process.env.APPLE_TEAM_ID) {
    console.log('Skipping macOS notarization. Required environment variables not set.');
    console.log('To enable notarization, set APPLE_ID, APPLE_ID_PASSWORD and APPLE_TEAM_ID environment variables.');
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);

  console.log(`Notarizing ${appPath} with Apple ID ${process.env.APPLE_ID}`);

  try {
    await notarize({
      appBundleId: 'com.yourname.ai-character-council',
      appPath,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID,
    });
    console.log('Notarization completed successfully');
  } catch (error) {
    console.error('Notarization failed:', error);
    throw error;
  }
};