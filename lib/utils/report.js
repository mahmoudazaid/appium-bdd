const reporter = require('cucumber-html-reporter');
const path = require('path');
const fs = require('fs');
const { log } = require('@nodebug/logger');

const reportsDir = path.join(process.cwd(), 'reports');
const jsonFile = path.join(reportsDir, 'cucumber_report.json');
const htmlFile = path.join(reportsDir, 'cucumber_report.html');

process.on('exit', function () {
  try {
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    if (!fs.existsSync(jsonFile)) {
      log.warn(`JSON report file not found: ${jsonFile}`);
      log.warn('HTML report will not be generated.');
      return;
    }

    const stats = fs.statSync(jsonFile);
    if (stats.size === 0) {
      log.warn('JSON report file is empty. HTML report will not be generated.');
      return;
    }

    try {
      const content = fs.readFileSync(jsonFile, 'utf8').trim();
      
      if (!content || content.length === 0) {
        log.warn('JSON report file is empty. HTML report will not be generated.');
        return;
      }

      if (!content.startsWith('[') || !content.endsWith(']')) {
        log.warn('JSON report appears incomplete. HTML report will not be generated.');
        return;
      }

      const jsonData = JSON.parse(content);
      
      if (!Array.isArray(jsonData)) {
        log.warn('JSON report is not in expected format (should be an array). HTML report will not be generated.');
        return;
      }

      log.info(`Generating HTML report from JSON (${stats.size} bytes, ${jsonData.length} scenarios)...`);

      const options = {
        theme: 'bootstrap',
        jsonFile,
        output: htmlFile,
        reportSuiteAsScenarios: true,
        scenarioTimestamp: true,
        launchReport: false,
        metadata: {
          'App Version': '2.2.0',
          'Test Environment': process.env.PLATFORM || 'android',
          'Platform': process.platform,
          'Executed': new Date().toISOString(),
        },
        screenshotsDirectory: path.join(process.cwd(), 'artifacts'),
        storeScreenshots: true,
      };

      reporter.generate(options);
      log.info('HTML report generated successfully');
      log.info(`Report location: ${htmlFile}`);
    } catch (parseError) {
      log.error(`Failed to parse JSON report: ${parseError.message}`);
      log.error('HTML report will not be generated.');
    }
  } catch (err) {
    log.warn('Cucumber report could not be generated due to an error');
    log.error('Error: ', err);
  }
});

function generateHTMLReport() {
  log.info('HTML report will be generated automatically on process exit');
}

module.exports = { generateHTMLReport };
