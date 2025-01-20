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
                        @click="serverInfo ? showServerInfo = true : null"
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
                        :error="!!errors.name"
                        :error-message="errors.name"
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
                        :error="!!errors.serverAddress"
                        :error-message="errors.serverAddress"
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
                        :error="!!errors.personalAccessToken"
                        :error-message="errors.personalAccessToken"
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
import { usePersistedStore } from '../../stores/persisted-store';
import { useJiraClient } from "../../composables/JiraClient.js";
import InfoDialog from '../InfoDialog.vue';

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

const errors = ref({
    name: '',
    serverAddress: '',
    personalAccessToken: ''
});

function clearErrors() {
    errors.value = {
        name: '',
        serverAddress: '',
        personalAccessToken: ''
    };
}

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
                // Switch to first available config and update store
                if (persistedStore.jiraConfigs.length > 0) {
                    selectConfig(persistedStore.jiraConfigs[0].name);
                } else {
                    selectedJiraConfigName.value = '';
                    persistedStore.selectedJiraConfig = { name: '', serverAddress: '', personalAccessToken: '' };
                }
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
        // Create a complete copy of the config object
        editJiraConfigData.value = JSON.parse(JSON.stringify(config));
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

async function saveJiraConfig() {
    clearErrors();
    let hasErrors = false;

    // Name validation
    if (!editJiraConfigData.value.name?.trim()) {
        errors.value.name = 'Config name is required';
        hasErrors = true;
    } else if (mode.value === 'add' && 
        persistedStore.jiraConfigs.some(c => c.name === editJiraConfigData.value.name)) {
        errors.value.name = 'Config name already exists';
        hasErrors = true;
    }

    // Server address validation
    if (!editJiraConfigData.value.serverAddress?.trim()) {
        errors.value.serverAddress = 'Server address is required';
        hasErrors = true;
    } else {
        try {
            new URL(editJiraConfigData.value.serverAddress);
        } catch {
            errors.value.serverAddress = 'Invalid server address format';
            hasErrors = true;
        }
    }

    // PAT validation
    if (!editJiraConfigData.value.personalAccessToken?.trim()) {
        errors.value.personalAccessToken = 'Personal access token is required';
        hasErrors = true;
    }

    if (hasErrors) {
        return;
    }

    try {

        if (mode.value === 'add') {
            // Add new config. Deep copy.
            persistedStore.jiraConfigs.push(JSON.parse(JSON.stringify(editJiraConfigData.value)));
            // Auto-select if this is the first config
            if (persistedStore.jiraConfigs.length === 1) {
                selectedJiraConfigName.value = editJiraConfigData.value.name;
            }
        } else {
            // Update existing config
            const index = persistedStore.jiraConfigs.findIndex(
                c => c.name === selectedJiraConfigName.value
            );
            if (index !== -1) {
                // Replace the config at the index with a deep copy of the edited config
                persistedStore.jiraConfigs[index] = JSON.parse(JSON.stringify(editJiraConfigData.value));
                // Update selected config name in case it changed
                selectedJiraConfigName.value = editJiraConfigData.value.name;
            }
        }

        // Verify connection before saving
        //await checkJiraConnection(editJiraConfigData.value);

        mode.value = 'view';
        editJiraConfigData.value = null;
    } catch (error) {
        console.error('Failed to save Jira config:', error);
        // Show generic error in name field
        errors.value.name = error.message;
        throw error;
    }

}

function cancelEdit() {
    mode.value = 'view';
}

function selectConfig(configName) {
    selectedJiraConfigName.value = configName;
}

// Add a watcher for selectedJiraConfigName changes
watch(selectedJiraConfigName, (newConfigName) => {
    if (newConfigName) {
        const config = persistedStore.jiraConfigs.find(c => c.name === newConfigName);
        if (config) {
            persistedStore.selectedJiraConfig = JSON.parse(JSON.stringify(config));
        }
    }
});

watch(
    () => [
        persistedStore.selectedJiraConfig.name,
        persistedStore.selectedJiraConfig.serverAddress,
        persistedStore.selectedJiraConfig.personalAccessToken
    ],
    fetchServerInfo
);

// Watch for input changes to clear errors
watch(editJiraConfigData, () => {
    clearErrors();
}, { deep: true });

// Initial fetch of server info
if (selectedJiraConfigName.value) {
    fetchServerInfo();
}
</script>

<style scoped>
</style>