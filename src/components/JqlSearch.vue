<template>
    <q-card class="absolute-top q-pt-sm q-ma-none" flat style="height: 100%; width: 100%">
        <q-card-section class="q-pt-none">
            <q-input label="Enter JQL Query" clearable dense filled style="width: 100%" v-model="jqlQuery"
                @keydown.enter="performSearch">
                <template v-slot:prepend>
                    <q-btn dense flat icon="mdi-history" :disabled="searchHistory.length == 0"
                        @click.stop="history = true"
                    >
                        <q-menu anchor="bottom left" self="top left">
                            <q-list style="min-width: 200px">
                                <q-item v-for="(query, index) in searchHistory" :key="index" v-close-popup clickable
                                    @click="selectQueryFromHistory(query)">
                                    <q-item-section>{{ query }}</q-item-section>
                                    <q-item-section side>
                                        <q-btn dense flat size="sm" icon="mdi-delete-outline"
                                            @click.stop="removeQueryFromHistory(query)" 
                                        />
                                    </q-item-section>
                                </q-item>
                            </q-list>
                        </q-menu>
                    </q-btn>
                </template>
            </q-input>
        </q-card-section>

        <q-card-section flat v-if="searchResults.length != 0">
            <q-table bordered flat row-key="id" class="my-sticky-header-table q-pt-none q-ma-none" 
                :columns="columns" 
                :rows="searchResults"
                :rows-per-page-options="[10, 20, 50]"
                :visible-columns="visibleColumns"
                v-model:pagination="pagination" 
                @request="onRequest" 
                :loading="loading" 
                wrap-cells
            >

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
                                :icon="props.expand ? 'mdi-chevron-up' : 'mdi-chevron-down'" 
                            />
                        </q-td>
                        <!-- Body columns -->
                        <q-td v-for="col in props.cols" :key="col.name" :props="props">
                            <div v-if="col.name == 'key'" class="row items-center justify-between">
                                <q-chip dense square color="transparent" :clickable="false" :ripple="false" class="q-pa-none" >
                                    <q-img :src="props.row.issueTypeIconURL" spinner-color="primary"
                                        style="width: 16px; height: 16px;" class="q-mr-xs q-pa-none" 
                                    />
                                    {{ col.value }}
                            </q-chip>
                            </div>
                            <div v-else>
                                {{ col.value }}
                            </div>
                        </q-td>
                    </q-tr>
                    <!-- Expanded Row -->
                    <q-tr v-if="props.expand" :props="props" no-hover>
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
import { useLogger } from "../composables/Logger.js";

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
        align: "center",
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
const logger = useLogger();

const emit = defineEmits(['issue-click']);

// Function to reset search state
function resetSearch() {
    pagination.value.page = 1; // Reset to the first page
    pagination.value.rowsNumber = 0; // Reset the total number of rows
    searchResults.value = []; // Clear previous search results
    showHistory.value = false;
}

const getIssueField = (field, defaultValue = null) => {
    return field.split('.').reduce((obj, key) => obj && obj[key] !== undefined ? obj[key] : defaultValue, issueFields.value);
}

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
            logger.error(`[JqlSearch] Error requesting page ${page}`);
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
        // Comment removed since it was just a debug log
        
        // Update pagination rows with total number of items for this search query
        pagination.value.rowsNumber = response.total;

        searchResults.value = response.issues.map((issue) => ({
            id: issue.id,
            key: issue.key,
            summary: issue.fields.summary,
            status: issue.fields.status.name,
            assignee: issue.fields.assignee?.displayName || "Unassigned",
            issueType: issue.fields.issuetype.name,
            issueTypeIconURL: issue.fields.issuetype.iconUrl
        }));

        if (
            jqlQuery.value.length != 0 &&
            !searchHistory.value.includes(jqlQuery.value)
        ) {
            searchHistory.value.push(jqlQuery.value);
        }
    } catch (error) {
        logger.error(`[JqlSearch] Error performing JQL search ${page}`);
    }
}

function selectQueryFromHistory(query) {
    jqlQuery.value = query;
    resetSearch();
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
    resetSearch(); // Reset search state when setting a new query
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
