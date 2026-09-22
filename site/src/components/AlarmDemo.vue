<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import PhoneFrame from './PhoneFrame.vue'
import DeviceMock from './DeviceMock.vue'

const base = import.meta.env.BASE_URL
const img = (name: string) => `${base}images/${name}`

const ringing = ref(false)
const stopped = ref(false)
const walking = ref(false)
const cable = ref<'plugged' | 'unplugged'>('plugged')
const phone = ref<'on' | 'off'>('on')
const shake = ref(false)
const soundOn = ref(true)
const logMessage = ref('')

// 押したことのある操作を覚えておく
const pressed = ref<Record<string, boolean>>({})
function markPressed(key: string) {
  pressed.value = { ...pressed.value, [key]: true }
}
const allPressed = computed(() =>
  ['power', 'cable', 'phone', 'stop'].every((k) => pressed.value[k]),
)



// 操作の説明はトーストで出す
type Explain = { title: string; body: string }
const explain = ref<Explain | null>(null)
// 押すたびにアニメーションをやり直すためのキー
const toastKey = ref(0)
let toastTimer: number | undefined

const deviceState = computed<'idle' | 'ringing' | 'stopped'>(() => {
  if (ringing.value) return 'ringing'
  if (stopped.value) return 'stopped'
  return 'idle'
})

const phoneSrc = computed(() =>
  ringing.value ? img('app-ringing.png') : img('app-alarm-list.png'),
)

/* ---------- 操作 ---------- */

function start() {
  reset()
  ringing.value = true
  logMessage.value = 'アラームが鳴り始めました。離れた部屋の機器が鳴っています。'
  if (soundOn.value) startBeeping()
}

function hitPower() {
  markPressed('power')
  shake.value = false
  requestAnimationFrame(() => (shake.value = true))
  window.setTimeout(() => (shake.value = false), 500)
  logMessage.value = '機器の電源ボタンを押しました。'
  setExplain(
    '電源ボタンを押しても切れません',
    '鳴っている間、機器の電源ボタンはソフトウェアで無効になります。押しても電源は切れず、アラームは鳴り続けます。',
  )
}

function hitCable() {
  markPressed('cable')
  cable.value = 'unplugged'
  logMessage.value = '電源ケーブルを抜きました。'
  setExplain(
    'ケーブルを抜いても止まりません',
    '給電が切れると、機器は内蔵バッテリーに切り替わります。ケーブルを抜いても、そのまま鳴り続けます。',
  )
}

function hitPhone() {
  markPressed('phone')
  phone.value = 'off'
  logMessage.value = 'スマホの電源を切りました。'
  setExplain(
    'スマホの電源を切っても止まりません',
    '音を鳴らしているのはスマホではなく、離れた場所に置いた機器です。スマホの電源を切っても、機器は鳴り続けます。',
  )
}

function hitStop() {
  markPressed('stop')
  logMessage.value = 'アプリにも機器にも、停止ボタンはありません。'
  setExplain(
    '停止ボタンはありません',
    'アプリにも機器にも、アラームを止めるボタンはありません。実装し忘れではなく、逃げ道を作らないためです。',
  )
}

function walk() {
  if (walking.value) return
  walking.value = true
  clearExplain()
  logMessage.value = '登録した停止地点へ向かっています。'
  window.setTimeout(() => {
    walking.value = false
    ringing.value = false
    stopped.value = true
    stopBeeping()
    logMessage.value = '停止地点に到達しました。何も操作しなくても音が止まりました。'
  }, 1600)
}

function reset() {
  ringing.value = false
  stopped.value = false
  walking.value = false
  cable.value = 'plugged'
  phone.value = 'on'
  shake.value = false
  logMessage.value = ''
  pressed.value = {}
  clearExplain()
  stopBeeping()
}

/* ---------- 説明トースト ---------- */

function setExplain(title: string, body: string) {
  explain.value = { title, body }
  toastKey.value += 1
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => (explain.value = null), 5000)
}

function clearExplain() {
  window.clearTimeout(toastTimer)
  explain.value = null
}

/* ---------- 機器と操作のつながりを示す線 ---------- */

const stageRef = ref<HTMLElement | null>(null)
const lines = ref<Array<{ d: string; x2: number; y2: number }>>([])
let ro: ResizeObserver | undefined

// 電源ボタンは機器・スマホとも右側の上部にあるので、線の終点をそこに合わせる
const targets = [
  { hotspot: 'hotspot--power', target: '.demo__device .device__body', at: 'rightTop', dir: -1 },
  { hotspot: 'hotspot--cable', target: '.demo__device .device__cable-svg', at: 'topCenter', dir: 1 },
  { hotspot: 'hotspot--phone', target: '.demo__phone .phone', at: 'rightTop', dir: -1 },
  { hotspot: 'hotspot--stop', target: '.demo__phone .phone__screen', at: 'rightCenter', dir: -1 },
] as const

function endpointOf(r: DOMRect, at: string) {
  switch (at) {
    case 'rightTop':
      return { x: r.right, y: r.top + r.height * 0.16 }
    case 'topCenter':
      return { x: r.left + r.width / 2, y: r.top + 12 }
    case 'rightCenter':
      return { x: r.right - 4, y: r.top + r.height * 0.42 }
    default:
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }
}

function computeLines() {
  const stage = stageRef.value
  if (!stage || !ringing.value) {
    lines.value = []
    return
  }
  const s = stage.getBoundingClientRect()
  const out: Array<{ d: string; x2: number; y2: number }> = []
  for (const { hotspot, target, at, dir } of targets) {
    const be = stage.querySelector(`.${hotspot}`)
    const te = stage.querySelector(target)
    if (!be || !te) continue
    const br = be.getBoundingClientRect()
    const tr = te.getBoundingClientRect()
    const x1 = br.left + br.width / 2 - s.left
    const y1 = br.top + br.height / 2 - s.top
    const e = endpointOf(tr, at)
    const x2 = e.x - s.left
    const y2 = e.y - s.top
    // 機器をまたがないように、相手から離れる側へ緩く膨らませた曲線にする
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2
    const bow = Math.min(56, Math.hypot(x2 - x1, y2 - y1) * 0.28)
    out.push({ d: `M ${x1} ${y1} Q ${mx} ${my + dir * bow} ${x2} ${y2}`, x2, y2 })
  }
  lines.value = out
}

onMounted(() => {
  computeLines()
  window.addEventListener('resize', computeLines)
  window.addEventListener('load', computeLines)
  if (stageRef.value) {
    ro = new ResizeObserver(computeLines)
    ro.observe(stageRef.value)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', computeLines)
  window.removeEventListener('load', computeLines)
  ro?.disconnect()
  window.clearTimeout(toastTimer)
  stopBeeping()
  void ctx?.close()
})

watch(ringing, () => nextTick(computeLines))

/* ---------- 音 ---------- */

let ctx: AudioContext | null = null
let beepTimer: number | undefined

function beep() {
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'square'
  osc.frequency.value = 880
  gain.gain.value = 0.04
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.12)
}

function startBeeping() {
  try {
    if (!ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return
      ctx = new Ctor()
    }
    void ctx.resume()
    window.clearInterval(beepTimer)
    beep()
    beepTimer = window.setInterval(beep, 1200)
  } catch {
    // 音を出せない環境では無音のまま進める
  }
}

function stopBeeping() {
  window.clearInterval(beepTimer)
}

watch(soundOn, (on) => {
  if (!ringing.value) return
  if (on) startBeeping()
  else stopBeeping()
})
</script>

<template>
  <section id="demo" class="demo">
    <div class="demo__inner">
      <div class="demo__head">
        <p class="eyebrow">試してみる</p>
        <h2 class="demo__title">電源を切ってみてください</h2>
        <p class="demo__lead">
          鳴っている間にできる操作を、ここで試せます。どう操作してもアラームは止まりません。止まるのは、あらかじめ登録した停止地点までスマホを運んだときだけです。判定には位置情報を使います。
        </p>
      </div>

      <div ref="stageRef" class="demo__stage" :class="{ 'is-ringing': ringing }">
        <div class="demo__startbar">
          <button v-if="!ringing && !stopped" class="demo__start" type="button" @click="start">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
            アラームを鳴らしてみる
          </button>
          <span v-else-if="ringing" class="demo__state demo__state--ring">鳴動中</span>
          <span v-else class="demo__state demo__state--ok">停止しました</span>
        </div>

        <div class="demo__device">
          <DeviceMock :state="deviceState" :cable="cable" :shake="shake" />
          <span class="demo__device-label">M5StickS3</span>

          <template v-if="ringing">
            <button
              class="hotspot hotspot--power"
              :class="{ 'is-new': !pressed.power }"
              type="button"
              @click="hitPower"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                <line x1="12" y1="2" x2="12" y2="12" />
              </svg>
              電源ボタンを押す
            </button>
            <button
              class="hotspot hotspot--cable"
              :class="{ 'is-new': !pressed.cable }"
              type="button"
              :disabled="cable === 'unplugged'"
              @click="hitCable"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M9 2v6M15 2v6" />
                <path d="M7 8h10v3a5 5 0 0 1-10 0z" />
                <path d="M12 16v6" />
              </svg>
              ケーブルを抜く
            </button>
          </template>
        </div>

        <div class="demo__phone">
          <PhoneFrame :src="phoneSrc" alt="アプリの画面" :off="phone === 'off'" />
          <span class="demo__phone-label">スマホ</span>

          <template v-if="ringing">
            <button
              class="hotspot hotspot--phone"
              :class="{ 'is-new': !pressed.phone }"
              type="button"
              :disabled="phone === 'off'"
              @click="hitPhone"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <rect x="7" y="2" width="10" height="20" rx="2" />
                <line x1="11" y1="18" x2="13" y2="18" />
              </svg>
              スマホの電源を切る
            </button>
            <button
              class="hotspot hotspot--stop"
              :class="{ 'is-new': !pressed.stop }"
              type="button"
              @click="hitStop"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="16" y1="16" x2="21" y2="21" />
              </svg>
              停止ボタンを探す
            </button>
          </template>
        </div>

        <svg v-if="ringing" class="demo__lines" aria-hidden="true">
          <path v-for="(l, i) in lines" :key="i" :d="l.d" />
          <circle v-for="(l, i) in lines" :key="`c${i}`" :cx="l.x2" :cy="l.y2" r="4" />
        </svg>

        <button v-if="ringing && soundOn" class="demo__sound" type="button" @click="soundOn = false">
          音を止める
        </button>
        <button v-else-if="ringing" class="demo__sound" type="button" @click="soundOn = true">
          音を出す
        </button>

        <Transition name="toast">
          <div v-if="explain" :key="toastKey" class="demo__toast" role="status" aria-live="polite">
            <strong class="demo__toast-title">{{ explain.title }}</strong>
            <span class="demo__toast-body">{{ explain.body }}</span>
          </div>
        </Transition>

        <!-- すべての操作を試したら、唯一の止め方が出てくる -->
        <Transition name="walk">
          <button
            v-if="ringing && allPressed"
            class="demo__walk button button--primary"
            type="button"
            :disabled="walking"
            @click="walk"
          >
            {{ walking ? '移動中…' : '停止地点まで歩く' }}
          </button>
        </Transition>
      </div>

      <p class="demo__log" role="status" aria-live="polite">
        {{ logMessage || '左上の「アラームを鳴らしてみる」を押すと始まります。' }}
      </p>

      <div class="demo__controls">
        <button v-if="stopped" class="button button--ghost" @click="reset">最初に戻す</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.demo {
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  background: var(--bg-soft);
}

.demo__inner {
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 72px 24px;
}

.demo__head {
  max-width: 46em;
}

.demo__title {
  margin-top: 12px;
  font-size: clamp(26px, 3.4vw, 38px);
  font-weight: 900;
  letter-spacing: -0.01em;
}

.demo__lead {
  margin-top: 12px;
  color: var(--text-muted);
}

.demo__stage {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: clamp(180px, 20vw, 280px);
  margin: 32px 0;
  /* 下はトーストのぶんを空けておく */
  padding: 72px 56px 132px;
  min-height: 420px;
  border: 1px solid var(--line);
  border-radius: 24px;
  /* 設計図（ブループリント）風の細かい方眼 */
  background-color: var(--blueprint-bg);
  background-image:
    linear-gradient(var(--blueprint-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--blueprint-line) 1px, transparent 1px),
    linear-gradient(var(--blueprint-line-strong) 1px, transparent 1px),
    linear-gradient(90deg, var(--blueprint-line-strong) 1px, transparent 1px);
  background-size:
    20px 20px,
    20px 20px,
    100px 100px,
    100px 100px;
  transition: box-shadow 0.4s ease;
}

.demo__stage.is-ringing {
  animation: stage-alarm 1s ease-in-out infinite;
}

@keyframes stage-alarm {
  0%,
  100% {
    box-shadow: inset 0 0 0 rgba(255, 75, 62, 0);
  }
  50% {
    box-shadow: inset 0 0 90px rgba(255, 75, 62, 0.22);
  }
}

/* 左上の開始コントロール */
.demo__startbar {
  position: absolute;
  top: 18px;
  left: 20px;
  z-index: 3;
}

.demo__start {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: 1px solid var(--green);
  border-radius: 999px;
  background: rgba(47, 191, 99, 0.14);
  color: var(--green);
  font-family: var(--font-jp);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.demo__start:hover {
  background: var(--green);
  color: #04140a;
}

.demo__state {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 999px;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
}

.demo__state--ring {
  background: rgba(255, 75, 62, 0.16);
  color: var(--alarm);
}

.demo__state--ok {
  background: rgba(47, 191, 99, 0.16);
  color: var(--green);
}

.demo__device,
.demo__phone {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.demo__phone {
  width: 180px;
}

.demo__device-label,
.demo__phone-label {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
}

/* 各パーツに紐づく操作ボタン */
.hotspot {
  position: absolute;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text);
  font-family: var(--font-jp);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  transition: border-color 0.2s ease, transform 0.15s ease;
}

.hotspot:hover {
  border-color: var(--blue);
  transform: translateY(-1px);
}

.hotspot:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

/* 操作ボタンは機器・スマホとも右側に置き、線が本体をまたがないようにする */
.hotspot--power {
  left: calc(100% + 20px);
  top: 12%;
}

.hotspot--cable {
  left: calc(100% + 20px);
  top: 72%;
}

.hotspot--phone {
  left: calc(100% + 20px);
  top: 12%;
}

.hotspot--stop {
  left: calc(100% + 20px);
  top: 60%;
}

/* 機器と操作のつながりを示す線 */
.demo__lines {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.demo__lines path {
  fill: none;
  stroke: var(--line-connector);
  stroke-width: 1.5;
  stroke-dasharray: 4 4;
}

.demo__lines circle {
  fill: var(--blue);
}

.demo__sound {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 3;
  padding: 6px 14px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text-muted);
  font-family: var(--font-jp);
  font-size: 13px;
  cursor: pointer;
}

/* 説明: 下からせり出すトースト。要素に被らないよう下に余白を取ってある */
.demo__toast {
  position: absolute;
  left: 50%;
  bottom: 20px;
  z-index: 5;
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: min(560px, calc(100% - 40px));
  padding: 14px 18px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface);
  box-shadow: var(--shadow);
  /* 左基準を保つ（これが無いと右にずれる） */
  transform: translateX(-50%);
}

.demo__toast-title {
  font-size: 14px;
  color: var(--alarm);
}

.demo__toast-body {
  font-size: 13px;
  color: var(--text-muted);
}

/* 出るときもアニメーションする */
.toast-enter-active {
  animation: toast-in 0.3s ease;
}

.toast-leave-active {
  animation: toast-out 0.28s ease forwards;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translate(-50%, 32px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  to {
    opacity: 0;
    transform: translate(-50%, 28px);
  }
}

/* すべて試したあとに、唯一の止め方が上から現れる */
.demo__walk {
  position: absolute;
  top: 18px;
  left: 50%;
  z-index: 3;
  transform: translateX(-50%);
}

.walk-enter-active {
  animation: walk-in 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.3);
}

@keyframes walk-in {
  from {
    opacity: 0;
    transform: translate(-50%, -14px) scale(0.85);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
}

/* まだ押していない操作ボタンを青く光らせて強調する */
.hotspot.is-new {
  border-color: var(--blue);
  color: var(--blue-ink);
  animation: hotspot-glow 1.6s ease-in-out infinite;
}

@keyframes hotspot-glow {
  0%,
  100% {
    box-shadow:
      0 8px 20px rgba(0, 0, 0, 0.4),
      0 0 0 0 rgba(46, 155, 242, 0);
  }
  50% {
    box-shadow:
      0 8px 20px rgba(0, 0, 0, 0.4),
      0 0 22px 3px rgba(46, 155, 242, 0.8);
  }
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active,
  .walk-enter-active,
  .hotspot.is-new {
    animation: none;
  }
}

.demo__log {
  min-height: 28px;
  margin: 0 0 20px;
  font-size: 15px;
  color: var(--text-muted);
}

.demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 980px) {
  .demo__stage {
    flex-direction: column;
    align-items: center;
    gap: 40px;
    padding: 72px 20px 132px;
  }

  .hotspot {
    position: static;
    margin-top: 4px;
  }

  .hotspot--power,
  .hotspot--cable,
  .hotspot--phone,
  .hotspot--stop {
    top: auto;
    right: auto;
    left: auto;
  }

  .demo__lines {
    display: none;
  }

  .demo__phone {
    width: 150px;
  }

  /* 縦積みのときは、止め方のボタンを流れの中に置く */
  .demo__walk {
    position: static;
    transform: none;
  }

  .walk-enter-active {
    animation: walk-in-mobile 0.45s ease;
  }
}

@keyframes walk-in-mobile {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
