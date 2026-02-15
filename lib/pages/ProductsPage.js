const BasePage = require('./BasePage');
const { log } = require('@nodebug/logger');
const WaitUtils = require('../utils/wait');
const MenuPage = require('./MenuPage');
const ProductsLocators = require('../locators/ProductsLocators');

class ProductsPage extends BasePage {
  constructor(driver) {
    super(driver);
    
    this.locators = new ProductsLocators(this.platform);
    this.menu = new MenuPage(driver);
  }

  async waitForPageLoad() {
    try {
      await this.findElementVisible(this.locators.cartIcon, 10000);
      log.info('Products page loaded - cart icon visible');
    } catch (error) {
      log.warn(`Products page load verification failed: ${error.message}, trying alternative check...`);
      try {
        await this.findElementVisible(this.locators.burgerMenu, 5000);
        log.info('Products page loaded - burger menu visible');
      } catch (error2) {
        log.warn('Products page load verification failed with both checks, continuing anyway...');
      }
    }
  }

  async clickBurgerMenu() {
    await this.click(this.locators.burgerMenu);
    log.info('Clicked on burger menu');
  }
}

module.exports = ProductsPage;
