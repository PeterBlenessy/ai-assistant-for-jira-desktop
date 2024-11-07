<template>
    <q-card v-if="isVisible" bordered flat>
        <q-card-section>
            <q-icon name="mdi-information-outline" color="positive" size="md"/>
        </q-card-section>
        <q-card-section class="q-pt-none q-pb-none">
            <MarkdownViewer :content="markdownContent" />
        </q-card-section>
        <q-card-actions align="right">
            <q-btn flat color="positive" label="Dismiss" @click="dismissInfoBox" />
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