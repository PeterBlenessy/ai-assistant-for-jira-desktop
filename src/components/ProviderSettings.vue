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
                        <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps" @click.stop="selectProvider(scope.opt.value)">
                                <q-item-section>{{ scope.opt.label }}</q-item-section>
                                <q-item-section side v-if="!PROTECTED_PROVIDER_IDS.includes(scope.opt.value)">
                                    <q-btn flat dense size="sm" icon="mdi-close"
                                        @click.stop="confirmDeleteProvider(scope.opt.value)" />
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
                    />
                </q-item-section>
            </q-item>
            <!-- AI Model -->
            <q-item class="q-pa-none">
                <q-item-section>
                    <q-input
                        v-model="editProviderData.model"
                        label="AI Model"
                        dense
                        filled
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
import { ref, computed, watch } from 'vue';
import {
    usePersistedStore,
    PROTECTED_PROVIDER_IDS,
    PROTECTED_MODELS
} from '../stores/persisted-store';

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

function editProvider() {
    mode.value = 'edit';
    const provider = persistedStore.aiProviders.find(p => p.id === selectedProviderId.value);
    if (provider) {
        editProviderData.value = { ...provider };
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
    if (!editProviderData.value.name || !editProviderData.value.model) {
        return;
    }
    if (mode.value === 'edit') {
        const index = persistedStore.aiProviders.findIndex(p => p.id === editProviderData.value.id);
        if (index !== -1) {
            persistedStore.aiProviders[index] = { ...editProviderData.value };
            selectedProviderId.value = editProviderData.value.id;
        }
    } else if (mode.value === 'add') {
        const newProvider = { ...editProviderData.value };
        newProvider.id = newProvider.name.toLowerCase().replace(/\s+/g, '-');
        if (!persistedStore.aiProviders.some(p => p.id === newProvider.id)) {
            persistedStore.aiProviders.push(newProvider);
            selectedProviderId.value = newProvider.id;
        }
    }
    mode.value = 'view';
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

</script>