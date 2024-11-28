<template>
    <div v-if="issueFields" class="row q-col-gutter-md items-start" :class="{ 'column': $q.screen.lt.md }">
        <!-- Original Issue Column -->
        <div class="col-12 col-md-6 q-pr-sm">
            <div class="text-subtitle1 q-mb-sm">Original Issue Fields</div>
            <q-list separator bordered padding class="rounded-borders">
                <template v-for="field in issueDisplayFields" :key="field">
                    <q-item>
                        <q-item-section>
                            <q-item-label class="text-capitalize text-subtitle2">{{ field }}</q-item-label>
                            <q-item-label>
                                <div v-if="field === 'description'">
                                    <MarkdownViewer :content="getIssueField(field)" />
                                </div>
                                <div v-else>
                                    <div v-html="formatJiraMarkup(getIssueField(field))"></div>
                                </div>
                            </q-item-label>
                        </q-item-section>
                    </q-item>
                </template>
            </q-list>
            <div class="float-right q-ma-sm">
                <q-btn color="primary" label="IMPROVE" @click="generateImprovement(props.issueKey)"
                    :loading="loading" />
            </div>
        </div>

        <!-- Improvements Column -->
        <div class="col-12 col-md-6 q-pl-md">
            <div class="text-subtitle1 q-mb-sm">AI Generated Improvement Proposals</div>
            <div class="description-text">
                <q-list v-if="improvementProposal && hasImprovements" separator bordered padding
                    class="rounded-borders">
                    <template v-for="(field, key) in improvementProposal" :key="key">
                        <q-item v-if="field?.updated == 'true' || field?.updated == true" style="cursor: default">
                            <q-item-section>
                                <q-item-label class="text-capitalize text-subtitle2">
                                    {{ field?.label || field }}
                                </q-item-label>
                                <q-item-label v-if="field?.text">
                                    <MarkdownViewer :content="field?.text" />
                                </q-item-label>
                                <q-item-label v-if="field?.comment" caption class="text-italic q-mt-xs">
                                    Comment: {{ field?.comment }}
                                </q-item-label>
                            </q-item-section>
                            <q-item-section side top>
                                <q-chip square size="sm" class="text-caption text-uppercase q-ma-none" color="primary"
                                    :clickable="!field.accepted" :outline="field.accepted"
                                    :label="field.accepted ? 'Accepted' : 'Accept'"
                                    :icon="field.accepted ? 'mdi-check' : 'mdi-plus'"
                                    @click="acceptImprovement(key, field)" />
                            </q-item-section>
                        </q-item>
                    </template>
                </q-list>
                <!-- Failed improvement -->
                <q-list v-else-if="improvementFailed" bordered padding class="rounded-borders"
                    style="border-color: var(--q-negative); background-color: rgb(from var(--q-negative) r g b / 10%)">
                    <q-item>
                        <q-item-section avatar top>
                            <q-icon name="mdi-alert-circle-outline" color="negative" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label class="text-subtitle2">Failed to generate improvements</q-item-label>
                            <q-item-label>{{ errorMessage }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
                <!-- No improvements needed -->
                <q-list v-else-if="!improvementFailed && !loading" bordered padding class="rounded-borders"
                    style="border-color: var(--q-positive); background: rgb(from var(--q-positive) r g b / 10%)">
                    <q-item>
                        <q-item-section avatar top>
                            <q-icon name="mdi-check-circle-outline" color="positive" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>All fields look great! No improvements needed.</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>

                <!-- Generating improvement -->
                <div v-else-if="loading">
                    Generating improvements...
                </div>

                <!-- First open -->
                <div v-else class="q-pa-md">Click the improve button to generate improvement proposals</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { colors, getCssVar, useQuasar } from 'quasar';
import { useJiraClient } from '../composables/JiraClient.js';
import { useOpenAIClient } from '../composables/OpenAIClient.js';
import MarkdownViewer from './MarkdownViewer.vue';
import { useTemplateStore } from '../stores/template-store';
import { PROMPT_GENERATE_IMPROVEMENT_MARKDOWN } from "../helpers/prompts.js";
import { useLogger } from '../composables/Logger.js';

import {
    parseYAML,
    formatJiraMarkup,
    extractDescriptionSections,
    formatDescription
} from '../composables/utility.js';

const props = defineProps({
    issueKey: {
        type: String,
        required: true
    }
});

const $q = useQuasar();
const logger = useLogger();
const { jiraClient } = useJiraClient();
const { openAIClient } = useOpenAIClient();
const templateStore = useTemplateStore();

const { textToRgb } = colors

const loading = ref(false);
const issueFields = ref(null);
const improvementProposal = ref(null);
const chunks = ref(0);
const improvementFailed = ref(false);
const errorMessage = ref('');

const issueDisplayFields = ['summary', 'description'];
const improvementDisplayFields = computed(() => Object.keys(improvementProposal.value || {}));

const shouldDisplayField = (field) => {
    const fieldData = improvementProposal.value[field];
    return fieldData?.updated && (field !== 'acceptanceCriteria' || fieldData.text?.length > 0);
};

const hasImprovements = computed(() => {
    return improvementDisplayFields.value.some(field => shouldDisplayField(field));
});

// Get the value of a field from the issue fields object
const getIssueField = (field, defaultValue = null) => {
    return field.split('.').reduce((obj, key) => obj?.[key] ?? defaultValue, issueFields.value);
}

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
            message: `No AI guidance found for the issue type: ${issueType}`,
            caption: 'You should consider adding one.',
            color: 'warning',
        });
    }

    return issueTypeInstructions;
}
const generateImprovement = async (issueKey) => {
    loading.value = true;
    chunks.value = 0;
    improvementFailed.value = false;
    errorMessage.value = '';
    const issueType = getIssueField('issuetype.name');

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

        for await (const chunk of stream) {
            fullResponse += chunk.choices[0]?.delta?.content || "";;
            improvementProposal.value = parseYAML(fullResponse);

            // Wait to improve streamed response UX
            await new Promise(resolve => setTimeout(resolve, 5));
        }
    } catch (error) {
        logger.error(`[IssueFields] - Error fetching improvements: ${error.message}`);
        improvementFailed.value = true;
        errorMessage.value = error.message;
        $q.notify({
            message: 'Failed to generate improvements',
            caption: error.message,
            color: 'negative'
        });
    } finally {
        loading.value = false;
    }
};

// Watch for changes in the issue key and fetch the issue details
watch(() => props.issueKey, async (newIssueKey) => {
    if (newIssueKey) {
        const issueDetails = await jiraClient.value.getIssueDetails(newIssueKey);
        issueFields.value = issueDetails.fields;
    }
}, { immediate: true });

// Dynamic field handling for accepting an improvement proposal
const acceptImprovement = async (type, improvement) => {
    try {
        let updateFields = {};
        if (improvementProposal.value[type]) {
            const currentDescription = getIssueField('description') || '';
            const descriptionSections = extractDescriptionSections(currentDescription);
            updateFields.description = formatDescription(descriptionSections, improvement);
        }

        await jiraClient.value.updateIssue(props.issueKey, { fields: updateFields });
        improvementProposal.value[type].accepted = true;

        // Refresh the issue fields to show updated content
        const issueDetails = await jiraClient.value.getIssueDetails(props.issueKey);
        issueFields.value = issueDetails.fields;

    } catch (error) {
        logger.error(`[IssueFields] Error updating issue: ${error}`);
    }
};

</script>

<style scoped>
/* Add some spacing for the formatted content */
h1,
h2,
h3 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
}
</style>
