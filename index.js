const electron = require('electron');
const { dirname } = require('path');
const os = require('os');
// Module to control application life.
const app = electron.app;
const dialog = electron.dialog;
const ipc = electron.ipcMain;
const Menu = electron.Menu;
const fs = require('fs');
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const mode = 'DEV';
const childProcess = require('child_process');
const { ipcRenderer } = require('electron');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const template = [{
    label: 'File',
    submenu: [{
        label: 'Open File',
        click: (menuItem) => {
            if(os.platform() === 'linux' || os.platform() === 'win32'){
                dialog.showOpenDialog({
                    properties: ['openFile']
                }).then(result => {
                    if (mode == 'DEV') {
                         childProcess.spawn('ln', [
                             '-s',
                             result.filePaths[0],
                             './public/'+result.filePaths[0].split('/').at(-1)
                         ])
                    }
                    if (!result.canceled) {
                        mainWindow.webContents.send('selected-file', result.filePaths[0]);
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
    }]
}]
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 800, height: 600,
                                    webPreferences: {
                                        nodeIntegration: true,
                                        contextIsolation: false,
                                    }});

    // and load the index.html of the app.
    // mainWindow.loadURL('http://localhost:3000');
    mainWindow.loadURL('http://localhost:3000')
    // mainWindow.loadFile('./build/index.html')
    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
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