<template>
    <q-card v-if="isVisible" bordered dense flat style="border-color: var(--q-warning); background-color: rgb(from var(--q-warning) r g b / 10%)">
        <q-card-section class="q-pb-xs">
            <q-icon name="mdi-information-outline" color="warning" size="sm"/>
        </q-card-section>
        <q-card-section class="q-pt-none q-pb-none text-caption">
            <MarkdownViewer :content="markdownContent" />
        </q-card-section>
        <q-card-actions align="right" class="q-pt-none">
            <q-btn flat icon="mdi-eye-off" size="sm" label="Dismiss" @click="dismissInfoBox" />
        </q-card-actions>
    </q-card>
</template>

<script setup>
import { ref } from 'vue'
import MarkdownViewer from './MarkdownViewer.vue'

const props = defineProps({
    markdownContent: {
        type: String,
        required: true
    }
})

const emit = defineEmits(['dismiss'])
const isVisible = ref(true)

function dismissInfoBox() {
    isVisible.value = false
    emit('dismiss')
}
</script>

<style scoped>
/* Add any specific styles if needed */
</style>