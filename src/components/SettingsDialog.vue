<template>
    <q-dialog v-model="model">

        <q-card style="width: 350px; max-width: 75vw">
            <!-- Info Box Section -->
            <q-card-section v-if="isInfoBoxVisible('SettingsInfo')">
                <InfoBox :markdownContent="infoBoxMarkdown" @dismiss="dismissInfoBox('SettingsInfo')" />
            </q-card-section>

            <q-card-section>
                <q-tabs v-model="activeTab" dense active-color="primary" indicator-color="primary" inline-label no-caps>
                    <q-tab name="jira" label="Jira" icon="mdi-atlassian" />
                    <q-tab name="provider" label="AI Providers" icon="mdi-creation" />
                </q-tabs>

                <q-separator />

                <q-tab-panels v-model="activeTab">
                    <q-tab-panel name="jira" class="q-pa-none q-pt-sm">
                        <JiraSettings />
                    </q-tab-panel>

                    <q-tab-panel name="provider" class="q-pa-none q-pt-sm">
                        <ProviderSettings />
                    </q-tab-panel>
                </q-tab-panels>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref } from "vue";
import JiraSettings from './JiraSettings.vue';
import ProviderSettings from './ProviderSettings.vue';
import { usePersistedStore } from '../stores/persisted-store';
import InfoBox from './InfoBox.vue';

const persistedStore = usePersistedStore();
const { isInfoBoxVisible, dismissInfoBox } = persistedStore;

const model = defineModel({ default: false });
const activeTab = ref('jira');
// Markdown content for the InfoBox
const infoBoxMarkdown = `
You need to configure Jira and AI Providers to use this app. Click on the below tabs to configure them.
`;


</script>
