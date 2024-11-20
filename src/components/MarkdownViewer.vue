<template>
    <div v-if="renderedContent" v-html="renderedContent" class="markdown-content" />
    <q-spinner v-else color="primary" size="2em" />
</template>

<script setup>
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'

const props = defineProps({
    content: {
        type: [String, Array], // Allow both String and Array types for content
        required: true
    }
})

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
})

// Function to format an array into a markdown numbered list
const formatList = (array) => {
    return array
        .map((item, index) => `${index + 1}. ${item}`) // Convert array to numbered list
        .join('\n') // Join list items with newlines
}

const renderedContent = computed(() => {
    // Check if content is an array
    let contentToRender = props.content
    if (Array.isArray(contentToRender)) {
        // If it's an array, format it as a numbered list
        contentToRender = formatList(contentToRender)
    }
    return md.render(contentToRender) // Render using MarkdownIt
})
</script>
