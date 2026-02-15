const BasePage = require('./BasePage');
const { log } = require('@nodebug/logger');
const MenuLocators = require('../locators/MenuLocators');

class MenuPage extends BasePage {
  constructor(driver) {
    super(driver);
    
    this.locators = new MenuLocators(this.platform);
  }

  async clickLogIn() {
    await this.click(this.locators.logIn);
    log.info('Clicked on Log In');
  }

  async clickLogOut() {
    await this.click(this.locators.logOut);
    log.info('Clicked on Log Out');
  }

  async isLogOutVisible(timeout = 5000) {
    return await this.isDisplayed(this.locators.logOut, timeout);
  }

  async isLogInVisible(timeout = 5000) {
    return await this.isDisplayed(this.locators.logIn, timeout);
  }

  /**
   * Click on menu item by text
   * @param {string} text - Menu item text
   */
  async clickMenuItem(text) {
    const locator = this.locators.getMenuItemLocator(text);
    await this.click(locator);
    log.info(`Clicked on menu item: ${text}`);
  }

  /**
   * Check if menu item is visible
   * @param {string} text - Menu item text
   * @param {number} timeout - Timeout in milliseconds
   */
  async isMenuItemVisible(text, timeout = 5000) {
    const locator = this.locators.getMenuItemVisibleLocator(text);
    return await this.isDisplayed(locator, timeout);
  }
}

module.exports = MenuPage;
