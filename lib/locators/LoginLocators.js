const BaseLocators = require('./BaseLocators');

/**
 * Login Page Locators
 */
class LoginLocators extends BaseLocators {
  constructor(platform = null) {
    super(platform);
    
    this.usernameField = this.getResourceIdLocator('com.saucelabs.mydemoapp.android:id/nameET');
    this.passwordField = this.getResourceIdLocator('com.saucelabs.mydemoapp.android:id/passwordET');
    this.loginButton = this.getResourceIdLocator('com.saucelabs.mydemoapp.android:id/loginBtn');
  }
}

module.exports = LoginLocators;
