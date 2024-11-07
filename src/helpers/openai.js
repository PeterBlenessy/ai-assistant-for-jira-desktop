import { fetch } from "@tauri-apps/plugin-http";
import OpenAI from "openai";

const OpenAIClient = (options) => {
    const { baseURL, apiKey, model } = options;
    // Model configuration
    const maxTokens = 4096;
    const temperature = 0.2;

    const client = new OpenAI({
        apiKey: apiKey,
        baseURL: baseURL,
        dangerouslyAllowBrowser: true,
        fetch: fetch,
    });

    const handleError = (error) => {
        if (error.response) {
            const { status, data } = error.response;
            switch (status) {
                case 400:
                    console.error("Bad Request:", data);
                    break;
                case 401:
                    if (data.error.message.includes("Invalid Authentication")) {
                        console.error("Invalid Authentication: Ensure the correct API key and requesting organization are being used.");
                    } else if (data.error.message.includes("Incorrect API key provided")) {
                        console.error("Incorrect API key provided: Ensure the API key used is correct, clear your browser cache, or generate a new one.");
                    } else if (data.error.message.includes("You must be a member of an organization to use the API")) {
                        console.error("You must be a member of an organization to use the API: Contact support to get added to a new organization or ask your organization manager to invite you.");
                    }
                    break;
                case 403:
                    console.error("Country, region, or territory not supported: You are accessing the API from an unsupported location. Please see the OpenAI documentation for more information.");
                    break;
                case 404:
                    console.error("Not Found:", data);
                    break;
                case 429:
                    if (data.error.message.includes("Rate limit reached for requests")) {
                        console.error("Rate limit reached for requests: Pace your requests. Read the Rate limit guide.");
                    } else if (data.error.message.includes("You exceeded your current quota, please check your plan and billing details")) {
                        console.error("You exceeded your current quota: Buy more credits or learn how to increase your limits.");
                    }
                    break;
                case 500:
                    console.error("The server had an error while processing your request: Issue on our servers. Retry your request after a brief wait and contact support if the issue persists. Check the status page.");
                    break;
                case 503:
                    console.error("The engine is currently overloaded: Our servers are experiencing high traffic. Please retry your requests after a brief wait.");
                    break;
                default:
                    console.error("Error:", data);
            }
        } else {
            console.error("Error:", error.message);
        }
        throw error;
    };

    const createChatCompletion = async (messages) => {
        try {
            return await client.chat.completions.create({
                messages: messages,
                model: model,
                temperature: temperature,
                max_tokens: maxTokens,
                stream: true,
                stream_options: {
                    "include_usage": true
                },
            });
        } catch (error) {
            handleError(error);
        }
    };

    const createStructuredChatCompletion = async (messages, responseFormat) => {
        try {
            return await client.chat.completions.create({
                messages: messages,
                model: model,
                temperature: temperature,
                max_tokens: maxTokens,
                response_format: { 
                    type: "json_schema",
                    json_schema: responseFormat
                },
                stream: true
            });
        } catch (error) {
            handleError(error);
        }
    };

    return {
        createChatCompletion,
        createStructuredChatCompletion,
    };
};

export default OpenAIClient;
