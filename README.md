# はじめてのAI副業ラボ

AIツール、Web制作、副業準備をこれから学ぶ初心者向けの静的アフィリエイトメディアです。
初心者2人チームで Git / GitHub / Pull Request / GitHub Actions / GitHub Pages を学びながら、小さく育てていくことを目的にしています。

## サイト概要

- サイト名: はじめてのAI副業ラボ
- テーマ: AIツール × Web制作 × 副業初心者
- 形式: HTML / CSS / JavaScript の静的サイト
- 公開先: GitHub Pages
- 注意: 収益を保証する表現は使わず、価格やキャンペーンなどは公式サイトで確認する方針です。

## ターゲット

- 副業を始めたいが、何から学べばよいか迷っている人
- Web制作やLP制作を基礎から試したい人
- AIツールを文章作成や制作補助に使ってみたい人
- GitHubでチーム開発とCI/CDを練習したい人

## ページ構成

```text
.
├── index.html
├── about.html
├── disclosure.html
├── privacy.html
├── articles/
│   ├── ai-tools-beginner.html
│   ├── chatgpt-lp.html
│   ├── github-pages-guide.html
│   ├── web-tools-beginner.html
│   └── conoha-timing.html
├── css/style.css
├── js/main.js
├── robots.txt
└── sitemap.xml
```

## ローカルでの確認方法

HTMLを直接ブラウザで開いて確認できます。

簡易サーバーで確認する場合:

```powershell
py -3 -m http.server 8000
```

ブラウザで以下を開きます。

```text
http://localhost:8000
```

## 初回セットアップ

```powershell
npm install
```

## lint

```powershell
npm run lint
```

## format

```powershell
npm run format
```

## Git運用ルール

- `main` は公開用ブランチです。
- `develop` は開発統合用ブランチです。
- 各自の作業は `feature/*` などのfeatureブランチで行います。
- 変更はPull Requestを作成し、レビューしてからマージします。
- Pull RequestではGitHub ActionsのCIが成功していることを確認します。
- 価格、キャンペーン、在庫などの変動情報は公式サイト確認の案内を入れます。
- アフィリエイトリンク予定のリンクには `rel="sponsored nofollow"` を付けます。

## 2人の役割分担例

- 開発者A: サイト構成、共通デザイン、CI/CD、GitHub Pages設定
- 開発者B: 記事本文、比較表、広告表記チェック、内部リンク整理

進め方の例:

1. Issueを作る
2. 担当者を決める
3. featureブランチで作業する
4. Pull Requestを作る
5. もう1人がレビューする
6. CI成功後に `develop` へマージする
7. 公開する内容を `main` へマージする
