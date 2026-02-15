const { log } = require('@nodebug/logger');
const WaitUtils = require('../utils/wait');
const PlatformUtils = require('../utils/platform');

/**
 * Base Page class with common functionality
 * All page objects should extend this class
 */
class BasePage {
  constructor(driver) {
    this.driver = driver;
    this.platform = PlatformUtils.detectPlatform();
  }

  /**
   * Find element with wait
   * @param {Object} locator - Element locator
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Object>} Element
   */
  async findElement(locator, timeout = null) {
    return WaitUtils.waitForElement(this.driver, locator, timeout);
  }

  /**
   * Find element and wait for it to be visible
   * @param {Object|Array} locator - Element locator or array of locators to try
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Object>} Element
   */
  async findElementVisible(locator, timeout = null) {
    if (Array.isArray(locator)) {
      let lastError;
      for (const loc of locator) {
        try {
          return await WaitUtils.waitForElementVisible(this.driver, loc, timeout);
        } catch (error) {
          lastError = error;
          continue;
        }
      }
      throw new Error(`Failed to find element visible with all locator strategies: ${lastError?.message || 'unknown error'}`);
    }
    
    return WaitUtils.waitForElementVisible(this.driver, locator, timeout);
  }

  /**
   * Find element and wait for it to be clickable
   * @param {Object} locator - Element locator
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Object>} Element
   */
  async findElementClickable(locator, timeout = null) {
    return WaitUtils.waitForElementClickable(this.driver, locator, timeout);
  }

  /**
   * Click on element
   * @param {Object|Array} locator - Element locator or array of locators to try
   * @returns {Promise<void>}
   */
  async click(locator) {
    // Handle array of locators - try each until one succeeds
    if (Array.isArray(locator)) {
      let lastError;
      for (const loc of locator) {
        try {
          await this.click(loc);
          return;
        } catch (error) {
          lastError = error;
          continue;
        }
      }
      throw new Error(`Failed to click element with all locator strategies: ${lastError?.message || 'unknown error'}`);
    }
    let retries = 3;
    while (retries > 0) {
      try {
        const element = await this.findElementClickable(locator);

        if (typeof element.click === 'function') {
          await element.click();
          log.info(`Clicked element: ${JSON.stringify(locator)}`);
          return;
        }
        
        await this.driver.performActions([
          {
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
              { type: 'pointerMove', duration: 0, origin: element },
              { type: 'pointerDown', button: 0 },
              { type: 'pause', duration: 10 },
              { type: 'pointerUp', button: 0 },
            ],
          },
        ]);
        log.info(`Clicked element via performActions: ${JSON.stringify(locator)}`);
        return;
      } catch (error) {
        retries--;
        if (retries === 0 || !error.message.includes('stale') && !error.message.includes('no such element')) {
          throw error;
        }
        await WaitUtils.sleep(300);
      }
    }
  }

  /**
   * Send keys to element
   * @param {Object} locator - Element locator
   * @param {string} text - Text to send
   * @returns {Promise<void>}
   */
  async sendKeys(locator, text) {
    if (Array.isArray(locator)) {
      let lastError;
      for (const loc of locator) {
        try {
          await this.sendKeys(loc, text);
          return;
        } catch (error) {
          lastError = error;
          continue;
        }
      }
      throw new Error(`Failed to send keys with all locator strategies: ${lastError?.message || 'unknown error'}`);
    }
    
    const element = await this.findElementVisible(locator);
    
    if (typeof element.clear === 'function' && typeof element.sendKeys === 'function') {
      await element.clear();
      await element.sendKeys(text);
      log.info(`Sent keys to element: ${JSON.stringify(locator)}`);
      return;
    }
    
    try {
      if (typeof element.click === 'function') {
        await element.click();
      } else {
        await this.driver.performActions([
          {
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
              { type: 'pointerMove', duration: 0, origin: element },
              { type: 'pointerDown', button: 0 },
              { type: 'pause', duration: 10 },
              { type: 'pointerUp', button: 0 },
            ],
          },
        ]);
      }
      
      const keyActions = [];
      for (const char of text) {
        keyActions.push({ type: 'keyDown', value: char });
        keyActions.push({ type: 'keyUp', value: char });
      }
      
      await this.driver.performActions([
        {
          type: 'key',
          id: 'keyboard1',
          actions: keyActions,
        },
      ]);
      
      log.info(`Sent keys via performActions to element: ${JSON.stringify(locator)}`);
      return;
    } catch (performActionsError) {
      if (typeof this.driver.execute === 'function') {
        try {
          await this.driver.execute('mobile: typeText', { text });
          log.info(`Sent keys via mobile:typeText to element: ${JSON.stringify(locator)}`);
          return;
        } catch (executeError) {
          throw new Error(`Failed to send keys to element: ${performActionsError.message}, ${executeError.message}`);
        }
      }
      
      throw new Error(`Failed to send keys to element: ${performActionsError.message}`);
    }
  }

  /**
   * Get text from element
   * @param {Object} locator - Element locator
   * @returns {Promise<string>} Element text
   */
  async getText(locator) {
    const element = await this.findElementVisible(locator);
    const text = await element.getText();
    log.info(`Got text from element: ${text}`);
    return text;
  }

  /**
   * Check if element is displayed
   * @param {Object} locator - Element locator
   * @param {number} timeout - Timeout in milliseconds (default: 2000)
   * @returns {Promise<boolean>}
   */
  async isDisplayed(locator, timeout = 2000) {
    try {
      const element = await this.findElement(locator, timeout);
      if (!element) {
        return false;
      }

      if (typeof this.driver.isElementDisplayed === 'function') {
        try {
          const elementId = element.ELEMENT;
          if (elementId && typeof elementId === 'string') {
            const displayed = await this.driver.isElementDisplayed(elementId);
            return displayed === true;
          }
        } catch (driverError) {
          log.debug(`driver.isElementDisplayed() failed: ${driverError.message}`);
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for text to appear in element
   * @param {Object} locator - Element locator
   * @param {string} text - Text to wait for
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Object>} Element
   */
  async waitForText(locator, text, timeout = null) {
    return WaitUtils.waitForText(this.driver, locator, text, timeout);
  }

  /**
   * Wait for element to disappear
   * @param {Object} locator - Element locator
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<void>}
   */
  async waitForElementNotPresent(locator, timeout = null) {
    return WaitUtils.waitForElementNotPresent(this.driver, locator, timeout);
  }

  /**
   * Get Android locator
   * @param {string} androidId - Android resource ID
   * @returns {Object} Locator object
   */
  getLocator(androidId) {
    return { id: androidId };
  }

  /**
   * Get XPath locator
   * @param {string} xpath - XPath expression
   * @returns {Object} Locator object
   */
  getXPathLocator(xpath) {
    return { xpath };
  }

  /**
   * Hide keyboard
   * @returns {Promise<void>}
   */
  async hideKeyboard() {
    try {
      if (typeof this.driver.hideKeyboard === 'function') {
        await this.driver.hideKeyboard();
        log.info('Keyboard hidden');
        return;
      }
    } catch (error) {
      log.warn(`hideKeyboard() failed: ${error.message}`);
    }

    try {
      if (typeof this.driver.execute === 'function') {
        await this.driver.execute('mobile: hideKeyboard', {});
        log.info('Keyboard hidden via mobile command');
        return;
      }
    } catch (error) {
      log.warn(`mobile: hideKeyboard failed: ${error.message}`);
    }

    try {
      await this.driver.pressKeyCode(4);
      log.info('Keyboard hidden via back button');
    } catch (error) {
      log.warn(`Failed to hide keyboard: ${error.message}`);
    }
  }

  /**
   * Take screenshot
   * @param {string} filename - Optional filename
   * @returns {Promise<string>} Screenshot path
   */
  async takeScreenshot(filename = null) {
    const ScreenshotUtils = require('../utils/screenshot');
    return ScreenshotUtils.takeScreenshot(this.driver, filename);
  }
}

module.exports = BasePage;
