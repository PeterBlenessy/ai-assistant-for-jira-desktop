<template>
    <div v-if="issueFields" class="row items-start">
        <!-- Original Issue Column -->
        <div class="col-12 col-md-6 q-pa-sm">
            <div class="row items-center justify-between">
                <div class="text-h2">Original Issue Fields</div>
                <div>
                    <q-btn v-if="hasPendingChanges"
                        class="q-pl-xs q-mb-sm q-mr-sm"
                        size="sm"
                        color="warning"
                        label="SYNC TO JIRA"
                        icon="mdi-database-sync-outline"
                        @click="syncToJira"
                    />
                    <q-btn
                        class="q-pl-xs q-mb-sm"
                        size="sm"
                        :color="loading ? 'negative' : 'primary'"
                        :label="loading ? 'ABORT' : 'IMPROVE'"
                        :icon="loading ? 'mdi-stop' : 'mdi-creation-outline'"
                        @click="() => loading ? abortGeneration() : generateImprovement(props.issueKey)"
                    />
                </div>
            </div>
            <q-list separator bordered padding class="rounded-borders q-pt-none">
                <template v-for="field in issueDisplayFields" :key="field">
                    <q-item>
                        <q-item-section>
                            <q-item-label class="text-capitalize text-h2">{{ field }}</q-item-label>
                            <q-item-label class="field-container">
                                <template v-if="editingField === field && editingType === 'original'">
                                    <q-input v-model="editingContent" type="textarea" filled dense :autogrow="true"
                                        @keyup.enter.ctrl="saveEdit" @keyup.esc="cancelEdit" />
                                </template>
                                <template v-else>
                                    <MarkdownViewer :content="getIssueField(field)" />
                                </template>
                            </q-item-label>
                        </q-item-section>
                        <q-item-section top side class="floating-buttons">
                            <template v-if="editingField === field && editingType === 'original'">
                                <div class="row">
                                    <q-btn class="q-pa-xs q-ma-none q-mt-sm q-mr-sm" size="sm" flat icon="mdi-check"
                                        color="positive" @click="saveEdit" />
                                    <q-btn class="q-pa-xs q-ma-none q-mt-sm q-mr-sm" size="sm" flat icon="mdi-close"
                                        @click="cancelEdit" />
                                </div>
                            </template>
                            <template v-else>
                                <q-btn class="q-pa-xs q-ma-none q-mt-sm q-mr-sm" flat size="sm" icon="mdi-pencil"
                                    @click="startEdit(field, 'original', getIssueField(field))" />
                            </template>
                        </q-item-section>
                    </q-item>
                </template>
            </q-list>

            <!-- Issues and Comments Section -->
            <q-list bordered class="rounded-borders q-mt-md q-pa-none" dense>
                <!-- Child Issues -->
                <ChildIssues :child-issues="childIssues" />
                <q-separator />

                <!-- Linked Issues -->
                <LinkedIssues :related-issues="relatedIssues" />
                <q-separator />

                <!-- Comments -->
                <IssueComments :comments="comments" />
            </q-list>
        </div>
        <!-- Improvements Column -->
        <div class="col-12 col-md-6 q-pa-sm">
            <div class="text-h2 q-mb-sm">AI Generated Improvement Proposals</div>
            <!-- STATE: GENERATING -->
            <!-- Field text is displayed if updated; comment is always displayed if available -->
            <q-list v-if="improvementProposal && improvementFieldsFiltered?.length > 0" separator bordered padding
                class="rounded-borders q-pt-none">
                <template v-for="(field, key) in improvementProposal" :key="key">
                    <q-item v-if="shouldDisplayField(key)">
                        <q-item-section>
                            <q-item-label class="text-capitalize text-h2">{{ field?.label || field }}</q-item-label>
                            <q-item-label v-if="field?.text && isFieldUpdated(field)" class="field-container">
                                <template v-if="editingField === key && editingType === 'improved'">
                                    <q-input v-model="editingContent" type="textarea" filled autofocus :autogrow="true"
                                        @blur="saveEdit" @keyup.enter.ctrl="saveEdit" @keyup.esc="cancelEdit" />
                                </template>
                                <template v-else>
                                    <MarkdownViewer :content="field?.text" />
                                </template>
                            </q-item-label>
                            <q-item-label v-if="field?.comment" caption class="text-italic q-mt-xs">
                                Comment: {{ field?.comment }}
                            </q-item-label>
                        </q-item-section>
                        <q-item-section side top v-if="isFieldUpdated(field)" class="floating-accept">
                            <div class="row">
                                <q-btn class="text-uppercase q-ma-sm q-pb-none q-pt-none q-pl-sm q-pr-sm" 
                                    color="primary"
                                    size="sm" 
                                    :disable="field.accepted"
                                    :outline="field.accepted"
                                    :label="field.accepted ? 'Accepted' : 'Accept'"
                                    :icon="field.accepted ? 'mdi-check' : 'mdi-plus'"
                                    @click="acceptImprovement(key, field)" 
                                />
                                <!-- Add revert button that shows only when change is accepted -->
                                <q-btn v-if="field.accepted && isPendingChange(key)"
                                    class="text-uppercase q-ma-sm q-pb-none q-pt-none q-pl-sm q-pr-sm" 
                                    color="negative"
                                    size="sm"
                                    outline
                                    icon="mdi-undo"
                                    label="Revert"
                                    @click="revertImprovement(key)" 
                                />
                            </div>
                        </q-item-section>
                    </q-item>
                </template>
            </q-list>

            <!-- STATE: WAITING -->
            <!-- for streaming respons to start -->
            <div v-else-if="loading">
                <q-spinner-ios size="24px" />
                Generating improvements
            </div>

            <!-- STATE: IDLE -->
            <div v-else-if="!loading">

                <!-- STATE: NOT STARTED -->
                <q-list v-if="improvementProposal == null" bordered class="rounded-borders"
                    style="border-color: var(--q-warning); background-color: rgb(from var(--q-warning) r g b / 10%)">
                    <q-item>
                        <q-item-section avatar>
                            <q-icon name="mdi-information-outline" color="warning" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>Click the improve button to generate improvement proposals</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>

                <!-- STATE: NO IMPROVEMENTS AND NO COMMENTS -->
                <q-list v-else-if="improvementProposal != null && improvementFieldsFiltered.length == 0" bordered
                    class="rounded-borders"
                    style="border-color: var(--q-warning); background-color: rgb(from var(--q-warning) r g b / 10%)">
                    <q-item>
                        <q-item-section avatar>
                            <q-icon name="mdi-information-outline" color="warning" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>No improvement proposals or comments</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>

                <!-- STATE: FAILED -->
                <!-- This happens due to connection issues, e.g. if user has no AI credits left.  -->
                <q-list v-else-if="improvementFailed" bordered padding class="rounded-borders"
                    style="border-color: var(--q-negative); background-color: rgb(from var(--q-negative) r g b / 10%)">
                    <q-item>
                        <q-item-section avatar>
                            <q-icon name="mdi-alert-circle-outline" color="negative" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label class="text-h3">Failed to generate improvements</q-item-label>
                            <q-item-label>{{ errorMessage }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </div>
        </div>
    </div>

</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useJiraClient } from '../../composables/JiraClient.js';
import { useOpenAIClient } from '../../composables/OpenAIClient.js';
import { usePersistedStore } from '../../stores/persisted-store';
import { storeToRefs } from 'pinia';
import { mockJiraData } from '../../test/mockJiraData';
import MarkdownViewer from '../MarkdownViewer.vue';
import ChildIssues from './ChildIssues.vue';
import LinkedIssues from './LinkedIssues.vue';
import IssueComments from './IssueComments.vue';
import { useLogger } from '../../composables/Logger.js';
import { useTemplateStore } from '../../stores/template-store';
import { PROMPT_GENERATE_IMPROVEMENT_MARKDOWN } from "../../helpers/prompts.js";
import {
    parseYAML,
    extractDescriptionSections,
    formatDescription
} from '../../helpers/markupUtils.js';

const props = defineProps({
    issueKey: {
        type: String,
        required: true
    }
});

const $q = useQuasar();
const logger = useLogger();
const { jiraClient } = useJiraClient();

const store = usePersistedStore();
const { isDemoMode } = storeToRefs(store);

const loading = ref(false);
const issueFields = ref(null);

const childIssues = ref([]);
const relatedIssues = ref([]);
const comments = ref([]);

// Fields from the issue to display in the UI
const issueDisplayFields = ['summary', 'description'];

const { openAIClient } = useOpenAIClient();
const templateStore = useTemplateStore();

const improvementProposal = ref(null);
const improvementFailed = ref(false);
const errorMessage = ref('');
const chunks = ref(0);

// Get the value of a field from the issue fields object
const getIssueField = (field, defaultValue = null) => {
    return field.split('.').reduce((obj, key) => obj && obj[key] !== undefined && obj[key] !== null ? obj[key] : defaultValue, issueFields.value);
}

// State for editing
const editingField = ref(null);
const editingType = ref(null);
const editingContent = ref('');

// Editing functions
const startEdit = (fieldName, type, content) => {
    editingField.value = fieldName;
    editingType.value = type;
    editingContent.value = content;
};

const saveEdit = async () => {
    if (!editingField.value || !editingType.value) return;

    // Only allow saving original fields
    if (editingType.value !== 'original') return;

    try {
        const updateFields = {
            fields: {
                [editingField.value]: editingContent.value
            }
        };

        // Save to Jira
        if (!isDemoMode.value) {
            await jiraClient.value.updateIssue(props.issueKey, updateFields);
        }

        // Update local state
        issueFields.value[editingField.value] = editingContent.value;
        // Also update originalValues to reflect the new state
        originalValues.value[editingField.value] = editingContent.value;
    } catch (error) {
        console.error('Error saving edit:', error);
        $q.notify({
            type: 'negative',
            message: 'Failed to save changes',
            caption: error.message,
            position: 'top',
            timeout: 5000
        });
    } finally {
        cancelEdit();
    }
};

const cancelEdit = () => {
    editingField.value = null;
    editingType.value = null;
    editingContent.value = '';
};

const fetchChildIssues = async () => {
    if (isDemoMode.value) {
        childIssues.value = mockJiraData.getChildIssues(props.issueKey) || [];
        return;
    }
    try {
        const jql = `parent = ${props.issueKey} ORDER BY created ASC`;
        const result = await jiraClient.value.searchIssues(jql, 0, 50, ["summary", "status", "issuetype"]);
        childIssues.value = result.issues || [];
    } catch (error) {
        logger.error(`Error fetching child issues: ${error}`);
        childIssues.value = [];
    }
};

const fetchRelatedIssues = async () => {
    if (isDemoMode.value) {
        // In demo mode, we'll show other issues from the same epic/initiative as related
        const currentIssue = mockJiraData.getIssue(props.issueKey);
        if (currentIssue) {
            const parent = mockJiraData.getIssue(currentIssue.fields.parent?.key);
            if (parent) {
                relatedIssues.value = mockJiraData.getChildIssues(parent.key)
                    .filter(issue => issue.key !== props.issueKey) || [];
                return;
            }
        }
        relatedIssues.value = [];
        return;
    }
    try {
        // This JQL finds issues that are either linked to or from the current issue
        const jql = `issue in linkedIssues(${props.issueKey}) ORDER BY created ASC`;
        const result = await jiraClient.value.searchIssues(jql, 0, 50, ["summary", "status", "issuetype"]);
        relatedIssues.value = result.issues || [];
    } catch (error) {
        logger.error(`Error fetching related issues: ${error}`);
        relatedIssues.value = [];
    }
};

const fetchComments = async () => {
    if (isDemoMode.value) {
        comments.value = mockJiraData.getComments(props.issueKey) || [];
        return;
    }
    try {
        const issueDetails = await jiraClient.value.getIssueDetails(props.issueKey);
        comments.value = issueDetails.fields.comment?.comments || [];
    } catch (error) {
        logger.error(`Error fetching comments: ${error}`);
        comments.value = [];
    }
};

const originalValues = ref({});

// Modify the watch handler for issueKey to store original values
watch(() => props.issueKey, async (newIssueKey) => {
    if (newIssueKey) {
        if (isDemoMode.value) {
            const issue = mockJiraData.getIssue(newIssueKey);
            if (issue) {
                issueFields.value = issue.fields;
                // Store original values
                originalValues.value = JSON.parse(JSON.stringify(issue.fields));
                await Promise.all([
                    fetchChildIssues(),
                    fetchRelatedIssues(),
                    fetchComments()
                ]);
            }
            return;
        }
        const issueDetails = await jiraClient.value.getIssueDetails(newIssueKey);
        issueFields.value = issueDetails.fields;
        // Store original values
        originalValues.value = JSON.parse(JSON.stringify(issueDetails.fields));
        await Promise.all([
            fetchChildIssues(),
            fetchRelatedIssues(),
            fetchComments()
        ]);
    }
}, { immediate: true });

// Fields in the template for the current issue type
const templateFields = computed(() => {
    const currentTemplate = templateStore.templates.find(t => t.name === getIssueField('issuetype.name'));
    return currentTemplate?.fields?.map(field => field.name) || []
});

const getIssueTypeInstructions = (issueType) => {
    const templates = templateStore.templates;
    const currentTemplate = templates.find(t => t.name === issueType);

    let issueTypeInstructions = '';
    if (currentTemplate) {
        // Include definition
        if (currentTemplate.definition) {
            issueTypeInstructions += `\n\nIssue Type: ${currentTemplate.name}\nDefinition:\n${currentTemplate.definition}\n`;
        }

        // Include persona
        if (currentTemplate.persona) {
            issueTypeInstructions += `\nPersona: ${currentTemplate.persona.name}\nDefinition: ${currentTemplate.persona.definition}\n`;
        }

        // Include fields
        if (currentTemplate.fields && currentTemplate.fields.length > 0) {
            issueTypeInstructions += `\nFields:\n`;
            currentTemplate.fields.forEach(field => {
                issueTypeInstructions += `- **${field.title}**: ${field.definition}\n`;
            });
        }
    } else {
        $q.notify({
            type: 'info',
            message: `No prompt template exists for the issue type: ${issueType}`,
            caption: 'You should consider adding one.',
            color: 'warning',
            timeout: 0,
            actions: [
                { label: 'Dismiss', color: 'white', handler: () => { /* ... */ } }
            ]
        });
    }

    return issueTypeInstructions;
}


const generateImprovement = async (issueKey) => {
    loading.value = true;
    chunks.value = 0;
    improvementFailed.value = false;
    improvementProposal.value = null;
    errorMessage.value = '';
    const issueType = getIssueField('issuetype.name');

    // Handle demo mode
    if (isDemoMode.value) {
        try {
            // Simulate streaming response
            const mockImprovement = mockJiraData.getMockImprovement(issueType);
            
            // Split the response into chunks to simulate streaming
            const chunks = Object.entries(mockImprovement).map(([key, value]) => ({
                [key]: value
            }));
            
            for (const chunk of chunks) {
                await new Promise(resolve => setTimeout(resolve, 500)); // Add delay for realistic effect
                improvementProposal.value = {
                    ...(improvementProposal.value || {}),
                    ...chunk
                };
            }
            
        } catch (error) {
            logger.error(`[IssueFields] - Error in demo mode: ${error.message}`);
            improvementFailed.value = true;
            errorMessage.value = error.message;
        } finally {
            loading.value = false;
            return;
        }
    }

    // Rest of the existing function for non-demo mode
    const userMessage = {
        "issueKey": issueKey,
        "issueType": issueType,
        "summary": getIssueField('summary'),
        "description": getIssueField('description')
    };
    let fullResponse = "";
    try {
        const stream = await openAIClient.value.createChatCompletion([
            { role: "system", content: PROMPT_GENERATE_IMPROVEMENT_MARKDOWN },
            { role: "system", content: getIssueTypeInstructions(issueType) },
            { role: "user", content: JSON.stringify(userMessage) }
        ]);

        if (!stream) {
            // Stream is null when aborted
            return;
        }

        for await (const chunk of stream) {
            fullResponse += chunk.choices[0]?.delta?.content || "";
            improvementProposal.value = parseYAML(fullResponse);

            // Wait to improve streamed response UX
            await new Promise(resolve => setTimeout(resolve, 5));
        }
    } catch (error) {
        logger.error(`[IssueFields] - Error fetching improvements: ${error.message}`);
        improvementFailed.value = true;
        errorMessage.value = error.message;
        $q.notify({
            type: 'negative',
            message: 'Failed to generate improvements',
            caption: error.message,
            timeout: 0,
            actions: [
                { label: 'Dismiss', color: 'white', handler: () => { /* ... */ } }
            ]

        });
    } finally {
        loading.value = false;
    }
};


const abortGeneration = () => {
    openAIClient.value.abort();
    loading.value = false;
    improvementFailed.value = true;
    errorMessage.value = 'Generation aborted by user';
};

// Checks if the field with fieldKey from the improvement proposal has been updated
const isFieldUpdated = (field) => {
    return field?.updated == 'true' || field?.updated == true;
};

// Fields in the improvement proposal
const improvementFields = computed(() => Object.keys(improvementProposal.value || {}));

// Fields that exist in both the improvementFields and in templateFields
const improvementFieldsFiltered = computed(() => {
    return improvementFields.value.filter(field => templateFields.value.includes(field));
});

// Checks if field with fieldKey from the improvement proposal should be displayed in the UI
const shouldDisplayField = (fieldKey) => {
    return improvementFieldsFiltered.value.includes(fieldKey);
};


// Helper function to format array content as a numbered list
const formatArrayContent = (content) => {
    if (Array.isArray(content)) {
        return content.map((item, index) => `${index + 1}. ${item}`).join('\n');
    }
    return content;
};

// Add this new ref to track pending changes
const pendingChanges = ref({});

// Modify the acceptImprovement function
const acceptImprovement = async (type, improvement) => {
    try {
        let updateFields = {};
        if (improvementProposal.value[type]) {
            if (type === 'summary') {
                updateFields.summary = improvement.text;
            } else {
                const currentDescription = getIssueField('description') || '';
                const descriptionSections = extractDescriptionSections(currentDescription);
                const formattedContent = formatArrayContent(improvement.text);

                if (type === 'description') {
                    descriptionSections.description = formattedContent;
                    updateFields.description = formatDescription(descriptionSections);
                } else {
                    const fieldLabel = improvementProposal.value[type].label || type;
                    descriptionSections[fieldLabel] = formattedContent;
                    updateFields.description = formatDescription(descriptionSections);
                }
            }
        }

        // Store the changes locally instead of sending to Jira
        pendingChanges.value = {
            ...pendingChanges.value,
            [type]: updateFields
        };

        // Update local state to show the changes in UI
        if (updateFields.summary) {
            issueFields.value.summary = updateFields.summary;
        }
        if (updateFields.description) {
            issueFields.value.description = updateFields.description;
        }

        improvementProposal.value[type].accepted = true;

    } catch (error) {
        logger.error(`[IssueFields] Error accepting improvement: ${error}`);
        // Add error notification
        $q.notify({
            type: 'negative',
            message: 'Error accepting improvement',
            caption: error.message,
            timeout: 5000
        });
    }
};

// Add new function to sync changes to Jira
const syncToJira = async () => {
    try {
        // Handle demo mode
        if (isDemoMode.value) {
            // Clear pending changes in demo mode
            pendingChanges.value = {};
            
            // Show success notification for demo mode
            $q.notify({
                type: 'positive',
                message: 'Demo Mode: Changes would be synced to Jira',
                caption: 'In real mode, these changes would be saved to your Jira instance',
                timeout: 3000,
                actions: [
                    { label: 'Dismiss', color: 'white' }
                ]
            });
            return;
        }

        // Combine all pending changes
        const allChanges = { fields: {} };
        Object.values(pendingChanges.value).forEach(changes => {
            Object.entries(changes).forEach(([field, value]) => {
                allChanges.fields[field] = value;
            });
        });

        // Send to Jira
        await jiraClient.value.updateIssue(props.issueKey, allChanges);
        
        // Clear pending changes
        pendingChanges.value = {};

        // Refresh the issue fields to confirm changes
        const issueDetails = await jiraClient.value.getIssueDetails(props.issueKey);
        issueFields.value = issueDetails.fields;

        // Show success notification
        $q.notify({
            type: 'positive',
            message: 'Changes synced to Jira successfully',
            timeout: 2000
        });
    } catch (error) {
        logger.error(`[IssueFields] Error syncing to Jira: ${error}`);
        $q.notify({
            type: 'negative',
            message: 'Failed to sync changes to Jira',
            caption: error.message,
            timeout: 5000
        });
    }
};

// Add computed property to check if there are pending changes
const hasPendingChanges = computed(() => Object.keys(pendingChanges.value).length > 0);

const revertImprovement = async (type) => {
    try {
        // Remove the pending change
        delete pendingChanges.value[type];

        // Reset the field to its original value
        if (type === 'summary') {
            issueFields.value.summary = originalValues.value.summary;
        } else {
            // For description fields, only revert the specific section
            const currentDescription = issueFields.value.description;
            const originalDescription = originalValues.value.description;
            
            const currentSections = extractDescriptionSections(currentDescription);
            const originalSections = extractDescriptionSections(originalDescription);
            
            // Get the field label that needs to be reverted
            const fieldLabel = improvementProposal.value[type].label || type;
            
            if (type === 'description') {
                currentSections.description = originalSections.description;
            } else {
                currentSections[fieldLabel] = originalSections[fieldLabel];
            }
            
            // Update the description with the reverted section
            issueFields.value.description = formatDescription(currentSections);
        }

        // Reset the accepted state in the improvement proposal
        if (improvementProposal.value[type]) {
            improvementProposal.value[type].accepted = false;
        }

        // Show success notification
        $q.notify({
            type: 'positive',
            message: 'Change reverted successfully',
            timeout: 2000
        });
    } catch (error) {
        logger.error(`[IssueFields] Error reverting improvement: ${error}`);
        $q.notify({
            type: 'negative',
            message: 'Failed to revert change',
            caption: error.message,
            timeout: 5000
        });
    }
};

// Add this helper function in the script section
const isPendingChange = (type) => {
    return type in pendingChanges.value;
};

</script>

<style scoped>
.field-container {
    position: relative;
}

.floating-buttons {
    position: absolute !important;
    top: 0;
    right: 0;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 1;
}

.q-item:hover .floating-buttons {
    opacity: 1;
}

.floating-accept {
    position: absolute !important;
    top: 0;
    right: 0;
    z-index: 1;
}

.q-input {
    width: 100%;
}

.issue-key {
    font-family: monospace;
    font-size: 0.9em;
}
</style>
