<script setup>
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { useStore } from "../store/index.js";

const store = useStore();

async function greet() {
  store.greetMsg = await invoke("greet", { name: store.name });
}
</script>

<template>
  <form class="row" @submit.prevent="greet">
    <input id="greet-input" v-model="store.name" placeholder="Enter a name..." />
    <button type="submit">Greet</button>
  </form>

  <p>{{ store.greetMsg }}</p>
</template>
