<template>
    <div>
        <!-- Info box section -->
        <q-card v-if="isInfoBoxVisible" class="bg-info">
            <q-card-section>
                <q-item>
                    <q-item-section avatar top>
                        <q-icon name="mdi-information" color="grey-7" />
                    </q-item-section>

                    <q-item-section>
                        <q-item-label caption>
                            The below information is provided to the AI as guidance when generating improvements.
                            You can edit any of the fields to guide the AI in the direction of your specific needs.
                            <br /><br />
                            Each issue type has a description, a persona, and a list of fields.
                        </q-item-label>
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-label caption>
                        <ul>
                            <li>
                                The <b>description</b> is a brief description of the issue type that
                                captures the essence of the desired outcomes.
                            </li>
                            <li>The <b>responsibility</b> is a description of the person or role that
                                the AI has to adopt to when generating improvements.
                            </li>
                            <li>
                                The <b>fields</b> are the specific details that will guide the AI when
                                reviewing the original issue details and when generating improvements.
                            </li>
                        </ul>
                    </q-item-label>
                </q-item>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat color="primary" label="Dismiss" @click="dismissInfoBox" />
            </q-card-actions>
        </q-card>


        <!-- Template Selection -->
        <div class="text-subtitle2 q-pt-md q-pb-sm">Jira issue type</div>
        <q-select v-model="selectedTemplate" :options="templateOptions" label="Select Issue Type" option-label="label"
            option-value="value" class="q-mb-md" />

        <!-- Template Description and Persona -->
        <template v-if="selectedTemplate && currentTemplateInfo">
            <q-list>
                <!-- Description -->
                <q-item>
                    <q-item-section>
                        <template v-if="editingSection === 'description'">
                            <q-input v-model="editingContent.description" type="textarea" label="Description" filled
                                dense autogrow @paste="handlePaste"
                                :rules="[val => !!val || 'Description is required']" />
                        </template>
                        <template v-else>
                            <q-item-label>Description of the issue type</q-item-label>
                            <q-item-label caption>{{ currentTemplateInfo.description }}</q-item-label>
                        </template>
                    </q-item-section>

                    <q-item-section side>
                        <div class="row q-gutter-sm">
                            <template v-if="editingSection === 'description'">
                                <q-btn flat icon="mdi-check" size="sm" class="q-pa-none" @click="handleSaveContent" />
                                <q-btn flat icon="mdi-close" size="sm" class="q-pa-none" @click="cancelEdit" />
                            </template>
                            <template v-else>
                                <q-btn flat icon="mdi-pencil" size="sm" class="q-pa-none"
                                    @click="handleEditContent('description')" />
                            </template>
                        </div>
                    </q-item-section>
                </q-item>
                <q-separator spaced inset />

                <!-- Persona -->
                <template v-if="currentTemplateInfo.persona">
                    <q-item>
                        <q-item-section>
                            <template v-if="editingSection === 'persona'">
                                <div class="row q-col-gutter-sm">
                                    <div class="col-12">
                                        <q-input v-model="editingContent.persona.name" label="Persona Name" filled dense
                                            @paste="handlePaste"
                                            :rules="[val => !!val || 'Persona name is required']" />
                                    </div>
                                    <div class="col-12">
                                        <q-input v-model="editingContent.persona.description" type="textarea"
                                            label="Persona Description" filled dense autogrow @paste="handlePaste"
                                            :rules="[val => !!val || 'Persona description is required']" />
                                    </div>
                                </div>
                            </template>
                            <template v-else>
                                <q-item-label>Responsibility: {{ currentTemplateInfo.persona.name }}</q-item-label>
                                <q-item-label caption>{{ currentTemplateInfo.persona.description }}</q-item-label>
                            </template>
                        </q-item-section>

                        <q-item-section side>
                            <div class="row q-gutter-sm">
                                <template v-if="editingSection === 'persona'">
                                    <q-btn flat icon="mdi-check" size="sm" class="q-pa-none"
                                        @click="handleSaveContent" />
                                    <q-btn flat icon="mdi-close" size="sm" class="q-pa-none" @click="cancelEdit" />
                                </template>
                                <template v-else>
                                    <q-btn flat icon="mdi-pencil" size="sm" class="q-pa-none"
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
                                        :rules="[val => !!val || 'Field title is required']" />
                                </div>
                                <div class="col-12">
                                    <q-input v-model="editingField.description" type="textarea"
                                        label="Field Description" filled dense autogrow @paste="handlePaste"
                                        :rules="[val => !!val || 'Field description is required']" />
                                </div>
                            </div>
                        </template>
                        <template v-else>
                            <q-item-label>{{ field.title }}</q-item-label>
                            <q-item-label caption>{{ field.description }}</q-item-label>
                        </template>
                    </q-item-section>

                    <q-item-section side>
                        <div class="row q-gutter-sm">
                            <template v-if="editingIndex === index">
                                <q-btn flat icon="mdi-check" size="sm" class="q-pa-none" @click="handleSaveField" />
                                <q-btn flat icon="mdi-close" size="sm" class="q-pa-none" @click="cancelEdit" />
                            </template>
                            <template v-else>
                                <q-btn flat icon="mdi-pencil" size="sm" class="q-pa-none"
                                    @click="handleEditField(index)" />
                                <q-btn flat icon="mdi-delete" size="sm" class="q-pa-none"
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
                                :rules="[val => !!val || 'Field title is required']" />
                        </div>
                        <div class="col-12">
                            <q-input v-model="editingField.description" type="textarea" label="Field Description" filled
                                dense autogrow @paste="handlePaste"
                                :rules="[val => !!val || 'Field description is required']" />
                        </div>
                    </div>
                </q-item-section>

                <q-item-section side>
                    <div class="row q-gutter-sm">
                        <q-btn flat icon="mdi-check" size="sm" class="q-pa-none" @click="handleSaveField" />
                        <q-btn flat icon="mdi-close" size="sm" class="q-pa-none" @click="cancelEdit" />
                    </div>
                </q-item-section>
            </q-item>

            <!-- Add Field Button -->
            <q-btn v-if="!isNewField" flat icon="mdi-plus" label="Add Field" class="q-mt-md" @click="handleAddField" />
        </template>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useTemplateStore } from '../stores/template-store';
import { storeToRefs } from 'pinia';
import { usePersistedStore } from '../stores/persisted-store';

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
    description: '',
    name: ''
});

// Add new computed property for current template info
const currentTemplateInfo = computed(() => {
    return templates.value.find(t => t.issueType === selectedTemplateType.value);
});

// Add new refs for template info editing
const editingSection = ref(null); // 'description' or 'persona'
const editingContent = ref({
    description: '',
    persona: {
        name: '',
        description: ''
    }
});

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
    } else if (targetName?.includes('description')) {
        editingField.value.description = cleanedText;
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
    editingField.value = { title: '', description: '', name: '' };
    isNewField.value = true;
    editingIndex.value = -1;
}

function cancelEdit() {
    // Reset field editing state
    editingIndex.value = -1;
    isNewField.value = false;
    editingField.value = { title: '', description: '', name: '' };

    // Reset content editing state
    editingSection.value = null;
    editingContent.value = {
        description: '',
        persona: {
            name: '',
            description: ''
        }
    };
}

function handleSaveField() {
    if (!editingField.value.title || !editingField.value.description) {
        return;
    }

    // Clean up the text and ensure title is capitalized before saving
    editingField.value.title = capitalizeFirstLetter(cleanText(editingField.value.title));
    editingField.value.description = cleanText(editingField.value.description);

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
    if (section === 'description') {
        editingContent.value.description = currentTemplateInfo.value.description;
    } else if (section === 'persona') {
        editingContent.value.persona = { ...currentTemplateInfo.value.persona };
    }
}

function handleSaveContent() {
    if (editingSection.value === 'description' && !editingContent.value.description) {
        return;
    }
    if (editingSection.value === 'persona' &&
        (!editingContent.value.persona.name || !editingContent.value.persona.description)) {
        return;
    }

    const templateIndex = templates.value.findIndex(t => t.issueType === selectedTemplateType.value);
    const updatedTemplate = { ...templates.value[templateIndex] };

    if (editingSection.value === 'description') {
        updatedTemplate.description = cleanText(editingContent.value.description);
    } else if (editingSection.value === 'persona') {
        updatedTemplate.persona = {
            name: cleanText(editingContent.value.persona.name),
            description: cleanText(editingContent.value.persona.description)
        };
    }

    templateStore.editTemplate(templateIndex, updatedTemplate);
    cancelEdit();
}
</script>

<style scoped>
/* No specific styles added yet */
</style>
