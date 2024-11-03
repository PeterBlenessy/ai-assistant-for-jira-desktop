import { ref, watch } from "vue";
import { defineStore } from "pinia";

export const useTemplateStore = defineStore("template-store", () => {
  const templates = ref(loadStateFromLocalStorage("templates") || []);
  const templateMappings = ref(loadStateFromLocalStorage("templateMappings") || {});

  function saveStateToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function loadStateFromLocalStorage(key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  function addTemplate(template) {
    templates.value.push(template);
    saveStateToLocalStorage("templates", templates.value);
  }

  function editTemplate(template) {
    const index = templates.value.findIndex(t => t.id === template.id);
    if (index !== -1) {
      templates.value[index] = template;
      saveStateToLocalStorage("templates", templates.value);
    }
  }

  function deleteTemplate(id) {
    templates.value = templates.value.filter(t => t.id !== id);
    saveStateToLocalStorage("templates", templates.value);
  }

  function setTemplateMapping(issueType, templateId) {
    templateMappings.value[issueType] = templateId;
    saveStateToLocalStorage("templateMappings", templateMappings.value);
  }

  watch(templates, (newValue) => {
    saveStateToLocalStorage("templates", newValue);
  }, { deep: true });

  watch(templateMappings, (newValue) => {
    saveStateToLocalStorage("templateMappings", newValue);
  }, { deep: true });

  return {
    templates,
    templateMappings,
    addTemplate,
    editTemplate,
    deleteTemplate,
    setTemplateMapping
  };
});
