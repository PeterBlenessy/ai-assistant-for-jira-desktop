import { ref } from 'vue'

/**
 * Creates a composable for handling Jira issue type operations
 * @param {Ref} jiraClient - Vue ref containing the Jira client instance
 * @returns {Object} Object containing Jira issue type utility functions and state
 */
export function useJiraIssueTypes(jiraClient) {
    const jiraIssueTypeInfo = ref(null)

    /**
     * Discovers and sets information about a specific Jira issue type
     * @param {string} issueType - The issue type to discover
     */
    async function discoverIssueTypeInfo(issueType) {
        try {
            // Get all issue types
            const issueTypes = await jiraClient.value.getIssueTypes();

            const matchingType = issueTypes.find(type => 
                type.name.toLowerCase() === issueType.toLowerCase()
            );

            jiraIssueTypeInfo.value = matchingType ? matchingType : null;
        } catch (error) {
            console.error('Error discovering issue type:', error);
            jiraIssueTypeInfo.value = null;
        }
    }

    return {
        jiraIssueTypeInfo,
        discoverIssueTypeInfo
    }
}