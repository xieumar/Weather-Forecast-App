const {
  app, BrowserWindow, Menu, shell,
} = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

const PORT = 3000;
let mainWindow;
let server;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.wasm': 'application/wasm',
};

function findDistRecursive(startDir) {
  if (!startDir || !fs.existsSync(startDir)) return null;
  const dirs = [startDir];
  for (let i = 0; i < dirs.length; i++) {
    const d = dirs[i];
    try {
      const entries = fs.readdirSync(d, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const full = path.join(d, entry.name);
          if (entry.name === 'dist' && fs.existsSync(path.join(full, 'index.html'))) {
            return full;
          }
          dirs.push(full);
        }
      }
    } catch {}
  }
  return null;
}

function getDistPath() {
  if (app.isPackaged) {
    const appPath = app.getAppPath();
    const candidates = [
      path.join(appPath, 'dist'),
      path.join(process.resourcesPath, 'app.asar.unpacked', 'dist'),
      path.join(process.resourcesPath, 'dist'),
    ];
    for (const p of candidates) {
      try {
        if (fs.existsSync(path.join(p, 'index.html'))) return p;
      } catch {}
    }
    const found = findDistRecursive(appPath) || findDistRecursive(process.resourcesPath);
    if (found) return found;
    console.error('WARNING: dist not found, falling back to:', candidates[0]);
    return candidates[0];
  }
  return path.join(__dirname, '..', 'dist');
}

function startStaticServer() {
  return new Promise((resolve) => {
    const distPath = getDistPath();

    server = http.createServer((req, res) => {
      let filePath = req.url.split('?')[0];

      if (filePath === '/' || filePath === '') {
        filePath = '/index.html';
      }

      const fullPath = path.join(distPath, filePath);

      fs.stat(fullPath, (err, stats) => {
        if (err || !stats.isFile()) {
          if (!filePath.includes('.')) {
            const indexPath = path.join(distPath, 'index.html');
            fs.readFile(indexPath, (readErr, data) => {
              if (readErr) {
                res.writeHead(500);
                res.end('Server error');
              } else {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(data);
              }
            });
            return;
          }
          res.writeHead(404);
          res.end('Not found');
          return;
        }

        const ext = path.extname(fullPath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        fs.readFile(fullPath, (readErr, data) => {
          if (readErr) {
            res.writeHead(500);
            res.end('Server error');
            return;
          }
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(data);
        });
      });
    });

    server.listen(PORT, '127.0.0.1', () => {
      console.log(`Static server running on http://127.0.0.1:${PORT}`);
      resolve();
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
      resolve();
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
    title: 'Weather Forecast App',
    backgroundColor: '#0B1426',
  });

  mainWindow.webContents.session.setPermissionRequestHandler(
    (_webContents, permission, callback) => {
      callback(permission === 'geolocation');
    }
  );

  if (!app.isPackaged) {
    mainWindow.loadURL('http://localhost:8081');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(`http://127.0.0.1:${PORT}`);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.on('did-finish-load', () => {
    https.get('https://ipapi.co/json/', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.latitude && json.longitude) {
            mainWindow.webContents.executeJavaScript(
              `window.__ELECTRON_LOCATION__ = { lat: ${json.latitude}, lon: ${json.longitude} };` +
              `window.dispatchEvent(new CustomEvent('electron-location', { detail: { lat: ${json.latitude}, lon: ${json.longitude} } }));`
            );
          }
        } catch (e) { /* silent fail */ }
      });
    }).on('error', () => { /* silent fail */ });
  });

  setupMenu();
}

function setupMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Refresh',
          accelerator: 'CmdOrCtrl+R',
          click: () => { mainWindow.reload(); },
        },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Navigate',
      submenu: [
        {
          label: 'Home',
          accelerator: 'CmdOrCtrl+H',
          click: () => { mainWindow.webContents.send('navigate', '/'); },
        },
        {
          label: 'Search',
          accelerator: 'CmdOrCtrl+F',
          click: () => { mainWindow.webContents.send('navigate', '/search'); },
        },
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://github.com/xieumar/Weather-Forecast-App');
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.on('ready', async () => {
  if (app.isPackaged) {
    const distPath = getDistPath();
    console.log('getDistPath() resolved to:', distPath);
    console.log('process.resourcesPath:', process.resourcesPath);
    console.log('process.execPath:', process.execPath);
    console.log('isPackaged:', app.isPackaged);
    try {
      const idx = path.join(distPath, 'index.html');
      console.log('index.html exists:', fs.existsSync(idx));
    } catch (e) {
      console.error('Error checking index.html:', e.message);
    }
    await startStaticServer();
  }
  createWindow();
});

app.on('window-all-closed', () => {
  if (server) {
    server.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
