<template>
    <div>
        <!-- Jira Settings Section -->
        <q-item>
            <q-item-section>
                <q-input
                    v-model="jiraServerAddress"
                    label="JIRA Server Address"
                    dense
                    filled
                    :readonly="!isEditing"
                />
            </q-item-section>
        </q-item>
        <q-item>
            <q-item-section>
                <q-input
                    v-model="jiraPersonalAccessToken"
                    label="Personal Access Token"
                    dense
                    filled
                    :type="hidePAT ? 'password' : 'text'"
                    :readonly="!isEditing"
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
            </q-item-section>
        </q-item>

        <!-- Action buttons -->
        <q-item>
            <q-item-section align="right">
                <div class="q-gutter-sm">
                    <q-btn
                        v-if="isEditing"
                        label="Save"
                        color="primary"
                        @click="handleSave"
                        size="sm"
                    />
                    <q-btn
                        v-else
                        label="Edit"
                        @click="isEditing = true"
                        size="sm"
                    />
                    <q-btn
                        label="Cancel"
                        @click="cancel"
                        size="sm"
                    />
                </div>
            </q-item-section>
        </q-item>
    </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';
import { usePersistedStore } from '../stores/persisted-store';

const persistedStore = usePersistedStore();

const jiraServerAddress = ref(persistedStore.jiraServerAddress);
const jiraPersonalAccessToken = ref(persistedStore.jiraPersonalAccessToken);
const hidePAT = ref(true);
const isEditing = ref(false);

const emit = defineEmits(['cancel']);

function handleSave() {
    if (jiraServerAddress.value === "" || jiraPersonalAccessToken.value === "") {
        return;
    }

    // Save Jira settings
    persistedStore.jiraServerAddress = jiraServerAddress.value;
    persistedStore.jiraPersonalAccessToken = jiraPersonalAccessToken.value;

    // Exit edit mode
    isEditing.value = false;
}

function cancel() {
    // Emit cancel event
    emit('cancel');
}
</script>