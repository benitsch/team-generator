import 'vuetify/styles';
import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';

import './assets/main.css';
import '@mdi/font/css/materialdesignicons.css';

const app = createApp(App);
const vuetify = createVuetify({
  components,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
});

app.use(vuetify);
app.use(createPinia());
app.use(router);

app.mount('#app');
