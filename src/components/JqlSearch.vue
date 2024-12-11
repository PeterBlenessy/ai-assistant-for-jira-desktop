<template>
    <q-card class="absolute-top q-pt-sm q-ma-none" flat style="height: 100%; width: 100%">
        <!-- Info Box Section -->
        <q-card-section class="q-pt-none" v-if="isInfoBoxVisible('JqlSearchInfo')">
            <InfoBox :markdownContent="infoBoxMarkdown" @dismiss="dismissInfoBox('JqlSearchInfo')" />
        </q-card-section>
        <q-card-section class="q-pt-none" v-if="isDemoMode && isInfoBoxVisible('JqlSearchDemoModeInfo')">
            <InfoBox :markdownContent="demoModeInfoMarkdown" @dismiss="dismissInfoBox('JqlSearchDemoModeInfo')" />
        </q-card-section>

        <q-card-section class="q-pt-none">
            <q-input label="Enter JQL Query" clearable dense filled style="width: 100%" v-model="jqlQuery"
                @keydown.enter="performSearch" :error="!!searchError" :error-message="searchError" no-error-icon>
                <template v-slot:prepend>
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
            </q-input>
        </q-card-section>

        <q-card-section flat v-if="searchResults.length != 0">
            <q-table bordered flat row-key="id" class="my-sticky-header-table q-pt-none q-ma-none" :columns="columns"
                :rows="searchResults" :rows-per-page-options="[10, 20, 50]" :visible-columns="visibleColumns"
                v-model:pagination="pagination" @request="onRequest" :loading="loading" wrap-cells>

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
                            <div v-if="col.name == 'key'" class="row items-center justify-between">
                                <q-chip dense square color="transparent" :clickable="false" :ripple="false"
                                    class="q-pa-none">
                                    <q-img :src="props.row.issueTypeIconURL" spinner-color="primary"
                                        style="width: 16px; height: 16px;" class="q-mr-xs q-pa-none" />
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
                            <IssueView :issueKey="props.row.key" />
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
import { mockJiraData } from "../test/mockJiraData";
import IssueView from "./IssueView/IssueView.vue";
import { useLogger } from "../composables/Logger.js";
import InfoBox from './InfoBox.vue';

const loading = ref(false);
const jqlQuery = ref("");
const searchResults = ref([]);
const showHistory = ref(false);
const searchError = ref('');

const pagination = ref({
    sortBy: 'key',
    descending: false,
    page: 1,
    rowsPerPage: 20,
    rowsNumber: 0,
});

const columns = [
    { 
        name: "id", 
        label: "ID", 
        field: "id",
        sortable: true,
        sort: (a, b) => Number(a) - Number(b)
    },
    {
        name: "key",
        label: "Key",
        field: "key",
        align: "center",
        required: true,
        sortable: true,
        sort: (a, b) => {
            // Extract project and number parts (e.g., "PROJ-123" -> ["PROJ", "123"])
            const [aProj, aNum] = a.split('-');
            const [bProj, bNum] = b.split('-');
            // First compare project parts
            if (aProj !== bProj) return aProj.localeCompare(bProj);
            // Then compare number parts
            return Number(aNum) - Number(bNum);
        }
    },
    {
        name: "summary",
        label: "Summary",
        field: "summary",
        align: "left",
        style: "max-width: 500px",
        required: true,
        sortable: true,
        sort: (a, b) => a.localeCompare(b)
    },
    {
        name: "status",
        label: "Status",
        field: "status",
        align: "left",
        required: true,
        sortable: true,
        sort: (a, b) => a.localeCompare(b)
    },
    {
        name: "assignee",
        label: "Assignee",
        field: "assignee",
        align: "left",
        sortable: true,
        sort: (a, b) => {
            // Handle null/undefined assignees
            if (!a) return 1;
            if (!b) return -1;
            return a.localeCompare(b);
        }
    },
];
const visibleColumns = ref(["key", "summary", "status", "assignee"]);

const persistedStore = usePersistedStore();
const { searchHistory, isDemoMode } = storeToRefs(persistedStore);
const { isInfoBoxVisible, dismissInfoBox } = persistedStore;

const infoBoxMarkdown = `
Search for issues on your Jira Server by entering a JQL (Jira Query Language) query in the input field below.
Here are some JQL examples to get you started:

Basic queries:
- \`project = "MY-PROJECT"\` - Find all issues in a project
- \`assignee = currentUser()\` - Your assigned issues
- \`created >= -1w\` - Issues created in the last week

Advanced queries:
- \`project = "MY-PROJECT" AND status = "In Progress" ORDER BY priority DESC\`
- \`assignee = currentUser() AND resolution = Unresolved\`
- \`text ~ "search term" AND type = Bug\`

[Learn more about JQL](https://www.atlassian.com/software/jira/guides/jql/overview#what-is-jql/)
`;

const demoModeInfoMarkdown = `
🎮 Demo Mode Active

You're currently in demo mode with access to a rich set of sample data. Try these example queries:

Available Projects:
- \`project = "MOBILE"\` - Mobile App project
- \`project = "WEB"\` - Web Platform project
- \`project = "API"\` - API Services project
- \`project = "INFRA"\` - Infrastructure project
- \`project = "DATA"\` - Data Platform project

Issue Types:
- \`type = "Initiative"\` - Strategic initiatives
- \`type = "Epic"\` - Project epics
- \`type = "Story"\` - User stories
- \`type = "Task"\` - Technical tasks
- \`type = "Sub-task"\` - Sub-tasks

Status Filter:
- \`status = "In Progress"\`
- \`status = "To Do"\`
- \`status = "Done"\`
- \`status = "In Review"\`

Note: In demo mode, complex JQL with AND/OR operators is not supported.
`;

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

// Handle pagination requests
function onRequest(props) {
    const { page, rowsPerPage, sortBy, descending } = props.pagination;

    loading.value = true;

    // Update all pagination values including sort
    pagination.value.page = page;
    pagination.value.rowsPerPage = rowsPerPage;
    pagination.value.sortBy = sortBy;
    pagination.value.descending = descending;

    performSearch()
        .then(() => {
            loading.value = false;
        })
        .catch(() => {
            logger.error(`[JqlSearch] Error requesting page ${page}`);
            loading.value = false;
        });
}

async function performSearch() {
    if (jqlQuery.value == "") return;

    searchError.value = ''; // Clear any previous errors
    const startAt = (pagination.value.page - 1) * pagination.value.rowsPerPage;
    const maxRows = pagination.value.rowsPerPage;

    try {
        if (isDemoMode.value) {
            // In demo mode, we'll do client-side filtering of the mock data
            const allIssues = mockJiraData.getAllIssues();
            let filteredIssues = allIssues;

            // Basic JQL parsing and filtering
            const query = jqlQuery.value.toLowerCase();
            if (query.includes('project =')) {
                const projectKey = query.match(/project\s*=\s*["']?([^"'\s]+)["']?/i)?.[1];
                if (projectKey) {
                    filteredIssues = filteredIssues.filter(issue =>
                        issue.fields.project?.key.toLowerCase() === projectKey.toLowerCase()
                    );
                }
            }
            if (query.includes('status =')) {
                const status = query.match(/status\s*=\s*["']?([^"'\s]+)["']?/i)?.[1];
                if (status) {
                    filteredIssues = filteredIssues.filter(issue =>
                        issue.fields.status?.name.toLowerCase() === status.toLowerCase()
                    );
                }
            }
            if (query.includes('type =') || query.includes('issuetype =')) {
                const type = query.match(/(?:type|issuetype)\s*=\s*["']?([^"'\s]+)["']?/i)?.[1];
                if (type) {
                    filteredIssues = filteredIssues.filter(issue =>
                        issue.fields.issuetype?.name.toLowerCase() === type.toLowerCase()
                    );
                }
            }

            // Map the filtered issues to the required format
            let mappedIssues = filteredIssues.map((issue) => ({
                id: issue.id,
                key: issue.key,
                summary: issue.fields?.summary || '',
                status: issue.fields?.status?.name || '',
                assignee: issue.fields?.assignee?.displayName || "Unassigned",
                issueType: issue.fields?.issuetype?.name || '',
                issueTypeIconURL: issue.fields?.issuetype?.iconUrl
            }));

            // Sort results based on current sort settings
            if (pagination.value.sortBy) {
                const sortFn = columns.find(col => col.name === pagination.value.sortBy)?.sort;
                if (sortFn) {
                    mappedIssues.sort((a, b) => {
                        const result = sortFn(a[pagination.value.sortBy], b[pagination.value.sortBy]);
                        return pagination.value.descending ? -result : result;
                    });
                }
            }

            // Apply pagination after sorting
            const total = mappedIssues.length;
            const paginatedIssues = mappedIssues.slice(startAt, startAt + maxRows);

            pagination.value.rowsNumber = total;
            searchResults.value = paginatedIssues;

            if (jqlQuery.value.length != 0 && !searchHistory.value.includes(jqlQuery.value)) {
                searchHistory.value.push(jqlQuery.value);
            }
            return;
        }

        const response = await jiraClient.value.searchIssues(
            jqlQuery.value,
            startAt,
            maxRows,
        );

        pagination.value.rowsNumber = response.total;

        let mappedIssues = response.issues.map((issue) => ({
            id: issue.id,
            key: issue.key,
            summary: issue?.fields?.summary || '',
            status: issue?.fields?.status?.name || '',
            assignee: issue?.fields?.assignee?.displayName || "Unassigned",
            issueType: issue?.fields?.issuetype?.name || '',
            issueTypeIconURL: issue?.fields?.issuetype?.iconUrl || ''
        }));

        // Sort results based on current sort settings
        if (pagination.value.sortBy) {
            const sortFn = columns.find(col => col.name === pagination.value.sortBy)?.sort;
            if (sortFn) {
                mappedIssues.sort((a, b) => {
                    const result = sortFn(a[pagination.value.sortBy], b[pagination.value.sortBy]);
                    return pagination.value.descending ? -result : result;
                });
            }
        }

        searchResults.value = mappedIssues;

        if (jqlQuery.value.length != 0 && !searchHistory.value.includes(jqlQuery.value)) {
            searchHistory.value.push(jqlQuery.value);
        }
    } catch (error) {
        // Handle specific JQL syntax errors
        if (error.details?.errors?.jql) {
            searchError.value = `JQL Error: ${error.details.errors.jql}`;
        } else if (error.details?.errorMessages?.length > 0) {
            searchError.value = error.details.errorMessages[0];
        } else {
            searchError.value = 'Failed to perform search. Please check your JQL syntax.';
        }
        logger.error(`[JqlSearch] Error performing JQL search: ${error.message}`);
        searchResults.value = []; // Clear results on error
        pagination.value.rowsNumber = 0;
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

</script>
<style lang="sass">
.my-sticky-header-table
    /* height or max-height is important */
    height: calc(100vh - 160px)

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
