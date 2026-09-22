<script setup lang="ts">
defineProps<{
  /** idle=待機 / ringing=鳴動中 / stopped=停止後 */
  state: 'idle' | 'ringing' | 'stopped'
  /** 給電ケーブルが挿さっているか */
  cable: 'plugged' | 'unplugged'
  /** 電源ボタンを押したときなどに本体を揺らす */
  shake?: boolean
}>()
</script>

<template>
  <div class="device" :class="[`is-${state}`, { 'is-shaking': shake }]">
    <span v-if="state === 'ringing'" class="device__ripples" aria-hidden="true">
      <span /><span /><span />
    </span>

    <div class="device__body">
      <div class="device__screen">
        <template v-if="state === 'ringing'">
          <span class="device__ringing">RINGING</span>
          <span class="device__wave" />
        </template>
        <template v-else>
          <span class="device__time">{{ state === 'stopped' ? '6:31' : '6:30' }}</span>
          <span class="device__meta">WiFi:OK MQTT:OK</span>
          <span class="device__meta device__meta--dim">alarms:1</span>
        </template>
      </div>
      <span class="device__button" />
      <span class="device__port" />
    </div>

    <div class="device__cable" :class="{ 'is-out': cable === 'unplugged' }" aria-hidden="true">
      <svg class="device__cable-svg" viewBox="0 0 120 112" role="presentation">
        <defs>
          <linearGradient id="device-cable" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="#2b3036" />
            <stop offset="0.4" stop-color="#8a919a" />
            <stop offset="0.55" stop-color="#c6ccd3" />
            <stop offset="1" stop-color="#2b3036" />
          </linearGradient>
          <linearGradient id="device-plug" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#cdd2d9" />
            <stop offset="0.55" stop-color="#8a919a" />
            <stop offset="1" stop-color="#565c63" />
          </linearGradient>
        </defs>

        <g class="device__wire">
          <!-- ゆるく曲がった丸いケーブル -->
          <path
            d="M60 18 C57 40 63 52 60 70 C58 90 60 100 60 112"
            fill="none"
            stroke="url(#device-cable)"
            stroke-width="10"
            stroke-linecap="round"
          />
          <path
            d="M60 18 C57 40 63 52 60 70 C58 90 60 100 60 112"
            fill="none"
            stroke="rgba(255, 255, 255, 0.28)"
            stroke-width="2.2"
            stroke-linecap="round"
            transform="translate(-2.6 0)"
          />
          <!-- USB Type-C コネクタ -->
          <rect x="49" y="1" width="22" height="15" rx="4" fill="url(#device-plug)" />
          <rect x="53" y="4" width="14" height="6.5" rx="2.6" fill="#1b1e22" />
          <!-- 根元のブーツ -->
          <path d="M51 16 L69 16 L66 23 L54 23 Z" fill="#3a3f46" />
        </g>
      </svg>
      <span class="device__cable-label">
        {{ cable === 'unplugged' ? 'バッテリーで動作中' : '給電中' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.device {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 128px;
  filter: drop-shadow(0 22px 34px rgba(0, 0, 0, 0.5));
}

.device__body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  aspect-ratio: 1 / 2;
  padding: 14px 12px;
  border-radius: 22px;
  background: linear-gradient(160deg, #34383f, #23262b 60%, #1b1e22);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 0 0 1px rgba(0, 0, 0, 0.5);
}

.device.is-ringing .device__body {
  animation: device-glow 1s ease-in-out infinite;
}

.device__screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  flex: 1;
  padding: 10px;
  border-radius: 12px;
  background: #05070a;
  overflow: hidden;
  text-align: center;
}

.device.is-ringing .device__screen {
  background: #3a0b08;
}

.device__time {
  font-family: var(--font-mono);
  font-size: 22px;
  color: #eef0f3;
  line-height: 1;
}

.device__meta {
  font-family: var(--font-mono);
  font-size: 8px;
  color: #7fd08a;
}

.device__meta--dim {
  color: #9aa3af;
}

.device__ringing {
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #ff6a5e;
  animation: device-blink 1s steps(2, start) infinite;
}

.device__wave {
  width: 40px;
  height: 2px;
  margin-top: 4px;
  background: rgba(255, 106, 94, 0.5);
  animation: device-pulse 1s ease-in-out infinite;
}

.device__button {
  width: 58%;
  height: 9px;
  border-radius: 999px;
  background: var(--blue);
  box-shadow: 0 0 12px rgba(46, 155, 242, 0.5);
}

/* 底面の USB-C ポート */
.device__port {
  position: absolute;
  left: 50%;
  bottom: -6px;
  width: 26px;
  height: 8px;
  border-radius: 3px;
  background: #0b0c0f;
  transform: translateX(-50%);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.9);
}

/* 給電ケーブル。抜くとケーブルが消える（アニメーションはしない） */
.device__cable {
  position: relative;
  width: 100%;
  height: 124px;
}

.device__cable-svg {
  display: block;
  width: 120px;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
  overflow: visible;
}

.device__cable.is-out .device__wire {
  visibility: hidden;
}

.device__cable-label {
  position: absolute;
  left: 50%;
  bottom: 0;
  font-family: var(--font-mono);
  font-size: 11px;
  white-space: nowrap;
  color: var(--text-muted);
  transform: translateX(-50%);
  transition: color 0.3s ease;
}

.device__cable.is-out .device__cable-label {
  color: var(--alarm);
}

/* 鳴動中は画面とは別に、音の波紋を出す */
.device__ripples {
  position: absolute;
  left: 50%;
  top: 38%;
  width: 0;
  height: 0;
}

.device__ripples span {
  position: absolute;
  left: 0;
  top: 0;
  width: 130px;
  height: 130px;
  margin: -65px 0 0 -65px;
  border: 2px solid rgba(255, 75, 62, 0.55);
  border-radius: 50%;
  animation: device-ripple 2s ease-out infinite;
}

.device__ripples span:nth-child(2) {
  animation-delay: 0.66s;
}

.device__ripples span:nth-child(3) {
  animation-delay: 1.33s;
}

.device.is-shaking {
  animation: device-shake 0.45s ease;
}

@keyframes device-blink {
  50% {
    opacity: 0.25;
  }
}

@keyframes device-pulse {
  0%,
  100% {
    transform: scaleX(0.6);
    opacity: 0.4;
  }
  50% {
    transform: scaleX(1);
    opacity: 1;
  }
}

@keyframes device-ripple {
  0% {
    transform: scale(0.45);
    opacity: 0.8;
  }
  100% {
    transform: scale(2.4);
    opacity: 0;
  }
}

@keyframes device-glow {
  0%,
  100% {
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      0 0 0 1px rgba(0, 0, 0, 0.5),
      0 0 0 rgba(255, 75, 62, 0);
  }
  50% {
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.08),
      0 0 0 1px rgba(0, 0, 0, 0.5),
      0 0 38px rgba(255, 75, 62, 0.6);
  }
}

@keyframes device-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-7px);
  }
  40% {
    transform: translateX(7px);
  }
  60% {
    transform: translateX(-4px);
  }
  80% {
    transform: translateX(4px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .device__ringing,
  .device__wave,
  .device__ripples span,
  .device.is-ringing .device__body,
  .device.is-shaking {
    animation: none;
  }
}

@media (max-width: 860px) {
  .device {
    width: 120px;
  }
}
</style>
