<script setup>
import { ref, onMounted, watch } from "vue";
import SettingsDialog from "./components/SettingsDialog.vue";
import { usePersistedStore } from "./stores/persisted-store";
import { useJiraClient } from "./composables/JiraClient.js";
import JqlSearch from "./components/JqlSearch.vue";
import SearchHistory from './components/SearchHistory.vue';
import PromptManagement from './components/PromptManagement.vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import InfoDialog from './components/InfoDialog.vue';
import MarkdownDialog from "./components/MarkdownDialog.vue";

const $q = useQuasar();
const persistedStore = usePersistedStore();
const { darkMode, leftDrawer, splitterRatio, showRightPane } = storeToRefs(persistedStore);

const showSettingsDialog = ref(false);
const showMenu = ref(false);
const isConnected = ref(false);
const user = ref(null);
const jqlSearch = ref(null);
const showUserInfoDialog = ref(false);
const showMarkdownDialog = ref(false);
const markdownContent = ref('');
const markdownTitle = ref('');

const { jiraClient } = useJiraClient();

// Update the splitter limits ref
const splitterLimits = ref([20, 80]);

const appMenu = {
    about: {
        filename: 'ABOUT.md',
        title: 'About',
        icon: 'mdi-information-box-outline'
    },
    changelog: {
        filename: 'CHANGELOG.md',
        title: 'Changelog',
        icon: 'mdi-timeline-text-outline'
    },
    gettingStarted: {
        filename: 'GETTINGSTARTE.md', // Ensure this matches the actual filename
        title: 'Getting Started Guide',
        icon: 'mdi-file-document-outline'
    }
};

function openSettingsDialog() {
    showSettingsDialog.value = true;
}

async function checkJiraConnection() {
    if (persistedStore.selectedJiraConfig.serverAddress === "" || persistedStore.selectedJiraConfig.personalAccessToken === "") {
        console.log("Missing Jira server address or personal access token");
        showSettingsDialog.value = true;
        return;
    }

    jiraClient.value
        .getUser()
        .then((response) => {
            user.value = response;
            isConnected.value = true;
        })
        .catch((error) => {
            console.log(error);
            isConnected.value = false;
            showSettingsDialog.value = true;
        });
}

onMounted(() => {
    checkJiraConnection();
});

// Watch for changes in selectedJiraConfig
watch(
    () => [
        persistedStore.selectedJiraConfig.name,
        persistedStore.selectedJiraConfig.serverAddress,
        persistedStore.selectedJiraConfig.personalAccessToken
    ],
    checkJiraConnection,
);

// Watch for changes in darkMode and update Quasar's dark mode
watch(darkMode, (newValue) => {
    $q.dark.set(newValue);
});

// Set initial dark mode on component mount
onMounted(() => {
    $q.dark.set(darkMode.value);
});

function handleHistorySelect(query) {
    jqlSearch.value.setQuery(query);
}

function toggleRightPane() {
    if (showRightPane.value) {
        persistedStore.lastSplitterRatio = splitterRatio.value;
        splitterLimits.value = [100, 100];  // Force full width for left pane
        splitterRatio.value = 100;
        showRightPane.value = false;
    } else {
        showRightPane.value = true;
        splitterLimits.value = [20, 80];    // Restore normal limits
        splitterRatio.value = persistedStore.lastSplitterRatio;
    }
}

async function openMarkdownDialog(key) {
    try {
        const mdConfig = appMenu[key];
        const module = await import(`../docs/${mdConfig.filename}?raw`);
        markdownContent.value = module.default || module;
        markdownTitle.value = mdConfig.title;
        showMarkdownDialog.value = true;
    } catch (error) {
        console.error(`Error loading markdown: ${error}`);
        markdownContent.value = '# Error\nFailed to load content.';
        markdownTitle.value = 'Error';
        showMarkdownDialog.value = true;
    }
}

</script>

<template>
    <q-layout view="hHh LpR lff">
        <q-header class="bg-grey-10">

            <q-toolbar>
                <q-avatar rounded>
                    <img src="./assets/ai-assistant-logo.png" />
                </q-avatar>
                <q-toolbar-title> AI Assistant for Jira </q-toolbar-title>
                <q-btn dense flat icon="mdi-compare" :color="darkMode ? 'grey-4' : 'grey-6'"
                    @click="darkMode = !darkMode" />
                <q-btn dense flat :color="leftDrawer ? 'grey-4' : 'grey-6'"
                    :icon="leftDrawer ? 'mdi-dock-left' : 'mdi-dock-left'" @click="leftDrawer = !leftDrawer" />
                <q-btn dense flat :color="showRightPane ? 'grey-4' : 'grey-6'"
                    :icon="showRightPane ? 'mdi-dock-right' : 'mdi-dock-right'" @click="toggleRightPane" />
                <q-btn flat dense color="grey-6" icon="mdi-cog" @click="openSettingsDialog" />
                <q-btn flat dense color="grey-6" icon="mdi-dots-vertical" @click="showMenu = true">
                    <q-menu anchor="bottom right" self="top right">
                        <q-list dense style="min-width: 150px">
                            <q-item v-for="(md, key) in appMenu" 
                                    :key="key"
                                    clickable 
                                    dense 
                                    v-ripple 
                                    v-close-popup 
                                    @click="openMarkdownDialog(key)">
                                <q-item-section avatar>
                                    <q-icon :name="md.icon" />
                                </q-item-section>
                                <q-item-section>{{ md.title }}</q-item-section>
                            </q-item>
                        </q-list>
                    </q-menu>
                </q-btn>
            </q-toolbar>
        </q-header>

        <!-- Left drawer -->
        <q-drawer side="left" v-model="leftDrawer" bordered :width="200">
            <SearchHistory @select="handleHistorySelect" />
            <q-separator inset />

            <q-item class="fixed-bottom q-pa-sm" clickable @click="showUserInfoDialog = true">
                <q-item-section side>
                    <q-avatar v-if="isConnected">
                        <img :src="user.avatarUrls['48x48']" spinner-color="primary" style="width: 36px; height: 36px;" />
                    </q-avatar>
                </q-item-section>
                <q-item-section>
                    <q-item-label class="text-subtitle2">{{ isConnected ? user.displayName : "" }}</q-item-label>
                </q-item-section>
            </q-item>
        </q-drawer>

        <q-page-container>
            <q-page style="height: calc(100vh - 50px)">
                <q-splitter v-model="splitterRatio" :limits="splitterLimits" style="height: 100%;">
                    <!-- Left side of the page -->
                    <template v-slot:before>
                        <div class="q-pa-md" style="height: 100%; overflow: auto;">
                            <JqlSearch ref="jqlSearch" />
                        </div>
                    </template>

                    <!-- -->
                    <template v-slot:separator>
                        <q-avatar text-color="grey-6" size="60px" icon="mdi-drag-vertical" />
                    </template>

                    <!-- Right side of the page - Right pane -->
                    <template v-slot:after>
                        <div class="q-pa-md" style="height: 100%; overflow: auto;">
                            <PromptManagement />
                        </div>
                    </template>
                </q-splitter>

            </q-page>
        </q-page-container>

        <SettingsDialog v-model="showSettingsDialog" />
        <InfoDialog v-model="showUserInfoDialog" title="User Information" :info="user" />
        <MarkdownDialog
            v-model="showMarkdownDialog"
            :content="markdownContent"
            :title="markdownTitle"
        />
    </q-layout>
</template>
<style scoped>
/* Hide scrollbars on Macs (and WebKit based webviews) */
::-webkit-scrollbar {
    display: none;
}

/* Hide scrollbars on Windows (in IE and Edge) */
body {
    overflow: auto;
    -ms-overflow-style: none;
}

/* Hide scrollbars in Firefox */
html {
    scrollbar-width: none;
}
</style>
