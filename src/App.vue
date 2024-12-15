<template>
    <q-layout view="hHh LpR lff">
        <q-header class="bg-grey-10">

            <q-toolbar>
                <q-avatar rounded>
                    <img src="./assets/ai-assistant-logo.png" />
                </q-avatar>
                <q-toolbar-title> AI Assistant for Jira </q-toolbar-title>
                <q-btn dense flat icon="mdi-compare" :color="darkMode ? 'grey-4' : 'grey-6'"
                    @click="darkMode = !darkMode">
                    <q-tooltip>Toggle Dark Mode</q-tooltip>
                </q-btn>
                <q-btn dense flat :color="leftDrawer ? 'grey-4' : 'grey-6'"
                    :icon="leftDrawer ? 'mdi-dock-left' : 'mdi-dock-left'" @click="leftDrawer = !leftDrawer" >
                    <q-tooltip>Toggle Primary Side Panel</q-tooltip>
                </q-btn>
                <q-btn dense flat :color="showRightPane ? 'grey-4' : 'grey-6'"
                    :icon="showRightPane ? 'mdi-dock-right' : 'mdi-dock-right'" @click="toggleRightPane" >
                    <q-tooltip>Toggle AI Prompt Management Panel</q-tooltip>
                </q-btn>
                <q-btn flat dense color="grey-6" icon="mdi-cog" @click="openSettingsDialog" >
                    <q-tooltip>Settings</q-tooltip>
                </q-btn>
                <q-btn flat dense color="grey-6" icon="mdi-dots-vertical" @click="showMenu = true">
                    <q-badge v-if="isUpdateAvailable" floating rounded />
                    <q-tooltip>Menu</q-tooltip>
                    <q-menu anchor="bottom right" self="top right" class="q-pa-sm">
                        <q-list dense style="min-width: 100px; width: 230px">
                            <q-item v-for="(md, key) in appMenu" :key="key" clickable v-ripple v-close-popup
                                @click="openMarkdownDialog(key)">
                                <q-item-section avatar>
                                    <q-icon :name="md.icon" />
                                </q-item-section>
                                <q-item-section>{{ md.title }}</q-item-section>
                            </q-item>
                            <q-separator spaced inset class="q-ma-sm" />
                            <q-item clickable @click.stop="handleClickUpdateButton()">
                                <q-item-section avatar>
                                    <template v-if="isChecking">
                                        <q-spinner color="primary" size="1.5em" />
                                    </template>
                                    <template v-else-if="progress > 0 && progress < 100">
                                        <q-spinner color="primary" size="1.5em" />
                                    </template>
                                    <q-icon v-else
                                        :name="progress == 0 ? 'mdi-download' : 'mdi-restart'"
                                        :color="isUpdateAvailable ? 'positive' : ''" />
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label class="text-no-wrap">
                                        {{ 
                                            isChecking ? 'Checking for updates...' :
                                            isUpdateAvailable ? 'Update available' : 
                                            'Check for updates...'
                                        }}
                                    </q-item-label>
                                    <q-item-label v-if="isUpdateAvailable" caption lines="1">{{ 'Version ' + newUpdate.version }}</q-item-label>
                                </q-item-section>
                                <q-tooltip>{{ 
                                    isChecking ? 'Checking for updates...' :
                                    progress === 100 ? 'Restart and install update' :
                                    isUpdateAvailable ? 'Download update' :
                                    'Check for updates'
                                }}</q-tooltip>
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

            <q-item v-if="isConnected" class="fixed-bottom q-pa-sm" clickable @click="showUserInfoDialog = true">
                <q-item-section side>
                    <q-avatar>
                        <img :src="user.avatarUrls['48x48']" spinner-color="primary"
                            style="width: 36px; height: 36px;" />
                    </q-avatar>
                </q-item-section>
                <q-item-section>
                    <q-item-label class="text-subtitle2">{{ isConnected ? user.displayName : "" }}</q-item-label>
                </q-item-section>
                <q-tooltip>Display user profile information</q-tooltip>
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
        <MarkdownDialog v-model="showMarkdownDialog" :content="markdownContent" :title="markdownTitle" />
    </q-layout>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import SettingsDialog from "./components/Settings/SettingsDialog.vue";
import { usePersistedStore } from "./stores/persisted-store";
import { useJiraClient } from "./composables/JiraClient.js";
import JqlSearch from "./components/JqlSearch.vue";
import SearchHistory from './components/SearchHistory.vue';
import PromptManagement from './components/PromptManagement.vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import InfoDialog from './components/InfoDialog.vue';
import MarkdownDialog from "./components/MarkdownDialog.vue";

import aboutMd from '../docs/ABOUT.md?raw';
import changelogMd from '../docs/CHANGELOG.md?raw';
import gettingStartedMd from '../docs/GETTINGSTARTED.md?raw';

import { useUpdater } from "./composables/Updater.js";
import { useLogger } from './composables/Logger.js';

const {
    checkForUpdates,
    downloadAndInstall,
    downloaded,
    contentLength,
    relaunchApp,
} = useUpdater();

const $q = useQuasar();
const logger = useLogger();
const { jiraClient } = useJiraClient();
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

// Update the splitter limits ref
const splitterLimits = ref([20, 80]);

const appMenu = {
    about: {
        content: aboutMd,
        title: 'About',
        icon: 'mdi-information-box-outline'
    },
    changelog: {
        content: changelogMd,
        title: 'Changelog',
        icon: 'mdi-timeline-text-outline'
    },
    gettingStarted: {
        content: gettingStartedMd,
        title: 'Getting Started',
        icon: 'mdi-file-document-outline'
    }
};

function openSettingsDialog() {
    showSettingsDialog.value = true;
}

// --- Updater ---
const isUpdateAvailable = ref(false);
const progress = ref(0);
const newUpdate = ref(null);
watch(downloaded, () => {
    progress.value = Math.round((downloaded.value / contentLength.value) * 100);
});

const isChecking = ref(false);

const handleClickUpdateButton = async () => {
    try {
        if (!isUpdateAvailable.value) {
            isChecking.value = true;
            newUpdate.value = await checkForUpdates();
            if (newUpdate.value) {
                isUpdateAvailable.value = true;
            } else {
                $q.notify({message: "No updates available"});
            }
            isChecking.value = false;
        }

        if (isUpdateAvailable.value && progress.value == 0) {
            downloadAndInstall();
        }

        if (isUpdateAvailable.value && progress.value == 100) {
            relaunchApp();
        }
    } catch (error) {
        isChecking.value = false;
        logger.error(`[app] Checking for updates error: ${error}`);
    }
};

onMounted(() => {
    isChecking.value = true;
    checkForUpdates().then((update) => {
        if (update) {
            isUpdateAvailable.value = true;
            newUpdate.value = update;
        }
    }).catch((error) => {
        logger.error(`[app] Checking for updates error: ${error}`);
    }).finally(() => {
        isChecking.value = false;
    });
});

// --- Jira ---
async function checkJiraConnection() {
    if (persistedStore.selectedJiraConfig.serverAddress === "" || persistedStore.selectedJiraConfig.personalAccessToken === "") {
        logger.log("[app] Missing Jira server address or personal access token");
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
            logger.error(`[app] - ${error}`);
            user.value = null;
            isConnected.value = false;
            showSettingsDialog.value = true;
        });
}

onMounted(() => {
    checkJiraConnection();
});

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
    const mdConfig = appMenu[key];
    markdownContent.value = mdConfig.content;
    markdownTitle.value = mdConfig.title;
    showMarkdownDialog.value = true;
}

</script>

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
