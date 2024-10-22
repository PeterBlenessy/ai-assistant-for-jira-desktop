import { createApp } from "vue";
import App from "./App.vue";

// ---------------------------------------------------------------------------------------------
// Create the app
const app = createApp(App);

// ---------------------------------------------------------------------------------------------
// Make pinia available in the app
import { createPinia } from "pinia";
const pinia = createPinia();
app.use(pinia);

// ---------------------------------------------------------------------------------------------
// Import and make Quasar available in the app
import { Quasar, Dark, Notify } from "quasar";
import quasarIconSet from "quasar/icon-set/svg-mdi-v7";
import "@quasar/extras/mdi-v7/mdi-v7.css";
import "quasar/dist/quasar.css";
// Custom styles
import "./styles.css";

app.use(Quasar, {
    plugins: { Dark, Notify }, // import Quasar plugins and add here
    config: {
        dark: true,
        notify: {},
        brand: {},
    },
    iconSet: quasarIconSet,
    extras: ["mdi-v7"],
});

// ---------------------------------------------------------------------------------------------
// Mount the app
app.mount("#app");
