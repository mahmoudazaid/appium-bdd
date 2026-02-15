const { log } = require('@nodebug/logger');
const config = require('@nodebug/config')('cucumber');

/**
 * Wait utilities - no hard sleeps, only explicit waits
 */
class WaitUtils {
  /**
   * Convert locator object to webdriver v9 format (strategy, selector)
   * @param {Object|string} locator - Locator object like { id: '...' } or { xpath: '...' }
   * @returns {Array} [strategy, selector] for webdriver v9 API
   */
  static convertLocatorToWebdriverV9(locator) {
    if (Array.isArray(locator) && locator.length === 2) {
      return locator;
    }
    
    if (typeof locator === 'object' && locator !== null) {
      if ('id' in locator) {
        const resourceId = locator.id;
        return {
          primary: ['id', resourceId],
          fallback: ['xpath', `//*[@resource-id="${resourceId}"]`],
        };
      }
      if ('appium:id' in locator) {
        const resourceId = locator['appium:id'];
        return {
          primary: ['id', resourceId],
          fallback: ['xpath', `//*[@resource-id="${resourceId}"]`],
        };
      }
      if ('xpath' in locator) {
        return ['xpath', locator.xpath];
      }
      if ('accessibility id' in locator) {
        return ['accessibility id', locator['accessibility id']];
      }
      if ('using' in locator && 'value' in locator) {
        return [locator.using, locator.value];
      }
      
      const keys = Object.keys(locator);
      if (keys.length > 0) {
        const key = keys[0];
        const value = locator[key];
        if (key === 'id' || key === 'appium:id') {
          return {
            primary: ['id', value],
            fallback: ['xpath', `//*[@resource-id="${value}"]`],
          };
        }
        if (key === 'accessibility id') {
          return ['accessibility id', value];
        }
        if (key === 'xpath') {
          return ['xpath', value];
        }
        return [key, value];
      }
    }
    
    if (typeof locator === 'string') {
      return ['id', locator];
    }
    
    throw new Error(`Unsupported locator format: ${JSON.stringify(locator)}`);
  }

  /**
   * Wait for an element to be present
   * @param {Object} driver - WebDriver instance
   * @param {Object|string} locator - Element locator (object or webdriver v9 format)
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Object>} Element when found
   */
  static async waitForElement(driver, locator, timeout = null) {
    const waitTimeout = timeout || config.timeout * 1000;
    const startTime = Date.now();
    
    const converted = this.convertLocatorToWebdriverV9(locator);
    
    let strategies = [];
    if (Array.isArray(converted)) {
      strategies = [converted];
    } else if (converted.primary) {
      strategies = [converted.primary];
      if (converted.fallback) {
        strategies.push(converted.fallback);
      }
    } else {
      strategies = [converted];
    }

    let iterationCount = 0;
    let triedObjectFormat = false;
    let lastError = null;

    while (Date.now() - startTime < waitTimeout) {
      iterationCount += 1;
      
      for (let strategyIndex = 0; strategyIndex < strategies.length; strategyIndex++) {
        const [strategy, selector] = strategies[strategyIndex];
        
        try {
          let element = null;
          
          try {
            element = await driver.findElement(strategy, selector);
          } catch (twoParamError) {
            if (!triedObjectFormat && iterationCount === 1 && strategyIndex === 0) {
              triedObjectFormat = true;
              try {
                const objectLocator = { [strategy]: selector };
                element = await driver.findElement(objectLocator);
              } catch (objectError) {
                lastError = twoParamError;
                continue;
              }
            } else {
              lastError = twoParamError;
              continue;
            }
          }
          
          if (element) {
            return element;
          }
        } catch (error) {
          lastError = error;
          continue;
        }
      }
      
      await this.sleep(500);
    }

    const strategyList = strategies.map(([s, sel]) => `"${s}": "${sel}"`).join(', ');
    throw new Error(`Element not found within ${waitTimeout}ms. Tried strategies: ${strategyList}. Last error: ${lastError?.message || 'unknown'}`);
  }

  /**
   * Wait for an element to be visible
   * @param {Object} driver - WebDriver instance
   * @param {string} locator - Element locator
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Object>} Element when visible
   */
  static async waitForElementVisible(driver, locator, timeout = null) {
    const waitTimeout = timeout || config.timeout * 1000;
    const startTime = Date.now();
    const converted = this.convertLocatorToWebdriverV9(locator);
    
    let strategies = [];
    if (Array.isArray(converted)) {
      strategies = [converted];
    } else if (converted.primary) {
      strategies = [converted.primary];
      if (converted.fallback) {
        strategies.push(converted.fallback);
      }
    } else {
      strategies = [converted];
    }

    while (Date.now() - startTime < waitTimeout) {
      for (let strategyIndex = 0; strategyIndex < strategies.length; strategyIndex++) {
        const [strategy, selector] = strategies[strategyIndex];
        
        try {
          const element = await driver.findElement(strategy, selector);
          
          if (typeof element.isDisplayed === 'function') {
            const displayed = await element.isDisplayed();
            if (displayed) {
              return element;
            }
          } else {
            return element;
          }
        } catch (error) {
        }
      }
      
      await this.sleep(500);
    }

    const strategyList = strategies.map(([s, sel]) => `"${s}": "${sel}"`).join(', ');
    throw new Error(`Element not visible within ${waitTimeout}ms. Tried strategies: ${strategyList}`);
  }

  /**
   * Wait for an element to be clickable
   * @param {Object} driver - WebDriver instance
   * @param {string} locator - Element locator
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Object>} Element when clickable
   */
  static async waitForElementClickable(driver, locator, timeout = null) {
    const waitTimeout = timeout || config.timeout * 1000;
    const element = await this.waitForElement(driver, locator, waitTimeout);
    return element;
  }

  /**
   * Wait for text to be present in element
   * @param {Object} driver - WebDriver instance
   * @param {string} locator - Element locator
   * @param {string} text - Text to wait for
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Object>} Element when text is present
   */
  static async waitForText(driver, locator, text, timeout = null) {
    const waitTimeout = timeout || config.timeout * 1000;
    const startTime = Date.now();
    const [strategy, selector] = this.convertLocatorToWebdriverV9(locator);

    while (Date.now() - startTime < waitTimeout) {
      try {
        const element = await driver.findElement(strategy, selector);
        const elementText = await element.getText();
        if (elementText && elementText.includes(text)) {
          return element;
        }
      } catch (error) {
      }
      await this.sleep(500);
    }

    throw new Error(`Text "${text}" not found within ${waitTimeout}ms: strategy="${strategy}", selector="${selector}"`);
  }

  /**
   * Wait for element to disappear
   * @param {Object} driver - WebDriver instance
   * @param {string} locator - Element locator
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<void>}
   */
  static async waitForElementNotPresent(driver, locator, timeout = null) {
    const waitTimeout = timeout || config.timeout * 1000;
    const startTime = Date.now();
    const [strategy, selector] = this.convertLocatorToWebdriverV9(locator);

    while (Date.now() - startTime < waitTimeout) {
      try {
        await driver.findElement(strategy, selector);
      } catch (error) {
        return;
      }
      await this.sleep(500);
    }

    throw new Error(`Element still present after ${waitTimeout}ms: strategy="${strategy}", selector="${selector}"`);
  }

  /**
   * Sleep utility
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  static sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = WaitUtils;
