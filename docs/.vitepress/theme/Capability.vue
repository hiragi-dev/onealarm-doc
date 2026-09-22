<script setup lang="ts">
import PhoneShot from './PhoneShot.vue'
import DeviceShot from './DeviceShot.vue'

defineProps<{
  /** 見出し。名詞句で書く */
  title: string
  /** 説明文 */
  desc: string
  /** 画像のパス。`/screenshots/xxx.png` または `/device/xxx.png` */
  src: string
  alt: string
  /** 画像が機器の写真なら true。アプリ画面なら省略する */
  device?: boolean
  /** 画像を右側に置くなら true */
  reverse?: boolean
}>()
</script>

<template>
  <section class="capability" :class="{ 'is-reverse': reverse }">
    <div class="capability__media">
      <DeviceShot v-if="device" :src="src" :alt="alt" />
      <PhoneShot v-else :src="src" :alt="alt" />
    </div>
    <div class="capability__text">
      <h3 class="capability__title">{{ title }}</h3>
      <p>{{ desc }}</p>
    </div>
  </section>
</template>
