<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = defineProps<{
  src: string
  alt: string
  /** 電源を切った状態。画面を黒くする */
  off?: boolean
}>()

// 画面上部のステータスバー部分は画像に含まれていないため、画像の上端の色を読んで
// 同じ色で塗り、画像とつながって見えるようにする。
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

onMounted(() => {
  if (img.value?.complete) sample()
})
</script>

<template>
  <figure class="phone">
    <div class="phone__body">
      <div class="phone__screen" :style="{ background: props.off ? '#000' : barColor }">
        <div class="phone__island" />
        <img v-if="!props.off" ref="img" :src="props.src" :alt="props.alt" @load="sample" />
        <div v-else class="phone__black" />
        <div class="phone__home" />
      </div>
    </div>
  </figure>
</template>

<style scoped>
/*
 * 外枠の寸法は 340px 幅を基準に cqw（コンテナ幅の 1%）で持たせている。
 * 表示サイズを変えてもベゼル・角丸・Dynamic Island の比率が崩れない。
 */
.phone {
  container-type: inline-size;
  margin: 0;
  width: 100%;
}

.phone__body {
  position: relative;
  padding: 3.53cqw;
  border-radius: 15.88cqw;
  background: #1c1c1e;
  box-shadow:
    0 0 0 0.44cqw #4a4a4e,
    0 0 0 1.18cqw #2a2a2c,
    0 7.06cqw 14.12cqw rgba(0, 0, 0, 0.45);
}

.phone__body::before,
.phone__body::after {
  content: '';
  position: absolute;
  width: 0.88cqw;
  border-radius: 0.59cqw;
  background: #3a3a3c;
}

.phone__body::before {
  left: -2.06cqw;
  top: 35.29cqw;
  height: 26.47cqw;
  box-shadow: 0 -17.65cqw 0 0 #3a3a3c;
}

.phone__body::after {
  right: -2.06cqw;
  top: 41.18cqw;
  height: 32.35cqw;
}

.phone__screen {
  position: relative;
  overflow: hidden;
  border-radius: 12.35cqw;
  padding-top: 12.94cqw;
  padding-bottom: 1.76cqw;
  background: #000;
}

.phone__island {
  position: absolute;
  top: 3.24cqw;
  left: 50%;
  width: 34%;
  height: 7.65cqw;
  transform: translateX(-50%);
  border-radius: 999px;
  background: #000;
}

.phone__screen img {
  display: block;
  width: 100%;
  margin: 0;
  border: 0;
  border-radius: 0;
}

/* 電源オフの画面。画像と同じ比率を保って枠の高さを揃える */
.phone__black {
  display: block;
  width: 100%;
  aspect-ratio: 420 / 860;
  background: #000;
}

.phone__home {
  position: absolute;
  bottom: 2.35cqw;
  left: 50%;
  width: 36%;
  height: 1.18cqw;
  transform: translateX(-50%);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.8);
}
</style>
