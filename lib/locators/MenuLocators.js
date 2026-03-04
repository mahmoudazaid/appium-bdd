const BaseLocators = require('./BaseLocators');

/**
 * Menu Locators
 */
class MenuLocators extends BaseLocators {
  constructor(platform = null) {
    super(platform);
    
    if (this.platform === 'android') {
      this.logIn = this.getClickableTextLocator('Log In');
      this.logOut = this.getClickableTextLocator('Log Out');
    } else {
      // iOS: use menu-specific accessibility identifiers
      this.logIn = this.getXPathLocator('//*[@name="Login Button"]');
      this.logOut = this.getXPathLocator('//XCUIElementTypeButton[@name="LogOut-menu-item"]');
    }
  }

  /**
   * Get locator for any menu item by text
   * @param {string} text - Menu item text
   * @returns {Object} Locator object
   */
  getMenuItemLocator(text) {
    return this.getClickableTextLocator(text);
  }

  /**
   * Get locator for menu item visibility check
   * @param {string} text - Menu item text
   * @returns {Object} Locator object
   */
  getMenuItemVisibleLocator(text) {
    return this.getVisibleTextLocator(text);
  }
}

module.exports = MenuLocators;
