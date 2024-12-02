<template>
    <q-dialog v-model="dialogOpen">
        <q-card style="min-width: 350px">
            <q-card-section>
                <div class="text-h6">{{ title }}</div>
            </q-card-section>

            <q-card-section v-if="info">
                <div class="info-grid">
                    <template v-for="(value, key) in displayableInfo" :key="key">
                        <div class="text-caption text-weight-medium">{{ formatLabel(key) }}:</div>
                        <div class="text-caption">{{ formatValue(value) }}</div>
                    </template>
                </div>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat :label="closeButtonText" color="primary" v-close-popup />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    info: {
        type: Object,
        default: null
    },
    excludeKeys: {
        type: Array,
        default: () => []
    },
    closeButtonText: {
        type: String,
        default: 'Close'
    }
});

const emit = defineEmits(['update:modelValue']);

const dialogOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

const displayableInfo = computed(() => {
    if (!props.info) return {};
    
    const info = { ...props.info };
    props.excludeKeys.forEach(key => delete info[key]);
    return info;
});

function formatLabel(key) {
    return key
        .replace(/([A-Z])/g, ' $1')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function formatValue(value) {
    if (Array.isArray(value)) {
        return value.join('.');
    }
    if (value instanceof Date) {
        return value.toLocaleString();
    }
    if (typeof value === 'object' && value !== null) {
        if (value.size && Array.isArray(value.items)) {
            return (
                <q-table
                    :rows="value.items"
                    row-key="name"
                    flat bordered
                />
            );
        }
        if (Object.keys(value).every(key => typeof value[key] === 'string')) {
            return (
                <q-table
                    :rows="Object.entries(value).map(([resolution, url]) => ({ resolution, url }))}
                    row-key="resolution"
                    flat bordered
                />
            );
        }
    }
    return value;
}
</script>

<style scoped>
.info-grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 6px 16px;
    align-items: baseline;
}
</style>
