<template>
  <div>
    <q-input
      v-model="jqlQuery"
      label="Enter JQL Query"
      dense
      filled
      style="width: 100%;"
    />
    <q-btn @click="performSearch" label="Search" color="primary" />

    <q-select
      v-model="selectedHistory"
      :options="searchHistory"
      label="Search History"
      dense
      filled
      style="width: 100%;"
      @input="selectHistory"
    />

    <q-table
      :rows="searchResults"
      :columns="columns"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[5, 10, 15]"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { usePersistedStore } from "../stores/persisted-store";
import JiraClient from "../services/jira.js";

const jqlQuery = ref("");
const searchResults = ref([]);
const searchHistory = ref([]);
const selectedHistory = ref(null);
const pagination = ref({
  page: 1,
  rowsPerPage: 5,
  rowsNumber: 0,
});

const columns = [
  { name: "summary", required: true, label: "Summary", align: "left", field: "summary" },
  { name: "status", required: true, label: "Status", align: "left", field: "status" },
  { name: "assignee", required: true, label: "Assignee", align: "left", field: "assignee" },
];

const persistedStore = usePersistedStore();

async function performSearch() {
  const client = JiraClient({
    host: persistedStore.jiraServerAddress,
    personalAccessToken: persistedStore.jiraPersonalAccessToken,
  });

  try {
    const response = await client.searchIssues(jqlQuery.value, (pagination.value.page - 1) * pagination.value.rowsPerPage, pagination.value.rowsPerPage);
    searchResults.value = response.issues;
    pagination.value.rowsNumber = response.total;

    if (!searchHistory.value.includes(jqlQuery.value)) {
      searchHistory.value.push(jqlQuery.value);
    }
  } catch (error) {
    console.error("Error performing JQL search:", error);
  }
}

function selectHistory(query) {
  jqlQuery.value = query;
  performSearch();
}
</script>
