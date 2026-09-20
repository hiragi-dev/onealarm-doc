import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'ja-JP',
  title: 'OneAlarm',
  description: '設定した場所まで歩かないと止められないアラームの使い方',

  // GitHub Pages 用。リポジトリ名を変えたらここも合わせる。
  // ユーザー/組織サイト（<name>.github.io）として置く場合は '/' にする。
  base: '/onealarm-doc/',

  // 開発中は画像の差し替えが頻繁に起きるため、リンク切れをビルドで落とす
  ignoreDeadLinks: false,

  head: [['meta', { name: 'theme-color', content: '#0a0a0c' }]],

  themeConfig: {
    // 利用者向けの読み物なので、トップナビは増やさずサイドバー1本で辿らせる
    nav: [
      { text: 'はじめかた', link: '/getting-started' },
      { text: '画面の使い方', link: '/screens' },
    ],

    sidebar: [
      {
        text: 'OneAlarm の使い方',
        items: [
          { text: 'OneAlarm とは', link: '/' },
          { text: 'はじめかた', link: '/getting-started' },
          { text: '画面の使い方', link: '/screens' },
          { text: '鳴動中の画面', link: '/ringing' },
          { text: '機器のセットアップ', link: '/device-setup' },
          { text: 'よくある質問', link: '/faq' },
        ],
      },
    ],

    outline: { level: [2, 3], label: 'このページの内容' },

    docFooter: { prev: '前のページ', next: '次のページ' },
    darkModeSwitchLabel: '外観',
    lightModeSwitchTitle: 'ライトモードに切り替える',
    darkModeSwitchTitle: 'ダークモードに切り替える',
    sidebarMenuLabel: 'メニュー',
    returnToTopLabel: 'ページの先頭へ',
    langMenuLabel: '言語',

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '検索', buttonAriaLabel: '検索' },
          modal: {
            displayDetails: '詳細を表示',
            resetButtonTitle: '検索条件をクリア',
            backButtonTitle: '閉じる',
            noResultsText: '見つかりませんでした',
            footer: {
              selectText: '選択',
              navigateText: '移動',
              closeText: '閉じる',
            },
          },
        },
      },
    },

    footer: {
      message: '現在は開発中のプロジェクトです。',
    },
  },
})
