<template>
    <q-card v-if="issueFields != null" class="q-pa-md">
        <q-card-section>
            <div class="row items-center justify-between q-mb-md">
                <div class="row items-center">
                    <q-img :src="getIssueField('issuetype.iconUrl')" spinner-color="primary"
                        style="width: 18px; height: 18px;" class="q-mr-xs" />
                    <div class="text-caption text-grey-6">{{ issueDetails.key }}</div>
                </div>
                <!-- Add any other top-right elements here if needed -->
            </div>

            <div class="row items-center q-mb-md">
                <q-input :model-value="getIssueField('summary')" dense input-class="text-subtitle1"
                    standout="bg-grey-6 text-white" style="width: 100%;">
                    <template v-slot:before>
                        <q-img :src="getIssueField('issuetype.iconUrl')" style="width: 28px; height: 28px;" />
                    </template>
                </q-input>
            </div>

            <q-separator class="q-my-md" />

            <q-splitter v-model="splitterModel" :limits="[40, 60]"
                style="height:500px; max-height: calc(100vh - 225px);">

                <!-- Left column -->
                <template v-slot:before>
                    <q-scroll-area style="height: 100%;">
                        <div class="q-pa-md">
                            <div class="text-subtitle1 q-mb-sm">Description</div>

                            <q-input :model-value="getIssueField('description')" dense standout="bg-grey-6 text-white"
                                style="width: 100%;" type="textarea" />

                            <div class="text-subtitle1 q-mt-md q-mb-sm">Child issues</div>
                            <!-- Add child issues list here -->

                            <div class="text-subtitle1 q-mt-md q-mb-sm">Activity</div>
                            <!-- Add activity/comments section here -->
                        </div>
                    </q-scroll-area>
                </template>

                <!-- Separator with drag icon -->
                <template v-slot:separator>
                    <q-avatar flat text-color="white" size="40px" icon="mdi-drag-vertical" />
                </template>

                <!-- Right column -->
                <template v-slot:after>
                    <q-scroll-area style="height: 100%;">
                        <div class="q-pa-md">
                            <q-expansion-item default-opened header-class="text-subtitle1" label="Details">
                                <q-card>
                                    <q-card-section>
                                        <div class="details-list q-gutter-y-sm">
                                        <div class="row items-center">
                                            <div class="col-5">Assignee</div>
                                            <div class="col-7 row items-start">

                                                <q-input :model-value="getIssueField('assignee.displayName')" dense disable readonly
                                                    input-class="text-caption" standout="bg-grey-6 text-white" >
                                                    <template v-slot:prepend>
                                                        <q-avatar size="xs" class="q-mr-xs">
                                                            <img :src="getIssueField('assignee.avatarUrls.24x24')" />
                                                        </q-avatar>
                                                    </template>
                                                </q-input>
                                            </div>
                                        </div>

                                        <div class="row items-center">
                                            <div class="col-5">Labels</div>
                                            <div class="col-7 row items-start">

                                                <q-input :model-value="getIssueField('labels', []).join(', ')" dense disable readonly
                                                    input-class="text-caption" standout="bg-grey-6 text-white" />
                                            </div>
                                        </div>

                                        <div class="row items-center">
                                            <div class="col-5">Start date</div>
                                            <div class="col-7">{{ formatDate(getIssueField('startDate')) || 'None' }}
                                            </div>
                                        </div>

                                        <div class="row items-center">
                                            <div class="col-5">Due date</div>
                                            <div class="col-7">{{ formatDate(getIssueField('duedate')) || 'None' }}
                                            </div>
                                        </div>

                                        <div class="row items-center">
                                            <div class="col-5">Reporter</div>
                                            <div class="col-7 row items-center">
                                                <q-input :model-value="getIssueField('reporter.displayName')" dense disable readonly
                                                    input-class="text-caption" standout="bg-grey-6 text-white">
                                                    <template v-slot:prepend>
                                                        <q-avatar size="xs" class="q-mr-xs">
                                                            <img :src="getIssueField('reporter.avatarUrls.24x24')" />
                                                        </q-avatar>
                                                    </template>
                                                </q-input>
                                            </div>
                                        </div>
                                    </div>

                                        <div class="q-mt-md column q-gutter-y-xs">
                                            <div class="text-caption">Created {{ formatDate(getIssueField('created')) }}
                                            </div>
                                            <div class="text-caption">Updated {{ formatDate(getIssueField('updated')) }}
                                            </div>
                                        </div>
                                    </q-card-section>
                                </q-card>
                            </q-expansion-item>
                        </div>
                    </q-scroll-area>
                </template>

            </q-splitter>
        </q-card-section>
    </q-card>
    <div v-else>
        <p>No issue selected</p>
    </div>
</template>

<script setup>
import { defineProps, ref, watch } from 'vue';
import JiraClient from '../services/jira.js';
import { usePersistedStore } from '../stores/persisted-store.js';

const persistedStore = usePersistedStore();
const client = JiraClient({
    host: persistedStore.jiraServerAddress,
    personalAccessToken: persistedStore.jiraPersonalAccessToken,
});
const props = defineProps({
    issue: {
        type: Object,
        required: false,
        default: null
    }
});

const issueDetails = ref(null);
const issueFields = ref(null);

const getIssueField = (field, defaultValue = null) => {
    return field.split('.').reduce((obj, key) => obj && obj[key] !== undefined ? obj[key] : defaultValue, issueFields.value);
}

const getIssueTypeIcon = (issueType) => {
    switch (issueType.toLowerCase()) {
        case 'initiative':
            return 'mdi-flag-variant';
        case 'epic':
            return 'mdi-lightning-bolt';
        case 'story':
            return 'mdi-book-open-variant';
        case 'task':
            return 'mdi-checkbox-marked-circle-outline';
        case 'bug':
            return 'mdi-bug';
        default:
            return 'mdi-help-circle-outline';
    }
};

const getIssueTypeColor = (issueType) => {
    switch (issueType.toLowerCase()) {
        case 'initiative':
            return 'purple';
        case 'epic':
            return 'indigo';
        case 'story':
            return 'green';
        case 'task':
            return 'blue';
        case 'bug':
            return 'red';
        default:
            return 'grey';
    }
};

function formatDate(dateString) {
    if (!dateString) return 'None';

    try {
        // Convert the date string to a Date object
        const date = new Date(dateString);

        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }

        // Extract the components
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        // Format the date
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch (error) {
        return 'Invalid Date';
    }
}

const splitterModel = ref(50); // Initial split at 50%

watch(() => props.issue, async (newIssue) => {
    if (newIssue) {
        issueDetails.value = await client.getIssueDetails(newIssue.id);
        issueFields.value = issueDetails.value.fields;
        console.log(issueFields.value);
    }
}, { immediate: true });

</script>

<style scoped>
.q-splitter__separator {
    width: 1px;
    background: #e0e0e0;
}

.q-splitter__separator:hover {
    background: #bdbdbd;
}

.q-splitter__separator .q-avatar {
    cursor: col-resize;
}
</style>
