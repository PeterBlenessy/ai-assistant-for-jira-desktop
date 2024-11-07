<template>
    <MarkdownDialog v-model="dialogOpen" :content="aboutContent" title="About" />
</template>

<script setup>
import MarkdownDialog from './MarkdownDialog.vue'
import aboutMd from '../../docs/ABOUT.md?raw'
import { computed } from 'vue'

const props = defineProps({
    modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])
const aboutContent = aboutMd

const dialogOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})
</script>
