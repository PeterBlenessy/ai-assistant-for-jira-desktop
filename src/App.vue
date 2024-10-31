<script setup>
import { ref, onMounted, watch } from "vue";
import SettingsDialog from "./components/SettingsDialog.vue";
import { usePersistedStore } from "./stores/persisted-store";
import JiraClient from "./helpers/jira.js";
import JqlSearch from "./components/JqlSearch.vue";
import IssueDetails from "./components/IssueDetails.vue";
import SearchHistory from './components/SearchHistory.vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';

const $q = useQuasar();
const persistedStore = usePersistedStore();
const { darkMode, leftDrawer } = storeToRefs(persistedStore);

const showSettingsDialog = ref(false);
const isConnected = ref(false);
const user = ref(null);
const jqlSearch = ref(null);

function openSettingsDialog() {
    showSettingsDialog.value = true;
}

async function checkJiraConnection() {
    const { jiraServerAddress, jiraPersonalAccessToken } = persistedStore;

    if (jiraServerAddress === "" || jiraPersonalAccessToken === "") {
        console.log("Missing Jira server address or personal access token");
        showSettingsDialog.value = true;
        return;
    }

    const client = JiraClient({
        host: jiraServerAddress,
        personalAccessToken: jiraPersonalAccessToken,
    });

    client
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

// Watch for changes in both jiraServerAddress and jiraPersonalAccessToken
watch(
    () => [
        persistedStore.jiraServerAddress,
        persistedStore.jiraPersonalAccessToken,
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

</script>

<template>
    <q-layout view="hHh Lpr lff">
        <q-header class="bg-grey-10">
            <q-toolbar>
                <q-avatar rounded>
                    <img src="./assets/ai-assistant-logo.png" />
                </q-avatar>
                <q-toolbar-title> AI Assistant for Jira </q-toolbar-title>
                <q-btn dense flat :color="leftDrawer ? 'grey-4' : 'grey-6'"
                    :icon="leftDrawer ? 'mdi-dock-left' : 'mdi-dock-left'" @click="leftDrawer = !leftDrawer" />
                <q-btn dense flat icon="mdi-compare" :color="darkMode ? 'grey-4' : 'grey-6'"
                    @click="darkMode = !darkMode" />
                <q-btn flat dense color="grey-6" icon="mdi-cog" @click="openSettingsDialog" />
            </q-toolbar>
        </q-header>

        <q-drawer side="left" v-model="leftDrawer" bordered :width="250">
                <SearchHistory @select="handleHistorySelect" />
                <q-separator inset/>

            <q-item v-ripple class="fixed-bottom q-pa-xs">
                <q-item-section side>
                    <q-icon dense flat :color="isConnected ? 'positive' : 'negative'"
                        :name="isConnected ? 'mdi-lan-connect' : 'mdi-lan-disconnect'" />
                </q-item-section>
                <q-item-section>
                    <q-item-label>{{ isConnected ? user.displayName : "" }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-btn flat dense icon="mdi-cog" @click="openSettingsDialog" />
                </q-item-section>
            </q-item>
        </q-drawer>

        <q-page-container>
            <q-page>
                <JqlSearch ref="jqlSearch"/>
            </q-page>
        </q-page-container>

        <SettingsDialog v-model="showSettingsDialog" />
    </q-layout>
</template>
<style scoped>
/* Hide scrollbars on Macs (and WebKit based webviews) */
::-webkit-scrollbar {
    display: none;
}

/* Hide scrollbars on Windows (in IE and Edge)
body {
    overflow: auto;
    -ms-overflow-style: none;
}
/* Hide scrollbars in Firefox */
html {
    scrollbar-width: none;
}
</style>
