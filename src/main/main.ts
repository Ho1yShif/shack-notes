import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { initializeDatabase, getDatabase } from '@main/database';

app.whenReady().then(() => {
  // Initialize database after app is ready
  initializeDatabase();
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
  return getDatabase().getAllNotes();
});

ipcMain.handle('notes:getPaginated', async (_event, limit: number, offset: number) => {
  return getDatabase().getNotesPaginated(limit, offset);
});

ipcMain.handle('notes:getOne', async (_event, id: number) => {
  return getDatabase().getNote(id);
});

ipcMain.handle('notes:create', async (_event, note: { title: string; content: string }) => {
  return getDatabase().createNote(note);
});

ipcMain.handle('notes:update', async (_event, note: any) => {
  const updateResult = getDatabase().updateNote(note);
  if (!updateResult.success) {
    return {
      success: false,
      error: updateResult.error
    };
  }
  return getDatabase().getNote(note.id);
});

ipcMain.handle('notes:delete', async (_event, id: number) => {
  return getDatabase().deleteNote(id);
});
