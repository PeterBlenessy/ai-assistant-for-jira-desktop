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

    <!-- AI Comments Toggle -->
    <q-item class="q-pa-none q-pb-sm">
        <q-item-section>
            <q-item-label>Add AI comments to Jira</q-item-label>
            <q-item-label caption>Add AI improvement comments to Jira when syncing accepted improvements</q-item-label>
        </q-item-section>
        <q-item-section side>
            <q-toggle v-model="addImprovementCommentsToJira" />
        </q-item-section>
    </q-item>

    <!-- Generate Child Issues Select -->
    <q-item class="q-pa-none q-pb-sm">
        <q-item-section>
            <q-item-label>Generate child issues</q-item-label>
            <q-item-label caption>Select issue types to generate child issues for</q-item-label>
            <q-select
                v-model="generateChildIssuesForIssueTypes"
                :options="availableIssueTypes"
                multiple
                use-chips
                dense
                options-dense
                filled
                class="q-mt-sm"
                emit-value
            />
        </q-item-section>
    </q-item>
</template>

<script setup>
import { usePersistedStore } from '../../stores/persisted-store';
import { storeToRefs } from 'pinia';

const store = usePersistedStore();

// Get reactive refs to store state
const { 
    isDemoMode, 
    showDismissedInfoBoxes, 
    addImprovementCommentsToJira, 
    generateChildIssuesForIssueTypes, 
    availableIssueTypes 
} = storeToRefs(store);

</script>
