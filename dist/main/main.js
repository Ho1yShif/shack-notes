"use strict";
const { app, BrowserWindow } = require("electron");
const path = require("path");
app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
    win.webContents.on("console-message", (event, level, message) => {
      if (message.includes("Autofill")) {
        event.preventDefault();
      }
    });
  } else {
    win.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  win.show();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
