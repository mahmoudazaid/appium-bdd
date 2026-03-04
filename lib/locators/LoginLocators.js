const BaseLocators = require('./BaseLocators');

/**
 * Login Page Locators
 */
class LoginLocators extends BaseLocators {
  constructor(platform = null) {
    super(platform);
    
    if (this.platform === 'android') {
      this.usernameField = this.getResourceIdLocator('com.saucelabs.mydemoapp.android:id/nameET');
      this.passwordField = this.getResourceIdLocator('com.saucelabs.mydemoapp.android:id/passwordET');
      this.loginButton = this.getResourceIdLocator('com.saucelabs.mydemoapp.android:id/loginBtn');
    } else {
      this.usernameField = this.getXPathLocator('//XCUIElementTypeTextField');
      this.passwordField = this.getXPathLocator('//XCUIElementTypeSecureTextField');
      this.loginButton = this.getXPathLocator('//XCUIElementTypeButton[@name="Login"]');
    }
  }
}

module.exports = LoginLocators;
