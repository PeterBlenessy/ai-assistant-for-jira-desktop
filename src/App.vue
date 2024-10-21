<script setup>
import { ref, onMounted, watch } from "vue";
import SettingsDialog from "./components/SettingsDialog.vue";
import { usePersistedStore } from "./stores/persisted-store";
import JiraClient from "./services/jira.js";
import JqlSearch from "./components/JqlSearch.vue";

const drawer = ref(false);
const showSettingsDialog = ref(false);
const persistedStore = usePersistedStore();
const isConnected = ref(false);
const user = ref(null);

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
</script>

<template>
    <q-layout view="hHh Lpr lfF">
        <q-header class="bg-grey-10">
            <q-toolbar>
                <q-btn
                    :icon="drawer ? 'mdi-menu-open' : 'mdi-menu'"
                    dense
                    flat
                    @click="drawer = !drawer"
                />
                <q-toolbar-title> AI Assistant for Jira </q-toolbar-title>
                <q-avatar rounded>
                    <img src="./assets/ai-assistant-logo.png" />
                </q-avatar>
            </q-toolbar>
        </q-header>

        <q-drawer v-model="drawer" bordered overlay>
            <q-item v-ripple class="fixed-bottom q-pa-xs">
                <q-item-section side>
                    <q-icon
                        flat
                        dense
                        :name="
                            isConnected
                                ? 'mdi-lan-connect'
                                : 'mdi-lan-disconnect'
                        "
                        :color="isConnected ? 'positive' : 'negative'"
                    />
                </q-item-section>
                <q-item-section>
                    <q-item-label>{{
                        isConnected ? user.displayName : ""
                    }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-btn
                        flat
                        dense
                        round
                        icon="mdi-cog"
                        aria-label="Settings"
                        @click="openSettingsDialog"
                    />
                </q-item-section>
            </q-item>
        </q-drawer>
        <q-page-container>
            <q-page class="container">
                <div class="row">
                    <JqlSearch />
                </div>
            </q-page>
        </q-page-container>

        <SettingsDialog v-model="showSettingsDialog" />
    </q-layout>
</template>
<style>
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
