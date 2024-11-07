<template>
    <MarkdownDialog v-model="dialogOpen" :content="changelogContent" title="Changelog" />
</template>

<script setup>
import MarkdownDialog from './MarkdownDialog.vue'
import changelogMd from '../../docs/CHANGELOG.md?raw'
import { computed } from 'vue'

const props = defineProps({
    modelValue: Boolean
})

const emit = defineEmits(['update:modelValue'])
const changelogContent = changelogMd

const dialogOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})
</script>
