<template>
    <!-- Mock Data Toggle -->
    <q-item class="q-pa-none q-pb-sm">
        <q-item-section>
            <q-item-label>Use mocked data</q-item-label>
            <q-item-label caption>Use mocked Jira data for testing purposes</q-item-label>
        </q-item-section>
        <q-item-section side>
            <q-toggle v-model="isMockMode" />
        </q-item-section>
    </q-item>

    <!-- Info Boxes Toggle -->
    <q-item class="q-pa-none q-pb-sm">
        <q-item-section>
            <q-item-label>Show dismissed info boxes</q-item-label>
            <q-item-label caption>
                Show information boxes that have been dismissed
            </q-item-label>
        </q-item-section>
        <q-item-section side>
            <q-toggle v-model="showDismissedInfoBoxes" />
        </q-item-section>
    </q-item>
</template>

<script setup>
import { usePersistedStore } from '../stores/persisted-store';
import { storeToRefs } from 'pinia';

const store = usePersistedStore();

// Get reactive refs to store state
const { isMockMode, showDismissedInfoBoxes } = storeToRefs(store);

</script>
