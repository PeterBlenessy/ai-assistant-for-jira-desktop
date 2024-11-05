import { ref, watch } from "vue";
import { defineStore } from "pinia";

// Define both default providers and their protected models
export const DEFAULT_PROVIDERS = [
    {
        id: 'openai',
        name: 'OpenAI',
        models: ['gpt-4', 'gpt-3.5-turbo'],
        baseURL: 'https://api.openai.com/v1',
        apiKey: ''
    },
    {
        id: 'ollama',
        name: 'Ollama',
        models: ['llama2', 'mistral'],
        baseURL: 'http://localhost:11434/v1',
        apiKey: ''
    }
];

// Export protected IDs for easy reference
export const PROTECTED_PROVIDER_IDS = DEFAULT_PROVIDERS.map(p => p.id);
export const PROTECTED_MODELS = DEFAULT_PROVIDERS.reduce((acc, provider) => {
    acc[provider.id] = provider.models;
    return acc;
}, {});

export const usePersistedStore = defineStore("persisted-store", () => {

    // --- Jira state ---
    const jiraServerAddress = ref(loadStateFromLocalStorage("jiraServerAddress") || "");
    const jiraPersonalAccessToken = ref(loadStateFromLocalStorage("jiraPersonalAccessToken") || "");
    const searchHistory = ref(loadStateFromLocalStorage("searchHistory") || []);

    // --- UI state ---
    const darkMode = ref(loadStateFromLocalStorage("darkMode") || false);
    const leftDrawer = ref(loadStateFromLocalStorage("leftDrawer") || false);
    const splitterRatio = ref(loadStateFromLocalStorage("splitterRatio") || 70);
    const showRightPane = ref(loadStateFromLocalStorage("showRightPane") ?? true);
    const lastSplitterRatio = ref(loadStateFromLocalStorage("lastSplitterRatio") || 70);

    // --- AI state ---
    const aiProviderUrl = ref(loadStateFromLocalStorage("aiProviderUrl") || "");
    const aiProviderApiKey = ref(loadStateFromLocalStorage("aiProviderApiKey") || "");

    const aiProviders = ref(loadStateFromLocalStorage("aiProviders") || DEFAULT_PROVIDERS);
    const selectedProvider = ref(loadStateFromLocalStorage("selectedProvider") || {
        providerId: 'openai',
        model: 'gpt-4o'
    });

    // Add info box state
    const infoBoxes = ref(loadStateFromLocalStorage("infoBoxes") || [{ infoBox: "PromptManagement", display: true }]);

    // --- Persisted state management functions ---
    function saveStateToLocalStorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value)); 
    }

    function loadStateFromLocalStorage(key) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    }

    // --- Jira state watchers ---
    watch(jiraServerAddress, (newValue) => {saveStateToLocalStorage("jiraServerAddress", newValue);});
    watch(jiraPersonalAccessToken, (newValue) => { saveStateToLocalStorage("jiraPersonalAccessToken", newValue); });
    watch(searchHistory, (newValue) => { saveStateToLocalStorage("searchHistory", newValue); }, { deep: true });

    // --- UI state watchers ---
    watch(darkMode, (newValue) => { saveStateToLocalStorage("darkMode", newValue); });
    watch(leftDrawer, (newValue) => { saveStateToLocalStorage("leftDrawer", newValue); });
    watch(splitterRatio, (newValue) => { saveStateToLocalStorage("splitterRatio", newValue); });
    watch(showRightPane, (newValue) => { saveStateToLocalStorage("showRightPane", newValue); });
    watch(lastSplitterRatio, (newValue) => { saveStateToLocalStorage("lastSplitterRatio", newValue); });
    
    // --- AI state watchers ---
    watch(aiProviderUrl, (newValue) => { saveStateToLocalStorage("aiProviderUrl", newValue); });
    watch(aiProviderApiKey, (newValue) => { saveStateToLocalStorage("aiProviderApiKey", newValue); });
    watch(aiProviders, (newValue) => { saveStateToLocalStorage("aiProviders", newValue); }, { deep: true });
    watch(selectedProvider, (newValue) => { saveStateToLocalStorage("selectedProvider", newValue); }, { deep: true });

    // Watcher for info box state
    watch(infoBoxes, (newValue) => { saveStateToLocalStorage("infoBoxes", newValue); }, { deep: true });

    return {
        // Jira state
        jiraServerAddress,
        jiraPersonalAccessToken,
        searchHistory,

        // UI state
        darkMode,
        leftDrawer,
        splitterRatio,
        showRightPane,
        lastSplitterRatio,

        // AI state
        aiProviderUrl,
        aiProviderApiKey,
        aiProviders,
        selectedProvider,

        // Info box state
        infoBoxes,
    };
});
