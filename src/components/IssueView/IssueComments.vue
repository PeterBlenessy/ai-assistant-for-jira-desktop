<template>
    <q-expansion-item dense>
        <template v-slot:header>
            <q-item-section avatar>
                <q-avatar class="q-ma-none" icon="mdi-comment-text-multiple-outline" size="md" />
            </q-item-section>
            <q-item-section class="text-uppercase">Comments</q-item-section>
            <q-item-section side class="text-caption">
                {{ comments.length }} comment{{ comments.length === 1 ? '' : 's' }}
            </q-item-section>
        </template>
        <q-list dense separator>
            <q-item v-for="comment in comments" :key="comment?.id" class="q-ma-none q-pa-none">
                <q-item-section>
                    <q-item-label class="text-weight-medium">
                        {{ comment?.author?.displayName }}
                        <span class="text-grey-7 text-caption q-ml-sm">
                            {{ new Date(comment?.created).toLocaleString() }}
                        </span>
                    </q-item-label>
                    <q-item-label>
                        <MarkdownViewer :content="comment?.body" />
                    </q-item-label>
                </q-item-section>
            </q-item>
        </q-list>
    </q-expansion-item>
</template>

<script setup>
import MarkdownViewer from '../MarkdownViewer.vue';

defineProps({
    comments: {
        type: Array,
        default: () => []
    }
});
</script>
