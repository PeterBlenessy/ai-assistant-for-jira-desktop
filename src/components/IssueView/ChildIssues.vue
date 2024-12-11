<template>
    <q-expansion-item dense>
        <template v-slot:header>
            <q-item-section avatar>
                <q-avatar class="q-ma-none" icon="mdi-file-tree-outline" size="md" />
            </q-item-section>
            <q-item-section class="text-uppercase">Child Issues</q-item-section>
            <q-item-section side class="text-caption">
                {{ childIssues?.length }} issue{{ childIssues?.length === 1 ? '' : 's' }}
            </q-item-section>
        </template>
        <q-list dense separator>
            <q-item v-for="issue in childIssues" :key="issue?.key" class="q-ma-none q-pa-none">
                <q-item-section avatar>
                    <q-chip color="transparent" class="q-pa-none" dense square :clickable="false" :ripple="false" size="sm">
                        <q-img :src="issue?.fields?.issuetype?.iconUrl" class="q-mr-xs q-pa-none"
                            style="width: 16px; height: 16px;" />
                            {{ issue?.key }}
                    </q-chip>
                </q-item-section>
                <q-item-section>
                    <q-item-label lines="1">{{ issue?.fields?.summary }}</q-item-label>
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
    childIssues: {
        type: Array,
        default: () => []
    }
});
</script>
