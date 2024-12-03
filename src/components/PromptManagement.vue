<template>
    <div>
        <!-- Info Box Section -->
        <InfoBox v-if="isInfoBoxVisible('PromptManagement')" :markdownContent="infoBoxMarkdown" @dismiss="dismissInfoBox('PromptManagement')" />

        <!-- Template Selection -->
        <div class="text-h2 q-pt-md q-pb-sm">Jira issue type</div>
        <q-select v-model="selectedTemplate" :options="templateOptions" label="Select Issue Type" option-label="label"
            option-value="value" class="q-mb-md" />

        <!-- Template Action Buttons -->
        <div class="q-gutter-sm">
            <q-btn icon="mdi-plus" label="Add new" class="q-mb-md q-pl-xs" size="sm" @click="handleAddTemplate" />
            <q-btn v-if="selectedTemplate" icon="mdi-delete" label="Delete" class="q-mb-md q-pl-xs" size="sm" @click="handleDeleteTemplate" />
        </div>

        <!-- Jira Issue Type Info -->
        <InfoBox v-if="jiraIssueTypeInfo && selectedTemplate && isInfoBoxVisible(jiraIssueTypeInfo.name)" :markdownContent="jiraTypeInfoMarkdown" @dismiss="dismissInfoBox(jiraIssueTypeInfo.name)" />

        <!-- Issue Type Editing -->
        <template v-if="selectedTemplate && currentTemplateInfo">
            <q-item>
                <q-item-section>
                    <template v-if="editingSection === 'issueType'">
                        <q-input v-model="editingContent.issueType" label="Issue Type" filled dense stack-label
                            :rules="[val => !!val || 'Issue type is required']" lazy-rules="ondemand"
                        />
                    </template>
                    <template v-else>
                        <q-item-label>Issue Type</q-item-label>
                        <q-item-label caption>{{ currentTemplateInfo.issueType }}</q-item-label>
                    </template>
                </q-item-section>

                <q-item-section side class="floating-buttons">
                    <template v-if="editingSection === 'issueType'">
                        <div class="row">
                            <q-btn flat icon="mdi-check" size="sm" class="q-pa-xs q-ma-none" color="primary" @click="handleSaveContent" />
                            <q-btn flat icon="mdi-close" size="sm" class="q-pa-xs q-ma-none" @click="cancelEdit" />
                        </div>
                    </template>
                    <template v-else>
                        <q-btn flat icon="mdi-pencil" size="sm" class="q-pa-xs q-ma-none" @click="handleEditContent('issueType')" />
                    </template>
                </q-item-section>
            </q-item>
            <q-separator spaced inset />
        </template>

        <!-- Template Name Editing -->
        <template v-if="selectedTemplate && currentTemplateInfo">
            <q-item>
                <q-item-section>
                    <template v-if="editingSection === 'name'">
                        <q-input v-model="editingContent.name" label="Name" filled dense stack-label
                            :rules="[val => !!val || 'Template name is required']" lazy-rules="ondemand"
                        />
                    </template>
                    <template v-else>
                        <q-item-label>Name</q-item-label>
                        <q-item-label caption>{{ currentTemplateInfo.name }}</q-item-label>
                    </template>
                </q-item-section>

                <q-item-section side class="floating-buttons">
                    <template v-if="editingSection === 'name'">
                        <div class="row">
                            <q-btn flat icon="mdi-check" size="sm" class="q-pa-xs q-ma-none" color="primary" @click="handleSaveContent" />
                            <q-btn flat icon="mdi-close" size="sm" class="q-pa-xs q-ma-none" @click="cancelEdit" />
                        </div>
                    </template>
                    <template v-else>
                        <q-btn flat icon="mdi-pencil" size="sm" class="q-pa-xs q-ma-none" @click="handleEditContent('name')" />
                    </template>
                </q-item-section>
            </q-item>
            <q-separator spaced inset />
        </template>

        <!-- Issue type definition and responsible person -->
        <template v-if="selectedTemplate && currentTemplateInfo">
            <q-list>
                <!-- Definition -->
                <q-item>
                    <q-item-section>
                        <template v-if="editingSection === 'definition'">
                            <q-input v-model="editingContent.definition" type="textarea" label="Definition" filled stack-label
                                dense autogrow @paste="handlePaste"
                                :rules="[val => !!val || 'Definition is required']" lazy-rules="ondemand"
                            />
                        </template>
                        <template v-else>
                            <q-item-label>Definition</q-item-label>
                            <q-item-label caption>{{ currentTemplateInfo.definition }}</q-item-label>
                        </template>
                    </q-item-section>

                    <q-item-section side class="floating-buttons">
                        <div class="row q-gutter-sm">
                            <template v-if="editingSection === 'definition'">
                                <q-btn flat icon="mdi-check" size="sm" class="q-pa-xs q-ma-none" color="primary" @click="handleSaveContent" />
                                <q-btn flat icon="mdi-close" size="sm" class="q-pa-xs q-ma-none" @click="cancelEdit" />
                            </template>
                            <template v-else>
                                <q-btn flat icon="mdi-pencil" size="sm" class="q-pa-xs q-ma-none" @click="handleEditContent('definition')" />
                            </template>
                        </div>
                    </q-item-section>
                </q-item>
                <q-separator spaced inset />

                <!-- Responsible person -->
                <template v-if="currentTemplateInfo.persona">
                    <q-item>
                        <q-item-section>
                            <template v-if="editingSection === 'persona'">
                                <div class="row q-col-gutter-sm">
                                    <div class="col-12">
                                        <q-input v-model="editingContent.persona.name" label="Responsible person role" filled dense stack-label
                                            @paste="handlePaste"
                                            :rules="[val => !!val || 'Responsible person role is required']" lazy-rules="ondemand"
                                        />
                                    </div>
                                    <div class="col-12">
                                        <q-input v-model="editingContent.persona.definition" type="textarea"
                                            label="Responsible person definition" filled dense stack-label autogrow @paste="handlePaste"
                                            :rules="[val => !!val || 'Responsible person definition is required']" lazy-rules="ondemand"
                                        />
                                    </div>
                                </div>
                            </template>
                            <template v-else>
                                <q-item-label>Responsible: {{ currentTemplateInfo.persona.name }}</q-item-label>
                                <q-item-label caption>{{ currentTemplateInfo.persona.definition }}</q-item-label>
                            </template>
                        </q-item-section>

                        <q-item-section side class="floating-buttons">
                            <div class="row q-gutter-sm">
                                <template v-if="editingSection === 'persona'">
                                    <q-btn flat icon="mdi-check" size="sm" class="q-pa-xs q-ma-none" color="primary" @click="handleSaveContent" />
                                    <q-btn flat icon="mdi-close" size="sm" class="q-pa-xs q-ma-none" @click="cancelEdit" />
                                </template>
                                <template v-else>
                                    <q-btn flat icon="mdi-pencil" size="sm" class="q-pa-xs q-ma-none" @click="handleEditContent('persona')" />
                                </template>
                            </div>
                        </q-item-section>
                    </q-item>
                    <q-separator spaced inset />
                </template>
            </q-list>

            <!-- Fields Management -->
            <div class="text-h2 q-pb-sm">Fields</div>

            <!-- Existing Fields -->
            <q-list v-for="(field, index) in currentFields" :key="index">
                <q-item>
                    <q-item-section>
                        <template v-if="editingIndex === index">
                            <div class="row q-col-gutter-sm">
                                <div class="col-12 col-sm-6">
                                    <q-input v-model="editingField.name" label="Field Name" filled dense stack-label
                                        :rules="[val => !!val || 'Field name is required']" lazy-rules="ondemand"
                                        @update:model-value="updateFieldName"
                                    />
                                </div>
                                <div class="col-12 col-sm-6">
                                    <q-input v-model="editingField.title" label="Field Title" filled dense stack-label
                                        :rules="[val => !!val || 'Field title is required']" lazy-rules="ondemand"
                                    />
                                </div>
                                <div class="col-12">
                                    <q-input v-model="editingField.definition" type="textarea" label="Field definition" filled stack-label
                                        dense autogrow @paste="handlePaste"
                                        :rules="[val => !!val || 'Field definition is required']" lazy-rules="ondemand"
                                    />
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <q-item-label>{{ field.title }}</q-item-label>
                            <q-item-label caption>{{ field.definition }}</q-item-label>
                        </template>
                    </q-item-section>

                    <q-item-section side class="floating-buttons">
                        <div class="row q-gutter-sm">
                            <template v-if="editingIndex === index">
                                <q-btn flat icon="mdi-check" size="sm" class="q-pa-xs q-ma-none" color="primary" @click="handleSaveField" />
                                <q-btn flat icon="mdi-close" size="sm" class="q-pa-xs q-ma-none" @click="cancelEdit" />
                            </template>
                            <template v-else>
                                <q-btn flat icon="mdi-pencil" size="sm" class="q-pa-xs q-ma-none" @click="handleEditField(index)" />
                                <q-btn v-if="field.name != 'summary' && field.name != 'description'" flat icon="mdi-delete" size="sm" class="q-pa-xs"
                                    @click="handleDeleteField(index)" />
                            </template>
                        </div>
                    </q-item-section>
                </q-item>
                <q-separator spaced inset />
            </q-list>

            <!-- New Field Item -->
            <q-item v-if="isNewField">
                <q-item-section>
                    <div class="row q-col-gutter-sm">
                        <div class="col-12 col-sm-6">
                            <q-input v-model="editingField.name" label="Field Name" filled dense stack-label
                                :rules="[val => !!val || 'Field name is required']" lazy-rules="ondemand"
                                @update:model-value="updateFieldName"
                            />
                        </div>
                        <div class="col-12 col-sm-6">
                            <q-input v-model="editingField.title" label="Field Title" filled dense stack-label
                                :rules="[val => !!val || 'Field title is required']" lazy-rules="ondemand"
                            />
                        </div>
                        <div class="col-12">
                            <q-input v-model="editingField.definition" type="textarea" label="Field definition" filled stack-label
                                dense autogrow @paste="handlePaste"
                                :rules="[val => !!val || 'Field definition is required']" lazy-rules="ondemand"
                            />
                        </div>
                    </div>
                </q-item-section>

                <q-item-section side class="floating-buttons">
                    <div class="row q-gutter-sm">
                        <q-btn flat icon="mdi-check" size="sm" class="q-pa-xs q-ma-none" color="primary" @click="handleSaveField" />
                        <q-btn flat icon="mdi-close" size="sm" class="q-pa-xs q-ma-none" @click="cancelEdit" />
                    </div>
                </q-item-section>
            </q-item>

            <!-- Add Field Button -->
            <q-btn v-if="!isNewField" color="primary" icon="mdi-plus" label="Add Field" class="q-mt-md q-pl-xs" size="sm"  @click="handleAddField" />
        </template>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTemplateStore } from '../stores/template-store';
import { storeToRefs } from 'pinia';
import { usePersistedStore } from '../stores/persisted-store';
import { useJiraClient } from '../composables/JiraClient';
import InfoBox from './InfoBox.vue';

const templateStore = useTemplateStore();
const { templates, selectedTemplateType } = storeToRefs(templateStore);

const persistedStore = usePersistedStore();
const { isInfoBoxVisible, dismissInfoBox } = persistedStore;

const { jiraClient } = useJiraClient();

// Compute template options from the store
const templateOptions = computed(() =>
    templates.value.map(template => ({
        label: template.name,
        value: template.issueType
    }))
);

// Create a computed property for the selected template
const selectedTemplate = computed({
    get: () => templateOptions.value.find(t => t.value === selectedTemplateType.value),
    set: (newValue) => {
        selectedTemplateType.value = newValue?.value;
    }
});

// Get current template's fields
const currentFields = computed(() => {
    const template = templates.value.find(t => t.issueType === selectedTemplateType.value);
    return template?.fields || [];
});

// Add new computed property for current template info
const currentTemplateInfo = computed(() => {
    checkIssueType(selectedTemplateType.value);
    return templates.value.find(t => t.issueType === selectedTemplateType.value);
});

// Add computed property for Jira issue type info markdown
const jiraTypeInfoMarkdown = computed(() => {
    if (!jiraIssueTypeInfo.value) return '';
    
    return `*${jiraIssueTypeInfo.value.name}* ${jiraIssueTypeInfo.value.description || 'No description available'}`;
});

const editingIndex = ref(-1);
const isNewField = ref(false);
const editingField = ref({
    title: '',
    definition: '',
    name: ''
});

// Add new refs for template info editing
const editingSection = ref(null); // 'definition' or 'persona'
const editingContent = ref({
    issueType: '',
    name: '',
    description: '',
    persona: {
        name: '',
        definition: ''
    }
});

// Add new ref for Jira issue type info
const jiraIssueTypeInfo = ref(null);

// Markdown content for the InfoBox
const infoBoxMarkdown = `
The below information is provided to the AI as guidance when generating improvements.
You can edit any of the fields to emphasize your specific needs.

Each issue type has a description, a responsible role, and a list of fields.

**Description**: A brief description of the issue type that captures the essence of the desired outcomes.

**Responsibility**: A definition of the person or role that the AI has to adopt when generating improvements.

**Fields**: The specific details that will guide the AI when reviewing the original issue details and when generating improvements. Fields can be existing Jira fields or sections of the issue description.
`;

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function toCamelCase(str) {
    return str
        .trim()
        .replace(/[\s-_]+(.)/g, (_, c) => c.toUpperCase())
        .replace(/^(.)/, c => c.toLowerCase())
        .replace(/[^a-zA-Z0-9]/g, '');
}

function cleanText(text) {
    return text
        .trim()
        .replace(/^\s+/gm, '')      // Remove leading whitespace from each line
        .replace(/\n\s*\n\s*/g, '\n\n')  // Replace multiple blank lines with a single one
        .replace(/\s+/g, ' ');      // Replace multiple spaces with a single space
}

function handlePaste(event) {
    // Prevent the default paste
    event.preventDefault();

    // Get the clipboard text
    const text = event.clipboardData.getData('text');

    // Clean the text
    const cleanedText = cleanText(text);

    // Get the target input name from the event
    const targetName = event.target.name || event.target.getAttribute('aria-label')?.toLowerCase();

    // Update the appropriate field
    if (targetName?.includes('title')) {
        editingField.value.title = cleanedText;
        updateFieldName(cleanedText);
    } else if (targetName?.includes('definition')) {
        editingField.value.definition = cleanedText;
    }
}

function updateFieldName(newTitle) {
    editingField.value.name = toCamelCase(newTitle);
    editingField.value.title = capitalizeFirstLetter(cleanText(newTitle));
}

function handleEditField(index) {
    editingField.value = { ...currentFields.value[index] };
    editingIndex.value = index;
    isNewField.value = false;
}

function handleAddField() {
    editingField.value = { title: '', definition: '', name: '' };
    isNewField.value = true;
    editingIndex.value = -1;
}

function cancelEdit() {
    // Reset field editing state
    editingIndex.value = -1;
    isNewField.value = false;
    editingField.value = { title: '', definition: '', name: '' };

    // Reset content editing state
    editingSection.value = null;
    editingContent.value = {
        issueType: '',
        name: '',
        description: '',
        persona: {
            name: '',
            definition: ''
        }
    };
}

function handleSaveField() {
    if (!editingField.value.title || !editingField.value.definition) {
        return;
    }

    // Clean up the text and ensure title is capitalized before saving
    editingField.value.title = capitalizeFirstLetter(cleanText(editingField.value.title));
    editingField.value.definition = cleanText(editingField.value.definition);

    const templateIndex = templates.value.findIndex(t => t.issueType === selectedTemplateType.value);
    const updatedTemplate = { ...templates.value[templateIndex] };
    updatedTemplate.fields = [...(updatedTemplate.fields || [])];

    if (isNewField.value) {
        updatedTemplate.fields.push(editingField.value);
    } else {
        updatedTemplate.fields[editingIndex.value] = editingField.value;
    }

    templateStore.editTemplate(templateIndex, updatedTemplate);
    cancelEdit();
}

function handleDeleteField(index) {
    const templateIndex = templates.value.findIndex(t => t.issueType === selectedTemplateType.value);
    const updatedTemplate = { ...templates.value[templateIndex] };
    updatedTemplate.fields = [...updatedTemplate.fields];
    updatedTemplate.fields.splice(index, 1);
    templateStore.editTemplate(templateIndex, updatedTemplate);
}

function handleEditContent(section) {
    editingSection.value = section;
    if (section === 'issueType') {
        editingContent.value.issueType = currentTemplateInfo.value.issueType;
    } else if (section === 'name') {
        editingContent.value.name = currentTemplateInfo.value.name;
    } else if (section === 'definition') {
        editingContent.value.definition = currentTemplateInfo.value.definition;
    } else if (section === 'persona') {
        editingContent.value.persona = { ...currentTemplateInfo.value.persona };
    }
}

function handleSaveContent() {
    if (editingSection.value === 'issueType' && !editingContent.value.issueType) {
        return;
    }
    if (editingSection.value === 'name' && !editingContent.value.name) {
        return;
    }
    if (editingSection.value === 'description' && !editingContent.value.description) {
        return;
    }
    if (editingSection.value === 'persona' &&
        (!editingContent.value.persona.name || !editingContent.value.persona.definition)) {
        return;
    }

    const templateIndex = templates.value.findIndex(t => t.issueType === selectedTemplateType.value);
    const updatedTemplate = { ...templates.value[templateIndex] };

    if (editingSection.value === 'issueType') {
        const newIssueType = cleanText(editingContent.value.issueType);
        updatedTemplate.issueType = newIssueType;
        // Update the selection in the dropdown box after saving
        selectedTemplateType.value = newIssueType;
    } else if (editingSection.value === 'name') {
        updatedTemplate.name = cleanText(editingContent.value.name);
    } else if (editingSection.value === 'description') {
        updatedTemplate.description = cleanText(editingContent.value.description);
    } else if (editingSection.value === 'persona') {
        updatedTemplate.persona = {
            name: cleanText(editingContent.value.persona.name),
            definition: cleanText(editingContent.value.persona.definition)
        };
    }

    templateStore.editTemplate(templateIndex, updatedTemplate);
    cancelEdit();
}

function handleAddTemplate() {
    const newTemplate = {
        issueType: '',
        name: '',
        definition: '',
        persona: {
            name: '',
            definition: ''
        },
        fields: []
    };
    templateStore.addTemplate(newTemplate);
    selectedTemplateType.value = newTemplate.issueType;
    
    // Automatically set issue type to edit mode
    editingSection.value = 'issueType';
    editingContent.value = { 
        issueType: '',
        name: '',
        description: '',
        persona: {
            name: '',
            definition: ''
        }
    };
}
function handleDeleteTemplate() {
    const templateIndex = templates.value.findIndex(t => t.issueType === selectedTemplateType.value);
    if (templateIndex !== -1) {
        templateStore.deleteTemplate(templateIndex);
        selectedTemplateType.value = templates.value[0]?.issueType || '';
    }
}

async function checkIssueType(issueType) {
    try {
        // Get all issue types
        const issueTypes = await jiraClient.value.getIssueTypes();
        
        const matchingType = issueTypes.find(type => 
            type.name.toLowerCase() === issueType.toLowerCase()
        );
        
        jiraIssueTypeInfo.value = matchingType ? matchingType : null;

    } catch (error) {
        console.error('Error checking issue type:', error);
        jiraIssueTypeInfo.value = null;
    }
}
</script>

<style scoped>
.floating-buttons {
    position: absolute !important;
    top: 0.75rem;
    right: 0;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 1;
}
.q-item:hover .floating-buttons {
    opacity: 1;
}
.q-item {
    position: relative;
}

</style>
