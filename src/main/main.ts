const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
import dbService from './database';

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // In development, load from Vite dev server
  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
    
    // Suppress harmless DevTools autofill warnings
    win.webContents.on('console-message', (_event, _level, message) => {
      // Suppress Autofill protocol warnings from DevTools
      if (message.includes('Autofill')) {
        return;
      }
    });
  } else {
    // In production, load the built files
    win.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  win.show();
});

// Quit the app when no windows are open on non-macOS platforms
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// IPC Handlers for database operations
ipcMain.handle('notes:getAll', async () => {
  return dbService.getAllNotes();
});

ipcMain.handle('notes:getOne', async (_event, id: number) => {
  return dbService.getNote(id);
});

ipcMain.handle('notes:create', async (_event, note: { title: string; content: string }) => {
  return dbService.createNote(note);
});

ipcMain.handle('notes:update', async (_event, note: any) => {
  const updateResult = dbService.updateNote(note);
  if (!updateResult.success) {
    return {
      success: false,
      error: updateResult.error
    };
  }
  return dbService.getNote(note.id);
});

ipcMain.handle('notes:delete', async (_event, id: number) => {
  return dbService.deleteNote(id);
});
