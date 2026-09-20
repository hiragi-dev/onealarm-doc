import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import PhoneShot from './PhoneShot.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 本文の Markdown から <PhoneShot src="/screenshots/xxx.png" alt="..." /> と書けるようにする
    app.component('PhoneShot', PhoneShot)
  },
} satisfies Theme
