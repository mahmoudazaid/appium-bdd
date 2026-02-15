const BaseLocators = require('./BaseLocators');

/**
 * Menu Locators
 */
class MenuLocators extends BaseLocators {
  constructor(platform = null) {
    super(platform);
    
    this.logIn = this.getClickableTextLocator('Log In');
    this.logOut = this.getClickableTextLocator('Log Out');
    this.catalog = this.getClickableTextLocator('Catalog');
    this.webView = this.getClickableTextLocator('WebView');
    this.qrCodeScanner = this.getClickableTextLocator('QR Code Scanner');
    this.geoLocation = this.getClickableTextLocator('Geo Location');
    this.drawing = this.getClickableTextLocator('Drawing');
    this.about = this.getClickableTextLocator('About');
    this.resetAppState = this.getClickableTextLocator('Reset App State');
    this.fingerPrint = this.getClickableTextLocator('FingerPrint');
    this.virtualUSB = this.getClickableTextLocator('Virtual USB');
    this.crashApp = this.getClickableTextLocator('Crash app (debug)');
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
