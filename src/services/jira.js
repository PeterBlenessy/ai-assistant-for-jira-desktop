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

    return {
        getIssue,
        getUser,
    };
};

export default JiraClient;
