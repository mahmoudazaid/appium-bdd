Feature: Login
  As a user
  I want to log in to the app
  So that I can access my account and shop

  # @login @android
  # Scenario: Success login with valid credentials
  #   Given the app is opened
  #   When I click on the burger menu
  #   And I click on "Log In"
  #   And I enter username "bod@example.com"
  #   And I enter password "10203040"
  #   And I click the login button
  #   And I click on the burger menu
  #   Then I should see the "Log Out"

  @login @android
  Scenario: Login session persists after app termination
    Given the app is opened
    When I click on the burger menu
    And I click on "Log In"
    And I enter username "bod@example.com"
    And I enter password "10203040"
    And I click the login button
    And I click on the burger menu
    Then I should see the "Log Out"
    When I terminate the app
    And I reopen the app
    And I click on the burger menu
    Then I should see the "Log Out"