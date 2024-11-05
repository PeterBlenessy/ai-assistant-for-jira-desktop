import { ref, watch } from "vue";
import { defineStore } from "pinia";
import { defaultTemplate } from "../helpers/templates";

export const useTemplateStore = defineStore("template-store", () => {
    const templates = ref(
        JSON.parse(localStorage.getItem('promptTemplates')) || defaultTemplate
    );

    const selectedTemplateType = ref(
        localStorage.getItem('selectedTemplateType') || 'initiative'
    );

    function resetToDefaults() {
        templates.value = defaultTemplate;
    }

    function editTemplate(index, updatedTemplate) {
        templates.value[index] = updatedTemplate;
    }

    watch(
        templates,
        (newTemplates) => {
            localStorage.setItem('promptTemplates', JSON.stringify(newTemplates));
        },
        { deep: true }
    );

    watch(
        selectedTemplateType,
        (newType) => {
            localStorage.setItem('selectedTemplateType', newType);
        }
    );

    return {
        templates,
        selectedTemplateType,
        editTemplate,
        resetToDefaults
    };
});