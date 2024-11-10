# Changelog

All notable changes to AI Assistant for Jira Desktop are documented below.

## Backlog
- Add support for signing, notarizing, and automatic updates.
- Add support for in-app notifications.
- Add notification when an issue type without template is encountered.
- Add support for renaming user defined issue type if not aligned with Jira names.
- Bug: some expansion rows throw error.

## Releases

### v0.5.0 - 2024-11-10
- Added Prompt Management component for Jira issue types with editable and extendable values.
- Added resizable right pane holding the Prompt Management component.
- Added InfoBox component to display dismissible information.
- Fixed some input field validation issues.
- Updated brand colors and aligned button styles.
- Change response format to markdown to get a better user experience, i.e. faster responses.
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
