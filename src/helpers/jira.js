import { fetch } from "@tauri-apps/plugin-http";

const JiraClient = (options) => {
    const { host, personalAccessToken } = options;

    const handleError = async (response) => {
        const errorText = await response.text();
        let errorMessage = `JiraAPI error! status: ${response.status}, text: ${response.statusText}`;

        try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.errorMessages) {
                errorMessage += `, errorMessages: ${errorJson.errorMessages.join(", ")}`;
            }
            if (errorJson.errors) {
                errorMessage += `, errors: ${JSON.stringify(errorJson.errors)}`;
            }
        } catch (e) {
            errorMessage += `, response: ${errorText}`;
        }

        throw new Error(errorMessage);
    };

    const jiraFetch = async (path, options = {}) => {
        const url = host + path;

        try {
            const response = await fetch(url, {
                method: options.method || "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${personalAccessToken}`,
                },
                body: options.body ? JSON.stringify(options.body) : undefined,
            });

            if (response.ok) {
                return response.json();
            } else {
                await handleError(response);
            }
        } catch (error) {
            console.error(`Error in jiraFetch: ${error.message}`);
            throw error;
        }
    };

    const getIssue = async (issue) => {
        try {
            return await jiraFetch(`/rest/api/latest/issue/${issue}`);
        } catch (error) {
            console.error(`Error in getIssue: ${error.message}`);
            throw error;
        }
    };

    const getUser = async () => {
        try {
            return await jiraFetch(`/rest/api/latest/myself?expand=groups,applicationRoles`);
        } catch (error) {
            console.error(`Error in getUser: ${error.message}`);
            throw error;
        }
    };

    const searchIssues = async (
        jql,
        startAt = 0,
        maxResults = 50,
        fields = ["*all"],
    ) => {
        try {
            return await jiraFetch("/rest/api/latest/search", {
                method: "POST",
                body: {
                    jql,
                    startAt,
                    maxResults,
                    fields,
                },
            });
        } catch (error) {
            console.error(`Error in searchIssues: ${error.message}`);
            throw error;
        }
    };

    const getIssueDetails = async (issueId) => {
        try {
            return await jiraFetch(`/rest/api/latest/issue/${issueId}`);
        } catch (error) {
            console.error(`Error in getIssueDetails: ${error.message}`);
            throw error;
        }
    };

    const updateIssue = async (issueKey, data) => {
        try {
            const response = await fetch(`${host}/rest/api/2/issue/${issueKey}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${personalAccessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                await handleError(response);
            }

            return response;
        } catch (error) {
            console.error(`Error in updateIssue: ${error.message}`);
            throw error;
        }
    };

    const getServerInfo = async () => {
        try {
            return await jiraFetch(`/rest/api/2/serverInfo`);
        } catch (error) {
            console.error(`Error in getServerInfo: ${error.message}`);
            throw error;
        }
    };

    const getConfiguration = async () => {
        try {
            return await jiraFetch(`/rest/api/latest/configuration`);
        } catch (error) {
            console.error(`Error in getUser: ${error.message}`);
            throw error;
        }
    };

    return {
        getIssue,
        getUser,
        getConfiguration,
        searchIssues,
        getIssueDetails,
        updateIssue,
        getServerInfo,  // Add this line
    };
};

export default JiraClient;
