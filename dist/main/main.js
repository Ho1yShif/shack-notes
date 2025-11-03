"use strict";
const { app, BrowserWindow } = require("electron");
app.whenReady().then(() => {
  const win = new BrowserWindow({
    webPreferences: {
      preload: `${__dirname}/preload.js`
    }
  });
  win.show();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
