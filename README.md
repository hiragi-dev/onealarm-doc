# onealarm-doc

[OneAlarm](https://github.com/hiragi-dev/onealarm-app) の**利用者向け**ドキュメントサイト。

公開URL: https://hiragi-dev.github.io/onealarm-doc/

## 編集する

本文はすべて `docs/` 直下の Markdown。触るのはこの5＋1ファイルだけで済む。

| ファイル | 内容 |
| --- | --- |
| `docs/index.md` | トップ（hero と features は front matter で編集する） |
| `docs/getting-started.md` | はじめかた（最初の3ステップ） |
| `docs/screens.md` | 3タブの説明（アラーム / 停止 / 設定） |
| `docs/ringing.md` | 鳴動中の画面 |
| `docs/device-setup.md` | 機器のセットアップ |
| `docs/faq.md` | よくある質問 |

サイドバーの並び・サイト名・検索の文言は `docs/.vitepress/config.ts`。

画像は `docs/public/screenshots/` に置き、本文からは `/screenshots/xxx.png` で参照する
（`public/` の中身はビルド時にルート直下へ展開されるため、パスに `public` を含めない）。

他のページからリンクする見出しには `## つながらない {#connection}` のように ASCII の ID を付ける。
VitePress が生成する見出し ID は濁点・半濁点が分離された形（NFD）になるため、
「が」「で」「ぱ」などを含む見出しへ日本語のまま `#つながらない` と書いたリンクは一致しない。

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

`onealarm-app` で `npm run dev` を起動しておき、このリポジトリで次を実行する。

```bash
npm run screenshots                    # 全画面
SECTION=ringing npm run screenshots    # 鳴動画面だけ
```

`scripts/screenshots.mjs` がローカルの Google Chrome をヘッドレスで起動し、
`docs/public/screenshots/` に上書き保存する（幅 420px・2倍解像度）。
dev サーバーが別の URL なら `BASE=http://...` で指定する。

dev ビルドにだけ出る開発ツール（設定タブ下部のパネル、鳴動画面の「開発用」カード）は
撮影前にスクリプトが非表示にする。手で撮る場合は写り込まないように注意する。
地図は WebGL で描くため、ヘッドレス Chrome は `--use-angle=swiftshader` 付きで起動している。
