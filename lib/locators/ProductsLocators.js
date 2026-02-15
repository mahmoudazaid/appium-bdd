const BaseLocators = require('./BaseLocators');

/**
 * Products Page Locators
 */
class ProductsLocators extends BaseLocators {
  constructor(platform = null) {
    super(platform);
    
    this.cartIcon = this.getResourceIdLocator('test-Cart');
    this.burgerMenu = this.getXPathLocator('//android.widget.ImageView[@content-desc="View menu"]');
  }
}

module.exports = ProductsLocators;
