const electron = require('electron');
const { dirname } = require('path');
const os = require('os');
// Module to control application life.
const app = electron.app;
const dialog = electron.dialog;
const ipc = electron.ipcMain;
const Menu = electron.Menu;
const fs = require('fs');
const srt2vtt = require('srt2vtt')
const storage = require('electron-json-storage');
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const mode = 'PROD';
const childProcess = require('child_process');
const { ipcRenderer } = require('electron');
const { settings } = require('cluster');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let shortcutsWindow;
const createLink = (source) => {
    const dest = './public/'+source.split('/').at(-1)
    childProcess.spawn('ln', [
        '-s',
        source,
        dest
    ])
}

const getSettings = () => {
    const settingsObject = storage.getSync('settings');
    const settingsList = ['skipAmount', 'autoSleepAmount'];
    const defaults = {
        skipAmount: 10,
        autoSleepAmount: 30
    }
    settingsList.forEach(item => {if(!settingsObject.hasOwnProperty(item)) { settingsObject[item] = defaults[item]}});

    return settingsObject;
}

let fileSource = '';
if(process.argv.length > 1) {
    fileSource = process.argv[1];
}

const convertSrt2Vtt = (source) => {
    let data = fs.readFileSync(source);
    let fileName = source.split('/').at(-1);
    let resultFileName = fileName.split('.').slice(0, -1).join('.') + '.vtt'
    let dest = source.split('/').slice(0, -1).join('/') + '/' + resultFileName;
    srt2vtt(data, function (err, data) {
        if (err) throw new Error(err);
        fs.writeFileSync(dest, data)
        if (mode === 'DEV') {
            createLink(dest)
        }
    });
    return (mode === 'DEV') ? 'http://localhost:3000/' + resultFileName : dest;
}

let template = [{
    label: 'File',
    submenu: [
        {
            label: 'Open File',
            accelerator: 'Ctrl+O',
            click: (menuItem) => {
            if(os.platform() === 'linux' || os.platform() === 'win32'){
                dialog.showOpenDialog({
                    properties: ['openFile']
                }).then(result => {
                    let dest = result.filePaths[0];
                    if (mode === 'DEV') {
                        createLink(result.filePaths[0]);
                        dest = 'http://localhost:3000/' + dest.split('/').at(-1)
                     }
                    if (!result.canceled) {
                        mainWindow.webContents.send('selected-file', dest);
                    }
                });
            } else {
                dialog.showOpenDialog({
                    properties: ['openFile', 'openDirectory']
                }, function (files) {
                    if (files) event.sender.send('selected-file', files[0]);
                });
            }
            }
        },
        {
            label: "Open Subtitles",
            click: (menuItem) => {
                if(os.platform() === 'linux' || os.platform() === 'win32'){
                    dialog.showOpenDialog({
                        properties: ['openFile']
                    }).then(result => {

                        if (!result.canceled) {
                            const dest = convertSrt2Vtt(result.filePaths[0]);
                            mainWindow.webContents.send('subtitle-listener', dest);
                        }
                    });
                } else {
                    dialog.showOpenDialog({
                        properties: ['openFile', 'openDirectory']
                    }, function (files) {
                        if (files) event.sender.send('selected-file', files[0]);
                    });
                }
            }
        },
        {
            label: 'Settings',
            accelerator: 'Ctrl+Shift+S',
            click: (menuItem) => {
                mainWindow.webContents.send('settings-toggle', {})
            }
        },
        {
            label: 'View Shortcuts',
            click: () => {
                openShortcutsWindow();
            }
        }
    ]
}] 
if (mode === 'DEV') {
    template.push({
        role: 'toggleDevTools'
    })
}
// template = (mode === 'DEV') ? template.push({
//     role: 'toggleDevTools'
// }): template;
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 800, height: 600,
                                    webPreferences: {
                                        devTools: (mode==='DEV'),
                                        nodeIntegration: true,
                                        contextIsolation: false,
                                    }});

    // and load the index.html of the app.
    // mainWindow.loadURL('http://localhost:3000');
    // mainWindow.loadURL('http://localhost:3000').then(() => mainWindow.webContents.send('settings-receiver', getSettings()))
    if (mode === 'DEV') {
        mainWindow.loadURL('http://localhost:3000').then(() => mainWindow.webContents.send('settings-receiver', getSettings()))
    }
    else
        mainWindow.loadFile('./build/index.html').then(() => {
                mainWindow.webContents.send('settings-receiver', getSettings())
                if (fileSource !== '') {
                    mainWindow.webContents.send('selected-file', fileSource)
                }
            }
        )
    // Open the DevTools.
    // mainWindow.webContents.openDevTools();
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

function openShortcutsWindow() {
    shortcutsWindow = new BrowserWindow({ width: 400, height: 400});
    shortcutsWindow.loadFile('./additional-webpages/settings.html');
    shortcutsWindow.setMenu(null)
    shortcutsWindow.on('close', function() {
        shortcutsWindow = null
    })
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

ipc.on('settings-receiver-web', function(e, data) {
    storage.set('settings', data);
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

// ipc.on('open-file-dialog-for-file', function (event) {
//     if(os.platform() === 'linux' || os.platform() === 'win32'){
//        dialog.showOpenDialog({
//            properties: ['openFile']
//        }).then(result => {
//            if (mode == 'DEV') {
//                 childProcess.spawn('ln', [
//                     '-s',
//                     result.filePaths[0],
//                     './public/'+result.filePaths[0].split('/').at(-1)
//                 ])
//            }
//            if (!result.canceled) {
//                ipc.send('selected-file', result.filePaths[0]);
//            }
//        });
//    } else {
//        dialog.showOpenDialog({
//            properties: ['openFile', 'openDirectory']
//        }, function (files) {
//            if (files) event.sender.send('selected-file', files[0]);
//        });
//    }});