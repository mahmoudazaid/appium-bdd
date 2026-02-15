const { setWorldConstructor } = require('@cucumber/cucumber');
const config = require('@nodebug/config')('cucumber');
const { setDefaultTimeout } = require('@cucumber/cucumber');

setDefaultTimeout(config.timeout * 1000);

function CustomWorld({ attach }) {
  this.attach = attach;
  this.driver = null;
  this.environment = config.env;
  this.data = new Map();
}

setWorldConstructor(CustomWorld);
