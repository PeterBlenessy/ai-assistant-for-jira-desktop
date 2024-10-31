import { fetch } from "@tauri-apps/plugin-http";
import OpenAI from "openai";

const OpenAIClient = (options) => {
    const { url, apiKey } = options;
    // Model configuration
    const model = "gpt-4o-mini";
    const maxTokens = 4096;
    const temperature = 0.2;
    const baseUrl = url;//"https://api.openai.com/v1";

    const client = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
    });

    const createChatCompletion = async (messages) => {
        return client.chat.completions.create({
            messages: messages,
            model: model,
            temperature: temperature,
            max_tokens: maxTokens,
        });
    };

    const createStructuredChatCompletion = async (messages, responseFormat) => {
        return client.chat.completions.create({
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
    };

    return {
        createChatCompletion,
        createStructuredChatCompletion,
    };
};

export default OpenAIClient;
