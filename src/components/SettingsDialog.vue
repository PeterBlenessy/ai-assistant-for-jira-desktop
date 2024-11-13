<template>
    <q-dialog v-model="model">
        <q-card style="width: 350px; max-width: 75vw">
            <q-card-section>
                <q-tabs v-model="activeTab" dense active-color="primary" indicator-color="primary" inline-label no-caps>
                    <q-tab name="jira" label="Jira" icon="mdi-atlassian"/>
                    <q-tab name="provider" label="AI Providers" icon="mdi-creation"/>
                </q-tabs>

                <q-separator />

                <q-tab-panels v-model="activeTab">
                    <q-tab-panel name="jira">
                        <JiraSettings @cancel="closeDialog" />
                    </q-tab-panel>

                    <q-tab-panel name="provider">
                        <ProviderSettings @cancel="closeDialog" />
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

const model = defineModel({ default: false });

const activeTab = ref('jira');

function closeDialog() {
    // Close the dialog
    model.value = false;
}
</script>
