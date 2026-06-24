# cicd-affiliate

Test repository for cicd.

## GitHub Pages デプロイ

このリポジトリは Vite でビルドし、GitHub Actions から GitHub Pages へ自動デプロイされます。

### 構成

- `npm run build` で `dist/` フォルダを生成します。
- `main` ブランチへの push のみで自動デプロイされます。
- Pull Request ではビルドのみ実行され、デプロイは行われません。

### セットアップ手順

1. GitHub リポジトリの `Settings` > `Pages` に移動します。
2. `Build and deployment` の `Source` を `GitHub Actions` に設定します。
3. `Workflow` には `deploy-frontend.yml` が利用されます。
4. 変更を `main` ブランチに push すると、自動で `dist/` がビルドされ、GitHub Pages にデプロイされます。

### ローカルコマンド

```bash
npm install
npm run build
npm run dev
```
