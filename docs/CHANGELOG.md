# Changelog

All notable changes to AI Assistant for Jira Desktop are documented below.

## Backlog
- Add support for logging using Sentry.
- Add support for transformer.js
- Add support for fetching links in the description.
- Add support for improving the context for the AI by adding child issues, comments, and attachments.
- Add support for SSO authentication (https://confluence.atlassian.com/enterprise/sso-for-atlassian-data-center-990546150.html)

## Releases

### v0.7.10 - 2025-01-20
- Fixed issue where selected JiraConfig could not be edited or deleted.
- Added unit tests for some helper functions.

### v0.7.9 - 2025-01-19
- Added input field validation in JiraSettings and ProviderSettings.
- Added support for checking Ollama server availability when Ollama is the selected provider.
- Updated package dependencies.

### v0.7.8 - 2024-12-21
- Updated `Getting started guide` with additional instruction when using Ollama.
- Added support for configuring Ollama server on Mac so it accepts API calls from this application.
- Added LICENSE.md to repo.

### v0.7.7 - 2024-12-17
- Changed width of settings dialog to make tab names fit.
- Added support for adding `AI improvement comments to Jira` when syncing accepted improvements.
- Replaced the separate accept and revert buttons with a single button.
- Added `sync to Jira` functionality for manual changes.

### v0.7.6 - 2024-12-16
- Fixed error where the `Accept` button remained disabled when generating improvements multiple times in demo mode.
- Added setting for `generating child issues`. Functionality not implemented yet.
- Added setting to `add AI improvement comments to Jira` when syncing accepted improvement. Functionality not implemented yet.
- Changed settings tab labels to be left-aligned for better UX.

### v0.7.5 - 2024-12-15
- Fixed error where issue type icons were not displayed in production when using demo mode.
- Changed child and linked issue key column to be fixed width to improve UX.
- Fixed error where the loading indication was not working when checking for and downloading updates.
- Added `demo mode` to AI improvement generation.
- Fixed error with editing an issue field before generating/accepting/reverting an improvement.
- Fixed error where accepting two different fields and then reverting any one of them, reverted both.
- Fixed error where accepting a `description` improvement replaced the first section when the description section was missing in the original issue.
- Improved UX for `Add field` in `PromptManagement` by making the save/cancel buttons clearly visible below the input fields instead of being hidden in the floating menu on the right side.
- Updated JqlSearch component to be responsive to switching `demo mode` on/off and rerun the JQL query to provide a seamless experience to users.
- Fixed error where when a generation is aborted and a new one is started, sometimes the previous aborted generation continued.
- Updated the system prompt to instruct the AI to always respond with a summary and a description, even if missing in the user input.
- Moved and renamed `mockJiraData.js` to `helpers/demoMode.js` to better reflect its purpose.

### v0.7.4 - 2024-12-13
- Added support for displaying issue icons in demo mode.
- Reorganized the settings components into a new "Settings" folder.
- Fixed error where the Jira Server Info dialog could open, dispite jira server no connection.
- Fixed error where an existing description section could become duplicated when accepting an improvement.
- Updated the acceptance flow to include an additional `Sync to Jira` step.
- Added option to revert an accepted improvement before it's synced to Jira.

### v0.7.3 - 2024-12-07
- Changed `mock mode` to `demo mode` to better make it easier to understand.
- Re-implemented the mock data to have a rich hierarchy of issues, generated deterministically but with random variations in statuses, priorities, and assignees to simulate real-world scenarios.
- Added `demo mode` to JqlSearch component.
- Added InfoBox about `demo mode`, displayed in JqlSearch component when `demo mode` is enabled.
- Added support for sorting the JqlSearch table.

### v0.7.2 - 2024-12-07
- Added support for indication of JQL query errors.
- Added support for opening external links in the system's default browser.
- Added informative JQL search help with examples.
- Added persistence of last used settings tab.
- Reduced log verboseness: filtered out window state related logs, such as resize or move window.

### v0.7.1 - 2024-12-07
- Fixed error with Splitter configuration in Settings dialog.
- Refactored IssueFields component by breaking out child issues, linked issues, and comments into their own components, making the code more modular and maintainable.
- Fixed issue where tooltip for update button remains 'Restart and install update' after restart.
- Fixed error where show dismissed info boxes got set to true after a restart.
- Fixed issue where `add new field` button in PromptManagementbecomes unresponsive when an issue type field is removed.

### v0.7.0 - 2024-12-06
- Updated info box to be more dense.
- Updated info box colors and transparency.
- Added general application settings in Settings dialog.
- Added mocked Jira data for testing purposes.

### v0.6.0 - 2024-12-05
- Added support for listing child issues, linked issues, and issue comments.
- Changed position of improve button to make space for additional issue information.

### v0.5.23 - 2024-12-03
- Updated header styles for improved UX.
- Fixed issue where markdown headers were converted to list items.
- Updated the PromptManagement action buttons to floating and displayed on hover to improve UX.
- Fixed issue where pasting text did not work as expected when editing issue type templates.
- Added support for Quasar Dialog plugin.
- Added confirmation dialog when deleting issue type templates and fields.
- Refactored text handling, dialog confirmations, and Jira utilities into separate helper files.
- Updated IssueFields component to make the accept buttons floating.
- Added revert functionality for accepted improvements.
- Fixed issue where the original summary and the generated had different styles.

### v0.5.22 - 2024-12-03
- Fixed null content handling in MarkdownViewer component
- Added support for editing the issue type name in PromptManagement
- Added InfoBox to display official Jira issue type descriptions

### v0.5.21 - 2024-12-02
- Added in-place editing for original Jira issue fields.
- Implemented hover-based edit icon for fields.
- Added save and cancel buttons for inline editing.
- Integrated Jira API for updating issue fields.
- Added error handling and notifications for edit actions.
- Added support for automatically adjusting the input height based on content.

### v0.5.20 - 2024-12-02
- Updated the rendering pipeline to convert Jira markup before rendering markdown.
- Fixed issue where user-defined field names were used instead of their labels in description sections.
- Fixed issue where similar field names would create duplicate sections.
- Fixed formatting of array-based content (like acceptance criteria) to maintain proper numbered lists.
- Fixed issue where existing sections were not properly updated when accepting improvements.
- Fixed issue where field updates would incorrectly modify the main description.

### v0.5.19 - 2024-12-02
- Fixed issue where last logged in user's info was available when Jira server was not connected.
- Fixed issue where user info dialog could not be closed.
- Updated transparent area around app icons.
- Updated tooltips.

### v0.5.18 - 2024-12-01
- Updated app icons to be aligned with Apple design guidelines.
- Removed unused code from JqlQuery component.
- Fixed bug where expansion rows throw error when description field is empty.

### v0.5.17 - 2024-12-01
- Updated error notifications to require user action to dismiss.
- Updated notification about missing template to require user action to dismiss.
- Added tooltip to main window buttons.

### v0.5.16 - 2024-11-30
- Added support for aborting the generation process.
- Added spinner to indicate ongoing generation process.
- Updated `pinia` to version `2.2.8`.

### v0.5.15 - 2024-11-30
- Fixed issue where flex columns did not occupy full available width in IssueFields component.
- Fixed issue where improvements were not reset and removed from UI when re-generating.
- Fixed issue where update was set to false for fields missing in issue but reqired in template.
- Improved UX by refactoring improvement generation state update indications.
- Improved UX by displaying AI comments for issue fields with no updates.

### v0.5.14 - 2024-11-28
- Removed old and unused Jira server configuration states.
- Add support for notifying the user when an issue type without template is encountered.
- Updated default in-app notification settings.
- Improved indication of successful and failed improvements.

### v0.5.13 - 2024-11-28
- Added badge to menu button to indicate when a new update is available.

### v0.5.12 - 2024-11-27
- Fixed issue where Jira configs were not saved correctly.
- Fixed issue where Jira server connection was not checked correctly when config changed.

### v0.5.11 - 2024-11-27
- Added better error handling for updater calls.
- Changed to centralized logging by using the Logger composable.

### v0.5.10 - 2024-11-27
- Fixed issue where update could not be downloaded.

### v0.5.9 - 2024-11-27
- Fixed error where models could not be added or edited in provider settings.
- Fixed error where app could not be restarted after downloading and installing an update.
- Added support for notifying user checks for updates and when no updates are available.
- Added support for logging using Tauri log plugin.

### v0.5.8 - 2024-11-27
- Fixed error where app didn't restart after downloaded and installed update.
- Add support for saving window positions and sizes and restore them when app is reopened.

### v0.5.7 - 2024-11-26
- Added support for displaying version number in the app menu when a new update is available.
- Upgraded dependencies.

### v0.5.6 - 2024-11-26
- Added Getting Started Guide to app menu.
- Added infoBox functions to persisted store to be accessible to all components.
- Added info box to settings dialog.
- Removed unused Tauri plugin `shell`.
- Added Tauri plugin `process` to be able to restart and apply updates.
- Added support for checking for and installing updates.

### v0.5.5 - 2024-11-22
- Fixed issue where jira calls were made directly instead of via the JiraClient composable.
- Added new component InfoDialog.vue to display information in a dialog, and use it for server info.
- Added support for displaying detailed user information when clicking the user avatar or name in the left drawer.
- Updated Jira server connection indicator icons.
- Added support for signing, notarizing, and updating the application using GitHub Actions.

### v0.5.4 - 2024-11-21
- Fixed issue of importing removed package js-yaml.
- Added Jira Server connection status and server information in Jira settings dialog.

### v0.5.3 - 2024-11-20
- Changed prompt to request responses in YAML format to improve support for streamed responses.
- Added support for array of strings as input to MarkdowViewer component.
- Updated default models for AI providers.
- Updated dependencies.

### v0.5.2 - 2024-11-16
- Fixed bug in Jira and Provider settings where the selected item looked indented and not dense.
- Changed delete icon highlight in jira and provider settings to rounded.
- Changed some labels in PromptManagement component to be more concise.
- Fixed issue in JqlQuery table where issue icon and key were displayed on different lines.
- Fixed flickering issue when expanding row in JqlQuery table.
- Remove unnecessary white space below the action buttons in settings dialog.
- Updated button icons and classes to be more consistent.
- Updated package dependencies.

### v0.5.1 - 2024-11-15
- Updated system prompt with instruction to not change field titles.
- Added issue type icon to JQL query table.
- Refactored Settings dialog; created JiraSettings and ProviderSettings components. 
- Added support for editing issue type names, adding new issue types, and deleting issue types.
- Fixed bug where clicking the settings button in the left drawer was opening the menu instead of the settings dialog.
- Added support for multiple Jira configurations, with options to add and edit.
- Fixed issue where selected provider stores the entire provider object, not url and model.
- Added support for deleting Jira and AI Provider configurations, inlcuding provider models.

### v0.5.0 - 2024-11-10
- Added Prompt Management component for Jira issue types with editable and extendable values.
- Added resizable right pane holding the Prompt Management component.
- Added InfoBox component to display dismissible information.
- Fixed some input field validation issues.
- Updated brand colors and aligned button styles.
- Changed response format to markdown to get a better user experience, i.e. faster responses.
- Refactored MarkdownViewer component so any component can use it to display markdown formatted text.
- Added issue type definitions to system message.
- Refactored code to support user defined fields dynamically.
- Renamed the 'description' key to 'definition' in template and code.
- Fixed occastional bug where the summary and description in the section title is replaced with the actual text.
- Fixed bug where pagination and search results were not reset on consecutive JQL searches, listing wrong results.
- Updated dependencies.

### v0.4.1 - 2024-11-02
- Fixed size of the improvement accepted chip.
- Improved error handling for Jira and OpenAI API calls by adding try-catch block to the async functions and providing more detailed error messages.
- Added a Vue composable for JiraClient to encapsulate the Jira configurations and have more clean component code.
- Added a Vue composable for OpenAIClient to encapsulate the OpenAI configurations and have more clean component code.
- Updated some variable names to avoid confusion and improve readability.

### v0.4.0 - 2024-11-01
- Added support for custom AI providers with configurable models

### v0.3.0 - 2024-10-31
- Added support for About dialog and Changelog dialog
- Added OpenAI-compatible API support with configurable LLM provider settings
- Added support for generating and accepting improvement proposals for issues
- Added JQL search functionality with pagination support
- Added detailed Jira issue information display
- Added persistent search history with improved UI placement
- Added persistent dark mode toggle support
- Fixed and optimized drawer behavior and layout
- Improved UX with updated component designs
- Fixed issue where Jira access settings were not validated when changed
- Fixed issue where pagination was not working properly
- Added SearchHistory component with JqlSearch integration

### v0.2.0 - 2024-10-12
- Improved checking Jira server connection.
- Updated README.md with how to setup local Jira server using Docker.
- Added Jira Server REST API support and integration
- Added settings dialog for Jira server connection settings
- Added support for Pinia store and fixed related issues
- Fixed various UI/layout issues and removed unused components
- Added Quasar framework support and updated application layout

### v0.1.0 - 2024-10-10
- Initial release
