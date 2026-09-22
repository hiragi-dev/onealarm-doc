import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import PhoneShot from './PhoneShot.vue'
import DeviceShot from './DeviceShot.vue'
import Capability from './Capability.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    // トップのヒーロー右側のアプリ画面と機器の写真はいま非表示にしている。
    // 戻すときは下の home-hero-image スロットを有効にする。
    return h(DefaultTheme.Layout, null, {
      // 'home-hero-image': () =>
      //   h('div', { class: 'hero-showcase' }, [
      //     h(PhoneShot, {
      //       src: '/screenshots/alarm-list.png',
      //       alt: 'アプリのアラーム一覧画面',
      //     }),
      //     h(DeviceShot, {
      //       src: '/device/m5sticks3.png',
      //       alt: '音を鳴らす機器 M5StickS3',
      //     }),
      //   ]),
    })
  },
  enhanceApp({ app }) {
    // 本文の Markdown から <PhoneShot src="/screenshots/xxx.png" alt="..." /> と書けるようにする
    app.component('PhoneShot', PhoneShot)
    // 機器の写真は <DeviceShot src="/device/xxx.png" alt="..." /> で貼る
    app.component('DeviceShot', DeviceShot)
    // できることの説明は <Capability title="..." desc="..." src="..." alt="..." /> で並べる
    app.component('Capability', Capability)
  },
} satisfies Theme
