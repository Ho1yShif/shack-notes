const { app, BrowserWindow } = require("electron");

app.whenReady().then(() => {
  const win = new BrowserWindow({
    webPreferences: {
      preload: `${__dirname}/preload.js`,
    },
  });
  win.show();
});

// Quit the app when no windows are open on non-macOS platforms
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
