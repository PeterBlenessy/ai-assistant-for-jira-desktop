<template>
    <q-card class="absolute-top q-pt-sm q-ma-none" style="height: 100%; width: 100vw">
        <q-card-section class="q-pt-none">
            <q-input label="Enter JQL Query" clearable dense filled style="width: 100%"
                v-model="jqlQuery"
                @keydown.enter="performSearch"
            >
                <template v-slot:before>
                    <q-btn dense flat icon="mdi-history" :disabled="searchHistory.length == 0"
                        @click.stop="history = true"
                    >
                        <q-menu anchor="bottom left" self="top left">
                            <q-list style="min-width: 200px">
                                <q-item
                                    v-for="(query, index) in searchHistory"
                                    :key="index" clickable @click="selectFromHistory(query)"
                                >
                                    <q-item-section>{{ query }}</q-item-section>
                                    <q-item-section side>
                                        <q-btn dense flat size="sm" icon="mdi-delete-outline"
                                            @click.stop="removeFromHistory(query)"
                                        />
                                    </q-item-section>
                                </q-item>
                            </q-list>
                        </q-menu>
                    </q-btn>
                </template>
                <template v-slot:after>
                    <q-btn dense flat icon="mdi-send" color="primary" @click="performSearch" />
                </template>
            </q-input>
        </q-card-section>

        <q-card-section class="q-pt-none" v-if="searchResults.length != 0">
            <q-table
                row-key="id"
                :columns="columns"
                :rows="searchResults"
                :visible-columns="visibleColumns"
                v-model:pagination="pagination"
                :rows-per-page-options="[10, 20, 50]"
                @request="onRequest"
                :loading="loading"
                class="my-sticky-header-table"
                wrap-cells
                @row-click="onRowClick"
            />
        </q-card-section>
    </q-card>
</template>

<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { usePersistedStore } from "../stores/persisted-store";
import JiraClient from "../services/jira.js";

const loading = ref(false);
const jqlQuery = ref("");
const searchResults = ref([]);
const showHistory = ref(false);

const pagination = ref({
    sortBy: "desc",
    descending: false,
    page: 1,
    rowsPerPage: 20,
    rowsNumber: 0,
});

const columns = [
    { name: "id", label: "ID", field: "id" },
    {
        name: "key",
        label: "Key",
        field: "key",
        align: "left",
        style: "width: 75px",
        required: true,
    },
    {
        name: "summary",
        label: "Summary",
        field: "summary",
        align: "left",
        style: "max-width: 500px",
        required: true,
    },
    {
        name: "status",
        label: "Status",
        field: "status",
        align: "left",
        required: true,
    },
    { name: "assignee", label: "Assignee", field: "assignee", align: "left" },
];
const visibleColumns = ref(["key", "summary", "status", "assignee"]);

const persistedStore = usePersistedStore();
const { searchHistory, selectedIssue } = storeToRefs(persistedStore);

const client = JiraClient({
    host: persistedStore.jiraServerAddress,
    personalAccessToken: persistedStore.jiraPersonalAccessToken,
});

function onRequest(props) {
    const { page, rowsPerPage, sortBy, descending } = props.pagination;

    loading.value = true;

    pagination.value.page = page;
    pagination.value.rowsPerPage = rowsPerPage;

    performSearch()
        .then(() => {
            loading.value = false;
        })
        .catch(() => {
            console.error(`Error requesting page ${page}`);
            loading.value = false;
        });
}

async function performSearch() {
    if (jqlQuery.value == "") return;

    const startAt = (pagination.value.page - 1) * pagination.value.rowsPerPage;
    const maxRows = pagination.value.rowsPerPage;

    try {
        const response = await client.searchIssues(
            jqlQuery.value,
            startAt,
            maxRows,
        );
        // console.log(response);

        // Update pagination rows with total number of items for this search query
        pagination.value.rowsNumber = response.total;

        searchResults.value = response.issues.map((issue) => ({
            id: issue.id,
            key: issue.key,
            summary: issue.fields.summary,
            status: issue.fields.status.name,
            assignee: issue.fields.assignee
                ? issue.fields.assignee.displayName
                : "Unassigned",
        }));

        if (
            jqlQuery.value.length != 0 &&
            !searchHistory.value.includes(jqlQuery.value)
        ) {
            searchHistory.value.push(jqlQuery.value);
        }
    } catch (error) {
        console.error("Error performing JQL search:", error);
    }
}

function selectFromHistory(query) {
    jqlQuery.value = query;
    showHistory.value = false;
    performSearch();
}

function removeFromHistory(query) {
    const index = searchHistory.value.indexOf(query);
    if (index > -1) {
        searchHistory.value.splice(index, 1);
    }
}

function onRowClick(evt, row, index) {
    selectedIssue.value = row;
}
</script>
<style lang="sass">
.my-sticky-header-table
    /* height or max-height is important */
    height: calc(100vh - 130px)

    .q-table__top,
    .q-table__bottom,
    thead tr:first-child th
        /* bg color is important for th; just specify one */
        background-color: #1d1d1d

    thead tr th
        top: 0
        position: sticky
        z-index: 2
        text-transform: uppercase

    thead tr:first-child th
        top: 0

    /* this is when the loading indicator appears */
    &.q-table--loading thead tr:last-child th
        /* height of all previous header rows */
        top: 48px

    /* prevent scrolling behind sticky top row on focus */
    tbody
        /* height of all previous header rows */
        scroll-margin-top: 48px
</style>
