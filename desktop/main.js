// GymScore デスクトップ版（Electron メインプロセス）
const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');

// 二重起動を防止（同じデータを2つの窓で編集して上書きし合わないように）
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'GymScore',
    icon: path.join(__dirname, 'app', 'icon.png'),
    backgroundColor: '#eef2f7',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'app', 'index.html'));

  // アプリ外へのページ遷移・新規ウィンドウは既定のブラウザで開く
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) {
      event.preventDefault();
      if (/^https?:/i.test(url)) shell.openExternal(url);
    }
  });

  // PDF・CSV の保存先をダイアログで選べるようにする
  mainWindow.webContents.session.on('will-download', (event, item) => {
    const defaultPath = path.join(app.getPath('documents'), item.getFilename());
    const savePath = dialog.showSaveDialogSync(mainWindow, {
      title: 'ファイルの保存',
      defaultPath,
      filters: filtersFor(item.getFilename())
    });
    if (savePath) {
      item.setSavePath(savePath);
    } else {
      item.cancel();
    }
  });
}

function filtersFor(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.pdf') return [{ name: 'PDF', extensions: ['pdf'] }];
  if (ext === '.csv') return [{ name: 'CSV', extensions: ['csv'] }];
  return [{ name: 'すべてのファイル', extensions: ['*'] }];
}

function buildMenu() {
  const template = [
    {
      label: 'ファイル',
      submenu: [
        { label: '印刷…', accelerator: 'CmdOrCtrl+P', click: () => mainWindow && mainWindow.webContents.print() },
        { type: 'separator' },
        { label: '終了', role: 'quit' }
      ]
    },
    {
      label: '表示',
      submenu: [
        { label: '再読み込み', role: 'reload' },
        { type: 'separator' },
        { label: '拡大', role: 'zoomIn' },
        { label: '縮小', role: 'zoomOut' },
        { label: '標準サイズ', role: 'resetZoom' },
        { type: 'separator' },
        { label: '全画面表示', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'ヘルプ',
      submenu: [
        {
          label: 'GymScore について',
          click: () => dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'GymScore について',
            message: `GymScore ${app.getVersion()}`,
            detail: '体操競技 得点集計アプリ\n鯖江高校体操部作成\n\nデータはこのパソコン内に自動保存されます。'
          })
        }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.whenReady().then(() => {
  buildMenu();
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});
