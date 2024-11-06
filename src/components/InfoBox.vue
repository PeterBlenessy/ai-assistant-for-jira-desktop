<template>
    <q-card v-if="isVisible" bordered flat>
        <q-card-section>
            <q-icon name="mdi-information-outline" color="positive" size="md"/>
        </q-card-section>
        <q-card-section class="q-pt-none q-pb-none">
            <div v-html="renderedContent" class="markdown-content" />
        </q-card-section>
        <q-card-actions align="right">
            <q-btn flat color="positive" label="Dismiss" @click="dismissInfoBox" />
        </q-card-actions>
    </q-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import MarkdownIt from 'markdown-it'

// Prop for markdown content
const props = defineProps({
    markdownContent: {
        type: String,
        required: true
    }
})

// Emit event to notify parent component
const emit = defineEmits(['dismiss'])

// State to control visibility
const isVisible = ref(true)

// Markdown rendering setup
const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
})

// Rendered markdown content
const renderedContent = computed(() => {
    return md.render(props.markdownContent)
})

// Dismiss the info box
function dismissInfoBox() {
    isVisible.value = false
    emit('dismiss')
}
</script>

<style scoped>
/* Add any specific styles if needed */
</style>