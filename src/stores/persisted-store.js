import { ref, watch } from "vue";
import { defineStore } from "pinia";

export const usePersistedStore = defineStore("persisted-store", () => {
    const apiKey = ref(loadStateFromLocalStorage("apiKey") || "");
    const jiraServerAddress = ref(
        loadStateFromLocalStorage("jiraServerAddress") || "",
    );
    const jiraPersonalAccessToken = ref(
        loadStateFromLocalStorage("jiraPersonalAccessToken") || "",
    );
    const searchHistory = ref(loadStateFromLocalStorage("searchHistory") || []);
    const selectedIssue = ref(loadStateFromLocalStorage("selectedIssue") || null);

    const darkMode = ref(loadStateFromLocalStorage("darkMode") || false);

    // --- Persisted state management functions ---
    function saveStateToLocalStorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function loadStateFromLocalStorage(key) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    }

    // --- State change listeners ---
    watch(apiKey, (newValue) => {
        saveStateToLocalStorage("apiKey", newValue);
    });

    watch(jiraServerAddress, (newValue) => {
        saveStateToLocalStorage("jiraServerAddress", newValue);
    });

    watch(jiraPersonalAccessToken, (newValue) => {
        saveStateToLocalStorage("jiraPersonalAccessToken", newValue);
    });

    watch(
        searchHistory,
        (newValue) => {
            saveStateToLocalStorage("searchHistory", newValue);
        },
        { deep: true },
    );

    watch(
        selectedIssue,
        (newValue) => {
            saveStateToLocalStorage("selectedIssue", newValue);
        },
        { deep: true },
    );

    watch(darkMode, (newValue) => {
        saveStateToLocalStorage("darkMode", newValue);
    });

    return {
        apiKey,
        jiraServerAddress,
        jiraPersonalAccessToken,
        searchHistory,
        selectedIssue,
        darkMode,
    };
});
