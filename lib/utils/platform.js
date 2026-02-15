const { log } = require('@nodebug/logger');

/**
 * Platform detection and utility functions
 */
class PlatformUtils {
  /**
   * Detect the current platform from environment or capabilities
   * @param {Object} capabilities - Appium capabilities
   * @returns {string} 'android' or 'ios'
   */
  static detectPlatform(capabilities = {}) {
    const envPlatform = process.env.PLATFORM?.toLowerCase();
    if (envPlatform === 'android' || envPlatform === 'ios') {
      return envPlatform;
    }

    if (capabilities.platformName) {
      return capabilities.platformName.toLowerCase();
    }

    log.warn('Platform not specified, defaulting to android');
    return 'android';
  }

  /**
   * Check if current platform is Android
   * @param {Object} capabilities - Appium capabilities
   * @returns {boolean}
   */
  static isAndroid(capabilities = {}) {
    return this.detectPlatform(capabilities) === 'android';
  }

  /**
   * Check if current platform is iOS
   * @param {Object} capabilities - Appium capabilities
   * @returns {boolean}
   */
  static isIOS(capabilities = {}) {
    return this.detectPlatform(capabilities) === 'ios';
  }

  /**
   * Get platform-specific locator strategy
   * @param {string} platform - 'android' or 'ios'
   * @returns {string} Locator strategy name
   */
  static getLocatorStrategy(platform) {
    return platform === 'android' ? 'id' : 'accessibility id';
  }

  /**
   * Get platform-specific resource ID attribute
   * @param {string} platform - 'android' or 'ios'
   * @returns {string} Attribute name
   */
  static getResourceIdAttribute(platform) {
    return platform === 'android' ? 'resource-id' : 'name';
  }
}

module.exports = PlatformUtils;
