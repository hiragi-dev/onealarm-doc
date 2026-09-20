<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { withBase } from 'vitepress'

const props = defineProps<{
  /** 画像のパス。`/screenshots/xxx.png` のように public 直下からの絶対パスで指定する */
  src: string
  alt: string
}>()

// 画面上部のステータスバー部分は画像に含まれていないため、画像の上端の色を読んで
// 同じ色で塗り、画像とつながって見えるようにする。読めなければ黒のまま。
const barColor = ref('#000')
const img = ref<HTMLImageElement | null>(null)

function sample() {
  const el = img.value
  if (!el || !el.naturalWidth) return
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(el, 4, 4, 1, 1, 0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    barColor.value = `rgb(${r}, ${g}, ${b})`
  } catch {
    // 読み取れない環境では既定色のまま
  }
}

// SSR で出した <img> は Vue が動き出す前に読み込みが終わっていることがあり、
// その場合 load イベントは二度と来ない。マウント時に読み込み済みなら即座に読む
onMounted(() => {
  if (img.value?.complete) sample()
})
</script>

<template>
  <figure class="phone-shot">
    <div class="phone-shot__body">
      <div class="phone-shot__screen" :style="{ background: barColor }">
        <div class="phone-shot__island" />
        <img ref="img" :src="withBase(props.src)" :alt="props.alt" @load="sample" />
        <div class="phone-shot__home" />
      </div>
    </div>
  </figure>
</template>
