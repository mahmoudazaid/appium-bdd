const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { log } = require('@nodebug/logger');
const LoginPage = require('../pages/LoginPage');
const ProductsPage = require('../pages/ProductsPage');

When('I click on the burger menu', async function () {
  if (!this.productsPage) {
    this.productsPage = new ProductsPage(this.driver);
  }
  await this.productsPage.waitForPageLoad();
  log.info('Products page loaded, clicking burger menu');
  await this.productsPage.clickBurgerMenu();
});

When('I enter username {string}', async function (username) {
  if (!this.loginPage) {
    this.loginPage = new LoginPage(this.driver);
  }
  await this.loginPage.waitForPageLoad();
  await this.loginPage.enterUsername(username);
});

When('I enter password {string}', async function (password) {
  if (!this.loginPage) {
    this.loginPage = new LoginPage(this.driver);
  }
  await this.loginPage.enterPassword(password);
});

When('I click the login button', async function () {
  if (!this.loginPage) {
    this.loginPage = new LoginPage(this.driver);
  }
  await this.loginPage.clickLogin();
});

Then('I should remain on the login page', async function () {
  if (!this.loginPage) {
    this.loginPage = new LoginPage(this.driver);
  }
  const usernameFieldVisible = await this.loginPage.isDisplayed(this.loginPage.locators.usernameField);
  expect(usernameFieldVisible).to.be.true;
  log.info('Remained on login page');
});