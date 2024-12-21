# Getting Started Guide

## Prerequisites
- A Jira Server account
- Access to an AI service (OpenAI, Ollama, or custom endpoint)

## Jira Configuration

### Setting up Jira Server connection
Follow the below steps to set up your Jira Server connection:

1. Click the `Add new` button to create a new configuration
2. Set the name for your configuration, e.g. `Default config`
2. Set the Jira Server Address, e.g. https://jira.your-domain.com
3. Set the Personal Access Token (PAT) for your Jira account
4. Click the `Save` button

Given that you have provided the correct information, you should now see the Jira Server version and a green server icon below the Jira Config dropdown.

### Generating a Personal Access Token (PAT)
To generate a Personal Access Token (PAT) for your Jira account, follow these steps:

1. Log in to your Jira Server instance
2. Click on your profile picture at the top right of the screen
3. Select "Profile" from the dropdown menu
4. In the left-hand menu, click on "Personal Access Tokens"
5. Click on "Create token"
6. Give your new token a name
7. Optionally, set an expiration date for the token
8. Click "Create" to generate the token
9. Copy the generated token and store it securely, as you won't be able to view it again

## AI Provider Configuration
The application supports any provider compatible with OpenAI API. You can choose between OpenAI, Ollama, or a configure a custom AI endpoint.

To configure your AI provider, follow the steps below:

### OpenAI Setup
1. Go to the OpenAI website (https://platform.openai.com) and log in to your account or create a new one if you don't have one
2. Once logged in, navigate to the API section by clicking on "API" in the top menu23.
3. In the left sidebar, click on "API Keys"
4. Click the "Create new secret key" button
5. Optionally, give your key a name to help you remember its purpose
6. Click "Create secret key" to generate the API key
7. Immediately copy the generated key and store it securely, as you won't be able to view it again after closing the popup
6. Enter your API key in the designated field

### Ollama Setup
1. Install [Ollama](https://ollama.com)
2. From the terminal, pull your desired model (e.g. `ollama pull qwen2.5`)
3. Configure Ollama to accept API calls from this application
   - Automatically from the Provider Settings dialog, by clicking the `Configure & Restart Ollama` button.
   - Manually, by starting Ollama server from the command line like this: `OLLAMA_ORIGINS=* ollama serve`
   - Manually setting globally (once) `launchctl setenv OLLAMA_ORIGINS '*'` and restart Ollama server (works on Mac)
4. In the app settings, select "Ollama" as provider
5. Select the downloaded model's name or add it if it's missing by editing Ollama config
6. Fill out the Ollama endpoint URL (default: http://localhost:11434/v1)
7. Add `ollama` as API Key

### Custom AI Endpoint
1. In the app settings, select "Add new"
2. Configure the following:
   - Provider name
   - AI model name
   - API endpoint URL
   - API key if required, otherwise `provider name` can be used


## Troubleshooting
- Verify your Jira URL is correct and includes the protocol (https://)
- Ensure your PAT has not expired
- Check if your AI service credentials are valid
- For Ollama, ensure the service is running locally

## Support
If you encounter any issues, please:
1. Check the logs in the app (Cmd+I on macOS, Ctrl+I on Windows)
2. Visit our GitHub issues page
3. Create a new issue with detailed error description