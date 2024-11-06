<template>
    <div v-if="issueFields" class="row q-col-gutter-md items-start" :class="{ 'column': $q.screen.lt.md }">
        <!-- Original Issue Column -->
        <div class="col-12 col-md-5">
            <div class="text-subtitle1 q-mb-sm">Original Issue Fields</div>
            <q-list separator bordered padding class="rounded-borders">
                <template v-for="field in issueDisplayFields" :key="field">
                    <q-item>
                        <q-item-section>
                            <q-item-label class="text-capitalize text-subtitle2">{{ field }}</q-item-label>
                            <q-item-label>
                                <div v-html="formatJiraMarkup(getIssueField(field))"></div>
                            </q-item-label>
                        </q-item-section>
                    </q-item>
                </template>
            </q-list>
        </div>

        <!-- Generate Button Column -->
        <div class="col-12 col-md text-center q-my-auto">
            <q-btn color="primary" label="IMPROVE" @click="generateImprovement(props.issueKey)" :loading="loading" />
        </div>

        <!-- Improvements Column -->
        <div class="col-12 col-md-5">
            <div class="text-subtitle1 q-mb-sm">AI Generated Improvement Proposals</div>
            <div class="description-text">
                <q-list v-if="improvementProposal && hasImprovements" separator bordered padding class="rounded-borders">
                    <template v-for="field in improvementDisplayFields" :key="field">
                        <q-item v-if="shouldDisplayField(field)"  style="cursor: default">
                            <q-item-section>
                                <q-item-label class="text-capitalize text-subtitle2">
                                    {{ improvementProposal[field].title || field }}
                                </q-item-label>
                                <template v-if="field === 'acceptanceCriteria'">
                                    <q-item-label v-for="(criteria, index) in improvementProposal[field].text" 
                                        :key="index">
                                        {{ index + 1 }}. {{ criteria.summary }}
                                    </q-item-label>
                                </template>
                                <template v-else>
                                    <q-item-label>{{ improvementProposal[field].text }}</q-item-label>
                                </template>
                                <q-item-label v-if="improvementProposal[field].comment" 
                                    caption 
                                    class="text-italic q-mt-xs">
                                    Comment: {{ improvementProposal[field].comment }}
                                </q-item-label>
                            </q-item-section>
                            <q-item-section side top>
                                <q-chip square size="sm" class="text-caption text-uppercase q-ma-none"
                                    color="primary"
                                    :clickable="improvementProposal[field].accepted ? false : true"
                                    :outline="improvementProposal[field].accepted ? true : false"
                                    :label="improvementProposal[field].accepted ? 'Accepted' : 'Accept'" 
                                    :icon="improvementProposal[field].accepted ? 'mdi-check' : 'mdi-plus'"
                                    @click="acceptImprovement(field, improvementProposal[field])" 
                                />
                            </q-item-section>
                        </q-item>
                    </template>
                </q-list>
                <div v-else-if="improvementProposal && !hasImprovements && !loading" class="text-grey-5 q-pt-lg">
                    <div>All fields look great! No improvements needed.</div>
                    <div class="text-h2 q-ma-xl">👍</div>
                </div>
                <div v-else-if="loading" class="q-pa-md">Generating improvements...</div>
                <div v-else class="q-pa-md">Click the improve button to generate improvement proposals</div>
            </div>
        </div>
    </div>
    <div v-else class="q-pa-md">
        <p>Loading description...</p>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useJiraClient } from '../composables/JiraClient.js';
import { useOpenAIClient } from '../composables/OpenAIClient.js';
import { PROMPT_GENERATE_DESCRIPTION } from "../helpers/prompts.js";
import { issueSchema } from '../helpers/schemas.js';

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


const issueDisplayFields = ['summary', 'description'];
const improvementDisplayFields = ['summary', 'description', 'mvp', 'acceptanceCriteria'];

const shouldDisplayField = (field) => {
    if (field === 'acceptanceCriteria') {
        return improvementProposal.value[field]?.text?.length > 0 
            && improvementProposal.value[field]?.updated;
    }
    return improvementProposal.value[field]?.updated;
};

// Get the value of a field from the issue fields object
const getIssueField = (field, defaultValue = null) => {
    return field.split('.').reduce((obj, key) =>
        obj && obj[key] !== undefined ? obj[key] : defaultValue,
        issueFields.value
    );
}

// Generate improved description for the issue
const generateStructuredFormatImprovement = async () => {
    loading.value = true;
    let systemMessage = {
        role: "system",
        content: PROMPT_GENERATE_DESCRIPTION
    };

    const content = {
        "issueKey": props.issueKey,
        "issueType": getIssueField('issuetype.name'),
        "summary": getIssueField('summary'),
        "description": getIssueField('description')
    }

    let userMessage = { role: "user", content: JSON.stringify(content) };
    let fullResponse = '';

    try {
        const stream = await openAIClient.value.createStructuredChatCompletion([systemMessage, userMessage], issueSchema);
        
        // Initialize an empty improvement proposal
        improvementProposal.value = {
            summary: { text: '', updated: false },
            description: { text: '', updated: false },
            mvp: { text: '', updated: false },
            acceptanceCriteria: []
        };

        for await (const chunk of stream) {
            if (chunk.choices[0]?.delta?.content) {
                fullResponse += chunk.choices[0].delta.content;
                
                // Try to parse the partial response
                try {
                    // Find the last complete JSON object
                    const lastBrace = fullResponse.lastIndexOf('}');
                    if (lastBrace !== -1) {
                        const partialResponse = fullResponse.substring(0, lastBrace + 1);
                        const parsed = JSON.parse(partialResponse);
                        
                        // Update the UI with whatever fields are available
                        Object.keys(parsed).forEach(key => {
                            if (improvementProposal.value.hasOwnProperty(key)) {
                                improvementProposal.value[key] = parsed[key];
                            }
                        });
                    }
                } catch (parseError) {
                    // Ignore parse errors for partial JSON
                    continue;
                }
            }
        }

        // Final parse of the complete response
        const finalParsed = JSON.parse(fullResponse);
        improvementProposal.value = finalParsed;
    } catch (error) {
        console.error('Error generating structured improvement:', error);
        // TODO: Add error handling UI feedback
    } finally {
        loading.value = false;
    }
};

// Update the click handler to use the new function
const generateImprovement = async () => {
    await generateStructuredFormatImprovement();
};

// Watch for changes in the issue key and fetch the issue details
watch(() => props.issueKey, async (newIssueKey) => {
    if (newIssueKey) {
        const issueDetails = await jiraClient.value.getIssueDetails(newIssueKey);
        issueFields.value = issueDetails.fields;
    }
}, { immediate: true });

// Accept an improvement proposal and attach it to the issue
const acceptImprovement = async (type, improvement) => {
    try {
        let updateFields = {};

        if (type === 'summary') {
            updateFields.summary = improvement.text;
        } else if (type === 'description' || type === 'mvp' || type === 'acceptanceCriteria') {
            // Parse existing description to maintain all sections
            const currentDescription = getIssueField('description') || '';
            let descriptionSections = {
                description: '',
                mvp: '',
                acceptanceCriteria: []
            };

            // Extract existing sections with flexible line break pattern
            const mvpMatch = currentDescription.match(/h2\.\s*Minimum Viable Product\s*\n+([^]*?)(?=\n+h2\.|$)/);
            const acMatch = currentDescription.match(/h2\.\s*Acceptance Criteria\s*\n+([^]*?)(?=\n+h2\.|$)/);
            const mainDescMatch = currentDescription.match(/^([^]*?)(?=\n+h2\.|$)/);

            // Populate sections with existing content
            descriptionSections.description = mainDescMatch ? mainDescMatch[1].trim() : '';
            descriptionSections.mvp = mvpMatch ? mvpMatch[1].trim() : '';
            if (acMatch) {
                descriptionSections.acceptanceCriteria = acMatch[1]
                    .split('\n')
                    .filter(line => line.trim())
                    .map(line => ({ summary: line.replace(/^\d+\.\s*/, '').trim() }));
            }

            // Only update the section that was actually accepted
            if (type === 'description') {
                descriptionSections.description = improvement.text;
            } else if (type === 'mvp') {
                descriptionSections.mvp = improvement.text;
            } else if (type === 'acceptanceCriteria' && improvement.updated) {
                descriptionSections.acceptanceCriteria = improvement.text;
            }

            // Format with single line breaks
            let formattedDescription = descriptionSections.description.trim();

            if (descriptionSections.mvp) {
                formattedDescription += '\n\nh2. Minimum Viable Product\n' + descriptionSections.mvp.trim();
            }

            if (descriptionSections.acceptanceCriteria?.length > 0) {
                formattedDescription += '\n\nh2. Acceptance Criteria\n';
                descriptionSections.acceptanceCriteria.forEach((criteria, index) => {
                    formattedDescription += `${index + 1}. ${criteria.summary.trim()}\n`;
                });
            }

            updateFields.description = formattedDescription;
        }

        // Update the Jira issue
        await jiraClient.value.updateIssue(props.issueKey, {
            fields: updateFields
        });

        // Mark the improvement as accepted in the UI
        if (improvementProposal.value[type]) {
            improvementProposal.value[type].accepted = true;
        }

        // Refresh the issue fields to show updated content
        const issueDetails = await jiraClient.value.getIssueDetails(props.issueKey);
        issueFields.value = issueDetails.fields;

    } catch (error) {
        console.error('Error updating issue:', error);
        // Handle error (show error message to user)
    }
};

// Format Jira markup for display as regular HTML
const formatJiraMarkup = (text) => {
    if (!text) return '';
    
    return text
        // Convert headings
        .replace(/h1\.(.*?)$/gm, '<span class="text-subtitle1 q-mb-sm">$1</span>')
        .replace(/h2\.(.*?)$/gm, '<span class="text-subtitle2 q-mb-sm">$1</span>')
        .replace(/h3\.(.*?)$/gm, '<span class="text-subtitle2 q-mb-sm">$1</span>')
        // Convert line breaks
        .replace(/\n/g, '<br>')
        // Convert lists (basic support)
        .replace(/^(\d+)\.\s(.*)$/gm, '<li>$2</li>');
};

const hasImprovements = computed(() => {
    if (!improvementProposal.value) return false;
    return improvementDisplayFields.some(field => shouldDisplayField(field));
});
</script>

<style>
/* Add some spacing for the formatted content */
h1, h2, h3 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
}
li {
    margin-left: 1.5rem;
}
</style>
