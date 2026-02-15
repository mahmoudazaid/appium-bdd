const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { log } = require('@nodebug/logger');
const BasePage = require('../pages/BasePage');
const BaseLocators = require('../locators/BaseLocators');
const DeviceActions = require('../utils/deviceActions');
const ProductsPage = require('../pages/ProductsPage');

Given('the app is opened', async function () {
  if (!this.driverManager?.isActive()) {
    throw new Error('Driver session is not active');
  }
  log.info('App is opened and ready');
});

When('I click on {string}', async function (text) {
  if (!this.basePage) {
    this.basePage = new BasePage(this.driver);
  }
  if (!this.baseLocators) {
    this.baseLocators = new BaseLocators(this.basePage.platform);
  }
  const locator = this.baseLocators.getClickableTextLocator(text);
  await this.basePage.click(locator);
  log.info(`Clicked on element with text: "${text}"`);
});

Then('I should see the {string}', async function (text) {
  if (!this.basePage) {
    this.basePage = new BasePage(this.driver);
  }
  if (!this.baseLocators) {
    this.baseLocators = new BaseLocators(this.basePage.platform);
  }
  const locator = this.baseLocators.getVisibleTextLocator(text);
  const isVisible = await this.basePage.isDisplayed(locator, 10000);
  expect(isVisible).to.be.true;
  log.info(`Verified that "${text}" is visible`);
});

When('I terminate the app', async function () {
  if (!this.deviceActions) {
    this.deviceActions = new DeviceActions(this.driver, this.driverManager);
  }
  await this.deviceActions.terminateApp();
  log.info('App terminated');
});

When('I reopen the app', async function () {
  if (!this.deviceActions) {
    this.deviceActions = new DeviceActions(this.driver, this.driverManager);
  }
  await this.deviceActions.reopenApp();
  log.info('App reopened');
  
  if (!this.productsPage) {
    this.productsPage = new ProductsPage(this.driver);
  }
  await this.productsPage.waitForPageLoad();
});