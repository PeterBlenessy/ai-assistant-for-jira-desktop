# Changelog

All notable changes to AI Assistant for Jira Desktop are documented below.

## Backlog
- Add support for logging using Sentry.
- Add support for notifying the user when an issue type without template is encountered.
- Fix bug where some expansion rows throw error.
- Add support for transformer.js
- Add support for SSO authentication (https://confluence.atlassian.com/enterprise/sso-for-atlassian-data-center-990546150.html)
- Check available issuetypes: api/latest/issuetype
- Add support for fetching issue attachments: api/latest/issue/{issueIdOrKey}/attachments - to improve context for the AI
- Add support for stopping an ongoing generation.

## Releases

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
