# 不動産価格推移予測システム

不動産物件の情報を入力すると、今後の価格推移を予測できるWebアプリケーションです。

## 機能

- **物件情報入力**: 築年数、平米数、駅からの距離、現在の価格、地域を入力
- **価格推移予測**: 不動産情報ライブラリAPIと連携して10年間の価格推移を予測
- **詳細分析**: 物件の価値に影響する複数の要因を分析
- **視覚的表示**: 予測結果を表にして表示

## 技術スタック

- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
- **バックエンド統合**: 不動産情報ライブラリAPI連携（REST API）
- **デプロイ**: GitHub Pages + GitHub Actions

## API統合

このアプリケーションは以下のAPIエンドポイントと連携します：

### POST `/forecast`

**リクエスト例:**
```json
{
  "buildingAge": 10,
  "squareMeters": 80,
  "distanceToStation": 5,
  "currentPrice": 3500,
  "location": "tokyo"
}
```

**レスポンス例:**
```json
{
  "currentPrice": 3500,
  "forecast": [
    {
      "year": 1,
      "price": 3430,
      "changeRate": "-2.0"
    },
    ...
  ],
  "analysis": [
    "✓ 築年数が浅いため、比較的安定した価格が期待できます",
    "✓ 駅に近いため、比較的価値が保ちやすいです",
    "✓ 東京都は不動産需要が高く、相対的に価値が保ちやすいです"
  ]
}
```

**API基底URL:**
```
https://api.realestate-lib.example.com
```

> ⚠️ **注**: 現在、バックエンドAPIが接続できない場合は、フロントエンド内蔵の予測エンジンが自動的に代替処理を行います。

## ローカル開発

### セットアップ

```bash
npm install
npm run build
```

### ビルド

```bash
npm run build
```

成果物は `dist/` ディレクトリに生成されます。

## デプロイ

このアプリケーションは GitHub Pages に自動デプロイされます。

### デプロイメントフロー

- `main` ブランチへの push → 自動でビルドしてGitHub Pages にデプロイ
- Pull Request → ビルド確認のみ（デプロイはなし）

### 設定

GitHub リポジトリの `Settings` > `Pages`:
- **Source**: GitHub Actions
- **Workflow**: `deploy-frontend.yml`

## ファイル構成

```
.
├── index.html              # メインHTMLファイル
├── assets/
│   ├── css/
│   │   └── style.css      # スタイルシート
│   └── js/
│       └── main.js        # JavaScriptメイン（API連携、予測ロジック）
├── scripts/
│   └── build.js           # ビルドスクリプト
├── .github/
│   └── workflows/
│       └── deploy-frontend.yml  # GitHub Actions ワークフロー
└── package.json           # npm設定
```

## 今後の拡張予定

- [ ] より詳細な予測モデルの実装
- [ ] 過去の取引データとの比較機能
- [ ] グラフによる可視化（Chart.js等）
- [ ] 複数物件の比較機能
- [ ] ユーザー認証と保存機能
