const fs = require('fs');
const path = require('path');
const { log } = require('@nodebug/logger');

/**
 * Screenshot and artifact management utilities
 */
class ScreenshotUtils {
  /**
   * Take a screenshot and save it
   * @param {Object} driver - WebDriver instance
   * @param {string} filename - Filename for the screenshot
   * @returns {Promise<string>} Path to saved screenshot
   */
  static async takeScreenshot(driver, filename = null) {
    try {
      const artifactsDir = path.join(process.cwd(), 'artifacts');
      if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const screenshotName = filename || `screenshot-${timestamp}.png`;
      const screenshotPath = path.join(artifactsDir, screenshotName);

      const screenshot = await driver.takeScreenshot();
      const buffer = Buffer.from(screenshot, 'base64');
      fs.writeFileSync(screenshotPath, buffer);

      log.info(`Screenshot saved: ${screenshotPath}`);
      return screenshotPath;
    } catch (error) {
      log.error(`Failed to take screenshot: ${error.message}`);
      throw error;
    }
  }

  /**
   * Save page source for debugging
   * @param {Object} driver - WebDriver instance
   * @param {string} filename - Filename for the page source
   * @returns {Promise<string>} Path to saved page source
   */
  static async savePageSource(driver, filename = null) {
    try {
      const artifactsDir = path.join(process.cwd(), 'artifacts');
      if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sourceName = filename || `page-source-${timestamp}.xml`;
      const sourcePath = path.join(artifactsDir, sourceName);

      const pageSource = await driver.getPageSource();
      fs.writeFileSync(sourcePath, pageSource);

      log.info(`Page source saved: ${sourcePath}`);
      return sourcePath;
    } catch (error) {
      log.error(`Failed to save page source: ${error.message}`);
      throw error;
    }
  }

  /**
   * Save screenshot and page source on failure
   * @param {Object} driver - WebDriver instance
   * @param {string} scenarioName - Name of the scenario
   * @returns {Promise<Object>} Paths to saved artifacts
   */
  static async saveArtifactsOnFailure(driver, scenarioName) {
    const sanitizedName = scenarioName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    const screenshotFilename = `failure-${sanitizedName}-${timestamp}.png`;
    const pageSourceFilename = `failure-${sanitizedName}-${timestamp}.xml`;

    const artifacts = {};

    try {
      artifacts.screenshot = await this.takeScreenshot(driver, screenshotFilename);
    } catch (error) {
      log.error(`Failed to save screenshot: ${error.message}`);
    }

    try {
      artifacts.pageSource = await this.savePageSource(driver, pageSourceFilename);
    } catch (error) {
      log.error(`Failed to save page source: ${error.message}`);
    }

    return artifacts;
  }
}

module.exports = ScreenshotUtils;
