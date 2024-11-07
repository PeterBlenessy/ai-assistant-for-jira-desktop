<template>
    <q-dialog v-model="isOpen">
        <q-card>
            <q-card-section class="row q-pa-sm q-pl-md vertical-middle" style="height: 45px">
                <div class="text-subtitle1 text-weight-bold">{{ title }}</div>
                <q-space />
                <q-btn icon="mdi-close" flat dense v-close-popup />
            </q-card-section>

            <q-separator />

            <q-card-section class="q-pa-md scroll" style="max-height: 50vh" >
                <MarkdownViewer :content="content" />
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import MarkdownViewer from './MarkdownViewer.vue'

const props = defineProps({
    modelValue: Boolean,
    content: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})
</script>
