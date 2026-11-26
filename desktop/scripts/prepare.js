// Web版 gymscore.html からオフライン動作するデスクトップ版の app/ を生成する
// - CDN 読込をローカルの vendor/ に差し替え
// - Google Fonts は削除（Windows 標準フォントで表示）
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const srcHtml = path.join(root, '..', 'gymscore.html');
const appDir = path.join(root, 'app');

function rmrf(p) { fs.rmSync(p, { recursive: true, force: true }); }
function copyDir(src, dst) { fs.cpSync(src, dst, { recursive: true }); }

let html = fs.readFileSync(srcHtml, 'utf8');

const replacements = [
  [/<script src="https:\/\/cdn\.tailwindcss\.com[^"]*"><\/script>/, '<script src="vendor/tailwindcss.js"></script>'],
  [/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\s*/, ''],
  [/<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>\s*/, ''],
  [/<link href="https:\/\/fonts\.googleapis\.com\/css2[^"]*" rel="stylesheet">/, ''],
  [/<link rel="stylesheet" href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/[^"]*all\.min\.css">/, '<link rel="stylesheet" href="vendor/fontawesome/css/all.min.css">'],
  [/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/html2pdf\.js\/[^"]*"><\/script>/, '<script src="vendor/html2pdf.bundle.min.js"></script>']
];

for (const [re, to] of replacements) {
  if (!re.test(html)) {
    throw new Error(`gymscore.html に想定した記述が見つかりません: ${re}`);
  }
  html = html.replace(re, to);
}

// 外部CDNへの参照が残っていないことを確認（オフラインで崩れるのを防ぐ）
const leftover = html.match(/https?:\/\/(cdn|fonts|cdnjs)[^"' )]*/g);
if (leftover) {
  throw new Error(`外部URLが残っています: ${leftover.join(', ')}`);
}

rmrf(appDir);
fs.mkdirSync(appDir, { recursive: true });
fs.writeFileSync(path.join(appDir, 'index.html'), html, 'utf8');
copyDir(path.join(root, 'vendor'), path.join(appDir, 'vendor'));
fs.copyFileSync(path.join(root, 'build', 'icon.png'), path.join(appDir, 'icon.png'));

console.log('app/ を生成しました（オフライン版 index.html + vendor）');
