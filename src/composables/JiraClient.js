import { ref, watch } from 'vue';
import JiraClient from '../helpers/jira.js';
import { usePersistedStore } from '../stores/persisted-store.js';

export function useJiraClient() {
    const persistedStore = usePersistedStore();
    const client = ref(null);

    const initializeClient = () => {
        client.value = JiraClient({
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
        client,
    };
}
