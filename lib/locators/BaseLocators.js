const PlatformUtils = require('../utils/platform');

/**
 * Base Locators class
 */
class BaseLocators {
  constructor(platform = null) {
    this.platform = platform || PlatformUtils.detectPlatform();
  }

  /**
   * Get text-based locator
   * @param {string} text - Text to find
   * @param {Object} options - Options for locator generation
   * @param {boolean} options.includeContentDesc - Include content-desc attribute
   * @param {boolean} options.includeContains - Include contains() for partial matches
   * @returns {Object} Locator object
   */
  getTextLocator(text, options = {}) {
    if (this.platform === 'android') {
      let xpath = `//android.widget.TextView[@text="${text}"] | //android.widget.Button[@text="${text}"]`;
      
      if (options.includeContentDesc !== false) {
        xpath += ` | //*[@content-desc="${text}"]`;
      }
      
      if (options.includeContains === true) {
        xpath += ` | //*[contains(@text,"${text}")]`;
      }
      
      return { xpath };
    } else {
      return {
        xpath: `//XCUIElementTypeStaticText[@name="${text}"] | //XCUIElementTypeButton[@name="${text}"]`
      };
    }
  }

  /**
   * Get text locator for clicking
   * @param {string} text - Text to find
   * @returns {Object} Locator object
   */
  getClickableTextLocator(text) {
    return this.getTextLocator(text, {
      includeContentDesc: true,
      includeContains: false,
    });
  }

  /**
   * Get text locator for visibility check
   * @param {string} text - Text to find
   * @returns {Object} Locator object
   */
  getVisibleTextLocator(text) {
    return this.getTextLocator(text, {
      includeContentDesc: true,
      includeContains: true,
    });
  }

  /**
   * Get resource ID locator
   * @param {string} resourceId - Resource ID
   * @returns {Object} Locator object
   */
  getResourceIdLocator(resourceId) {
    return { id: resourceId };
  }

  /**
   * Get XPath locator
   * @param {string} xpath - XPath expression
   * @returns {Object} Locator object
   */
  getXPathLocator(xpath) {
    return { xpath };
  }
}

module.exports = BaseLocators;
