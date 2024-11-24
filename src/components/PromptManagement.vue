<template>
    <div>
        <!-- Info Box Section -->
        <InfoBox v-if="isInfoBoxVisible" :markdownContent="infoBoxMarkdown" @dismiss="dismissInfoBox" />

        <!-- Template Selection -->
        <div class="text-subtitle2 q-pt-md q-pb-sm">Jira issue type</div>
        <q-select v-model="selectedTemplate" :options="templateOptions" label="Select Issue Type" option-label="label"
            option-value="value" class="q-mb-md" />

        <!-- Template Action Buttons -->
        <div class="q-gutter-sm">
            <q-btn icon="mdi-plus" label="Add new" class="q-mb-md q-pl-xs" size="sm" @click="handleAddTemplate" />
            <q-btn v-if="selectedTemplate" icon="mdi-delete" label="Delete" class="q-mb-md q-pl-xs" size="sm" @click="handleDeleteTemplate" />
        </div>

        <!-- Template Name Editing -->
        <template v-if="selectedTemplate && currentTemplateInfo">
            <q-item>
                <q-item-section>
                    <template v-if="editingSection === 'name'">
                        <q-input v-model="editingContent.name" label="Template Name" filled dense
                            :rules="[val => !!val || 'Template name is required']" lazy-rules="ondemand"
                        />
                    </template>
                    <template v-else>
                        <q-item-label>Name</q-item-label>
                        <q-item-label caption>{{ currentTemplateInfo.name }}</q-item-label>
                    </template>
                </q-item-section>

                <q-item-section side>
                    <div class="row q-gutter-sm">
                        <template v-if="editingSection === 'name'">
                            <q-btn flat icon="mdi-check" size="sm" class="q-pa-xs q-ma-none" color="primary" @click="handleSaveContent" />
                            <q-btn flat icon="mdi-close" size="sm" class="q-pa-xs q-ma-none" @click="cancelEdit" />
                        </template>
                        <template v-else>
                            <q-btn flat icon="mdi-pencil" size="sm" class="q-pa-xs q-ma-none"
                                @click="handleEditContent('name')" />
                        </template>
                    </div>
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
                            <q-input v-model="editingContent.definition" type="textarea" label="Definition" filled
                                dense autogrow @paste="handlePaste"
                                :rules="[val => !!val || 'Definition is required']" lazy-rules="ondemand"
                            />
                        </template>
                        <template v-else>
                            <q-item-label>Definition</q-item-label>
                            <q-item-label caption>{{ currentTemplateInfo.definition }}</q-item-label>
                        </template>
                    </q-item-section>

                    <q-item-section side>
                        <div class="row q-gutter-sm">
                            <template v-if="editingSection === 'definition'">
                                <q-btn flat icon="mdi-check" size="sm" class="q-pa-xs q-ma-none" color="primary" @click="handleSaveContent" />
                                <q-btn flat icon="mdi-close" size="sm" class="q-pa-xs q-ma-none" @click="cancelEdit" />
                            </template>
                            <template v-else>
                                <q-btn flat icon="mdi-pencil" size="sm" class="q-pa-xs q-ma-none"
                                    @click="handleEditContent('definition')" />
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
                                        <q-input v-model="editingContent.persona.name" label="Responsible person role" filled dense
                                            @paste="handlePaste"
                                            :rules="[val => !!val || 'Responsible person role is required']" lazy-rules="ondemand"
                                        />
                                    </div>
                                    <div class="col-12">
                                        <q-input v-model="editingContent.persona.definition" type="textarea"
                                            label="Responsible person definition" filled dense autogrow @paste="handlePaste"
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

                        <q-item-section side>
                            <div class="row q-gutter-sm">
                                <template v-if="editingSection === 'persona'">
                                    <q-btn flat icon="mdi-check" size="sm" class="q-pa-xs q-ma-none" color="primary" @click="handleSaveContent" />
                                    <q-btn flat icon="mdi-close" size="sm" class="q-pa-xs q-ma-none" @click="cancelEdit" />
                                </template>
                                <template v-else>
                                    <q-btn flat icon="mdi-pencil" size="sm" class="q-pa-xs q-ma-none"
                                        @click="handleEditContent('persona')" />
                                </template>
                            </div>
                        </q-item-section>
                    </q-item>
                    <q-separator spaced inset />
                </template>
            </q-list>

            <!-- Fields Management -->
            <div class="text-subtitle2 q-pb-sm">Fields</div>

            <!-- Existing Fields -->
            <q-list v-for="(field, index) in currentFields" :key="index">
                <q-item>
                    <q-item-section>
                        <template v-if="editingIndex === index">
                            <div class="row q-col-gutter-sm">
                                <div class="col-12">
                                    <q-input v-model="editingField.title" label="Field Title" filled dense autofocus
                                        @update:model-value="updateFieldName" @paste="handlePaste"
                                        :rules="[val => !!val || 'Field title is required']" lazy-rules="ondemand"
                                    />
                                </div>
                                <div class="col-12">
                                    <q-input v-model="editingField.definition" type="textarea"
                                        label="Field definition" filled dense autogrow @paste="handlePaste"
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

                    <q-item-section side>
                        <div class="row q-gutter-sm">
                            <template v-if="editingIndex === index">
                                <q-btn flat icon="mdi-check" size="sm" class="q-pa-xs q-ma-none" color="primary" @click="handleSaveField" />
                                <q-btn flat icon="mdi-close" size="sm" class="q-pa-xs q-ma-none" @click="cancelEdit" />
                            </template>
                            <template v-else>
                                <q-btn flat icon="mdi-pencil" size="sm" class="q-pa-xs q-ma-none"
                                    @click="handleEditField(index)" />
                                <q-btn v-if="field.name != 'summary' && field.name != 'description'" flat icon="mdi-delete" size="sm" class="q-pa-xs q-ma-none"
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
                        <div class="col-12">
                            <q-input v-model="editingField.title" label="Field Title" filled dense autofocus
                                @update:model-value="updateFieldName" @paste="handlePaste" 
                                :rules="[val => !!val || 'Field title is required']" lazy-rules="ondemand"
                            />
                        </div>
                        <div class="col-12">
                            <q-input v-model="editingField.definition" type="textarea" label="Field definition" filled
                                dense autogrow @paste="handlePaste"
                                :rules="[val => !!val || 'Field definition is required']" lazy-rules="ondemand"
                            />
                        </div>
                    </div>
                </q-item-section>

                <q-item-section side>
                    <div class="row q-gutter-sm">
                        <q-btn flat icon="mdi-check" size="sm" class="q-pa-xs" color="primary" @click="handleSaveField" />
                        <q-btn flat icon="mdi-close" size="sm" class="q-pa-none" @click="cancelEdit" />
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
import InfoBox from './InfoBox.vue'; // Import the new InfoBox component

const templateStore = useTemplateStore();
const { templates, selectedTemplateType } = storeToRefs(templateStore);

const persistedStore = usePersistedStore();
const { infoBoxes } = storeToRefs(persistedStore);

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

const editingIndex = ref(-1);
const isNewField = ref(false);
const editingField = ref({
    title: '',
    definition: '',
    name: ''
});

// Add new computed property for current template info
const currentTemplateInfo = computed(() => {
    return templates.value.find(t => t.issueType === selectedTemplateType.value);
});

// Add new refs for template info editing
const editingSection = ref(null); // 'definition' or 'persona'
const editingContent = ref({
    name: '',
    description: '',
    persona: {
        name: '',
        definition: ''
    }
});

// Markdown content for the InfoBox
const infoBoxMarkdown = `
The below information is provided to the AI as guidance when generating improvements.
You can edit any of the fields to emphasize your specific needs.

Each issue type has a description, a responsible role, and a list of fields.

**Description**: A brief description of the issue type that captures the essence of the desired outcomes.

**Responsibility**: A definition of the person or role that the AI has to adopt when generating improvements.

**Fields**: The specific details that will guide the AI when reviewing the original issue details and when generating improvements. Fields can be existing Jira fields or sections of the issue description.
`;

// Check if the info box should be visible
const isInfoBoxVisible = computed(() => {
    const infoBox = infoBoxes.value.find(box => box.infoBox === "PromptManagement");
    return infoBox ? infoBox.display : true;
});

// Dismiss the info box
function dismissInfoBox() {
    const infoBox = infoBoxes.value.find(box => box.infoBox === "PromptManagement");
    if (infoBox) {
        infoBox.display = false;
    }
}

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
    if (section === 'name') {
        editingContent.value.name = currentTemplateInfo.value.name;
    } else if (section === 'definition') {
        editingContent.value.definition = currentTemplateInfo.value.definition;
    } else if (section === 'persona') {
        editingContent.value.persona = { ...currentTemplateInfo.value.persona };
    }
}

function handleSaveContent() {
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

    if (editingSection.value === 'name') {
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
        issueType: 'newType',
        name: 'New Issue Type',
        definition: '',
        persona: {
            name: '',
            definition: ''
        },
        fields: []
    };
    templateStore.addTemplate(newTemplate);
    selectedTemplateType.value = 'newType';
}

function handleDeleteTemplate() {
    const templateIndex = templates.value.findIndex(t => t.issueType === selectedTemplateType.value);
    if (templateIndex !== -1) {
        templateStore.deleteTemplate(templateIndex);
        selectedTemplateType.value = templates.value[0]?.issueType || '';
    }
}
</script>

<style scoped>
/* No specific styles added yet */
</style>
