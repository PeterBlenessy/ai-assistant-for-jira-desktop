<template>
    <q-dialog v-model="model">
        <q-card style="width: 350px; max-width: 75vw">
            <!-- Jira Settings Section -->
            <q-card class="q-ma-sm">
                <q-card-section>
                    <div class="text-subtitle2">Jira Settings</div>
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
            </q-card>
            <q-separator spaced inset/>
            <!-- AI Provider Settings Section -->
            <q-card class="q-ma-sm">
                <q-card-section>
                    <div class="text-subtitle2">AI Provider Settings</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                    <q-select
                        v-model="selectedProviderId"
                        :options="providerOptions"
                        label="AI Provider"
                        dense
                        filled
                        emit-value
                        map-options
                        use-input
                        @new-value="addNewProvider"
                        @update:model-value="handleProviderChange"
                    >
                        <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
                            <q-item v-bind="itemProps" dense>
                                <q-item-section>
                                    <q-item-label>{{ opt.label }}</q-item-label>
                                </q-item-section>
                                <q-item-section side v-if="!isDefaultProvider(opt.value)">
                                    <q-btn
                                        flat
                                        dense
                                        icon="mdi-delete"
                                        color="grey-6"
                                        size="xs"
                                        @click.stop="deleteProvider(opt.value)"
                                    />
                                </q-item-section>
                            </q-item>
                        </template>
                    </q-select>
                </q-card-section>
                <q-card-section class="q-pt-none">
                    <q-select
                        v-model="selectedModel"
                        :options="currentProviderModels"
                        label="AI Model"
                        dense
                        filled
                        use-input
                        input-debounce="0"
                        @new-value="addNewModel"
                    >
                        <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
                            <q-item v-bind="itemProps" dense>
                                <q-item-section>
                                    <q-item-label>{{ opt }}</q-item-label>
                                </q-item-section>
                                <q-item-section side v-if="!isDefaultModel(opt)">
                                    <q-btn
                                        flat
                                        dense
                                        icon="mdi-delete"
                                        color="grey-6"
                                        size="xs"
                                        @click.stop="deleteModel(opt)"
                                    />
                                </q-item-section>
                            </q-item>
                        </template>
                    </q-select>
                </q-card-section>
                <q-card-section class="q-pt-none">
                    <q-input
                        v-model="currentProvider.baseURL"
                        label="API Endpoint"
                        dense
                        filled
                    />
                </q-card-section>
                <q-card-section class="q-pt-none">
                    <q-input
                        v-model="currentProvider.apiKey"
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
                </q-card-section>
            </q-card>

            <q-card-actions align="right">
                <q-btn flat label="Cancel" v-close-popup />
                <q-btn
                    label="Save"
                    color="primary"
                    @click="saveSettings"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { usePersistedStore } from "../stores/persisted-store";
import { PROTECTED_PROVIDER_IDS, PROTECTED_MODELS } from "../stores/persisted-store";

const model = defineModel({ default: false });

const persistedStore = usePersistedStore();

const jiraServerAddress = ref(persistedStore.jiraServerAddress);
const jiraPersonalAccessToken = ref(persistedStore.jiraPersonalAccessToken);
const hidePAT = ref(true);

const selectedProviderId = ref(persistedStore.selectedProvider.providerId);
const selectedModel = ref(persistedStore.selectedProvider.model);

const providerOptions = computed(() => 
    persistedStore.aiProviders.map(p => ({
        label: p.name,
        value: p.id
    }))
);

const currentProvider = computed(() => 
    persistedStore.aiProviders.find(p => p.id === selectedProviderId.value)
);

const currentProviderModels = computed(() => 
    currentProvider.value?.models || []
);

const hideApiKey = ref(true);

function isDefaultProvider(providerId) {
    return PROTECTED_PROVIDER_IDS.includes(providerId);
}

function isDefaultModel(model) {
    if (!currentProvider.value) return false;
    
    // Only check protected models if this is a default provider
    if (isDefaultProvider(currentProvider.value.id)) {
        const protectedModels = PROTECTED_MODELS[currentProvider.value.id];
        return protectedModels?.includes(model) || false;
    }
    
    // For custom providers, no models are protected
    return false;
}

function deleteProvider(providerId) {
    if (isDefaultProvider(providerId)) return;
    
    const index = persistedStore.aiProviders.findIndex(p => p.id === providerId);
    if (index !== -1) {
        persistedStore.aiProviders.splice(index, 1);
        
        // If the deleted provider was selected, switch to OpenAI
        if (selectedProviderId.value === providerId) {
            selectedProviderId.value = 'openai';
            handleProviderChange('openai');
        }
    }
}

function deleteModel(model) {
    if (!currentProvider.value || isDefaultModel(model)) return;
    
    const index = currentProvider.value.models.indexOf(model);
    if (index !== -1) {
        currentProvider.value.models.splice(index, 1);
        
        // If the deleted model was selected, switch to the first available model
        if (selectedModel.value === model) {
            selectedModel.value = currentProvider.value.models[0] || null;
        }
    }
}

function addNewProvider(val, done) {
    if (val) {
        // Generate a unique ID (lowercase, no spaces)
        const newId = val.toLowerCase().replace(/\s+/g, '-');
        
        // Check if provider with this ID already exists
        if (!persistedStore.aiProviders.some(p => p.id === newId)) {
            // Add new provider
            const newProvider = {
                id: newId,
                name: val,
                models: [],
                baseURL: '',
                apiKey: ''
            };
            
            persistedStore.aiProviders.push(newProvider);
            selectedProviderId.value = newId;
        }
        done(val);
    }
}

function handleProviderChange(providerId) {
    const provider = persistedStore.aiProviders.find(p => p.id === providerId);
    if (provider) {
        if (provider.models.length > 0) {
            selectedModel.value = provider.models[0];
        } else {
            selectedModel.value = null;
        }
    }
}

function addNewModel(val, done) {
    if (!val || typeof val !== 'string') {
        done(null);
        return;
    }

    const provider = persistedStore.aiProviders.find(p => p.id === selectedProviderId.value);
    if (!provider) {
        done(null);
        return;
    }

    // Initialize models array if it doesn't exist
    if (!provider.models) {
        provider.models = [];
    }

    // Check if model already exists
    if (!provider.models.includes(val)) {
        // Create a new array with the new model
        provider.models = [...provider.models, val];
        selectedModel.value = val;
        done(val);
    } else {
        done(null);
    }
}

function saveSettings() {
    if (
        jiraServerAddress.value === "" ||
        jiraPersonalAccessToken.value === "" ||
        !selectedProviderId.value || 
        !selectedModel.value
    ) {
        return;
    }

    // Save Jira settings
    persistedStore.jiraServerAddress = jiraServerAddress.value;
    persistedStore.jiraPersonalAccessToken = jiraPersonalAccessToken.value;

    // Update selected provider
    persistedStore.selectedProvider = {
        providerId: selectedProviderId.value,
        model: selectedModel.value
    };

    // Update provider settings
    const providerIndex = persistedStore.aiProviders.findIndex(p => p.id === selectedProviderId.value);
    if (providerIndex !== -1) {
        persistedStore.aiProviders[providerIndex] = {
            ...currentProvider.value
        };
    }

    model.value = false;
}
</script>
