module.exports = {
  require: [
    'lib/support/**/*.js',
    'lib/step-definitions/**/*.js',
  ],
  format: ['json:reports/cucumber_report.json'],
}
