<template>
    <div>
        <div v-if="mode === 'view'">
            <!-- Jira Config Dropdown -->
            <q-item class="q-pa-none">
                <q-item-section>
                    <q-select
                        v-model="selectedJiraConfigName"
                        :options="jiraConfigOptions"
                        label="JIRA Config"
                        dense
                        options-dense
                        filled
                        emit-value
                        map-options
                    >
                        <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps" @click.stop="selectConfig(scope.opt.value)">
                                <q-item-section>{{ scope.opt.label }}</q-item-section>
                                <q-item-section side>
                                    <q-btn flat dense size="sm" icon="mdi-close"
                                        @click.stop="confirmDeleteConfig(scope.opt.value)" />
                                </q-item-section>
                            </q-item>
                        </template>
                    </q-select>
                </q-item-section>
            </q-item>

            <!-- Server Info -->
            <q-item class="q-pa-none">
                <q-item-section />
                <q-item-section side>
                    <q-badge 
                        label="Jira Server: "
                        color="grey" 
                        outline 
                        size="xs"
                        class="cursor-pointer"
                        @click="showServerInfo = true"
                    >
                        {{ serverInfo ? 'version '+serverInfo.version : 'no connection' }}
                        <q-icon class="q-pl-md" size="xs" 
                            :name="serverInfo ? 'mdi-server-network' : 'mdi-server-network-off'" 
                            :color="serverInfo ? 'positive' : 'negative'" 
                        />
                    </q-badge>
                </q-item-section>
            </q-item>

            <!-- Edit and Add New Buttons -->
            <q-item class="q-pa-none">
                <q-item-section align="right">
                    <div class="q-gutter-sm q-ma-none">
                        <q-btn icon="mdi-plus" label="Add New" @click="addJiraConfig" size="sm" class="q-pl-xs" />
                        <q-btn icon="mdi-pencil-outline" label="Edit" @click="editJiraConfig" size="sm" class="q-pl-xs" />
                    </div>
                </q-item-section>
            </q-item>
        </div>

        <div v-else>
            <!-- Config Name -->
            <q-item class="q-pa-none">
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
            <q-item class="q-pa-none">
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
            <q-item class="q-pa-none">
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
            <q-item class="q-pa-none">
                <q-item-section align="right">
                    <div class="q-gutter-sm q-ma-none">
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
                <q-btn dense label="Cancel" size="sm" v-close-popup />
                <q-btn dense label="Delete" color="negative" size="sm" @click="deleteConfig" v-close-popup />
            </q-card-actions>
        </q-card>
    </q-dialog>

    <!-- Server Info Dialog -->
    <InfoDialog
        v-model="showServerInfo"
        title="Jira Server Information"
        :info="serverInfo"
        :exclude-keys="['healthChecks']"
    />
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { usePersistedStore } from '../stores/persisted-store';
import { useJiraClient } from "../composables/JiraClient.js";
import InfoDialog from './InfoDialog.vue';

const persistedStore = usePersistedStore();
const { jiraClient } = useJiraClient();

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

const serverInfo = ref(null);
const showServerInfo = ref(false);

async function fetchServerInfo() {
    try {
        serverInfo.value = await jiraClient.value.getServerInfo();
    } catch (error) {
        console.error('Failed to fetch server info:', error);
        serverInfo.value = null;
    }
}

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
    if (!editJiraConfigData.value.name || !editJiraConfigData.value.serverAddress || !editJiraConfigData.value.personalAccessToken) {
        return;
    }
    if (mode.value === 'edit') {
        // Find the original config being edited
        const originalConfig = persistedStore.jiraConfigs.find(c => c.name === selectedJiraConfigName.value);
        if (originalConfig) {
            // Find the index of the original config
            const index = persistedStore.jiraConfigs.indexOf(originalConfig);
            // Update the config at that index
            persistedStore.jiraConfigs[index] = { ...editJiraConfigData.value };
            // Update selected config name in case it changed
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

watch(
    () => [
        persistedStore.selectedJiraConfig.name,
        persistedStore.selectedJiraConfig.serverAddress,
        persistedStore.selectedJiraConfig.personalAccessToken
    ],
    fetchServerInfo
);

// Initial fetch of server info
if (selectedJiraConfigName.value) {
    fetchServerInfo();
}
</script>

<style scoped>
</style>