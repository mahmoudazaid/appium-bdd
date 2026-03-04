const BaseLocators = require('./BaseLocators');

/**
 * Products Page Locators
 */
class ProductsLocators extends BaseLocators {
  constructor(platform = null) {
    super(platform);
    
    this.cartIcon = this.getResourceIdLocator('test-Cart');
    
    if (this.platform === 'android') {
      this.burgerMenu = this.getXPathLocator('//android.widget.ImageView[@content-desc="View menu"]');
    } else {
      this.burgerMenu = this.getXPathLocator('//XCUIElementTypeButton[@name="More-tab-item"]');
    }
  }
}

module.exports = ProductsLocators;
