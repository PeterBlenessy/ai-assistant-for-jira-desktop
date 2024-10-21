import { fetch } from "@tauri-apps/plugin-http";

const JiraClient = (options) => {
    const { host, personalAccessToken } = options;

    const jiraFetch = async (path, options) => {
        const url = "http://" + host + path;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${personalAccessToken}`,
            },
        });

        if (response.ok) {
            return response.json();
        } else {
            throw new Error(
                `JiraAPI error! status: ${response.status}, text: ${response.statusText}`,
            );
        }
    };

    const getIssue = (issue) => {
        return jiraFetch(`/rest/api/latest/issue/${issue}`);
    };

    const getUser = () => {
        return jiraFetch(`/rest/api/latest/myself`);
    };

    const searchIssues = async (
        jql,
        startAt = 0,
        maxResults = 50,
        fields = ["*all"],
    ) => {
        const url = "http://" + host + "/rest/api/latest/search";
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${personalAccessToken}`,
            },
            body: JSON.stringify({
                jql,
                startAt,
                maxResults,
                fields,
            }),
        });

        if (response.ok) {
            return response.json();
        } else {
            throw new Error(
                `JiraAPI error! ${response.status} - ${response.statusText}`,
            );
        }
    };

    return {
        getIssue,
        getUser,
        searchIssues,
    };
};

export default JiraClient;
