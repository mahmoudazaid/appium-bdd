const { exec } = require('child_process');
const { promisify } = require('util');
const { log } = require('@nodebug/logger');
const PlatformUtils = require('./platform');
const CapabilitiesBuilder = require('../driver/capabilities');

const execAsync = promisify(exec);

class DeviceActions {
  constructor(driver, driverManager) {
    this.driver = driver;
    this.driverManager = driverManager;
    this.platform = driverManager?.getPlatform() || PlatformUtils.detectPlatform();
  }

  async getAppPackageId() {
    try {
      const deviceConfig = CapabilitiesBuilder.getDeviceConfig();
      const capabilities = this.driverManager?.capabilities || {};

      if (this.platform === 'android') {
        const packageId = capabilities['appium:appPackage'] || deviceConfig.appPackage;
        if (packageId) {
          return packageId;
        }

        const appPath = capabilities['appium:app'] || deviceConfig.app;
        if (appPath) {
          const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
          if (androidHome) {
            try {
              const { stdout: aaptPath } = await execAsync(`find "${androidHome}/build-tools" -name aapt 2>/dev/null | head -1`);
              const aapt = aaptPath.trim();
              if (aapt) {
                const { stdout: packageOutput } = await execAsync(`"${aapt}" dump badging "${appPath}" | grep package: | awk '{print $2}' | sed "s/name=//g" | sed "s/'//g"`);
                const extractedPackage = packageOutput.trim();
                if (extractedPackage) {
                  return extractedPackage;
                }
              }
            } catch (error) {
              log.warn(`Could not extract package ID from APK: ${error.message}`);
            }
          }
        }

        log.warn('Could not determine Android package ID. Using common demo app package.');
        return 'com.saucelabs.mydemoapp.rn';
      } else {
        const bundleId = capabilities['appium:bundleId'] || deviceConfig.bundleId;
        if (bundleId) {
          return bundleId;
        }

        log.warn('Could not determine iOS bundle ID. Using common demo app bundle.');
        return 'com.saucelabs.mydemoapp.rn';
      }
    } catch (error) {
      log.error(`Error getting app package ID: ${error.message}`);
      throw error;
    }
  }

  async terminateApp() {
    if (!this.driver) {
      throw new Error('Driver not initialized');
    }

    try {
      const packageId = await this.getAppPackageId();
      log.info(`Terminating app: ${packageId}`);

      if (this.platform === 'android') {
        try {
          await this.driver.terminateApp(packageId);
        } catch (error) {
          await this.driver.execute('mobile: terminateApp', { appId: packageId });
        }
        log.info('App terminated successfully');
      } else {
        try {
          await this.driver.terminateApp(packageId);
        } catch (error) {
          await this.driver.execute('mobile: terminateApp', { bundleId: packageId });
        }
        log.info('App terminated successfully');
      }
    } catch (error) {
      log.error(`Failed to terminate app: ${error.message}`);
      throw error;
    }
  }

  async reopenApp() {
    if (!this.driver) {
      throw new Error('Driver not initialized');
    }

    try {
      const packageId = await this.getAppPackageId();
      log.info(`Re-opening app: ${packageId}`);

      if (this.platform === 'android') {
        try {
          await this.driver.activateApp(packageId);
        } catch (error) {
          await this.driver.execute('mobile: activateApp', { appId: packageId });
        }
        log.info('App re-opened successfully');
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else {
        try {
          await this.driver.activateApp(packageId);
        } catch (error) {
          await this.driver.execute('mobile: launchApp', { bundleId: packageId });
        }
        log.info('App re-opened successfully');
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      log.error(`Failed to re-open app: ${error.message}`);
      throw error;
    }
  }

  async terminateAndReopenApp() {
    await this.terminateApp();
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await this.reopenApp();
  }
}

module.exports = DeviceActions;
