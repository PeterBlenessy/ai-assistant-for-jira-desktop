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
//import quasarIconSet from 'quasar/icon-set/svg-material-icons';
import "@quasar/extras/mdi-v7/mdi-v7.css";
import "quasar/dist/quasar.css";
// Custom styles
import "./styles.css";

app.use(Quasar, {
    plugins: { Dark, Notify }, // import Quasar plugins and add here
    config: {
        dark: true,
        notify: {
            position: 'bottom',
            timeout: 2500,
        },
        brand: {
            primary: '#21BA45',
            secondary: '#ff8000',
            accent: '#9C27B0',
    
            dark: '#333333',
            'dark-page': '#191919',
    
            positive: '#21BA45',
            negative: '#ff0000',
            info: '#31ccec',
            warning: '#f2c037'
          },
    },
    iconSet: quasarIconSet,
    extras: ["material-icons", "mdi-v7"],
});

// ---------------------------------------------------------------------------------------------
// Mount the app
app.mount("#app");
