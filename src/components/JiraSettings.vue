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
                    >
                        <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps" @click.stop="selectConfig(scope.opt.value)">
                                <q-item-section>{{ scope.opt.label }}</q-item-section>
                                <q-item-section side>
                                    <q-btn flat round dense size="sm" icon="mdi-close"
                                        @click.stop="confirmDeleteConfig(scope.opt.value)" />
                                </q-item-section>
                            </q-item>
                        </template>
                    </q-select>
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

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteConfirm">
        <q-card>
            <q-card-section class="row items-center">
                <span class="q-ml-sm">Are you sure you want to delete this Jira configuration?</span>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="Cancel" color="primary" v-close-popup />
                <q-btn flat label="Delete" color="negative" @click="deleteConfig" v-close-popup />
            </q-card-actions>
        </q-card>
    </q-dialog>
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

const showDeleteConfirm = ref(false);
const configToDelete = ref(null);

function confirmDeleteConfig(configName) {
    if (persistedStore.jiraConfigs.length <= 1) {
        // Don't allow deleting the last config
        return;
    }
    configToDelete.value = configName;
    showDeleteConfirm.value = true;
}

function deleteConfig() {
    if (configToDelete.value) {
        const index = persistedStore.jiraConfigs.findIndex(c => c.name === configToDelete.value);
        if (index !== -1) {
            persistedStore.jiraConfigs.splice(index, 1);
            if (selectedJiraConfigName.value === configToDelete.value) {
                // Switch to first available config
                selectedJiraConfigName.value = persistedStore.jiraConfigs[0].name;
            }
        }
    }
    showDeleteConfirm.value = false;
    configToDelete.value = null;
}

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

function selectConfig(configName) {
    selectedJiraConfigName.value = configName;
}

watch(selectedJiraConfigName, (newValue) => {
    const config = persistedStore.jiraConfigs.find(c => c.name === newValue);
    if (config) {
        persistedStore.selectedJiraConfig = { ...config };
    }
});
</script>