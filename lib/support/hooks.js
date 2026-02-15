const { Before, After, Status } = require('@cucumber/cucumber');
const { log } = require('@nodebug/logger');
const fs = require('fs');
const path = require('path');
const DriverManager = require('../driver/DriverManager');
const ScreenshotUtils = require('../utils/screenshot');
require('../utils/report');

const artifactsDir = path.join(process.cwd(), 'artifacts');
if (!fs.existsSync(artifactsDir)) {
  fs.mkdirSync(artifactsDir, { recursive: true });
}

Before(async function () {
  try {
    this.driverManager = new DriverManager();
    const platform = process.env.PLATFORM || 'android';
    this.driver = await this.driverManager.initiate({ platform });
    
    // Store driver manager in world for step definitions
    this.driverManager = this.driverManager;
    
    log.info('Driver initialized successfully');
  } catch (error) {
    log.error(`Failed to initialize driver: ${error.message}`);
    throw error;
  }
});

After(async function (scenario) {
  const failed = scenario.result.status === Status.FAILED;
  
  if (failed && this.driver && this.driverManager?.isActive()) {
    try {
      const scenarioName = scenario.pickle.name || 'unknown-scenario';
      log.info(`Saving artifacts for failed scenario: ${scenarioName}`);
      
      const artifacts = await ScreenshotUtils.saveArtifactsOnFailure(
        this.driver,
        scenarioName
      );
      
      if (artifacts.screenshot) {
        const screenshotBuffer = fs.readFileSync(artifacts.screenshot);
        this.attach(screenshotBuffer, 'image/png');
      }
      
      log.info('Artifacts saved for failed scenario');
    } catch (error) {
      log.error(`Failed to save artifacts: ${error.message}`);
    }
  }
  
  if (this.driverManager && this.driverManager.isActive()) {
    try {
      await this.driverManager.exit();
      log.info('Driver session closed');
    } catch (error) {
      log.error(`Error closing driver session: ${error.message}`);
    }
  }
});

