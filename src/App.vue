<script setup>
import { ref, onMounted } from "vue";
import SettingsDialog from "./components/SettingsDialog.vue";
import { usePersistedStore } from "./stores/persisted-store";
import JiraClient from "./services/jira.js";

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
</script>

<template>
    <q-layout view="lHh Lpr lfF">
        <q-header class="bg-grey-10">
            <q-toolbar>
                <q-avatar rounded>
                    <img src="./assets/ai-assistant-logo.png" />
                </q-avatar>
                <q-toolbar-title> AI Assistant for Jira </q-toolbar-title>
                <q-btn icon="mdi-cog" dense flat @click="openSettingsDialog" />
            </q-toolbar>
        </q-header>

        <q-page-container>
            <q-page class="container">
                <div class="row"></div>
            </q-page>
        </q-page-container>

        <q-footer class="bg-grey-10">
            <q-toolbar>
                <q-toolbar-title>
                    <q-btn
                        flat
                        dense
                        :icon="
                            isConnected
                                ? 'mdi-lan-connect'
                                : 'mdi-lan-disconnect'
                        "
                        :color="isConnected ? 'positive' : 'negative'"
                        @click="
                            isConnected
                                ? openSettingsDialog()
                                : checkJiraConnection()
                        "
                    />
                </q-toolbar-title>
            </q-toolbar>
        </q-footer>

        <SettingsDialog v-model="showSettingsDialog" />
    </q-layout>
</template>
