const path = require('path');
const { log } = require('@nodebug/logger');
const PlatformUtils = require('../utils/platform');

/**
 * Capability builders for Android and iOS
 */
class CapabilitiesBuilder {
  /**
   * Get device configuration from device.json
   * @returns {Object} Device configuration
   */
  static getDeviceConfig() {
    try {
      const deviceConfig = require('@nodebug/config')('device');
      if (!deviceConfig) {
        log.warn('Device config not found, using defaults');
        return {};
      }
      return deviceConfig;
    } catch (error) {
      log.warn(`Failed to load device config: ${error.message}, using defaults`);
      return {};
    }
  }
  /**
   * Build Android capabilities
   * @param {Object} config - Configuration object
   * @returns {Object} Android capabilities
   */
  static buildAndroidCapabilities(config = {}) {

    const capabilities = {
      platformName: 'Android',
      'appium:automationName': config.automationName,
      'appium:app': config.app,
      'appium:autoGrantPermissions': true,
      'appium:newCommandTimeout': config.commandTimeout,
    };

    if (config.platformVersion) {
      capabilities['appium:platformVersion'] = config.platformVersion;
    }
    
    log.info('Android capabilities built:', JSON.stringify(capabilities, null, 2));
    return capabilities;
  }

  /**
   * Build iOS capabilities
   * @param {Object} config - Configuration object
   * @returns {Object} iOS capabilities
   */
  static buildIOSCapabilities(config = {}) {
    let appPath = config.app || config.appPath;
    if (!appPath) {
      const appDir = path.join(process.cwd(), 'apps', 'ios', 'SauceLabs-Demo-App.app');
      const ipaPath = path.join(process.cwd(), 'apps', 'ios', 'SauceLabs-Demo-App.ipa');
      
      if (require('fs').existsSync(appDir)) {
        appPath = appDir;
      } else if (require('fs').existsSync(ipaPath)) {
        appPath = ipaPath;
      } else {
        log.warn('iOS app not found in default locations. Please specify app path in device.json');
      }
    }

    const capabilities = {
      platformName: 'iOS',
      'appium:platformVersion': config.platformVersion || '15.0',
      'appium:deviceName': config.deviceName || 'iPhone Simulator',
      'appium:automationName': config.automationName || 'XCUITest',
      'appium:noReset': config.noReset !== false, // Default to true
      'appium:fullReset': config.fullReset === true,
      'appium:newCommandTimeout': config.commandTimeout || 300,
    };

    if (appPath) {
      capabilities['appium:app'] = appPath;
    }

    if (config.udid) {
      capabilities['appium:udid'] = config.udid;
    }

    if (config.bundleId) {
      capabilities['appium:bundleId'] = config.bundleId;
    }

    log.info('iOS capabilities built:', JSON.stringify(capabilities, null, 2));
    return capabilities;
  }

  /**
   * Build capabilities based on platform
   * @param {string} platform - 'android' or 'ios' (optional, can be from device.json)
   * @param {Object} config - Configuration object (can override device config)
   * @returns {Object} Platform-specific capabilities
   */
  static buildCapabilities(platform = null, config = {}) {
    const deviceConfig = this.getDeviceConfig();
    
    const determinedPlatform = platform?.toLowerCase() 
      || deviceConfig.platform?.toLowerCase() 
      || PlatformUtils.detectPlatform();
    
    const mergedConfig = {
      ...deviceConfig,
      ...config,
    };
    
    const normalizedPlatform = determinedPlatform.toLowerCase();
    
    if (normalizedPlatform === 'android') {
      return this.buildAndroidCapabilities(mergedConfig);
    } else if (normalizedPlatform === 'ios') {
      return this.buildIOSCapabilities(mergedConfig);
    } else {
      throw new Error(`Unsupported platform: ${determinedPlatform}`);
    }
  }
}

module.exports = CapabilitiesBuilder;
