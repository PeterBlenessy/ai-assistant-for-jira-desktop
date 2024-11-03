<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Prompt Management</div>
        <q-btn color="primary" @click="showAddTemplateDialog = true">Add Template</q-btn>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="text-subtitle1">Existing Templates</div>
        <q-list bordered separator>
          <q-item v-for="template in templates" :key="template.id">
            <q-item-section>
              <q-item-label>{{ template.name }}</q-item-label>
              <q-item-label>{{ template.issueType }}</q-item-label>
              <q-item-label>{{ template.content }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn flat icon="edit" @click="editTemplate(template)" />
              <q-btn flat icon="delete" @click="deleteTemplate(template.id)" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showAddTemplateDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Add Template</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="newTemplate.name" label="Template Name" />
          <q-select v-model="newTemplate.issueType" :options="issueTypes" label="Issue Type" />
          <q-input v-model="newTemplate.content" label="Template Content" type="textarea" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showAddTemplateDialog = false" />
          <q-btn flat label="Save" color="primary" @click="saveTemplate" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-card>
      <q-card-section>
        <div class="text-subtitle1">Select Template for Issue Types</div>
        <q-list bordered separator>
          <q-item v-for="issueType in issueTypes" :key="issueType">
            <q-item-section>
              <q-item-label>{{ issueType }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select v-model="templateMappings[issueType]" :options="templateOptions" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useTemplateStore } from '../stores/template-store';

const templateStore = useTemplateStore();
const templates = templateStore.templates;
const templateMappings = templateStore.templateMappings;

const showAddTemplateDialog = ref(false);
const newTemplate = ref({
  name: '',
  issueType: '',
  content: ''
});

const issueTypes = ['initiative', 'epic', 'story', 'task'];
const templateOptions = templates.map(template => ({ label: template.name, value: template.id }));

function saveTemplate() {
  templateStore.addTemplate({ ...newTemplate.value, id: Date.now() });
  newTemplate.value = { name: '', issueType: '', content: '' };
  showAddTemplateDialog.value = false;
}

function editTemplate(template) {
  newTemplate.value = { ...template };
  showAddTemplateDialog.value = true;
}

function deleteTemplate(id) {
  templateStore.deleteTemplate(id);
}
</script>

<style scoped>
.q-page {
  max-width: 800px;
  margin: 0 auto;
}
</style>
