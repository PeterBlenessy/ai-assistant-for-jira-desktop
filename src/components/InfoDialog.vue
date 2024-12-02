<template>
    <q-dialog v-model="dialogOpen">
        <q-card>
            <q-card-section class="row q-pa-sm q-pl-md vertical-middle" style="height: 45px">
                <div class="text-subtitle1 text-weight-bold">{{ title }}</div>
                <q-space />
                <q-btn icon="mdi-close" flat dense v-close-popup />
            </q-card-section>

            <q-card-section v-if="info">
                <div class="info-grid">
                    <template v-for="(value, key) in displayableInfo" :key="key">
                        <div class="text-caption text-weight-medium">{{ formatLabel(key) }}:</div>
                        <div class="text-caption">
                            <!-- Value can be an object -->
                            <div v-if="typeof value === 'object' && value !== null">
                                <!-- ... containing an array with specific size -->
                                <!-- ...containing simple objects with key-value pairs -->
                                <div v-if="value?.size && Array.isArray(value?.items)">
                                    <div v-for="(value, key) in value.items">
                                        <li>{{ value?.name }}</li>
                                    </div>
                                </div>
                                <!-- ... containing key-value pairs -->
                                <div v-else v-for="(value, key) in value" :key="key">
                                    <li><a href="{{value}}">{{ key }}</a></li>
                                </div>
                            </div>
                            <!-- Value can be string, array of strings, date -->
                            <div v-else>
                                {{ formatValue(value) }}
                            </div>
                        </div>

                    </template>
                </div>
            </q-card-section>
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
