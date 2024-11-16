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
                        <q-item v-if="field?.updated == true" style="cursor: default">
                            <q-item-section>
                                <q-item-label class="text-capitalize text-subtitle2">
                                    {{ field?.title || field }}
                                </q-item-label>
                                <q-item-label v-if="field?.text">
                                    <MarkdownViewer :content="field?.text" />
                                </q-item-label>
                                <q-item-label v-if="field?.comment" caption
                                    class="text-italic q-mt-xs">
                                    Comment: {{ field?.comment }}
                                </q-item-label>
                            </q-item-section>
                            <q-item-section side top>
                                <q-chip square size="sm" class="text-caption text-uppercase q-ma-none" color="primary"
                                    :clickable="!field.accepted"
                                    :outline="field.accepted"
                                    :label="field.accepted ? 'Accepted' : 'Accept'"
                                    :icon="field.accepted ? 'mdi-check' : 'mdi-plus'"
                                    @click="acceptImprovement(key, field)" />
                            </q-item-section>
                        </q-item>
                    </template>
                </q-list>
                <div v-else-if="!hasImprovements && !loading" class="text-grey-5 q-pt-lg">
                    <div>All fields look great! No improvements needed.</div>
                    <div class="text-h2 q-ma-xl">👍</div>
                </div>
                <div v-else-if="loading" class="q-pa-md">Generating improvements...</div>
                <div v-else class="q-pa-md">Click the improve button to generate improvement proposals</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useJiraClient } from '../composables/JiraClient.js';
import { useOpenAIClient } from '../composables/OpenAIClient.js';
import MarkdownViewer from './MarkdownViewer.vue';
import { useTemplateStore } from '../stores/template-store';
import { PROMPT_GENERATE_IMPROVEMENT_MARKDOWN } from "../helpers/prompts.js";

import {
    parseFrontMatter,
    parseMarkdown,
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

const loading = ref(false);
const issueFields = ref(null);
const improvementProposal = ref(null);

const { jiraClient } = useJiraClient();
const { openAIClient } = useOpenAIClient();
const templateStore = useTemplateStore();

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
    }

    return issueTypeInstructions;
}
const generateImprovement = async (issueKey) => {
    loading.value = true;
    const issueType = getIssueField('issuetype.name');

    const userMessage = {
        "issueKey": issueKey,
        "issueType": issueType,
        "summary": getIssueField('summary'),
        "description": getIssueField('description')
    };

    try {
        const stream = await openAIClient.value.createChatCompletion([
            { role: "system", content: PROMPT_GENERATE_IMPROVEMENT_MARKDOWN },
            { role: "system", content: getIssueTypeInstructions(issueType) },
            { role: "user", content: JSON.stringify(userMessage) }
        ]);

        let fullResponse = "";
        let frontMatter = {};
        let frontMatterParsed = false;

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            fullResponse += content;

            // Parse frontMatter only if needed
            if (!frontMatterParsed) {
                const parts = fullResponse.split('---');

                if (parts.length === 3) { // All front matter received
                    frontMatter = parseFrontMatter(parts[1]);
                    // We've parsed and stored frontMatter. Keep only the markdown.
                    fullResponse = parts[2];
                    // the improvementProposal object will build on frontMatter object
                    improvementProposal.value = frontMatter;
                    frontMatterParsed = true;
                }
            } else {
                improvementProposal.value = parseMarkdown(fullResponse, improvementProposal.value);
            }
        }
    } catch (error) {
        console.error("Error fetching improvements:", error);
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
        console.error('Error updating issue:', error);
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
