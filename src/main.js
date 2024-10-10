import { createApp } from "vue";
import App from "./App.vue";
import { Quasar } from "quasar";
import "@quasar/extras/material-icons/material-icons.css";
import "quasar/src/css/index.sass";
import { createPinia } from "pinia";
import { usePersistedStore } from "./stores/settings-store";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(Quasar);
app.mount("#app");

const persistedStore = usePersistedStore();
