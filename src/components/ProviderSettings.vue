<template>
    <div>
        <div v-if="mode === 'view'">
            <!-- AI Provider Dropdown -->
            <q-item>
                <q-item-section>
                    <q-select
                        v-model="selectedProviderId"
                        :options="providerOptions"
                        label="AI Provider"
                        dense
                        filled
                        emit-value
                        map-options
                    />
                </q-item-section>
            </q-item>
            <!-- Edit and Add New Buttons -->
            <q-item>
                <q-item-section  align="right">
                    <div class="q-gutter-sm">
                        <q-btn label="Add New" @click="addProvider" size="sm"/>
                        <q-btn label="Edit" @click="editProvider" size="sm"/>
                    </div>
                </q-item-section>
            </q-item>
        </div>

        <div v-else>
            <!-- Provider Name -->
            <q-item>
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
            <q-item>
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
            <q-item>
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
            <q-item>
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
            <q-item>
                <q-item-section align="right">
                    <div class="q-gutter-sm">
                        <q-btn label="Save" color="primary" size="sm" @click="saveProvider" />
                        <q-btn label="Cancel" size="sm" @click="cancelEdit" />
                    </div>
                </q-item-section>
            </q-item>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, defineEmits } from 'vue';
import {
    usePersistedStore,
    PROTECTED_PROVIDER_IDS,
    PROTECTED_MODELS
} from '../stores/persisted-store';

const persistedStore = usePersistedStore();

const selectedProviderId = ref(persistedStore.selectedProvider.providerId);
const providerOptions = computed(() =>
    persistedStore.aiProviders.map(p => ({
        label: p.name,
        value: p.id
    }))
);

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
</script>