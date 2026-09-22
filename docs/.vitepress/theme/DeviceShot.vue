<script setup lang="ts">
import { withBase } from 'vitepress'

const props = defineProps<{
  /** 画像のパス。`/device/xxx.png` のように public 直下からの絶対パスで指定する */
  src: string
  alt: string
}>()
</script>

<template>
  <figure class="device-shot">
    <img :src="withBase(props.src)" :alt="props.alt" />
  </figure>
</template>
