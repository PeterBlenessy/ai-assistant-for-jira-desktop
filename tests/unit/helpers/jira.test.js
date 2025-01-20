import { vi, describe, test, expect, beforeEach } from 'vitest';
import JiraClient from '@/helpers/jira';

// Move mock function declaration before vi.mock
const mockFetch = vi.fn();

// Mock setup must be at top level
vi.mock('@tauri-apps/plugin-http', () => ({
    fetch: (url, options) => mockFetch(url, options)
}));

describe('JiraClient', () => {
    const mockOptions = {
        host: 'https://jira.example.com',
        personalAccessToken: 'test-token'
    };

    let client;

    beforeEach(() => {
        mockFetch.mockClear();
        client = JiraClient(mockOptions);
    });

    // Helper functions for response mocking
    const mockSuccessResponse = (data) => ({
        ok: true,
        json: () => Promise.resolve(data)
    });

    const mockErrorResponse = (status, statusText, errorData) => ({
        ok: false,
        status,
        statusText,
        text: () => Promise.resolve(JSON.stringify(errorData))
    });

    test('getIssue fetches issue successfully', async () => {
        const mockData = { id: '123', key: 'TEST-1' };
        mockFetch.mockResolvedValueOnce(mockSuccessResponse(mockData));

        const result = await client.getIssue('TEST-1');

        expect(result).toEqual(mockData);
        expect(mockFetch).toHaveBeenCalledWith(
            'https://jira.example.com/rest/api/latest/issue/TEST-1',
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-token'
                }
            }
        );
    });

    test('searchIssues sends correct POST request', async () => {
        const mockData = { issues: [] };
        mockFetch.mockResolvedValueOnce(mockSuccessResponse(mockData));

        const jql = 'project = TEST';
        await client.searchIssues(jql);

        expect(mockFetch).toHaveBeenCalledWith(
            'https://jira.example.com/rest/api/latest/search',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-token'
                },
                body: JSON.stringify({
                    jql,
                    startAt: 0,
                    maxResults: 50,
                    fields: ['*all']
                })
            }
        );
    });

    test('addComment sends correct POST request', async () => {
        const mockData = { id: '123' };
        mockFetch.mockResolvedValueOnce(mockSuccessResponse(mockData));

        const comment = 'Test comment';
        await client.addComment('TEST-1', comment);

        expect(mockFetch).toHaveBeenCalledWith(
            'https://jira.example.com/rest/api/latest/issue/TEST-1/comment',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-token'
                },
                body: JSON.stringify({ body: comment })
            }
        );
    });

    test('handles API error response correctly', async () => {
        const errorData = {
            errorMessages: ['Invalid issue key'],
            errors: { key: 'Issue does not exist' }
        };
        mockFetch.mockResolvedValueOnce(mockErrorResponse(404, 'Not Found', errorData));

        await expect(client.getIssue('INVALID-1')).rejects.toThrow(/JiraAPI error/);
    });

    test('updateIssue sends correct PUT request', async () => {
        const mockResponse = { status: 204 };
        mockFetch.mockResolvedValueOnce(mockSuccessResponse(mockResponse));

        const updateData = { fields: { summary: 'Updated summary' } };
        await client.updateIssue('TEST-1', updateData);

        expect(mockFetch).toHaveBeenCalledWith(
            'https://jira.example.com/rest/api/latest/issue/TEST-1',
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-token'
                },
                body: JSON.stringify(updateData)
            }
        );
    });

    test('getServerInfo fetches server info successfully', async () => {
        const mockData = { version: '8.0.0', baseUrl: 'https://jira.example.com' };
        mockFetch.mockResolvedValueOnce(mockSuccessResponse(mockData));

        const result = await client.getServerInfo();

        expect(result).toEqual(mockData);
        expect(mockFetch).toHaveBeenCalledWith(
            'https://jira.example.com/rest/api/latest/serverInfo',
            expect.any(Object)
        );
    });
});