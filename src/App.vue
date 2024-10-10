<script setup>
import { ref } from "vue";
import SettingsDialog from "./components/SettingsDialog.vue";

const showSettingsDialog = ref(false);

function openSettingsDialog() {
    showSettingsDialog.value = true;
}
</script>

<template>
    <q-layout>
        <q-header>
            <q-toolbar>
                <q-avatar rounded>
                    <img src="./assets/ai-assistant-logo.png" />
                </q-avatar>
                <q-toolbar-title> AI Assistant for Jira </q-toolbar-title>
                <q-btn
                    icon="mdi-cog"
                    dense
                    flat
                    rounded
                    @click="openSettingsDialog"
                />
            </q-toolbar>
        </q-header>

        <q-page-container>
            <q-page class="container">
                <div class="row"></div>
            </q-page>
        </q-page-container>

        <q-footer>
            <q-toolbar>
                <q-toolbar-title>
                    <q-icon name="mdi-login" />
                    Log in
                </q-toolbar-title>
            </q-toolbar>
        </q-footer>

        <SettingsDialog v-model="showSettingsDialog" />
    </q-layout>
</template>
