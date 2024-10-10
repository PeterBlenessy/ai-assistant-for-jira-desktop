<script setup>
import { ref, onMounted } from "vue";
import SettingsDialog from "./components/SettingsDialog.vue";
import { usePersistedStore } from "../stores/persisted-store";
import { JiraClient } from "@atlassian/jira";

const showSettingsDialog = ref(false);
const persistedStore = usePersistedStore();
const isConnected = ref(false);

function openSettingsDialog() {
    showSettingsDialog.value = true;
}

async function checkJiraConnection() {
    const { jiraServerAddress, jiraPersonalAccessToken } = persistedStore;
    if (!jiraServerAddress || !jiraPersonalAccessToken) {
        showSettingsDialog.value = true;
        return;
    }

    try {
        const jira = new JiraClient({
            host: jiraServerAddress,
            authentication: {
                personalAccessToken: jiraPersonalAccessToken,
            },
        });

        const response = await jira.myself.getMyself();
        if (response) {
            isConnected.value = true;
        } else {
            isConnected.value = false;
        }
    } catch (error) {
        isConnected.value = false;
        showSettingsDialog.value = true;
    }
}

onMounted(() => {
    checkJiraConnection();
});
</script>

<template>
    <q-layout>
        <q-header>
            <q-toolbar>
                <q-avatar rounded>
                    <img src="./assets/ai-assistant-logo.png" />
                </q-avatar>
                <q-toolbar-title> AI Assistant for Jira </q-toolbar-title>
                <q-btn
                    icon="mdi-cog"
                    dense
                    flat
                    rounded
                    @click="openSettingsDialog"
                />
            </q-toolbar>
        </q-header>

        <q-page-container>
            <q-page class="container">
                <div class="row"></div>
            </q-page>
        </q-page-container>

        <q-footer>
            <q-toolbar>
                <q-toolbar-title>
                    <q-icon :name="isConnected ? 'mdi-lan-connect' : 'mdi-lan-disconnect'" />
                    {{ isConnected ? 'Connected' : 'Disconnected' }}
                </q-toolbar-title>
            </q-toolbar>
        </q-footer>

        <SettingsDialog v-model="showSettingsDialog" />
    </q-layout>
</template>
