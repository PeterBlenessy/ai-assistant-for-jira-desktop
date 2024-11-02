<template>
    <q-card class="absolute-top q-pt-sm q-ma-none" style="height: 100%; width: 100%">
        <q-card-section class="q-pt-none">
            <q-input label="Enter JQL Query" clearable dense filled style="width: 100%" v-model="jqlQuery"
                @keydown.enter="performSearch">
                <template v-slot:before>
                    <q-btn dense flat icon="mdi-history" :disabled="searchHistory.length == 0"
                        @click.stop="history = true">
                        <q-menu anchor="bottom left" self="top left">
                            <q-list style="min-width: 200px">
                                <q-item v-for="(query, index) in searchHistory" :key="index" v-close-popup clickable
                                    @click="selectQueryFromHistory(query)">
                                    <q-item-section>{{ query }}</q-item-section>
                                    <q-item-section side>
                                        <q-btn dense flat size="sm" icon="mdi-delete-outline"
                                            @click.stop="removeQueryFromHistory(query)" />
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
            <q-table row-key="id" :columns="columns" :rows="searchResults" :visible-columns="visibleColumns"
                v-model:pagination="pagination" :rows-per-page-options="[10, 20, 50]" @request="onRequest"
                :loading="loading" class="my-sticky-header-table" wrap-cells>

                <!-- Header columns -->
                <template v-slot:header="props">
                    <q-tr :props="props">
                        <q-th auto-width />
                        <q-th v-for="col in props.cols" :key="col.name" :props="props">
                            {{ col.label }}
                        </q-th>
                    </q-tr>
                </template>

                <!-- Body rows -->
                <template v-slot:body="props">
                    <!-- Expand/Collapse Row -->
                    <q-tr :props="props" @click.stop="props.expand = !props.expand">
                        <q-td auto-width>
                            <q-btn size="sm" flat dense @click.stop="props.expand = !props.expand"
                                :icon="props.expand ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
                        </q-td>
                        <!-- Body columns -->
                        <q-td v-for="col in props.cols" :key="col.name" :props="props">
                            {{ col.value }}
                        </q-td>
                    </q-tr>
                    <!-- Expanded Row -->
                    <q-tr v-show="props.expand" :props="props">
                        <q-td colspan="100%">
                            <IssueFields :issueKey="props.row.key" />
                        </q-td>
                    </q-tr>
                </template>
            </q-table>
        </q-card-section>
    </q-card>
</template>

<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { usePersistedStore } from "../stores/persisted-store";
import { useJiraClient } from "../composables/JiraClient.js";
import IssueFields from "./IssueFields.vue";

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
const { searchHistory } = storeToRefs(persistedStore);

const { jiraClient } = useJiraClient();

const emit = defineEmits(['issue-click']);

// Handle pagination requests
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

// Perform the JQL search
async function performSearch() {
    if (jqlQuery.value == "") return;

    const startAt = (pagination.value.page - 1) * pagination.value.rowsPerPage;
    const maxRows = pagination.value.rowsPerPage;

    try {
        const response = await jiraClient.value.searchIssues(
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

function selectQueryFromHistory(query) {
    jqlQuery.value = query;
    showHistory.value = false;
    performSearch();
}

function removeQueryFromHistory(query) {
    const index = searchHistory.value.indexOf(query);
    if (index > -1) {
        searchHistory.value.splice(index, 1);
    }
}

function setQuery(query) {
    jqlQuery.value = query;
    performSearch();
}

// Expose the setQuery method to the parent component
defineExpose({ setQuery });

const improvedDescriptions = ref({});

function generateImprovement(issueKey) {
    const issue = issues.value.find(i => i.key === issueKey);
    if (issue) {
        improvedDescriptions.value[issueKey] = issue.fields.description;
    }
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
        background-color: #ffffff

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

    &.q-table--dark
        .q-table__top,
        .q-table__bottom,
        thead tr:first-child th
            /* bg color is important for th; just specify one */
            background-color: #1d1d1d

    /* prevent scrolling behind sticky top row on focus */
    tbody
        /* height of all previous header rows */
        scroll-margin-top: 48px
</style>
