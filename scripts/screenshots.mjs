// onealarm-app の dev サーバー（http://localhost:5173）をヘッドレス Chrome で開き、
// ドキュメント用のスクリーンショットを撮る。
// dev ビルドにだけ出る開発ツール・devtools・SW トーストは撮影前に DOM から取り除く。
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const BASE = process.env.BASE ?? 'http://localhost:5173'
const OUT = process.env.OUT ?? path.resolve(import.meta.dirname, '../docs/public/screenshots')
const SECTION = process.env.SECTION ?? 'all'
fs.mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 420, height: 860, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await page.setGeolocation({ latitude: 35.6798, longitude: 139.765 })
page.on('pageerror', (e) => console.error('[pageerror]', e.message))

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** dev 限定の要素と、撮影に不要な常駐 UI を取り除く */
async function cleanup() {
  await page.evaluate(() => {
    // 全画面ダイアログ（ウィザード・編集画面・地図）の外周の枠線と影は、
    // 画像の端に 1px の線として写り込み、iPhone 風の外枠と二重に見える。撮影時だけ消す
    if (!document.getElementById('shot-style')) {
      const style = document.createElement('style')
      style.id = 'shot-style'
      style.textContent = '[role="dialog"], [data-slot="dialog-content"] { border-color: transparent !important; box-shadow: none !important; }'
      document.head.appendChild(style)
    }
    // remove ではなく非表示にする。開発用ボタンを撮影後も el.click() で押せるようにするため
    const kill = (el) => el && (el.style.display = 'none')
    // TanStack Router devtools（右下のボタン）
    document.querySelectorAll('[class*="TanStackRouterDevtools"], .tsqd-parent-container, button[aria-label*="TanStack"], button[aria-label*="Devtools"]').forEach(kill)
    // Service Worker トースト / ホーム画面追加バナー
    for (const el of document.querySelectorAll('div.fixed')) {
      const t = el.textContent ?? ''
      if (t.includes('オフラインで利用できます') || t.includes('新しいバージョンがあります') || t.includes('ホーム画面に追加してください')) kill(el)
    }
    // 設定タブの開発ツール（折りたたみカード）
    for (const el of document.querySelectorAll('[data-slot="card"]')) {
      const t = el.textContent ?? ''
      if (t.includes('開発ツール') || t.includes('本番ビルドには含まれません')) kill(el)
    }
  })
}

async function shot(name) {
  await cleanup()
  await sleep(300)
  const file = path.join(OUT, `${name}.png`)
  await page.screenshot({ path: file })
  console.log('saved', file)
}

async function goto(p) {
  await page.goto(BASE + p, { waitUntil: 'networkidle0' })
  await sleep(1200)
}

/** テキストで要素を探してクリックする */
async function clickText(selector, text) {
  const ok = await page.evaluate(
    ({ selector, text }) => {
      const els = [...document.querySelectorAll(selector)]
      const el = els.find((e) => (e.textContent ?? '').trim().includes(text))
      if (!el) return false
      el.click()
      return true
    },
    { selector, text },
  )
  if (!ok) throw new Error(`not found: ${selector} "${text}"`)
  await sleep(600)
}

async function clickAria(label) {
  await page.click(`[aria-label="${label}"]`)
  await sleep(600)
}

/** 地図（MapLibre）のタイルが描かれるのを待つ */
async function waitMap(ms = 4000) {
  await sleep(ms)
}

if (SECTION === 'all' || SECTION === 'main') {
// ---- アラーム一覧
await goto('/')
await shot('alarm-list')

// ---- 新規ウィザード
await clickAria('アラームを追加')
await sleep(800)
await shot('alarm-wizard-time')
await clickText('button', '次へ')
await shot('alarm-wizard-days')
await clickText('button', '次へ')
await sleep(400)
await clickText('button', '会社')
await waitMap()
await shot('alarm-wizard-stop-method')
await clickText('button', '次へ')
await sleep(600)
await shot('alarm-wizard-confirm')
await clickAria('閉じる').catch(async () => {
  // step が 0 以外だと aria-label が変わるので、戻るで先頭まで戻す
  for (let i = 0; i < 3; i++) await clickAria('前のステップに戻る')
  await clickAria('閉じる')
})
await sleep(600)

// ---- 編集ページ（22:00 のアラーム: 歩行検知を有効にする地点あり）
await clickText('[role="button"]', '22:00')
await waitMap()
await shot('alarm-edit')
await clickAria('一覧に戻る')
await sleep(600)

// ---- 停止方法
await goto('/stop')
await waitMap(6000)
await shot('stop-methods')

// 追加 → 地図で地点を選ぶ
await clickText('button', '追加')
await waitMap()
// 地図の中央をタップして地点を選ぶ
const map = await page.$('.leaflet-container')
const box = await map.boundingBox()
await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2 - 40)
await sleep(1500)
await shot('stop-method-map')
await clickText('button', '次へ')
await sleep(600)
await shot('stop-method-name')
await clickText('button', 'キャンセル')
await sleep(600)

// 一覧の行をタップ → 閲覧ダイアログ
await clickText('button', '最寄り駅')
await waitMap()
await shot('stop-method-view')
await page.keyboard.press('Escape')
await sleep(600)

// ---- 設定
await goto('/settings')
await shot('settings')

}

if (SECTION === 'all' || SECTION === 'ringing') {
// ---- 鳴動画面（開発ツールから鳴らす）
// 再読み込みするとメモリ上のデモ状態が消えて鳴動が止まるので、以降はページ遷移しない。
// 鳴動画面は全画面テイクオーバーなので、どのタブにいても同じ見え方になる
await goto('/settings')
await clickText('button', '開発ツール')
await sleep(600)
await clickText('button', '6:30')
await waitMap(5000)
await shot('ringing')
await clickText('button', '歩行中にする')
await sleep(800)
await shot('ringing-walking')
await clickText('button', '静止中にする')
await sleep(300)
// 強制停止して、歩行検知の地点付きのアラームを鳴らす
await clickText('button', '強制停止')
// エッジの応答待ちを模した遅延の後に鳴動が終わる。ボタンが戻るまで待つ
for (let i = 0; i < 20; i++) {
  await sleep(1000)
  const ok = await page.evaluate(() => [...document.querySelectorAll('button')].some((b) => (b.textContent ?? '').includes('22:00')))
  if (ok) break
}
await clickText('button', '22:00')
await waitMap(5000)
await shot('ringing-locked')
}

await browser.close()
