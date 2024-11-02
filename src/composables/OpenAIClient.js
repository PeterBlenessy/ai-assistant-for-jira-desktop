import { ref, watch } from 'vue';
import OpenAIClient from '../helpers/openai.js';
import { usePersistedStore } from '../stores/persisted-store.js';

export function useOpenAIClient() {
    const persistedStore = usePersistedStore();
    const openAIClient = ref(null);

    const updateClient = () => {
        const provider = persistedStore.aiProviders.find(p => p.id === persistedStore.selectedProvider.providerId);
        openAIClient.value = OpenAIClient({
            baseURL: provider.baseURL,
            apiKey: provider.apiKey,
            model: persistedStore.selectedProvider.model
        });
    };

    watch(
        () => persistedStore.selectedProvider,
        () => {
            updateClient();
        },
        { immediate: true }
    );

    return { openAIClient };
}
