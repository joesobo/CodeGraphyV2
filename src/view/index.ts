import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'

import GraphApp from './Graph/App.vue'
import LanguageApp from './Languages/App.vue'
import { messages } from '../locales'

const i18n = createI18n({
	legacy: false,
	locale: 'en',
	messages,
})

const graphApp = createApp(GraphApp)
graphApp.use(i18n).mount('#graph-app')

const languageApp = createApp(LanguageApp)
languageApp.use(i18n).mount('#language-app')
