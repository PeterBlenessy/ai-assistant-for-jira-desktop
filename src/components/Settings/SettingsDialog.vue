<template>
    <q-dialog v-model="model">
        <q-card style="width: 600px; max-width: 75vw">
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

                <q-splitter v-model="splitterModel" style="min-height: 176px" disable>
                    <template v-slot:before>
                        <q-list dense>
                            <q-item v-for="tab in tabs" :key="tab.name" 
                                clickable
                                @click="activeTab = tab.name" 
                                :active="tab.name == activeTab"
                                active-class="text-primary"
                            >
                                <q-item-section avatar>
                                    <q-icon :name="tab.icon" />
                                </q-item-section>
                                <q-item-section>
                                    {{ tab.label }}
                                </q-item-section>
                            </q-item>
                        </q-list>
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
import { ref, watch } from "vue";
import JiraSettings from './JiraSettings.vue';
import ProviderSettings from './ProviderSettings.vue';
import GeneralSettings from './GeneralSettings.vue';
import { usePersistedStore } from '../../stores/persisted-store';
import { storeToRefs } from 'pinia';
import InfoBox from '../InfoBox.vue';

const persistedStore = usePersistedStore();
const { isInfoBoxVisible, dismissInfoBox } = persistedStore;
const { lastSettingsTab } = storeToRefs(persistedStore);

const model = defineModel({ default: false });
const splitterModel = ref(30);
const activeTab = ref(lastSettingsTab.value);

// Watch for tab changes and update the persisted store
watch(activeTab, (newTab) => {
    lastSettingsTab.value = newTab;
});

// Markdown content for the InfoBox
const infoBoxMarkdown = `
In order to be able to use the AI Assistant for Jira, you need to configure your Jira Server and AI providers.
If you just want to try it out, you can enable the mock mode.`;

const tabs = [
    { name: 'jira', label: 'Jira', icon: 'mdi-atlassian' },
    { name: 'provider', label: 'AI Providers', icon: 'mdi-creation' },
    { name: 'general', label: 'General', icon: 'mdi-cog' }
];
</script>
<style scoped>
.align-left {
    justify-content: left !important;
    align-items: left !important;
}
</style>