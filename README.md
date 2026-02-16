# Appium BDD Test Framework

BDD test framework for Appium mobile testing using Cucumber.js and Page Object Model pattern.

## Test Strategy

See [test-strategy.md](test-strategy.md) for the complete test strategy documentation.

## Architecture

The framework follows a layered architecture:

- **Test Layer:** Cucumber feature files and step definitions
- **Page Object Layer:** Page classes representing app screens
- **Locator Layer:** Locator classes for element identification (separated from page objects)
- **Driver Layer:** Appium driver management and capabilities
- **Support Layer:** Hooks, utilities, and helpers

### Locator Management

The framework uses a unified locator approach with a dedicated `locators/` directory:

- **BaseLocators**: Base class providing common locator generation methods
  - Platform-agnostic text locator generation
  - Resource ID and XPath locator helpers
  - Supports both Android and iOS

- **Page-Specific Locators**: Each page has its own locator class extending `BaseLocators`
  - `MenuLocators`: Navigation menu/drawer locators
  - `LoginLocators`: Login page locators
  - `ProductsLocators`: Products page locators
  - Additional locator classes as needed

**Benefits:**
- Centralized locator management
- Separation of concerns (locators separate from page objects)
- Platform-agnostic locator generation
- Easy maintenance and updates
- Consistent approach across all pages

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure your test environment:
   - `.config/cucumber.json` - Cucumber test configuration (for test framework)

## Prerequisites

Before running tests, ensure you have the following installed:

- **Node.js** >= 18.17.0
- **Appium 3.x** (see installation instructions below)
- **Android SDK** (for Android testing) - See Android SDK Setup section
- **Xcode** (for iOS testing on macOS)

### Installing Appium

**Install Appium globally:**
```bash
npm install -g appium
```

**Verify Appium installation:**
```bash
appium --version
```

**Install Required Drivers:**

For Android testing, install the UiAutomator2 driver:
```bash
appium driver install uiautomator2
```

For iOS testing, install the XCUITest driver:
```bash
appium driver install xcuitest
```

**Install Required Plugins:**

For device management, install the device-farm plugin:
```bash
appium plugin install device-farm
```

**List installed drivers and plugins:**
```bash
# List drivers
appium driver list

# List plugins
appium plugin list
```

## Running Tests

### Start Appium Server

**IMPORTANT:** You must start the Appium server before running tests.

**Start Appium with device-farm plugin:**
```bash
# Make sure ANDROID_HOME or ANDROID_SDK_ROOT is set first!
appium server --use-plugins=device-farm --plugin-device-farm-platform=android
```

**Note:** The device-farm plugin works for both Android and iOS. For iOS-only testing, you can also use:

```bash
# Make sure ANDROID_HOME or ANDROID_SDK_ROOT is set first!
appium server --use-plugins=device-farm --plugin-device-farm-platform=ios
```

**Check Available Devices:**

Once Appium server is running, you can view available devices in your browser:
- Open: http://127.0.0.1:4723/device-farm/

This page shows all connected devices, emulators, and simulators that Appium can use for testing.

Keep the Appium server terminal window open while running tests.

### Verify iOS Simulator Device

Before running tests, verify your device exists:

```bash
xcrun simctl list devices available | grep iPhone
```

If your device doesn't exist, you may need to create it or update your configuration.

### Run Cucumber Tests

```bash
npm test
```

Or run a specific feature:

```bash
npm test -- features/open-app.feature
```

Or with specific tags:

```bash
npm test -- --tags "@your-tag"
```

### Running and Debugging Tests in VS Code

The project includes a `.vscode/launch.json` configuration file for running and debugging Cucumber tests directly in VS Code.

#### Current Launch Configuration

The `.vscode/launch.json` file contains a debug configuration that runs tests with the `@login` tag:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Run Tests",
      "program": "${workspaceFolder}/node_modules/@cucumber/cucumber/bin/cucumber-js",
      "args": [
        "--require",
        "lib/support/**/*.js",
        "--require",
        "lib/step-definitions/**/*.js",
        "--format",
        "json:reports/cucumber_report.json",
        "--tags",
        "@login"
      ],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "skipFiles": ["<node_internals>/**"],
      "env": {
        "NODE_ENV": "test"
      }
    }
  ]
}
```

#### How to Run Tests from VS Code

1. **Prerequisites:**
   - Ensure Appium server is running (see "Start Appium Server" section above)
   - Ensure your emulator/simulator is started and connected
   - Verify device is visible at http://127.0.0.1:4723/device-farm/

2. **Run Tests:**
   - Open VS Code in the project directory
   - Go to the **Run and Debug** panel:
     - Press `Ctrl+Shift+D` (Windows/Linux) or `Cmd+Shift+D` (macOS)
     - Or click the "Run and Debug" icon in the sidebar
   - Select **"Run Tests"** from the configuration dropdown
   - Click the green play button ▶️ or press `F5`
   - Tests will run in the integrated terminal

3. **Debug Tests (with Breakpoints):**
   - Set breakpoints in your code by clicking in the gutter next to line numbers
   - Breakpoints can be set in:
     - Step definition files (`lib/step-definitions/*.js`)
     - Page object files (`lib/pages/*.js`)
     - Support files (`lib/support/*.js`)
     - Driver manager (`lib/driver/*.js`)
   - Select **"Run Tests"** from the debug configuration dropdown
   - Press `F5` to start debugging
   - The debugger will pause at your breakpoints when code is executed

#### Customizing Launch Configuration

You can customize the launch configuration to run different tests by modifying the `args` array in `.vscode/launch.json`:

**Run All Tests:**
Remove the `--tags` argument:
```json
"args": [
  "--require",
  "lib/support/**/*.js",
  "--require",
  "lib/step-definitions/**/*.js",
  "--format",
  "json:reports/cucumber_report.json"
]
```

**Run Specific Feature File:**
Add the feature file path:
```json
"args": [
  "--require",
  "lib/support/**/*.js",
  "--require",
  "lib/step-definitions/**/*.js",
  "--format",
  "json:reports/cucumber_report.json",
  "features/login.feature"
]
```

**Run Tests with Different Tags:**
Change the `--tags` value:
```json
"args": [
  "--require",
  "lib/support/**/*.js",
  "--require",
  "lib/step-definitions/**/*.js",
  "--format",
  "json:reports/cucumber_report.json",
  "--tags",
  "@shopping"
]
```

**Run Multiple Tags:**
Use comma-separated tags:
```json
"--tags",
"@login and @android"
```

**Add Multiple Configurations:**

You can add multiple configurations to the `configurations` array for different test scenarios:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Tests (@login)",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/@cucumber/cucumber/bin/cucumber-js",
      "args": [
        "--require", "lib/support/**/*.js",
        "--require", "lib/step-definitions/**/*.js",
        "--format", "json:reports/cucumber_report.json",
        "--tags", "@login"
      ],
      "console": "integratedTerminal",
      "env": { "NODE_ENV": "test" }
    },
    {
      "name": "Run All Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/@cucumber/cucumber/bin/cucumber-js",
      "args": [
        "--require", "lib/support/**/*.js",
        "--require", "lib/step-definitions/**/*.js",
        "--format", "json:reports/cucumber_report.json"
      ],
      "console": "integratedTerminal",
      "env": { "NODE_ENV": "test" }
    },
    {
      "name": "Run Login Feature",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/@cucumber/cucumber/bin/cucumber-js",
      "args": [
        "--require", "lib/support/**/*.js",
        "--require", "lib/step-definitions/**/*.js",
        "--format", "json:reports/cucumber_report.json",
        "features/login.feature"
      ],
      "console": "integratedTerminal",
      "env": { "NODE_ENV": "test" }
    }
  ]
}
```

#### Important Notes

- **Appium Server Required:** Make sure Appium server is running before starting tests from VS Code
- **Device Connection:** Ensure your emulator/simulator is started and visible at http://127.0.0.1:4723/device-farm/
- **Configuration Files:** The launch configuration uses the same `.config/` files as command-line execution
- **Environment Variables:** You can add environment variables to the `env` object in the launch configuration
- **Output:** Test results are saved to `reports/cucumber_report.json` as configured

#### Example Debug Session

1. Start Appium server in a terminal:
   ```bash
   appium server --use-plugins=device-farm --plugin-device-farm-platform=android
   ```

2. Start your emulator/simulator

3. In VS Code, open `lib/step-definitions/login-steps.js`

4. Set a breakpoint by clicking in the gutter next to a line number

5. Go to Run and Debug panel (`Ctrl+Shift+D` / `Cmd+Shift+D`)

6. Select **"Run Tests"** from the dropdown

7. Press `F5` to start debugging

8. The debugger will pause at your breakpoint when that code executes

9. Use the debug toolbar to:
   - Continue (`F5`)
   - Step Over (`F10`)
   - Step Into (`F11`)
   - Step Out (`Shift+F11`)
   - Restart (`Ctrl+Shift+F5` / `Cmd+Shift+F5`)
   - Stop (`Shift+F5`)

## Project Structure

```
.
├── .config/              # Configuration files
│   ├── cucumber.json     # Cucumber test configuration
│   ├── appium.json       # Appium server settings
│   └── device.json       # Device matrix configuration
├── features/             # Cucumber feature files
│   ├── login.feature     # Login test scenarios
│   ├── shopping-flow.feature  # Shopping flow scenarios
│   └── edge-cases.feature     # Edge case scenarios
├── lib/                  # Framework libraries
│   ├── driver/           # Driver management
│   │   ├── DriverManager.js
│   │   └── capabilities.js
│   ├── locators/         # Locator classes (Page Object Model)
│   │   ├── BaseLocators.js      # Base locator class with common methods
│   │   ├── MenuLocators.js      # Navigation menu locators
│   │   ├── LoginLocators.js     # Login page locators
│   │   ├── ProductsLocators.js  # Products page locators
│   │   └── [Page]Locators.js    # Other page-specific locators
│   ├── pages/            # Page Object Model
│   │   ├── BasePage.js
│   │   ├── LoginPage.js
│   │   ├── ProductsPage.js
│   │   ├── MenuPage.js
│   │   ├── CartPage.js
│   │   └── CheckoutPage.js
│   ├── step-definitions/ # Step definition files
│   │   ├── login-steps.js
│   │   ├── shopping-steps.js
│   │   ├── edge-case-steps.js
│   │   └── app-steps.js
│   ├── support/          # Cucumber support files
│   │   ├── hooks.js      # Before/After hooks
│   │   └── world.js      # Custom world
│   └── utils/            # Utilities and helpers
│       ├── wait.js
│       ├── screenshot.js
│       ├── gestures.js
│       ├── platform.js
│       └── deviceActions.js
├── apps/                 # Application binaries
│   ├── android/          # Android APK files
│   └── ios/              # iOS app files
├── artifacts/            # Test artifacts (screenshots, page sources on failure)
└── reports/              # Test reports (JSON and HTML)
```

## Device/Emulator Requirements

### Android
- Android Emulator or physical device
- Minimum Android version: 8.0 (API level 26)
- Recommended: Android 10+ (API level 29+)
- App file: `apps/android/mda-2.2.0-25.apk`

### iOS
- iOS Simulator or physical device
- Minimum iOS version: 14.3
- Recommended: iOS 15+
- App file: `apps/ios/SauceLabs-Demo-App.app` or `apps/ios/SauceLabs-Demo-App.ipa`

### Setup Instructions

1. **Android Emulator:**
   ```bash
   # List available emulators
   emulator -list-avds
   
   # Start an emulator
   emulator -avd <avd_name>
   ```

2. **iOS Simulator:**
   ```bash
   # List available simulators
   xcrun simctl list devices available
   
   # Boot a simulator
   xcrun simctl boot <device_id>
   ```

3. **Verify Device Connection:**
   ```bash
   # Android
   adb devices
   
   # iOS
   xcrun simctl list devices
```

4. **Check Devices via Device Farm:**
   - Start Appium server with device-farm plugin
   - Open http://127.0.0.1:4723/device-farm/ in your browser
   - View all available devices, emulators, and simulators

## Configuration

The framework uses three configuration files located in the `.config/` directory. These files are automatically loaded by the framework and should be properly configured to avoid issues.

### Configuration Files Overview

- **`.config/cucumber.json`** - Cucumber test framework settings (timeouts, environment, screenshots)
- **`.config/appium.json`** - Appium server connection settings (hostname, port, timeouts)
- **`.config/device.json`** - Target device configuration (platform, device name, app path, capabilities)

### How to Use Configuration Files

#### 1. `.config/device.json` - Device Configuration

This file defines the target device and app for testing. **This is the most important configuration file** and must be set correctly.

**Example for Android:**
```json
{
  "platform": "Android",
  "platformVersion": "16.0",
  "deviceName": "Pixel_9",
  "automationName": "UiAutomator2",
  "app": "/absolute/path/to/apps/android/mda-2.2.0-25.apk"
}
```

**Example for iOS:**
   ```json
   {
     "platform": "iOS",
     "platformVersion": "15.0",
     "deviceName": "iPhone Simulator",
     "automationName": "XCUITest",
  "app": "/absolute/path/to/apps/ios/SauceLabs-Demo-App.app"
}
```

**Important Notes:**
- **Use absolute paths** for the `app` field (not relative paths)
- The `deviceName` must match an actual device/emulator name (check via `adb devices` or `xcrun simctl list devices`)
- The `platformVersion` should match your device's OS version
- For Android, `automationName` should be `"UiAutomator2"`
- For iOS, `automationName` should be `"XCUITest"`

**Platform Override Priority:**
1. Options passed directly to driver (highest priority)
2. `PLATFORM` environment variable: `PLATFORM=android npm test` or `PLATFORM=ios npm test`
3. `platform` field in `device.json`
4. Automatic platform detection (lowest priority)

**Common Issues:**
- ❌ **Wrong app path**: Use absolute path, verify file exists
- ❌ **Device name mismatch**: Device name must exist and be booted
- ❌ **Platform version mismatch**: Version must match your device's OS
- ❌ **Relative paths**: Always use absolute paths for app location

#### 2. `.config/appium.json` - Appium Server Configuration

This file configures the connection to the Appium server.

**Example:**
```json
{
  "hostname": "127.0.0.1",
  "path": "/",
  "port": 4723,
  "logLevel": "error",
  "timeout": 10,
  "headless": false,
  "usePreinstalledWDA": true,
  "videoPath": "./reports",
  "devicefarm-hostname": {
    "local": "127.0.0.1"
  }
}
```

**Configuration Fields:**
- `hostname`: Appium server hostname (default: `127.0.0.1` for local)
- `port`: Appium server port (default: `4723`)
- `path`: WebDriver endpoint path (default: `/`)
- `logLevel`: Logging level (`error`, `warn`, `info`, `debug`)
- `timeout`: Connection timeout in seconds
- `devicefarm-hostname`: Device farm plugin hostname configuration

**Important Notes:**
- The `port` must match the port where Appium server is running
- If using device-farm plugin, ensure `devicefarm-hostname.local` matches your server
- For remote Appium servers, update `hostname` accordingly

**Common Issues:**
- ❌ **Port mismatch**: Port in config must match Appium server port
- ❌ **Connection refused**: Verify Appium server is running on specified hostname:port
- ❌ **Timeout errors**: Increase `timeout` value if connection is slow

#### 3. `.config/cucumber.json` - Test Framework Configuration

This file configures Cucumber test execution settings.

**Example:**
```json
{
  "env": "test",
  "stack": "",
  "screenshots": "onfail",
  "video": false,
  "videoPath": "./reports",
  "timeout": 900,
  "apitimeout": 180,
  "version": "1.0.0"
}
```

**Configuration Fields:**
- `timeout`: Step timeout in seconds (default: `900` = 15 minutes)
- `apitimeout`: API call timeout in seconds (default: `180` = 3 minutes)
- `screenshots`: When to take screenshots (`"onfail"`, `"always"`, `"never"`)
- `video`: Enable video recording (default: `false`)
- `videoPath`: Directory for video files (default: `"./reports"`)
- `env`: Environment name (default: `"test"`)

**Important Notes:**
- `timeout` is in seconds and applies to each Cucumber step
- Screenshots are automatically saved to `artifacts/` directory on failure
- Increase `timeout` if tests are timing out on slow devices
- Set `screenshots: "always"` to capture screenshots for all steps (useful for debugging)

**Common Issues:**
- ❌ **Step timeout errors**: Increase `timeout` value for slow operations
- ❌ **Missing screenshots**: Verify `screenshots` is set to `"onfail"` or `"always"`
- ❌ **API timeout**: Increase `apitimeout` for slow network operations

### Configuration Best Practices

1. **Always use absolute paths** for app files in `device.json`
2. **Verify device names** match actual devices before running tests
3. **Check Appium server** is running on the configured hostname:port
4. **Test configuration** by running a simple test before full test suite
5. **Keep config files in version control** but use environment variables for sensitive data
6. **Validate JSON syntax** - invalid JSON will cause framework to fail

### Configuration Validation

Before running tests, verify your configuration:

   ```bash
# Check if device.json is valid JSON
cat .config/device.json | jq .

# Check if appium.json is valid JSON
cat .config/appium.json | jq .

# Check if cucumber.json is valid JSON
cat .config/cucumber.json | jq .

# Verify app path exists (for device.json)
# Replace with your app path from device.json
ls -la /path/to/your/app.apk  # Android
ls -la /path/to/your/app.app  # iOS
```

### Troubleshooting Configuration Issues

| Issue | Solution |
|-------|----------|
| "Cannot find module '@nodebug/config'" | Run `npm install` to install dependencies |
| "Invalid JSON in config file" | Validate JSON syntax with `jq` or JSON validator |
| "App path not found" | Use absolute path and verify file exists |
| "Device not found" | Verify device name matches actual device and is booted |
| "Connection refused" | Check Appium server is running on configured hostname:port |
| "Step timeout" | Increase `timeout` value in `cucumber.json` |
| "Platform not supported" | Verify `platform` is exactly `"Android"` or `"iOS"` (case-sensitive) |

### Running Specific Test Suites

```bash
# Run login tests only
npm test -- --tags "@login"

# Run shopping flow tests
npm test -- --tags "@shopping"

# Run edge case tests
npm test -- --tags "@edge-case"

# Run Android-specific tests
npm test -- --tags "@android"

# Run iOS-specific tests
npm test -- --tags "@ios"
```

## How to Run Tests Locally

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Android SDK Setup (Required for Android Testing):**

   **IMPORTANT:** You must set the `ANDROID_HOME` or `ANDROID_SDK_ROOT` environment variable before running Android tests or starting Appium with the device-farm plugin for Android.

   **Quick Setup (Recommended):**
   
   Run the automated setup script:
   ```bash
   npm run setup:android-sdk
   ```
   
   This script will:
   - Automatically detect your Android SDK installation
   - Add `ANDROID_HOME` and `ANDROID_SDK_ROOT` to your shell profile
   - Add Android SDK tools to your PATH
   - Provide instructions to apply the changes

   After running the script, reload your shell:
   ```bash
   source ~/.zshrc  # for zsh
   # or
   source ~/.bash_profile  # for bash
   ```

   **Manual Setup (Alternative):**
   
   First, locate your Android SDK installation. Common locations:
   - `~/Library/Android/sdk` (macOS, default for Android Studio)
   - `~/Android/Sdk` (Linux, default for Android Studio)
   - Or wherever you installed Android Studio/SDK

   Then, add these lines to your shell profile (`~/.zshrc` for zsh or `~/.bash_profile` for bash):
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   ```

   After adding, reload your shell configuration:
   ```bash
   source ~/.zshrc  # or source ~/.bash_profile
   ```

   **For Windows:**
   
   Common SDK location: `C:\Users\YourName\AppData\Local\Android\Sdk`
   
   Set environment variables via System Properties:
   1. Open System Properties → Environment Variables
   2. Add new System Variable:
      - Variable name: `ANDROID_HOME`
      - Variable value: `C:\Users\YourName\AppData\Local\Android\Sdk`
   3. Edit `Path` variable and add:
      - `%ANDROID_HOME%\platform-tools`
      - `%ANDROID_HOME%\tools`
      - `%ANDROID_HOME%\tools\bin`

   **Verify Installation:**
   ```bash
   # Check if ANDROID_HOME is set
   echo $ANDROID_HOME  # macOS/Linux
   echo %ANDROID_HOME% # Windows
   
   # Verify ADB is accessible
   adb version
   ```

   **Alternative: Use ANDROID_SDK_ROOT**
   
   If you prefer `ANDROID_SDK_ROOT` instead of `ANDROID_HOME`, set it the same way. The device-farm plugin accepts either variable.

   **Troubleshooting:**
   - If you get "Neither ANDROID_HOME nor ANDROID_SDK_ROOT environment variable was exported", make sure:
     1. The environment variable is set in your shell profile (`.zshrc` or `.bash_profile`)
     2. You've reloaded your shell: `source ~/.zshrc` (or `source ~/.bash_profile`)
     3. Or open a new terminal window
     4. The path points to a valid Android SDK installation
   - The `npm run check:prerequisites` command automatically loads environment variables from your shell profile, so it should work even if you haven't sourced your profile in the current session
   - If issues persist, run `npm run setup:android-sdk` to reconfigure

3. **Start Appium Server:**
   
   Start Appium with the device-farm plugin:
   ```bash
   # Make sure ANDROID_HOME or ANDROID_SDK_ROOT is set first!
   appium server --use-plugins=device-farm --plugin-device-farm-platform=android
   ```
   
   **Verify Appium is running:**
   - Check the terminal output for "Appium REST http interface listener started"
   - Open http://127.0.0.1:4723/device-farm/ in your browser to see available devices
   
   **Note:** If you see an error about `ANDROID_HOME` or `ANDROID_SDK_ROOT` not being set, refer to the Android SDK Setup section above.

4. **Start Device/Emulator:**
   - Android: Start an emulator or connect a physical device
   - iOS: Boot a simulator or connect a physical device
   - Verify devices are visible at http://127.0.0.1:4723/device-farm/

5. **Run Tests:**
   ```bash
   # Run all tests
   npm test
   
   # Run specific feature
   npm test -- features/login.feature
   
   # Run with tags
   npm test -- --tags "@login"
   ```

## Viewing Test Reports

After running tests, you can view the generated reports to analyze test results, failures, and execution details.

### Report Types

The framework generates two types of reports:

1. **JSON Report** (`reports/cucumber_report.json`) - Machine-readable test results
2. **HTML Report** (`reports/cucumber_report.html`) - Human-readable visual report

### HTML Report

The HTML report is automatically generated after test execution completes. It provides a visual, interactive view of your test results.

**Location:**
```
reports/cucumber_report.html
```

**How to View:**
1. **Open in Browser:**
   ```bash
   # macOS
   open reports/cucumber_report.html
   
   # Linux
   xdg-open reports/cucumber_report.html
   
   # Windows
   start reports/cucumber_report.html
   ```

2. **Or manually navigate:**
   - Open your file browser
   - Navigate to the `reports/` directory in your project
   - Double-click `cucumber_report.html`

**What's Included in HTML Report:**
- Test execution summary (passed/failed/skipped scenarios)
- Detailed step-by-step results for each scenario
- Execution time for each step and scenario
- Screenshots (if tests failed and screenshots were captured)
- Metadata (App Version, Test Environment, Platform, Execution Date)
- Feature and scenario organization

**Report Generation:**
- The HTML report is automatically generated when the test process exits
- If the JSON file is missing or invalid, the HTML report will not be generated
- Check the console output for any report generation errors

### JSON Report

The JSON report contains the raw test execution data in machine-readable format.

**Location:**
```
reports/cucumber_report.json
```

**How to View:**
1. **View in Terminal:**
   ```bash
   cat reports/cucumber_report.json
   ```

2. **Pretty Print JSON:**
   ```bash
   cat reports/cucumber_report.json | jq .
   ```

3. **View in Code Editor:**
   - Open `reports/cucumber_report.json` in your preferred code editor
   - Most editors provide JSON syntax highlighting

**JSON Report Structure:**
The JSON report is an array of feature objects, each containing:
- Feature metadata (name, description, tags)
- Scenarios with their steps
- Step results (status, duration, error messages if failed)
- Attachments (screenshots, page sources)

**Example JSON Structure:**
```json
[
  {
    "uri": "features/login.feature",
    "id": "login",
    "keyword": "Feature",
    "name": "Login",
    "line": 1,
    "description": "",
    "elements": [
      {
        "id": "login;success-login-with-valid-credentials",
        "keyword": "Scenario",
        "name": "Success login with valid credentials",
        "line": 7,
        "steps": [...]
      }
    ]
  }
]
```

### Checking Report Status

**Verify Report Files Exist:**
```bash
# Check if reports directory exists
ls -la reports/

# Check JSON report
ls -lh reports/cucumber_report.json

# Check HTML report
ls -lh reports/cucumber_report.html
```

**Check Report File Size:**
```bash
# JSON report should have content (not 0 bytes)
du -h reports/cucumber_report.json

# HTML report should exist after successful test run
du -h reports/cucumber_report.html
```

**Validate JSON Report:**
```bash
# Check if JSON is valid
cat reports/cucumber_report.json | jq . > /dev/null && echo "JSON is valid" || echo "JSON is invalid"

# Count scenarios in report
cat reports/cucumber_report.json | jq '.[] | .elements | length' | awk '{sum+=$1} END {print "Total scenarios:", sum}'
```

### Troubleshooting Report Issues

**HTML Report Not Generated:**
- Check if JSON report exists and has content
- Verify JSON report is valid (not corrupted)
- Check console output for error messages
- Ensure the `reports/` directory is writable

**Empty or Invalid JSON Report:**
- Tests may have been interrupted before completion
- Check for errors in test execution
- Verify Cucumber completed successfully
- Check file permissions on `reports/` directory

**Report Generation Errors:**
- Check console logs for specific error messages
- Verify `cucumber-html-reporter` package is installed
- Ensure sufficient disk space in `reports/` directory

### Report Artifacts

In addition to reports, test artifacts are saved in the `artifacts/` directory:

**Screenshots:**
- Location: `artifacts/`
- Format: PNG files
- Naming: `failure-<scenario-name>-<timestamp>.png`
- Captured: Automatically on test failure (if configured)

**Page Sources:**
- Location: `artifacts/`
- Format: XML files
- Naming: `failure-<scenario-name>-<timestamp>.xml`
- Captured: Automatically on test failure (if configured)

**View Artifacts:**
```bash
# List all artifacts
ls -la artifacts/

# View screenshots
open artifacts/*.png  # macOS
xdg-open artifacts/*.png  # Linux
```

## How to Debug if Environment is Missing Something

If you encounter issues when running tests, follow these debugging steps:

### 1. Check Prerequisites

**Verify Node.js version:**
```bash
node --version
# Should be >= 18.17.0
```

**Verify Appium installation:**
```bash
appium --version
# Should show Appium 3.x version
```

**Verify drivers are installed:**
```bash
appium driver list
# Should show uiautomator2 (for Android) and/or xcuitest (for iOS)
```

**Verify plugins are installed:**
```bash
appium plugin list
# Should show device-farm plugin
```

### 2. Check Android SDK Setup

**Verify ANDROID_HOME or ANDROID_SDK_ROOT:**
```bash
echo $ANDROID_HOME  # macOS/Linux
echo %ANDROID_HOME% # Windows
# Should show a valid path to Android SDK
```

**Verify ADB is accessible:**
```bash
adb version
# Should show ADB version information
```

**Check connected Android devices:**
```bash
adb devices
# Should list connected devices/emulators
```

### 3. Check iOS Setup (macOS only)

**Verify Xcode is installed:**
```bash
xcode-select --print-path
# Should show Xcode path
```

**List available iOS simulators:**
```bash
xcrun simctl list devices available
# Should list available simulators
```

### 4. Check Appium Server

**Verify Appium server is running:**
- Check terminal for "Appium REST http interface listener started"
- Open http://127.0.0.1:4723/status in browser (should return JSON status)
- Open http://127.0.0.1:4723/device-farm/ to see available devices

**Common Appium errors:**
- "Cannot find module" → Install missing drivers/plugins (see Prerequisites section)
- "ANDROID_HOME not set" → Configure Android SDK environment variables (see Android SDK Setup)
- "No devices found" → Start an emulator/simulator or connect a physical device

### 5. Check Device Connection

**For Android:**
```bash
adb devices
# Should show at least one device (emulator or physical)
```

**For iOS:**
```bash
xcrun simctl list devices
# Should show at least one booted simulator
```

**Via Device Farm UI:**
- Open http://127.0.0.1:4723/device-farm/
- Verify your device/emulator appears in the list

### 6. Run Prerequisites Check Script

If available, run the project's prerequisite check:
```bash
npm run check:prerequisites
```

This will verify all required tools and configurations are set up correctly.

### 7. Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| "Appium not found" | Run `npm install -g appium` |
| "Driver not found" | Run `appium driver install <driver-name>` |
| "Plugin not found" | Run `appium plugin install <plugin-name>` |
| "ANDROID_HOME not set" | Set environment variable (see Android SDK Setup) |
| "No devices found" | Start emulator/simulator or connect physical device |
| "Connection refused" | Make sure Appium server is running |
| "Port 4723 already in use" | Stop other Appium instances or change port |

## Notes

- All step definitions use `this.driver` (provided by hooks)
- Screenshots and page sources are automatically saved to `artifacts/` on test failure
- Page Object Model pattern ensures maintainable and reusable code
- Platform-specific handling is abstracted in page objects
- Locators are separated from page objects in dedicated `locators/` directory
- Each page has its own locator class extending `BaseLocators` for unified approach
- Generic text-based interactions use `BaseLocators` for platform-agnostic element finding
- Locators are separated from page objects in dedicated `locators/` directory
- Each page has its own locator class extending `BaseLocators` for unified approach
- Generic text-based interactions use `BaseLocators` for platform-agnostic element finding