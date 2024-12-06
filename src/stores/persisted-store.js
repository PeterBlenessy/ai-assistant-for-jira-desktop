import { ref, watch } from "vue";
import { defineStore } from "pinia";

// Define both default providers and their protected models
export const DEFAULT_PROVIDERS = [
  {
    id: "openai",
    name: "OpenAI",
    models: ["gpt-4", "gpt-4o"],
    baseURL: "https://api.openai.com/v1",
    apiKey: "",
  },
  {
    id: "ollama",
    name: "Ollama",
    models: ["llama3.2:1b", "mistral"],
    baseURL: "http://localhost:11434/v1",
    apiKey: "",
  },
];

// Export protected IDs for easy reference
export const PROTECTED_PROVIDER_IDS = DEFAULT_PROVIDERS.map((p) => p.id);
export const PROTECTED_MODELS = DEFAULT_PROVIDERS.reduce((acc, provider) => {
  acc[provider.id] = provider.models;
  return acc;
}, {});

export const usePersistedStore = defineStore("persisted-store", () => {
  // --- Jira state ---
  const searchHistory = ref(loadStateFromLocalStorage("searchHistory") || []);
  const jiraConfigs = ref(loadStateFromLocalStorage("jiraConfigs") || []);
  const selectedJiraConfig = ref(
    loadStateFromLocalStorage("selectedJiraConfig") || {
      name: "",
      serverAddress: "",
      personalAccessToken: "",
    }
  );

  // --- UI state ---
  const darkMode = ref(loadStateFromLocalStorage("darkMode") || false);
  const leftDrawer = ref(loadStateFromLocalStorage("leftDrawer") || false);
  const splitterRatio = ref(loadStateFromLocalStorage("splitterRatio") || 70);
  const showRightPane = ref(loadStateFromLocalStorage("showRightPane") ?? true);
  const lastSplitterRatio = ref(
    loadStateFromLocalStorage("lastSplitterRatio") || 70
  );

  // --- AI state ---
  const aiProviders = ref(
    loadStateFromLocalStorage("aiProviders") || DEFAULT_PROVIDERS
  );
  const selectedProvider = ref(
    loadStateFromLocalStorage("selectedProvider") || {
      providerId: "openai",
      model: DEFAULT_PROVIDERS[0].models[0], // Use first model of first provider as default
    }
  );

  // Add info box state
  const infoBoxes = ref(
    loadStateFromLocalStorage("infoBoxes") || [
      { infoBox: "PromptManagement", display: true },
    ]
  );

  // App Settings
  const isMockMode = ref(loadStateFromLocalStorage("isMockMode") || false);
  const showDismissedInfoBoxes = ref(
    loadStateFromLocalStorage("showDismissedInfoBoxes") || true
  );

  // Persisted state management functions
  function saveStateToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function loadStateFromLocalStorage(key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  // --- Jira state watchers ---
  watch(
    searchHistory,
    (newValue) => {
      saveStateToLocalStorage("searchHistory", newValue);
    },
    { deep: true }
  );
  watch(
    jiraConfigs,
    (newValue) => {
      saveStateToLocalStorage("jiraConfigs", newValue);
    },
    { deep: true }
  );
  watch(
    selectedJiraConfig,
    (newValue) => {
      saveStateToLocalStorage("selectedJiraConfig", newValue);
    },
    { deep: true }
  );

  // --- UI state watchers ---
  watch(darkMode, (newValue) => {
    saveStateToLocalStorage("darkMode", newValue);
  });
  watch(leftDrawer, (newValue) => {
    saveStateToLocalStorage("leftDrawer", newValue);
  });
  watch(splitterRatio, (newValue) => {
    saveStateToLocalStorage("splitterRatio", newValue);
  });
  watch(showRightPane, (newValue) => {
    saveStateToLocalStorage("showRightPane", newValue);
  });
  watch(lastSplitterRatio, (newValue) => {
    saveStateToLocalStorage("lastSplitterRatio", newValue);
  });

  // --- AI state watchers ---
  watch(
    aiProviders,
    (newValue) => {
      saveStateToLocalStorage("aiProviders", newValue);
    },
    { deep: true }
  );
  watch(
    selectedProvider,
    (newValue) => {
      saveStateToLocalStorage("selectedProvider", newValue);
    },
    { deep: true }
  );

  // Watcher for info box state
  watch(
    infoBoxes,
    (newValue) => {
      saveStateToLocalStorage("infoBoxes", newValue);
    },
    { deep: true }
  );

  // Watch settings for persistence
  watch(isMockMode, (newValue) =>
    saveStateToLocalStorage("isMockMode", newValue)
  );
  watch(showDismissedInfoBoxes, (newValue) =>
    saveStateToLocalStorage("showDismissedInfoBoxes", newValue)
  );

  function dismissInfoBox(infoBoxName) {
    let infoBox = infoBoxes.value.find((box) => box.infoBox === infoBoxName);
    if (!infoBox) {
      infoBox = { infoBox: infoBoxName, display: false };
      infoBoxes.value.push(infoBox);
    } else {
      infoBox.display = false;
    }
  }

  const isInfoBoxVisible = (infoBoxName) => {

    if (showDismissedInfoBoxes.value) {
      return true;
    }

    const infoBox = infoBoxes.value.find((box) => box.infoBox === infoBoxName);
    return infoBox ? infoBox.display : true;
  };

  return {
    // Jira state
    searchHistory,
    jiraConfigs,
    selectedJiraConfig,

    // UI state
    darkMode,
    leftDrawer,
    splitterRatio,
    showRightPane,
    lastSplitterRatio,

    // AI state
    aiProviders,
    selectedProvider,

    // Info box state
    infoBoxes,

    // App Settings
    isMockMode,
    showDismissedInfoBoxes,

    dismissInfoBox,
    isInfoBoxVisible,
  };
});
