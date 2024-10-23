<script setup>
import { ref, onMounted, watch } from "vue";
import SettingsDialog from "./components/SettingsDialog.vue";
import { usePersistedStore } from "./stores/persisted-store";
import JiraClient from "./services/jira.js";
import JqlSearch from "./components/JqlSearch.vue";
import IssueDetails from "./components/IssueDetails.vue";

const leftDrawer = ref(false);
const rightDrawer = ref(false);
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

// Watch for changes in selectedIssue and open the drawer when it changes
watch(
    () => persistedStore.selectedIssue,
    (newIssue) => {
        if (newIssue) {
            rightDrawer.value = true;
        }
    },
    { deep: true }
);
</script>

<template>
    <q-layout view="hHh Lpr lff">
        <q-header class="bg-grey-10">
            <q-toolbar>
                <q-avatar rounded>
                    <img src="./assets/ai-assistant-logo.png" />
                </q-avatar>
                <q-toolbar-title> AI Assistant for Jira </q-toolbar-title>
                <q-btn dense flat 
                    :color="leftDrawer ? 'grey-4' : 'grey-6'"
                    :icon="leftDrawer ? 'mdi-dock-left' : 'mdi-dock-left'"
                    @click="leftDrawer = !leftDrawer"
                />
                <q-btn dense flat
                    :color="rightDrawer ? 'grey-4' : 'grey-6'"
                    :icon="rightDrawer ? 'mdi-dock-right' : 'mdi-dock-right'"
                    @click="rightDrawer = !rightDrawer"
                />
                <q-btn flat dense color="grey-6" icon="mdi-cog" @click="openSettingsDialog" />

            </q-toolbar>
        </q-header>

        <q-drawer side="left" v-model="leftDrawer" bordered overlay :width="250" >
            <div class="absolute" style="top: 15px; right: -17px">
                <q-btn dense round icon="mdi-chevron-left-circle" @click="leftDrawer = false" />
            </div>

            <q-item v-ripple class="fixed-bottom q-pa-xs">
                <q-item-section side>
                    <q-icon dense flat 
                        :color="isConnected ? 'positive' : 'negative'"
                        :name=" isConnected ? 'mdi-lan-connect' : 'mdi-lan-disconnect'"
                    />
                </q-item-section>
                <q-item-section>
                    <q-item-label>{{ isConnected ? user.displayName : "" }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-btn flat dense icon="mdi-cog" @click="openSettingsDialog" />
                </q-item-section>
            </q-item>
        </q-drawer>

        <q-drawer side="right" v-model="rightDrawer" bordered overlay :width="700" >
            <q-btn dense flat icon="mdi-close" class="absolute-top-right q-mt-md q-mr-md"
                @click="rightDrawer = false"
            />
            <IssueDetails :issue="persistedStore.selectedIssue" />
        </q-drawer>

        <q-page-container>
            <q-page>
                <JqlSearch />
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
