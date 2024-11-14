<template>
    <div>
        <div v-if="mode === 'view'">
            <!-- Jira Config Dropdown -->
            <q-item>
                <q-item-section>
                    <q-select
                        v-model="selectedJiraConfigName"
                        :options="jiraConfigOptions"
                        label="JIRA Config"
                        dense
                        filled
                        emit-value
                        map-options
                    />
                </q-item-section>
            </q-item>
            <!-- Edit and Add New Buttons -->
            <q-item>
                <q-item-section align="right">
                    <div class="q-gutter-sm">
                        <q-btn label="Add New" @click="addJiraConfig" size="sm"/>
                        <q-btn label="Edit" @click="editJiraConfig" size="sm"/>
                    </div>
                </q-item-section>
            </q-item>
        </div>

        <div v-else>
            <!-- Config Name -->
            <q-item>
                <q-item-section>
                    <q-input
                        v-model="editJiraConfigData.name"
                        label="Config Name"
                        dense
                        filled
                    />
                </q-item-section>
            </q-item>
            <!-- Jira Server Address -->
            <q-item>
                <q-item-section>
                    <q-input
                        v-model="editJiraConfigData.serverAddress"
                        label="JIRA Server Address"
                        dense
                        filled
                    />
                </q-item-section>
            </q-item>
            <!-- Personal Access Token -->
            <q-item>
                <q-item-section>
                    <q-input
                        v-model="editJiraConfigData.personalAccessToken"
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
                </q-item-section>
            </q-item>
            <!-- Save and Cancel Buttons -->
            <q-item>
                <q-item-section align="right">
                    <div class="q-gutter-sm">
                        <q-btn label="Save" color="primary" size="sm" @click="saveJiraConfig" />
                        <q-btn label="Cancel" size="sm" @click="cancelEdit" />
                    </div>
                </q-item-section>
            </q-item>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { usePersistedStore } from '../stores/persisted-store';

const persistedStore = usePersistedStore();

const selectedJiraConfigName = ref(persistedStore.selectedJiraConfig.name);
const jiraConfigOptions = computed(() =>
    persistedStore.jiraConfigs.map(config => ({
        label: config.name,
        value: config.name
    }))
);

const mode = ref('view'); // 'view', 'edit', or 'add'

const editJiraConfigData = ref({
    name: '',
    serverAddress: '',
    personalAccessToken: ''
});

const hidePAT = ref(true);

function editJiraConfig() {
    mode.value = 'edit';
    const config = persistedStore.jiraConfigs.find(c => c.name === selectedJiraConfigName.value);
    if (config) {
        editJiraConfigData.value = { ...config };
    }
}

function addJiraConfig() {
    mode.value = 'add';
    editJiraConfigData.value = {
        name: '',
        serverAddress: '',
        personalAccessToken: ''
    };
}

function saveJiraConfig() {
    if (!editJiraConfigData.value.name || !editJiraConfigData.value.serverAddress) {
        return;
    }
    if (mode.value === 'edit') {
        const index = persistedStore.jiraConfigs.findIndex(c => c.name === editJiraConfigData.value.name);
        if (index !== -1) {
            persistedStore.jiraConfigs[index] = { ...editJiraConfigData.value };
            selectedJiraConfigName.value = editJiraConfigData.value.name;
        }
    } else if (mode.value === 'add') {
        const newConfig = { ...editJiraConfigData.value };
        if (!persistedStore.jiraConfigs.some(c => c.name === newConfig.name)) {
            persistedStore.jiraConfigs.push(newConfig);
            selectedJiraConfigName.value = newConfig.name;
        }
    }
    persistedStore.selectedJiraConfig = { ...editJiraConfigData.value };
    mode.value = 'view';
}

function cancelEdit() {
    mode.value = 'view';
}

watch(selectedJiraConfigName, (newValue) => {
    const config = persistedStore.jiraConfigs.find(c => c.name === newValue);
    if (config) {
        persistedStore.selectedJiraConfig = { ...config };
    }
});
</script>