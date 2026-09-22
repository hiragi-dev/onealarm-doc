# onealarm-doc

[OneAlarm](https://github.com/hiragi-dev/onealarm-app) の**利用者向け**ドキュメントサイト。

公開URL:

- トップ（ランディングページ）: https://hiragi-dev.github.io/onealarm-doc/
- ドキュメント: https://hiragi-dev.github.io/onealarm-doc/docs/

## 構成

トップのランディングページとドキュメントは別のものとして作っています。1回のビルドで `dist/` にまとめて出力し、GitHub Pages へ配信します。

| 場所 | 内容 | 実体 |
| --- | --- | --- |
| `/` | ランディングページ（プロダクトのコンセプト） | `site/`（Vite + Vue） |
| `/docs/` | ドキュメント | `docs/`（VitePress） |

## ランディングページを編集する

- 本体 … `site/src/App.vue`
- 見た目 … `site/src/style.css`
- 部品 … `site/src/components/`（`PhoneFrame.vue` = iPhone 枠、`DeviceMock.vue` = M5StickS3 の見た目、`AlarmDemo.vue` = 電源が切れないことを試せるデモ）
- 画像 … `site/public/images/`（`docs/public/` から使うものをコピーしている）
- `<head>` とフォント … `site/index.html`

## ドキュメントを編集する

本文はすべて `docs/` 直下の Markdown。触るのはこの7ファイル。

| ファイル | 内容 |
| --- | --- |
| `docs/index.md` | ドキュメントの入口 |
| `docs/getting-started.md` | はじめかた（機器の準備からアラーム作成まで） |
| `docs/screens.md` | 3タブの説明（アラーム / 停止 / 設定） |
| `docs/ringing.md` | 鳴動中の画面 |
| `docs/device-setup.md` | 機器（M5StickS3）のセットアップ。書き込みと初期設定 |
| `docs/device.md` | 機器の使い方。画面・ボタン・電源・鳴動中の動き |
| `docs/faq.md` | よくある質問 |

サイドバー・サイト名・検索の文言・base は `docs/.vitepress/config.ts`。

スクリーンショットは `docs/public/screenshots/` に置き、本文からは
`<PhoneShot src="/screenshots/xxx.png" alt="説明" />` で貼る（iPhone 風の外枠付きで表示される。
実体は `docs/.vitepress/theme/PhoneShot.vue`）。

機器（M5StickS3）の写真は `docs/public/device/` に置き、`<DeviceShot src="/device/xxx.png" alt="説明" />`
で貼る（背景を抜いた画像を影付きで表示する。実体は `docs/.vitepress/theme/DeviceShot.vue`）。

`public/` の中身はビルド時にルート直下へ展開されるため、パスに `public` を含めない。

他のページからリンクする見出しには `## つながらない {#connection}` のように ASCII の ID を付ける。
VitePress が生成する見出し ID は濁点・半濁点が分離された形（NFD）になるため、
「が」「で」「ぱ」などを含む見出しへ日本語のまま `#つながらない` と書いたリンクは一致しない。

## 動かす

```bash
npm install
npm run lp:dev        # LP        http://localhost:5173/onealarm-doc/
npm run docs:dev      # ドキュメント http://localhost:5174/onealarm-doc/docs/
npm run build         # dist/ にまとめて出力する
npm run lp:preview    # ビルド結果（LP）を確認
```

## 公開する

`main` への push で GitHub Pages へ自動デプロイされる（`.github/workflows/deploy.yml`）。
ワークフローは `npm run build` を実行し、`dist/` を配信する。
リポジトリの Settings > Pages で **Source を「GitHub Actions」** にしておくこと。

リポジトリ名を変えたら次も合わせる。

- `site/vite.config.ts` の `base`
- `docs/.vitepress/config.ts` の `base`
- `docs/.vitepress/config.ts` の nav にある「トップ」のURL
- `site/src/App.vue` の `docsUrl`（`import.meta.env.BASE_URL` から組み立てている）

`<user>.github.io` として公開する場合は `base: '/'` にする。

## スクリーンショットの撮り直し

`onealarm-app` で `npm run dev` を起動しておき、このリポジトリで次を実行する。

```bash
npm run screenshots                    # 全画面
SECTION=ringing npm run screenshots    # 鳴動画面だけ
```

`scripts/screenshots.mjs` がローカルの Google Chrome をヘッドレスで起動し、
`docs/public/screenshots/` に上書き保存する（幅 420px・2倍解像度）。
dev サーバーが別の URL なら `BASE=http://...` で指定する。

ドキュメントのスクリーンショットを撮り直したら、LP で使っている画像も
`site/public/images/` へコピーし直す。

dev ビルドにだけ出る開発ツール（設定タブ下部のパネル、鳴動画面の「開発用」カード）は
撮影前にスクリプトが非表示にする。手で撮る場合は写り込まないように注意する。
地図は WebGL で描くため、ヘッドレス Chrome は `--use-angle=swiftshader` 付きで起動している。
