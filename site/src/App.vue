<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PhoneFrame from './components/PhoneFrame.vue'
import AlarmDemo from './components/AlarmDemo.vue'

const base = import.meta.env.BASE_URL
const img = (name: string) => `${base}images/${name}`
const docsUrl = `${base}docs/`
const gettingStartedUrl = `${base}docs/getting-started`

// 既定はホワイト。切り替えは localStorage に保存する
const theme = ref<'light' | 'dark'>('light')

onMounted(() => {
  theme.value = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
})

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = theme.value
  try {
    localStorage.setItem('onealarm-theme', theme.value)
  } catch {
    // 保存できない環境ではそのまま
  }
}
</script>

<template>
  <header class="topbar">
    <div class="topbar__inner">
      <a class="brand" :href="base">
        <span class="brand__dot" />
        OneAlarm
      </a>
      <nav class="topbar__nav">
        <button
          class="topbar__toggle"
          type="button"
          :aria-label="theme === 'dark' ? 'ライトモードに切り替える' : 'ダークモードに切り替える'"
          @click="toggleTheme"
        >
          <svg v-if="theme === 'dark'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        </button>
        <a class="topbar__link" :href="docsUrl">ドキュメント</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="hero__inner">
        <div class="hero__text">
          <h1 class="hero__title">
            <span>絶対に</span>
            <span>電源を切れない</span>
            <span>アラーム</span>
          </h1>
          <p class="hero__lead">
            低コストで簡単に構築できる。手のひらサイズの機器とアプリだけで作る、二度寝防止のアラームです。
          </p>
          <div class="hero__actions">
            <a class="button button--primary" :href="docsUrl">ドキュメントを見る</a>
            <a class="button button--ghost" href="#demo">試してみる</a>
          </div>
        </div>

        <div class="hero__visual">
          <div class="hero__phone">
            <PhoneFrame :src="img('app-alarm-list.png')" alt="アプリのアラーム一覧画面" />
          </div>
          <img
            class="hero__device"
            :src="img('m5sticks3.png')"
            alt="音を鳴らす機器 M5StickS3"
          />
        </div>
      </div>
    </section>

    <AlarmDemo />

    <section class="section">
      <p class="eyebrow">なぜ、止められないのか</p>
      <div class="merits">
        <article class="merit">
          <h3 class="merit__title">電源を切っても鳴り続ける</h3>
          <p class="merit__body">
            音を鳴らすのはスマホではなく、ベッドから離れた場所に置いた機器です。スマホの電源を切っても、機器のケーブルを抜いても、音は止まりません。
          </p>
        </article>
        <article class="merit">
          <h3 class="merit__title">低コストで簡単に作れる</h3>
          <p class="merit__body">
            音を鳴らすのは M5StickS3 という端末1台です。スピーカーと画面とバッテリーが内蔵されていて、専用の部品やはんだ付けは要りません。設定はアプリから行います。
          </p>
        </article>
      </div>
    </section>

    <section id="how" class="section section--how">
      <p class="eyebrow">仕組み</p>
      <h2 class="section__title">設定して、鳴らして、歩いて止める</h2>

      <ol class="steps">
        <li class="step">
          <div class="step__media">
            <PhoneFrame :src="img('app-alarm-edit.png')" alt="アプリでのアラーム設定" />
          </div>
          <div class="step__body">
            <span class="step__no">01</span>
            <h3 class="step__title">アプリで時刻と場所を決める</h3>
            <p>鳴らす時刻と曜日、止まる場所（停止地点）をアプリで登録します。設定はアプリから機器に送られます。</p>
          </div>
        </li>

        <li class="step step--reverse">
          <div class="step__media step__media--device">
            <img :src="img('m5sticks3.png')" alt="音を鳴らす機器 M5StickS3" />
          </div>
          <div class="step__body">
            <span class="step__no">02</span>
            <h3 class="step__title">時刻になると、離れた部屋の機器が鳴る</h3>
            <p>ベッドから離れた場所に置いた機器が音を鳴らします。スマホ側では、アラームの設定は開けません。</p>
          </div>
        </li>

        <li class="step">
          <div class="step__media">
            <PhoneFrame :src="img('app-ringing-walking.png')" alt="歩いている間の画面" />
          </div>
          <div class="step__body">
            <span class="step__no">03</span>
            <h3 class="step__title">登録した停止地点に着くと自動で止まる</h3>
            <p>スマホが停止地点に着くと、操作なしで鳴り止みます。位置情報で判定するので、機器との距離は関係ありません。歩いている間は音が一時停止します。</p>
          </div>
        </li>
      </ol>
    </section>

    <section class="section">
      <p class="eyebrow">止められない理由</p>
      <ul class="reasons">
        <li>鳴っている間、機器の電源ボタンはソフトウェアで無効になります。</li>
        <li>電源ケーブルを抜いても、内蔵バッテリーに切り替わって動き続けます。</li>
        <li>アプリにも機器にも、アラームを止めるボタンはありません。</li>
        <li>鳴っている間は、アラームの変更も削除もできません。</li>
      </ul>
      <p class="footnote">※ 開発中のため、仕様は変わる場合があります。</p>
    </section>

    <section class="cta">
      <div class="cta__inner">
        <div>
          <h2 class="cta__title">作り方と使い方は、ドキュメントにまとめています</h2>
          <p>機器のセットアップからアラームの作成まで、順番に進められます。</p>
        </div>
        <a class="button button--primary" :href="gettingStartedUrl">はじめかたを読む</a>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="footer__inner">
      <span class="footer__brand">OneAlarm</span>
      <a class="footer__link" :href="docsUrl">ドキュメント</a>
    </div>
  </footer>
</template>
