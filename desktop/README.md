# GymScore デスクトップ版（Windows）

Web版 `../gymscore.html` を、インターネットなしで動く Windows ソフトにしたものです（Electron 製）。

## 配布ファイル（`dist/`）

| ファイル | 使い方 |
| :--- | :--- |
| `GymScore-Setup-1.0.0.exe` | インストーラー。デスクトップとスタートメニューにショートカットができます。 |
| `GymScore-Portable-1.0.0.exe` | インストール不要。USBメモリなどに入れてダブルクリックで起動できます。 |

- 初回起動時に「Windows によって PC が保護されました」と出た場合は、**詳細情報 → 実行** を押してください（署名なしのソフトのため表示されます）。
- データはパソコン内（`%APPDATA%\GymScore`）に自動保存されます。Web版やブラウザのデータとは別です。
- PDF・CSV は保存先を選ぶダイアログが出ます。

## Web版との違い

- **オフラインで動作**：Tailwind / Font Awesome / html2pdf.js を同梱しているため、会場にネットがなくても使えます。
- フォントは Windows 標準（游ゴシック等）で表示します。
- 二重起動はできません（2つの窓でデータを上書きし合わないため）。

## アプリを更新したとき（作り直し方）

`../gymscore.html` を修正したら、この `desktop` フォルダで次を実行します。

```powershell
powershell -ExecutionPolicy Bypass -File .\build-win.ps1
```

- ビルド作業は `%LOCALAPPDATA%\gymscore-desktop-build` で行い（Googleドライブの同期を重くしないため）、できた exe だけが `dist/` にコピーされます。
- バージョン番号は `package.json` の `version` で変えられます。
- 必要なもの：Node.js（初回は Electron のダウンロードにインターネット接続が必要）。

## フォルダ構成

| パス | 内容 |
| :--- | :--- |
| `main.js` | ウィンドウ・メニュー・保存ダイアログの処理 |
| `scripts/prepare.js` | `gymscore.html` の CDN 読込をローカルに差し替えて `app/` を生成 |
| `vendor/` | 同梱ライブラリ（Tailwind CSS 3.4.17 / Font Awesome 6.5.1 / html2pdf.js 0.10.1） |
| `build/icon.png` | アプリアイコン（原稿は `build/icon.html`） |
| `build-win.ps1` | Windows 用ビルドスクリプト |

鯖江高校体操部作成
