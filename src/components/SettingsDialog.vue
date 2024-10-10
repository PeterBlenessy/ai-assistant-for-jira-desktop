<template>
  <q-dialog v-model="model">
    <q-card>
      <q-card-section>
        <div class="text-h6">Settings</div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="jiraServerAddress"
          label="JIRA Server Address"
          filled
        />
        <q-input
          v-model="jiraPersonalAccessToken"
          label="Personal Access Token"
          filled
          type="password"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" v-close-popup />
        <q-btn flat label="Save" @click="saveSettings" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from "vue";
import { useSettingsStore } from "../stores/settings-store";
import { defineModel } from "vue";

const model = defineModel({ default: false });

const settingsStore = useSettingsStore();
const jiraServerAddress = ref(settingsStore.jiraServerAddress);
const jiraPersonalAccessToken = ref(settingsStore.jiraPersonalAccessToken);

function saveSettings() {
  settingsStore.jiraServerAddress = jiraServerAddress.value;
  settingsStore.jiraPersonalAccessToken = jiraPersonalAccessToken.value;
  model.value = false;
}
</script>
