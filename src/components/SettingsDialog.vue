<template>
    <q-dialog v-model="model">
        <q-card style="width: 350px; max-width: 75vw">
            <q-card-section>
                <div class="text-h6">Jira Settings</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
                <q-input
                    v-model="jiraServerAddress"
                    label="JIRA Server Address"
                    dense
                    filled
                />
            </q-card-section>
            <q-card-section class="q-pt-none">
                <q-input
                    v-model="jiraPersonalAccessToken"
                    label="Personal Access Token"
                    dense
                    filled
                    :type="hidePAT ? 'password' : 'text'"
                >
                    <template v-slot:append>
                        <q-icon
                            class="cursor-pointer"
                            size="xs"
                            :name="hidePAT ? 'mdi-eye-off' : 'mdi-eye'"
                            @click="hidePAT = !hidePAT"
                        />
                    </template>
                </q-input>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="Cancel" v-close-popup />
                <q-btn
                    flat
                    label="Save"
                    color="primary"
                    @click="saveSettings"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref } from "vue";
import { usePersistedStore } from "../stores/persisted-store";

const model = defineModel({ default: false });

const persistedStore = usePersistedStore();

const jiraServerAddress = ref(persistedStore.jiraServerAddress);
const jiraPersonalAccessToken = ref(persistedStore.jiraPersonalAccessToken);
const hidePAT = ref(true);

function saveSettings() {
    if (
        jiraServerAddress.value === "" ||
        jiraPersonalAccessToken.value === ""
    ) {
        return;
    }
    persistedStore.jiraServerAddress = jiraServerAddress.value;
    persistedStore.jiraPersonalAccessToken = jiraPersonalAccessToken.value;
    model.value = false;
}
</script>
