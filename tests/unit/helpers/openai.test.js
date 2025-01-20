import { vi, describe, test, expect, beforeEach } from 'vitest';
import OpenAIClient from '@/helpers/openai';

// Mock the dependencies
vi.mock('@tauri-apps/plugin-http', () => ({
    fetch: vi.fn()
}));

// Create mock implementation for OpenAI
const mockCreate = vi.fn();
vi.mock('openai', () => ({
    default: class MockOpenAI {
        constructor() {
            this.chat = {
                completions: {
                    create: mockCreate
                }
            };
        }
    }
}));

describe('OpenAIClient', () => {
    const mockOptions = {
        baseURL: 'https://api.openai.com/v1',
        apiKey: 'test-api-key',
        model: 'gpt-4'
    };

    let client;

    beforeEach(() => {
        mockCreate.mockClear();
        client = OpenAIClient(mockOptions);
    });

    test('creates chat completion successfully', async () => {
        const mockStream = new ReadableStream();
        mockCreate.mockResolvedValue(mockStream);

        const messages = [{ role: 'user', content: 'Hello' }];
        const response = await client.createChatCompletion(messages);

        expect(response).toBe(mockStream);
        expect(mockCreate).toHaveBeenCalledWith({
            messages,
            model: mockOptions.model,
            temperature: 0.2,
            max_tokens: 4096,
            stream: true
        }, { signal: expect.any(AbortSignal) });
    });

    test('creates structured chat completion successfully', async () => {
        const mockStream = new ReadableStream();
        mockCreate.mockResolvedValue(mockStream);

        const messages = [{ role: 'user', content: 'Hello' }];
        const schema = { type: 'object', properties: {} };
        const response = await client.createStructuredChatCompletion(messages, schema);

        expect(response).toBe(mockStream);
        expect(mockCreate).toHaveBeenCalledWith({
            messages,
            model: mockOptions.model,
            temperature: 0.2,
            max_tokens: 4096,
            response_format: {
                type: 'json_schema',
                json_schema: schema
            },
            stream: true
        }, { signal: expect.any(AbortSignal) });
    });

    test('aborts ongoing request', () => {
        const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
        
        client.createChatCompletion([{ role: 'user', content: 'Hello' }]);
        client.abort();

        expect(abortSpy).toHaveBeenCalled();
    });

    test('handles API errors correctly', async () => {
        const mockError = {
            response: {
                status: 401,
                data: {
                    error: {
                        message: 'Invalid Authentication'
                    }
                }
            }
        };

        mockCreate.mockRejectedValue(mockError);

        const messages = [{ role: 'user', content: 'Hello' }];
        await expect(client.createChatCompletion(messages)).rejects.toThrow();
    });
});