#!/usr/bin/env node

const { execSync } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');

/**
 * Check prerequisites before running tests
 */
class PrerequisitesChecker {
  /**
   * Load Android SDK environment variables from shell profile
   */
  static loadAndroidEnvFromProfile() {
    const homeDir = os.homedir();
    const profiles = [
      path.join(homeDir, '.zshrc'),
      path.join(homeDir, '.bash_profile'),
      path.join(homeDir, '.bashrc'),
    ];

    for (const profilePath of profiles) {
      if (fs.existsSync(profilePath)) {
        try {
          const profileContent = fs.readFileSync(profilePath, 'utf-8');
          
          // Extract ANDROID_HOME
          const androidHomeMatch = profileContent.match(/export\s+ANDROID_HOME=["']?([^"'\s]+)["']?/);
          if (androidHomeMatch && androidHomeMatch[1]) {
            let androidHome = androidHomeMatch[1].replace(/\$HOME/g, homeDir).replace(/^~/, homeDir);
            process.env.ANDROID_HOME = androidHome;
          }
          
          // Extract ANDROID_SDK_ROOT
          const androidSdkRootMatch = profileContent.match(/export\s+ANDROID_SDK_ROOT=["']?([^"'\s]+)["']?/);
          if (androidSdkRootMatch && androidSdkRootMatch[1]) {
            let androidSdkRoot = androidSdkRootMatch[1].replace(/\$HOME/g, homeDir).replace(/^~/, homeDir);
            process.env.ANDROID_SDK_ROOT = androidSdkRoot;
          }
          
          // If ANDROID_HOME is set but ANDROID_SDK_ROOT is not, set it to the same value
          if (process.env.ANDROID_HOME && !process.env.ANDROID_SDK_ROOT) {
            process.env.ANDROID_SDK_ROOT = process.env.ANDROID_HOME;
          }
          
          // Update PATH if ANDROID_HOME is found
          if (process.env.ANDROID_HOME) {
            const platformTools = path.join(process.env.ANDROID_HOME, 'platform-tools');
            const tools = path.join(process.env.ANDROID_HOME, 'tools');
            const toolsBin = path.join(process.env.ANDROID_HOME, 'tools', 'bin');
            
            if (!process.env.PATH.includes(platformTools)) {
              process.env.PATH = `${process.env.PATH}:${platformTools}`;
            }
            if (!process.env.PATH.includes(tools)) {
              process.env.PATH = `${process.env.PATH}:${tools}`;
            }
            if (!process.env.PATH.includes(toolsBin)) {
              process.env.PATH = `${process.env.PATH}:${toolsBin}`;
            }
            
            return true;
          }
        } catch (error) {
          // Continue to next profile if this one fails
          continue;
        }
      }
    }
    
    // If not found in profiles, try common locations
    const commonLocations = [
      path.join(homeDir, 'Library', 'Android', 'sdk'), // macOS
      path.join(homeDir, 'Android', 'Sdk'), // Linux
    ];
    
    for (const location of commonLocations) {
      if (fs.existsSync(location)) {
        process.env.ANDROID_HOME = location;
        process.env.ANDROID_SDK_ROOT = location;
        return true;
      }
    }
    
    return false;
  }
  /**
   * Check if iOS simulator is available/booted
   */
  static checkIOSSimulator() {
    try {
      console.log('Checking iOS Simulator...');
      const output = execSync('xcrun simctl list devices', { encoding: 'utf-8' });
      const lines = output.split('\n');
      
      // Look for iPhone 16 Pro
      let found = false;
      let booted = false;
      
      for (const line of lines) {
        if (line.includes('iPhone 16 Pro')) {
          found = true;
          if (line.includes('Booted')) {
            booted = true;
            console.log('✅ iPhone 16 Pro is booted');
            return true;
          }
        }
      }
      
      if (found && !booted) {
        console.log('⚠️  iPhone 16 Pro found but not booted');
        console.log('   You may need to boot it manually or the test will boot it automatically');
        return true; // Still OK, Appium can boot it
      }
      
      if (!found) {
        console.log('⚠️  iPhone 16 Pro not found in available devices');
        console.log('   Available devices:');
        lines.filter(l => l.includes('iPhone')).forEach(l => console.log(`   ${l.trim()}`));
      }
      
      return found;
    } catch (error) {
      console.error('❌ Error checking iOS Simulator:', error.message);
      return false;
    }
  }

  /**
   * Check if Appium server is running
   */
  static checkAppiumServer() {
    return new Promise((resolve) => {
      console.log('Checking Appium server...');
      const req = http.get('http://127.0.0.1:4723/status', (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const status = JSON.parse(data);
            console.log('✅ Appium server is running');
            console.log(`   Version: ${status.value.build?.version || 'unknown'}`);
            resolve(true);
          } catch (error) {
            console.log('⚠️  Appium server responded but with unexpected format');
            resolve(true); // Server is running
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Appium server is not running');
        console.error('   Please start Appium: appium --address 127.0.0.1 --port 4723');
        resolve(false);
      });

      req.setTimeout(3000, () => {
        req.destroy();
        console.error('❌ Appium server connection timeout');
        resolve(false);
      });
    });
  }

  /**
   * Check Android SDK environment variables
   */
  static checkAndroidSDK() {
    try {
      console.log('Checking Android SDK configuration...');
      const androidHome = process.env.ANDROID_HOME;
      const androidSdkRoot = process.env.ANDROID_SDK_ROOT;
      
      if (androidHome || androidSdkRoot) {
        const sdkPath = androidHome || androidSdkRoot;
        console.log(`✅ Android SDK found: ${sdkPath}`);
        
        // Verify adb is accessible (try from PATH first, then SDK path)
        try {
          // First try if adb is in PATH
          execSync('adb version', { encoding: 'utf-8', stdio: 'ignore' });
          console.log('✅ ADB is accessible from PATH');
          return true;
        } catch (pathError) {
          // If not in PATH, try SDK path directly
          try {
            const sdkBase = androidHome || androidSdkRoot;
            const adbPath = path.join(sdkBase, 'platform-tools', 'adb');
            execSync(`"${adbPath}" version`, { encoding: 'utf-8', stdio: 'ignore' });
            console.log('✅ ADB is accessible from SDK path');
            console.log('⚠️  Consider adding platform-tools to your PATH for easier access');
            return true;
          } catch (sdkError) {
            const sdkBase = androidHome || androidSdkRoot;
            console.log('⚠️  ADB not found in platform-tools');
            console.log('   Make sure Android SDK platform-tools are installed');
            console.log('   Expected location: ' + path.join(sdkBase, 'platform-tools', 'adb'));
            return false;
          }
        }
      } else {
        console.error('❌ Android SDK environment variables not set');
        console.error('   Neither ANDROID_HOME nor ANDROID_SDK_ROOT is exported');
        console.error('   Please set one of these environment variables:');
        console.error('   - ANDROID_HOME (recommended)');
        console.error('   - ANDROID_SDK_ROOT');
        console.error('');
        console.error('   Example for macOS/Linux:');
        console.error('   export ANDROID_HOME=$HOME/Library/Android/sdk');
        console.error('   export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools');
        console.error('');
        console.error('   Example for Windows:');
        console.error('   set ANDROID_HOME=C:\\Users\\YourName\\AppData\\Local\\Android\\Sdk');
        console.error('   set PATH=%PATH%;%ANDROID_HOME%\\platform-tools;%ANDROID_HOME%\\tools');
        console.error('');
        console.error('   See README.md for detailed setup instructions');
        return false;
      }
    } catch (error) {
      console.error('❌ Error checking Android SDK:', error.message);
      return false;
    }
  }

  /**
   * Check if Appium has device-farm plugin (optional)
   */
  static async checkAppiumPlugins() {
    try {
      console.log('Checking Appium plugins...');
      const output = execSync('appium driver list 2>&1', { encoding: 'utf-8' });
      
      if (output.includes('xcuitest') || output.includes('XCUITest')) {
        console.log('✅ XCUITest driver is available');
      } else {
        console.log('⚠️  XCUITest driver not found');
        console.log('   Install with: appium driver install xcuitest');
      }
      
      // Check for device-farm plugin (if using)
      const pluginOutput = execSync('appium plugin list 2>&1', { encoding: 'utf-8' });
      if (pluginOutput.includes('device-farm') || pluginOutput.includes('devicefarm')) {
        console.log('✅ Device-farm plugin is available');
      } else {
        console.log('ℹ️  Device-farm plugin not found (optional for local testing)');
      }
      
      return true;
    } catch (error) {
      console.log('⚠️  Could not check Appium plugins:', error.message);
      return true; // Not critical
    }
  }

  /**
   * Run all checks
   */
  static async runAllChecks() {
    console.log('🔍 Checking prerequisites for test execution...\n');
    
    // Load Android SDK environment variables from shell profile if not already set
    if (!process.env.ANDROID_HOME && !process.env.ANDROID_SDK_ROOT) {
      this.loadAndroidEnvFromProfile();
    }
    
    // Check platform from environment or default
    const platform = (process.env.PLATFORM || 'android').toLowerCase();
    const isAndroid = platform === 'android';
    const isIOS = platform === 'ios';
    
    let androidOk = true;
    let simulatorOk = true;
    
    // Check Android SDK if Android platform is being used
    if (isAndroid) {
      androidOk = this.checkAndroidSDK();
      console.log('');
    }
    
    // Check iOS Simulator if iOS platform is being used
    if (isIOS) {
      simulatorOk = this.checkIOSSimulator();
      console.log('');
    }
    
    const appiumOk = await this.checkAppiumServer();
    console.log('');
    
    await this.checkAppiumPlugins();
    console.log('');
    
    if (isAndroid && !androidOk) {
      console.log('❌ Error: Android SDK is not properly configured');
      console.log('   Please set ANDROID_HOME or ANDROID_SDK_ROOT environment variable');
      console.log('   See README.md for detailed setup instructions');
      process.exit(1);
    }
    
    if (isIOS && !simulatorOk) {
      console.log('⚠️  Warning: iOS Simulator check had issues');
    }
    
    if (!appiumOk) {
      console.log('❌ Error: Appium server is not running');
      console.log('   Please start Appium before running tests');
      process.exit(1);
    }
    
    console.log('✅ Prerequisites check complete');
    return true;
  }
}

// Run checks if called directly
if (require.main === module) {
  PrerequisitesChecker.runAllChecks().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}

module.exports = PrerequisitesChecker;
