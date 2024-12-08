<template>
    <!-- Mock Data Toggle -->
    <q-item class="q-pa-none q-pb-sm">
        <q-item-section>
            <q-item-label>Use demo mode</q-item-label>
            <q-item-label caption>Use demo mode with mock data</q-item-label>
        </q-item-section>
        <q-item-section side>
            <q-toggle v-model="isDemoMode" />
        </q-item-section>
    </q-item>

    <!-- Info Boxes Toggle -->
    <q-item class="q-pa-none q-pb-sm">
        <q-item-section>
            <q-item-label>Show dismissed info boxes</q-item-label>
            <q-item-label caption>Show information boxes that have been dismissed</q-item-label>
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
const { isDemoMode, showDismissedInfoBoxes } = storeToRefs(store);

</script>
