<template>
    <q-dialog v-model="isOpen">
        <q-card style="width: 50vw; max-width: 80vw; max-height: 60vh">
            <q-card-section class="q-pa-md scroll">
                <div v-if="renderedContent" v-html="renderedContent" class="markdown-content" />
                <q-spinner v-else color="primary" size="2em" />
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import aboutMd from '../../docs/ABOUT.md?raw'
import changelogMd from '../../docs/CHANGELOG.md?raw'

const props = defineProps({
    modelValue: Boolean,
    type: {
        type: String,
        required: true,
        validator: (value) => ['about', 'changelog'].includes(value)
    }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const title = computed(() => {
    return props.type === 'about' ? 'About' : 'Changelog'
})

const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
})

const markdownContent = computed(() => {
    switch (props.type) {
        case 'about':
            return aboutMd
        case 'changelog':
            return changelogMd
        default:
            return ''
    }
})

const renderedContent = computed(() => {
    return md.render(markdownContent.value)
})
</script>