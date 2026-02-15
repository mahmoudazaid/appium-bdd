const WebDriver = require('webdriver');
const { log } = require('@nodebug/logger');
const CapabilitiesBuilder = require('./capabilities');
const PlatformUtils = require('../utils/platform');

/**
 * Driver Manager for Appium 3.x
 * Handles driver initialization, session management, and cleanup
 */
class DriverManager {
  constructor() {
    this.driver = null;
    this.capabilities = null;
    this.platform = null;
    this.hasActiveSession = false;
  }

  /**
   * Initialize the driver with Appium 3.x
   * @param {Object} options - Driver options
   * @returns {Promise<Object>} WebDriver instance
   */
  async initiate(options = {}) {
    try {
      const appiumConfig = this.getAppiumConfig();
      
      const deviceConfig = CapabilitiesBuilder.getDeviceConfig();
      this.platform = options.platform 
        || process.env.PLATFORM 
        || deviceConfig.platform?.toLowerCase() 
        || PlatformUtils.detectPlatform();
      
      const capabilityConfig = {
        ...appiumConfig,
        ...options,
      };
      this.capabilities = CapabilitiesBuilder.buildCapabilities(this.platform, capabilityConfig);

      const connectionOptions = {
        hostname: appiumConfig.hostname || '127.0.0.1',
        port: appiumConfig.port || 4723,
        path: '/',
        capabilities: this.capabilities,
      };

      log.info(`Initializing ${this.platform} driver...`);
      log.info(`Connecting to Appium server at ${connectionOptions.hostname}:${connectionOptions.port}`);

      this.driver = await WebDriver.newSession(connectionOptions);
      this.hasActiveSession = true;

      log.info('Driver initialized successfully');
      
      try {
        if (typeof this.driver.getSessionId === 'function') {
          const sessionId = await this.driver.getSessionId();
          log.info(`Session ID: ${sessionId}`);
        } else if (this.driver.sessionId) {
          log.info(`Session ID: ${this.driver.sessionId}`);
        }
      } catch (sessionError) {
        log.debug('Could not retrieve session ID (non-critical)');
      }

      return this.driver;
    } catch (error) {
      log.error(`Failed to initialize driver: ${error.message}`);
      this.hasActiveSession = false;
      throw error;
    }
  }

  /**
   * Get Appium configuration from config file or environment
   * @returns {Object} Appium configuration
   */
  getAppiumConfig() {
    try {
      const appiumConfig = require('@nodebug/config')('appium');
      return appiumConfig || {};
    } catch (error) {
      log.warn('Appium config not found, using defaults');
      return {};
    }
  }

  /**
   * Get the current driver instance
   * @returns {Object} WebDriver instance
   */
  getDriver() {
    if (!this.driver || !this.hasActiveSession) {
      throw new Error('Driver not initialized. Call initiate() first.');
    }
    return this.driver;
  }

  /**
   * Get page source
   * @returns {Promise<string>} Page source XML
   */
  async source() {
    if (!this.driver || !this.hasActiveSession) {
      throw new Error('Driver not initialized');
    }
    return await this.driver.getPageSource();
  }

  /**
   * Take a screenshot
   * @returns {Promise<string>} Base64 encoded screenshot
   */
  async takeScreenshot() {
    if (!this.driver || !this.hasActiveSession) {
      throw new Error('Driver not initialized');
    }
    return await this.driver.takeScreenshot();
  }

  /**
   * Get current platform
   * @returns {string} 'android' or 'ios'
   */
  getPlatform() {
    return this.platform;
  }

  /**
   * Check if driver has active session
   * @returns {boolean}
   */
  isActive() {
    return this.hasActiveSession && this.driver !== null;
  }

  /**
   * Close the driver session
   * @returns {Promise<void>}
   */
  async exit() {
    if (this.driver && this.hasActiveSession) {
      try {
        log.info('Closing driver session...');
        await this.driver.deleteSession();
        this.hasActiveSession = false;
        this.driver = null;
        log.info('Driver session closed');
      } catch (error) {
        log.error(`Error closing driver session: ${error.message}`);
        this.hasActiveSession = false;
        this.driver = null;
      }
    }
  }

  /**
   * Reset the app (close and reopen)
   * @returns {Promise<void>}
   */
  async resetApp() {
    if (!this.driver || !this.hasActiveSession) {
      throw new Error('Driver not initialized');
    }
    try {
      await this.driver.reset();
      log.info('App reset successfully');
    } catch (error) {
      log.warn(`App reset failed: ${error.message}`);
    }
  }

  /**
   * Put app in background
   * @param {number} seconds - Seconds to keep app in background
   * @returns {Promise<void>}
   */
  async backgroundApp(seconds = 3) {
    if (!this.driver || !this.hasActiveSession) {
      throw new Error('Driver not initialized');
    }
    try {
      await this.driver.background(seconds);
      log.info(`App put in background for ${seconds} seconds`);
    } catch (error) {
      log.warn(`Background app failed: ${error.message}`);
    }
  }

  /**
   * Get window size
   * @returns {Promise<Object>} Window size {width, height}
   */
  async getWindowSize() {
    if (!this.driver || !this.hasActiveSession) {
      throw new Error('Driver not initialized');
    }
    return this.driver.getWindowSize();
  }

  /**
   * Set orientation
   * @param {string} orientation - 'PORTRAIT' or 'LANDSCAPE'
   * @returns {Promise<void>}
   */
  async setOrientation(orientation) {
    if (!this.driver || !this.hasActiveSession) {
      throw new Error('Driver not initialized');
    }
    try {
      await this.driver.setOrientation(orientation.toUpperCase());
      log.info(`Orientation set to ${orientation}`);
    } catch (error) {
      log.warn(`Set orientation failed: ${error.message}`);
    }
  }
}

module.exports = DriverManager;
