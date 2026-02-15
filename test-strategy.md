# Test Strategy

## 1. What Types of Tests Would Be Automated?

### Core Business Flows (High Priority)

- Successful login  
- Failed login (invalid credentials)  
- Browse product catalog  
- Add product to cart  
- Complete checkout  
- Verify order confirmation  

These represent the primary user journey and highest business risk.

---

### State & Lifecycle Scenarios

- Cart persistence during navigation  
- App restart behavior  
- Background → foreground recovery  
- Orientation change during flow  

Mobile lifecycle issues are common regression sources and must be validated.

---

### Negative / Edge Case

- Failed login validation  
- Error message handling  

This ensures proper validation and error recovery.

---

## 2. What Would NOT Be Automated (and Why)?

### Visual & Styling Checks
Pixel-perfect UI validation (fonts, spacing, colors) is excluded because:
- It is brittle in mobile automation
- Better suited for visual testing tools

### Exhaustive Combinatorial Testing
Testing all product combinations or every possible input variation provides low ROI within the time constraint.

### Performance / Load Testing
Requires specialized tooling outside UI automation scope.

### Exploratory Testing
Human-driven discovery testing cannot be fully scripted.

---

## 3. How Would Automation Be Structured?

### Multiple Platforms (iOS & Android)

- Shared feature files (BDD scenarios)
- Screen/Page Object Model
- Platform abstraction layer for gesture or OS differences
- Platform-specific locators only when required

This ensures reuse while isolating platform differences.

---

### Multiple Devices

- Capability configuration externalized
- Device selection via configuration/environment variables
- Smoke suite for single device
- Matrix expansion possible in CI

---

### Long-Term Maintainability

- Page Object / Screen Model abstraction
- Centralized locator management
- Accessibility ID–first locator strategy
- Explicit waits only (no hard sleeps)
- Test isolation via fresh session per scenario
- Artifact capture for debugging

Tests express business intent, not UI mechanics.

---

## 4. CI/CD Integration

- Smoke tests executed on PR against a single simulator/emulator
- Artifacts stored:
  - Screenshots
  - Page source
  - Test report
- Nightly execution can extend to additional platforms/devices

Scaling precedes only after stability is achieved.

---

## 5. Biggest Risks in Mobile Automation (for This App)

### 1. Flakiness Due to Timing
Mitigation:
- Explicit wait conditions
- Synchronization on element state

### 2. State Persistence
Mitigation:
- Fresh Appium session per scenario
- No shared state between tests

### 3. Locator Instability
Mitigation:
- Accessibility-first strategy
- Centralized locator definitions

### 4. Platform Differences
Mitigation:
- Platform abstraction layer
- Minimal conditional branching

### 5. Mobile Lifecycle Interruptions
Mitigation:
- Dedicated lifecycle test
- Controlled app activation/termination handling
