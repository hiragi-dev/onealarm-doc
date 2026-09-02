# onealarm-doc

[OneAlarm](https://github.com/hiragi-dev/onealarm-app) の**利用者向け**ドキュメントサイト。
非エンジニアが読むことを想定しているので、実装の話はここに書かない。

## 編集する

本文はすべて `docs/` 直下の Markdown。触るのはこの5＋1ファイルだけで済む。

| ファイル | 内容 |
| --- | --- |
| `docs/index.md` | トップ（hero と features は front matter で編集する） |
| `docs/getting-started.md` | はじめかた（最初の3ステップ） |
| `docs/screens.md` | 3タブの説明 |
| `docs/ringing.md` | 鳴ったときの挙動 |
| `docs/device-setup.md` | 機器のセットアップ |
| `docs/faq.md` | よくある質問 |

サイドバーの並び・サイト名・検索の文言は `docs/.vitepress/config.ts`。

画像は `docs/public/screenshots/` に置き、本文からは `/screenshots/xxx.png` で参照する
（`public/` の中身はビルド時にルート直下へ展開されるため、パスに `public` を含めない）。

## 動かす

```bash
npm install
npm run docs:dev      # http://localhost:5173
npm run docs:build    # リンク切れはここで落ちる
npm run docs:preview  # ビルド結果を確認
```

## 公開する

`main` への push で GitHub Pages へ自動デプロイされる（`.github/workflows/deploy.yml`）。
リポジトリの Settings > Pages で **Source を「GitHub Actions」** にしておくこと。

リポジトリ名を変えたら `docs/.vitepress/config.ts` の `base` も合わせる。
`<user>.github.io` として公開する場合は `base: '/'`。

## スクリーンショットの撮り直し

`onealarm-app` の `npm run dev` を起動し、ブラウザを幅 420px 程度にして撮る。
**dev ビルドにだけ出る開発ツール**（設定タブ下部のパネル、鳴動画面の「開発用」カード）が
写り込まないように注意する。
