import { ref, watch } from "vue";
import { defineStore } from "pinia";

export const usePersistedStore = defineStore("persisted-store", () => {
    const jiraServerAddress = ref(
        loadStateFromLocalStorage("jiraServerAddress") || "",
    );
    const jiraPersonalAccessToken = ref(
        loadStateFromLocalStorage("jiraPersonalAccessToken") || "",
    );
    const searchHistory = ref(loadStateFromLocalStorage("searchHistory") || []);

    const darkMode = ref(loadStateFromLocalStorage("darkMode") || false);
    const leftDrawer = ref(loadStateFromLocalStorage("leftDrawer") || false);

    const aiProviderUrl = ref(loadStateFromLocalStorage("aiProviderUrl") || "");
    const aiProviderApiKey = ref(loadStateFromLocalStorage("aiProviderApiKey") || "");

    // --- Persisted state management functions ---
    function saveStateToLocalStorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value)); 
    }

    function loadStateFromLocalStorage(key) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    }

    // --- State change listeners ---
    watch(jiraServerAddress, (newValue) => {saveStateToLocalStorage("jiraServerAddress", newValue);});
    watch(jiraPersonalAccessToken, (newValue) => { saveStateToLocalStorage("jiraPersonalAccessToken", newValue); });
    watch(searchHistory, (newValue) => { saveStateToLocalStorage("searchHistory", newValue); }, { deep: true });
    watch(darkMode, (newValue) => { saveStateToLocalStorage("darkMode", newValue); });
    watch(leftDrawer, (newValue) => { saveStateToLocalStorage("leftDrawer", newValue); });
    watch(aiProviderUrl, (newValue) => { saveStateToLocalStorage("aiProviderUrl", newValue); });
    watch(aiProviderApiKey, (newValue) => { saveStateToLocalStorage("aiProviderApiKey", newValue); });

    return {
        jiraServerAddress,
        jiraPersonalAccessToken,
        searchHistory,
        darkMode,
        leftDrawer,
        aiProviderUrl,
        aiProviderApiKey,
    };
});
