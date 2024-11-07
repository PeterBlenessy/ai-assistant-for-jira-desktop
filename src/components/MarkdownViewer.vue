<template>
    <div v-if="renderedContent" v-html="renderedContent" class="markdown-content" />
    <q-spinner v-else color="primary" size="2em" />
</template>

<script setup>
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'

const props = defineProps({
    content: {
        type: String,
        required: true
    }
})

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
})

const renderedContent = computed(() => {
    return md.render(props.content)
})
</script>
