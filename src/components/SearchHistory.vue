<template>
    <q-list dense>
        <q-item-label header>Search History</q-item-label>

        <q-item v-for="(query, index) in searchHistory" :key="index" clickable @click="selectQuery(query)">
            <q-item-section>{{ query }}</q-item-section>
            <q-item-section side>
                <q-btn dense flat size="sm" icon="mdi-delete-outline" @click.stop="removeFromHistory(query)" />
            </q-item-section>
        </q-item>
    </q-list>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { usePersistedStore } from "../stores/persisted-store";

const persistedStore = usePersistedStore();
const { searchHistory } = storeToRefs(persistedStore);

const emit = defineEmits(['select']);

function removeFromHistory(query) {
    const index = searchHistory.value.indexOf(query);
    if (index > -1) {
        searchHistory.value.splice(index, 1);
    }
}

function selectQuery(query) {
    emit('select', query);
}
</script>
