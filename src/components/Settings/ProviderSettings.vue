<template>
    <div>
        <div v-if="mode === 'view'">
            <!-- AI Provider Dropdown -->
            <q-item class="q-pa-none">
                <q-item-section>
                    <q-select
                        v-model="selectedProviderId"
                        :options="providerOptions"
                        label="AI Provider"
                        dense
                        options-dense
                        filled
                        emit-value
                        map-options
                    >
                        <template v-slot:append>
                            <q-btn v-if="isOllamaProviderById(selectedProviderId)"
                                flat dense size="sm" 
                                :icon="ollamaRunning ? 'mdi-circle' : 'mdi-restart'"
                                :color="ollamaRunning ? 'positive' : 'grey'"
                                :loading="restartingOllama"
                                @click.stop.prevent="configureAndRestartOllama"
                            >
                                <q-tooltip>{{ ollamaRunning ? 'Ollama is running' : 'Configure & Restart Ollama' }}</q-tooltip>
                            </q-btn>
                        </template>
                        <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps" @click.stop="selectProvider(scope.opt.value)">
                                <q-item-section>{{ scope.opt.label }}</q-item-section>
                                <q-item-section side class="q-gutter-x-sm">
                                    <!-- Delete button -->
                                    <q-btn v-if="!PROTECTED_PROVIDER_IDS.includes(scope.opt.value)"
                                        flat dense size="sm" 
                                        icon="mdi-close"
                                        @click.stop="confirmDeleteProvider(scope.opt.value)" 
                                    />
                                </q-item-section>
                            </q-item>
                        </template>
                    </q-select>
                </q-item-section>
            </q-item>
            <!-- Model Selection Dropdown -->
            <q-item class="q-pa-none">
                <q-item-section>
                    <q-select
                        v-model="selectedModel"
                        :options="modelOptions"
                        label="AI Model"
                        dense
                        options-dense
                        filled
                        emit-value
                        map-options
                    >
                        <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps">
                                <q-item-section>{{ scope.opt.label }}</q-item-section>
                                <q-item-section side v-if="!isProtectedModel(scope.opt.value)">
                                    <q-btn flat dense size="sm" icon="mdi-close"
                                        @click.stop="confirmDeleteModel(scope.opt.value)" />
                                </q-item-section>
                            </q-item>
                        </template>
                    </q-select>
                </q-item-section>
            </q-item>
            <!-- Edit and Add New Buttons -->
            <q-item class="q-pa-none">
                <q-item-section align="right">
                    <div class="q-gutter-sm q-ma-none">
                        <q-btn icon="mdi-plus" label="Add New" @click="addProvider" size="sm" class="q-pl-xs" />
                        <q-btn icon="mdi-pencil-outline" label="Edit" @click="editProvider" size="sm" class="q-pl-xs" />
                    </div>
                </q-item-section>
            </q-item>
        </div>

        <div v-else>
            <!-- Provider Name -->
            <q-item class="q-pa-none">
                <q-item-section>
                    <q-input
                        v-model="editProviderData.name"
                        label="Provider Name"
                        dense
                        filled
                        :error="!!errors.name"
                        :error-message="errors.name"
                    />
                </q-item-section>
            </q-item>
            <!-- API Endpoint -->
            <q-item class="q-pa-none">
                <q-item-section>
                    <q-input
                        v-model="editProviderData.baseURL"
                        label="API Endpoint"
                        dense
                        filled
                        :error="!!errors.baseURL"
                        :error-message="errors.baseURL"
                    />
                </q-item-section>
            </q-item>
            <!-- API Key -->
            <q-item class="q-pa-none">
                <q-item-section>
                    <q-input
                        v-model="editProviderData.apiKey"
                        label="API Key"
                        dense
                        filled
                        :type="hideApiKey ? 'password' : 'text'"
                        :error="!!errors.apiKey"
                        :error-message="errors.apiKey"
                    >
                        <template v-slot:append>
                            <q-icon
                                class="cursor-pointer"
                                size="xs"
                                :name="hideApiKey ? 'mdi-eye-off' : 'mdi-eye'"
                                @click="hideApiKey = !hideApiKey"
                            />
                        </template>
                    </q-input>
                </q-item-section>
            </q-item>
            <!-- AI Model -->
            <q-item class="q-pa-none">
                <q-item-section>
                    <q-select
                        v-model="editProviderData.models"
                        label="AI Models"
                        dense
                        filled
                        use-chips
                        use-input
                        multiple
                        new-value-mode="add-unique"
                        input-debounce="0"
                        hide-dropdown-icon
                        :error="!!errors.models"
                        :error-message="errors.models"
                    />
                </q-item-section>
            </q-item>
            <!-- Save and Cancel Buttons -->
            <q-item class="q-pa-none">
                <q-item-section align="right">
                    <div class="q-gutter-sm q-ma-none">
                        <q-btn label="Save" color="primary" size="sm" @click="saveProvider" />
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
                <span class="q-ml-sm">Are you sure you want to delete this provider?</span>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn dense label="Cancel" size="sm" v-close-popup />
                <q-btn dense label="Delete" color="negative" size="sm" @click="deleteProvider" v-close-popup />
            </q-card-actions>
        </q-card>
    </q-dialog>

    <!-- Delete Model Confirmation Dialog -->
    <q-dialog v-model="showDeleteModelConfirm">
        <q-card>
            <q-card-section class="row items-center">
                <span class="q-ml-sm">Are you sure you want to delete this model?</span>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn dense label="Cancel" size="sm" v-close-popup />
                <q-btn dense label="Delete" color="negative" size="sm" @click="deleteModel" v-close-popup />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Command } from '@tauri-apps/plugin-shell';
import {
    usePersistedStore,
    PROTECTED_PROVIDER_IDS,
    PROTECTED_MODELS
} from '../../stores/persisted-store';

const persistedStore = usePersistedStore();

const selectedProviderId = ref(persistedStore.selectedProvider.providerId);
const selectedModel = ref(persistedStore.selectedProvider.model);

const providerOptions = computed(() =>
    persistedStore.aiProviders.map(p => ({
        label: p.name,
        value: p.id
    }))
);

const modelOptions = computed(() => {
    const provider = persistedStore.aiProviders.find(p => p.id === selectedProviderId.value);
    return provider ? provider.models.map(model => ({
        label: model,
        value: model
    })) : [];
});

const mode = ref('view'); // 'view', 'edit', or 'add'

const editProviderData = ref({
    id: '',
    name: '',
    model: '',
    baseURL: '',
    apiKey: '',
    models: []
});

const hideApiKey = ref(true);

const errors = ref({
    name: '',
    baseURL: '',
    apiKey: '',
    models: ''
});

function clearErrors() {
    errors.value = {
        name: '',
        baseURL: '',
        apiKey: '',
        models: ''
    };
}

function editProvider() {
    mode.value = 'edit';
    const provider = persistedStore.aiProviders.find(p => p.id === selectedProviderId.value);
    if (provider) {
        //editProviderData.value = { ...provider };
        // Create a complete copy of the config object
        editProviderData.value = JSON.parse(JSON.stringify(provider));
    }
}

function addProvider() {
    mode.value = 'add';
    editProviderData.value = {
        id: '',
        name: '',
        model: '',
        baseURL: '',
        apiKey: '',
        models: []
    };
}

function saveProvider() {
    clearErrors();
    let hasErrors = false;

    // Name validation
    if (!editProviderData.value.name?.trim()) {
        errors.value.name = 'Provider name is required';
        hasErrors = true;
    } else if (mode.value === 'add' && 
        persistedStore.aiProviders.some(p => p.name.toLowerCase() === editProviderData.value.name.toLowerCase())) {
        errors.value.name = 'Provider name already exists';
        hasErrors = true;
    }

    // Base URL validation
    if (!editProviderData.value.baseURL?.trim()) {
        errors.value.baseURL = 'API endpoint is required';
        hasErrors = true;
    } else {
        try {
            new URL(editProviderData.value.baseURL);
        } catch {
            errors.value.baseURL = 'Invalid API endpoint format';
            hasErrors = true;
        }
    }

    // API Key validation
    if (!editProviderData.value.apiKey?.trim()) {
        errors.value.apiKey = 'API key is required';
        hasErrors = true;
    }

    // Models validation
    if (!editProviderData.value.models?.length) {
        errors.value.models = 'At least one model is required';
        hasErrors = true;
    }

    if (hasErrors) {
        return;
    }

    try {
        if (mode.value === 'add') {
            const newProvider = JSON.parse(JSON.stringify(editProviderData.value));
            newProvider.id = newProvider.name.toLowerCase().replace(/\s+/g, '-');
            persistedStore.aiProviders.push(newProvider);
            // Only set selectedProviderId if this is the first provider
            if (persistedStore.aiProviders.length === 1) {
                selectedProviderId.value = newProvider.id;
            }
        } else if (mode.value === 'edit') {
            const index = persistedStore.aiProviders.findIndex(p => p.id === editProviderData.value.id);
            if (index !== -1) {
                persistedStore.aiProviders[index] = JSON.parse(JSON.stringify(editProviderData.value));
                selectedProviderId.value = editProviderData.value.id;
            }
        }

        mode.value = 'view';
        editProviderData.value = null;
    } catch (error) {
        console.error('Failed to save provider:', error);
        errors.value.name = error.message;
    }
}

function cancelEdit() {
    mode.value = 'view';
}

// Update provider selection watcher to include model
watch(selectedProviderId, (newValue) => {
    const provider = persistedStore.aiProviders.find(p => p.id === newValue);
    if (provider) {
        persistedStore.selectedProvider = {
            providerId: provider.id,
            model: provider.models[0] // Select first model by default
        };
        selectedModel.value = provider.models[0];
    }
});

// Add model selection watcher
watch(selectedModel, (newValue) => {
    if (newValue) {
        persistedStore.selectedProvider = {
            providerId: selectedProviderId.value,
            model: newValue
        };
    }
});

const showDeleteConfirm = ref(false);
const providerToDelete = ref(null);

function confirmDeleteProvider(providerId) {
    providerToDelete.value = providerId;
    showDeleteConfirm.value = true;
}

function deleteProvider() {
    if (providerToDelete.value) {
        const index = persistedStore.aiProviders.findIndex(p => p.id === providerToDelete.value);
        if (index !== -1) {
            persistedStore.aiProviders.splice(index, 1);
            if (selectedProviderId.value === providerToDelete.value) {
                // Switch to first available provider
                selectedProviderId.value = persistedStore.aiProviders[0].id;
            }
        }
    }
    showDeleteConfirm.value = false;
    providerToDelete.value = null;
}

function selectProvider(providerId) {
    selectedProviderId.value = providerId;
}

const showDeleteModelConfirm = ref(false);
const modelToDelete = ref(null);

function confirmDeleteModel(model) {
    modelToDelete.value = model;
    showDeleteModelConfirm.value = true;
}

function deleteModel() {
    if (modelToDelete.value) {
        const provider = persistedStore.aiProviders.find(p => p.id === selectedProviderId.value);
        if (provider) {
            const modelIndex = provider.models.findIndex(m => m === modelToDelete.value);
            if (modelIndex !== -1) {
                provider.models.splice(modelIndex, 1);
                if (selectedModel.value === modelToDelete.value) {
                    selectedModel.value = provider.models[0] || '';
                }
            }
        }
    }
    showDeleteModelConfirm.value = false;
    modelToDelete.value = null;
}

// Helper function to check if a model is protected
function isProtectedModel(model) {
    return PROTECTED_MODELS[selectedProviderId.value]?.includes(model);
}

const restartingOllama = ref(false);

const isOllamaProvider = computed(() => {
    return editProviderData.value.name?.toLowerCase().includes('ollama') || 
           editProviderData.value.baseURL?.toLowerCase().includes('ollama');
});

// Add new helper function to check if a provider is Ollama by ID
function isOllamaProviderById(providerId) {
    const provider = persistedStore.aiProviders.find(p => p.id === providerId);
    return provider && (
        provider.name.toLowerCase().includes('ollama') || 
        provider.baseURL.toLowerCase().includes('ollama')
    );
}

const ollamaRunning = ref(false);
let statusCheckInterval = null; // Add this to track the interval

// Add function to check Ollama status
async function checkOllamaStatus() {
    if (!isOllamaProviderById(selectedProviderId.value)) {
        ollamaRunning.value = false;
        return;
    }

    try {
        const provider = persistedStore.aiProviders.find(p => p.id === selectedProviderId.value);
        if (!provider) return;

        // Create URL object to manipulate the URL
        const url = new URL(provider.baseURL);
        // Use only origin (protocol + hostname + port)
        const baseUrl = url.origin;
        
        const response = await fetch(`${baseUrl}/api/tags`);
        ollamaRunning.value = response.ok;
    } catch (error) {
        ollamaRunning.value = false;
    }
}

// Function to start periodic status checking
function startOllamaStatusCheck() {
    // Clear any existing interval first
    stopOllamaStatusCheck();
    
    if (isOllamaProviderById(selectedProviderId.value)) {
        checkOllamaStatus();
        statusCheckInterval = setInterval(checkOllamaStatus, 5000);
    }
}

// Function to stop status checking
function stopOllamaStatusCheck() {
    if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
        statusCheckInterval = null;
    }
}

// Replace existing provider watcher with this consolidated one
watch(selectedProviderId, async (newValue) => {
    const provider = persistedStore.aiProviders.find(p => p.id === newValue);
    if (provider) {
        persistedStore.selectedProvider = {
            providerId: provider.id,
            model: provider.models[0]
        };
        selectedModel.value = provider.models[0];
        
        // Handle Ollama status checking
        if (isOllamaProviderById(newValue)) {
            startOllamaStatusCheck();
        } else {
            stopOllamaStatusCheck();
            ollamaRunning.value = false;
        }
    }
});

// Update onMounted
onMounted(() => {
    startOllamaStatusCheck();
});

// Add onUnmounted to clean up
onUnmounted(() => {
    stopOllamaStatusCheck();
});

// Update configureAndRestartOllama
async function configureAndRestartOllama() {
    restartingOllama.value = true;
    try {
        // Set environment variable
        await new Command('launchctl')
            .execute(['setenv', 'OLLAMA_ORIGINS', '*']);
        
        // Kill Ollama
        await new Command('killall')
            .execute(['Ollama']);
        
        // Wait a moment for the process to fully terminate
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Start Ollama
        await new Command('open')
            .execute(['-a', 'Ollama']);
            
        console.log('Successfully configured and restarted Ollama');
        
        // Add delay and status check after restart
        await new Promise(resolve => setTimeout(resolve, 2000));
        await checkOllamaStatus();
    } catch (error) {
        console.error('Failed to configure and restart Ollama:', error);
    } finally {
        restartingOllama.value = false;
    }
}

// Add watcher to clear errors
watch(editProviderData, () => {
    clearErrors();
}, { deep: true });

</script>