import { ref, watch } from "vue";
import { defineStore } from "pinia";

export const usePersistedStore = defineStore("persisted-store", () => {
    
    const apiKey = ref(loadStateFromLocalStorage("apiKey") || "");

    function saveStateToLocalStorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function loadStateFromLocalStorage(key) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    }

    watch(apiKey, (newValue) => {
        saveStateToLocalStorage("apiKey", newValue);
    });

    return {
        apiKey,
    };
});
