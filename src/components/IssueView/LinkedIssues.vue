<template>
    <q-expansion-item dense>
        <template v-slot:header>
            <q-item-section avatar>
                <q-avatar class="q-ma-none" icon="mdi-link-variant" size="md" />
            </q-item-section>
            <q-item-section class="text-uppercase">Linked Issues</q-item-section>
            <q-item-section side class="text-caption">
                {{ relatedIssues.length }} issue{{ relatedIssues.length === 1 ? '' : 's' }}
            </q-item-section>
        </template>
        <q-list dense>
            <q-item v-for="issue in relatedIssues" :key="issue?.key" class="q-ma-none q-pa-none">
                <q-item-section avatar>
                    <q-chip color="transparent" class="q-pa-none" dense square :clickable="false" :ripple="false" size="sm">
                        <q-img :src="issue?.fields?.issuetype?.iconUrl" class="q-mr-sm q-pa-none"
                            style="width: 16px; height: 16px;" />
                    </q-chip>
                </q-item-section>
                <q-item-section caption class="col-1">
                    <q-item-label lines="1">{{ issue?.key }}</q-item-label>
                </q-item-section>
                <q-item-section>
                    <q-item-label>{{ issue?.fields?.summary }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-chip dense color="grey-6" text-color="white" size="sm" square>
                        {{ issue?.fields?.status?.name }}
                    </q-chip>
                </q-item-section>
            </q-item>
        </q-list>
    </q-expansion-item>
</template>

<script setup>
defineProps({
    relatedIssues: {
        type: Array,
        default: () => []
    }
});
</script>
