const { log } = require('@nodebug/logger');
const PlatformUtils = require('./platform');

/**
 * Gesture utilities for mobile interactions
 */
class GestureUtils {
  /**
   * Scroll to element
   * @param {Object} driver - WebDriver instance
   * @param {string} locator - Element locator
   * @param {string} direction - 'up', 'down', 'left', 'right'
   * @param {number} maxSwipes - Maximum number of swipes
   * @returns {Promise<Object>} Element when found
   */
  static async scrollToElement(driver, locator, direction = 'down', maxSwipes = 10) {
    const platform = PlatformUtils.detectPlatform();
    const WaitUtils = require('./wait');
    let swipes = 0;

    while (swipes < maxSwipes) {
      try {
        const [strategy, selector] = WaitUtils.convertLocatorToWebdriverV9(locator);
        const element = await driver.findElement(strategy, selector);
        if (element) {
          const displayed = await element.isDisplayed();
          if (displayed) {
            return element;
          }
        }
      } catch (error) {
      }

      await this.swipe(driver, direction);
      swipes += 1;
    }

    throw new Error(`Element not found after ${maxSwipes} swipes: ${JSON.stringify(locator)}`);
  }

  /**
   * Swipe in a direction
   * @param {Object} driver - WebDriver instance
   * @param {string} direction - 'up', 'down', 'left', 'right'
   * @param {number} distance - Swipe distance (percentage of screen)
   * @returns {Promise<void>}
   */
  static async swipe(driver, direction = 'down', distance = 0.5) {
    try {
      const size = await driver.getWindowSize();
      const { width, height } = size;

      let startX, startY, endX, endY;

      switch (direction.toLowerCase()) {
        case 'up':
          startX = width / 2;
          startY = height * 0.8;
          endX = width / 2;
          endY = height * (0.8 - distance);
          break;
        case 'down':
          startX = width / 2;
          startY = height * 0.2;
          endX = width / 2;
          endY = height * (0.2 + distance);
          break;
        case 'left':
          startX = width * 0.8;
          startY = height / 2;
          endX = width * (0.8 - distance);
          endY = height / 2;
          break;
        case 'right':
          startX = width * 0.2;
          startY = height / 2;
          endX = width * (0.2 + distance);
          endY = height / 2;
          break;
        default:
          throw new Error(`Invalid swipe direction: ${direction}`);
      }

      const platform = PlatformUtils.detectPlatform();
      if (platform === 'android') {
        await driver.execute('mobile: swipe', {
          startX,
          startY,
          endX,
          endY,
          duration: 300,
        });
      } else {
        await driver.execute('mobile: swipe', {
          direction: direction.toLowerCase(),
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      log.warn(`Swipe action failed, trying alternative method: ${error.message}`);
      await this.swipeWithScript(driver, direction, distance);
    }
  }

  /**
   * Swipe using JavaScript execution (fallback)
   * @param {Object} driver - WebDriver instance
   * @param {string} direction - 'up', 'down', 'left', 'right'
   * @param {number} distance - Swipe distance
   * @returns {Promise<void>}
   */
  static async swipeWithScript(driver, direction, distance) {
    const platform = PlatformUtils.detectPlatform();
    const size = await driver.getWindowSize();
    const { width, height } = size;

    let startX, startY, endX, endY;

    switch (direction.toLowerCase()) {
      case 'up':
        startX = width / 2;
        startY = height * 0.8;
        endX = width / 2;
        endY = height * (0.8 - distance);
        break;
      case 'down':
        startX = width / 2;
        startY = height * 0.2;
        endX = width / 2;
        endY = height * (0.2 + distance);
        break;
      case 'left':
        startX = width * 0.8;
        startY = height / 2;
        endX = width * (0.8 - distance);
        endY = height / 2;
        break;
      case 'right':
        startX = width * 0.2;
        startY = height / 2;
        endX = width * (0.2 + distance);
        endY = height / 2;
        break;
      default:
        throw new Error(`Invalid swipe direction: ${direction}`);
    }

    if (platform === 'android') {
      await driver.execute('mobile: swipe', {
        startX,
        startY,
        endX,
        endY,
        duration: 300,
      });
    } else {
      await driver.execute('mobile: swipe', {
        direction,
        element: null,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  /**
   * Tap on coordinates
   * @param {Object} driver - WebDriver instance
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {Promise<void>}
   */
  static async tap(driver, x, y) {
    if (typeof driver.performActions === 'function') {
      try {
        await driver.performActions([
          {
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
              { type: 'pointerMove', x, y, duration: 0 },
              { type: 'pointerDown', button: 0 },
              { type: 'pointerUp', button: 0 },
            ],
          },
        ]);
        return;
      } catch (error) {
        log.warn(`performActions failed: ${error.message}`);
      }
    }
    
    if (typeof driver.execute === 'function') {
      try {
        await driver.execute('mobile: tap', { x, y });
        return;
      } catch (error) {
        log.warn(`execute mobile: tap failed: ${error.message}`);
      }
    }
    
    try {
      await driver.touchPerform([
        { action: 'tap', x, y },
      ]);
    } catch (fallbackError) {
      log.error(`All tap methods failed: ${fallbackError.message}`);
      throw new Error(`All tap methods failed. Last error: ${fallbackError.message}`);
    }
  }

  /**
   * Long press on element
   * @param {Object} driver - WebDriver instance
   * @param {Object} element - Element to long press
   * @param {number} duration - Duration in milliseconds
   * @returns {Promise<void>}
   */
  static async longPress(driver, element, duration = 1000) {
    try {
      const location = await element.getLocation();
      const size = await element.getSize();
      const x = location.x + size.width / 2;
      const y = location.y + size.height / 2;

      await driver.execute('mobile: longClick', {
        x,
        y,
        duration,
      });
    } catch (error) {
      log.warn(`Long press failed: ${error.message}`);
      try {
        const location = await element.getLocation();
        const size = await element.getSize();
        const x = location.x + size.width / 2;
        const y = location.y + size.height / 2;
        await driver.touchPerform([
          { action: 'press', x, y },
          { action: 'wait', ms: duration },
          { action: 'release' },
        ]);
      } catch (fallbackError) {
        log.error(`All long press methods failed: ${fallbackError.message}`);
      }
    }
  }
}

module.exports = GestureUtils;
