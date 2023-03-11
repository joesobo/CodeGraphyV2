import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'

import { messages } from '../locales'

import App from './App.vue'

const i18n = createI18n({
	legacy: false,
	locale: 'en',
	messages
})

const app = createApp(App)
app.use(i18n).mount('#app')
