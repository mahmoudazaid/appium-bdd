const BasePage = require('./BasePage');
const { log } = require('@nodebug/logger');
const LoginLocators = require('../locators/LoginLocators');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    
    this.locators = new LoginLocators(this.platform);
  }

  async waitForPageLoad() {
    await this.findElementVisible(this.locators.usernameField, 10000);
    log.info('Login page loaded - username field visible');
  }

  async enterUsername(username) {
    await this.waitForPageLoad();
    await this.sendKeys(this.locators.usernameField, username);
  }

  async enterPassword(password) {
    await this.sendKeys(this.locators.passwordField, password);
  }

  async clickLogin() {
    await this.hideKeyboard();
    await this.findElementVisible(this.locators.loginButton, 10000);
    await this.click(this.locators.loginButton);
  }
}

module.exports = LoginPage;
