import { ref, watch } from 'vue';
import JiraClient from '../helpers/jira.js';
import { usePersistedStore } from '../stores/persisted-store.js';

export function useJiraClient() {
    const persistedStore = usePersistedStore();
    const jiraClient = ref(null);

    const initializeClient = () => {
        jiraClient.value = JiraClient({
            host: persistedStore.selectedJiraConfig.serverAddress,
            personalAccessToken: persistedStore.selectedJiraConfig.personalAccessToken,
        });
    };

    watch(
        () => [persistedStore.selectedJiraConfig.serverAddress, persistedStore.selectedJiraConfig.personalAccessToken],
        initializeClient,
        { immediate: true }
    );

    return {
        jiraClient,
    };
}
