import { ref, watch } from 'vue';
import JiraClient from '../helpers/jira.js';
import { usePersistedStore } from '../stores/persisted-store.js';

export function useJiraClient() {
    const persistedStore = usePersistedStore();
    const jiraClient = ref(null);

    const initializeClient = () => {
        jiraClient.value = JiraClient({
            host: persistedStore.jiraServerAddress,
            personalAccessToken: persistedStore.jiraPersonalAccessToken,
        });
    };

    watch(
        () => [persistedStore.jiraServerAddress, persistedStore.jiraPersonalAccessToken],
        initializeClient,
        { immediate: true }
    );

    return {
        jiraClient,
    };
}
