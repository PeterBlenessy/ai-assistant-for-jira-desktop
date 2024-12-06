<template>
    <q-dialog v-model="model">
        <q-card style="width: 550px; max-width: 75vw">
            <q-card-section class="row q-pa-sm q-pl-md vertical-middle" style="height: 45px">
                <div class="text-subtitle1 text-weight-bold">Settings</div>
                <q-space />
                <q-btn icon="mdi-close" flat dense v-close-popup />
            </q-card-section>

            <q-separator />

            <!-- Info Box Section -->
            <q-card-section v-if="isInfoBoxVisible('SettingsInfo')">
                <InfoBox :markdownContent="infoBoxMarkdown" @dismiss="dismissInfoBox('SettingsInfo')" />
            </q-card-section>

            <q-card-section class="q-pa-none">

                <q-splitter v-model="splitterModel" style="min-height: 176px">
                    <template v-slot:before>
                        <q-tabs v-model="activeTab" vertical dense active-color="primary" indicator-color="primary"
                            inline-label no-caps class="q-pt-sm">
                            <q-tab name="jira" label="Jira" icon="mdi-atlassian" />
                            <q-tab name="provider" label="AI Providers" icon="mdi-creation" />
                            <q-tab name="general" label="General" icon="mdi-cog" />
                        </q-tabs>
                    </template>

                    <template v-slot:after>
                        <q-tab-panels v-model="activeTab" class="q-pa-none">
                            <q-tab-panel name="jira">
                                <JiraSettings />
                            </q-tab-panel>

                            <q-tab-panel name="provider">
                                <ProviderSettings />
                            </q-tab-panel>

                            <q-tab-panel name="general">
                                <GeneralSettings />
                            </q-tab-panel>
                        </q-tab-panels>
                    </template>
                </q-splitter>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref } from "vue";
import JiraSettings from './JiraSettings.vue';
import ProviderSettings from './ProviderSettings.vue';
import GeneralSettings from './GeneralSettings.vue';
import { usePersistedStore } from '../stores/persisted-store';
import InfoBox from './InfoBox.vue';

const persistedStore = usePersistedStore();
const { isInfoBoxVisible, dismissInfoBox } = persistedStore;

const model = defineModel({ default: false });
const activeTab = ref('jira');
// Markdown content for the InfoBox
const infoBoxMarkdown = `
In order to be able to use the AI Assistant for Jira, you need to configure your Jira Server and AI providers.
If you just want to try it out, you can enable the mock mode.`;
</script>
<style scoped>
.align-left {
    justify-content: left !important;
    align-items: left !important;
}
</style>