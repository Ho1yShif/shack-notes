"use strict";
const Database = require("better-sqlite3");
const electron = require("electron");
const path$1 = require("path");
class DatabaseService {
  constructor() {
    this.statements = {
      createNote: null,
      getNote: null,
      getAllNotes: null,
      updateNote: null,
      deleteNote: null
    };
    this.db = new Database(path$1.join(electron.app.getPath("userData"), "notes.db"));
    this.db.pragma("journal_mode = WAL");
    this.initialize();
    this.prepareStatements();
  }
  initialize() {
    this.db.exec(`
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                createdAt DATETIME NOT NULL,
                updatedAt DATETIME NOT NULL
            )
        `);
  }
  prepareStatements() {
    this.statements.createNote = this.db.prepare(`
            INSERT INTO notes (title, content, createdAt, updatedAt)
            VALUES (?, ?, datetime('now'), datetime('now'))
        `);
    this.statements.getNote = this.db.prepare(`
            SELECT * FROM notes WHERE id = ?
        `);
    this.statements.getAllNotes = this.db.prepare(`
            SELECT * FROM notes ORDER BY updatedAt DESC
        `);
    this.statements.updateNote = this.db.prepare(`
            UPDATE notes SET title = ?, content = ?, updatedAt = datetime('now') WHERE id = ?
        `);
    this.statements.deleteNote = this.db.prepare(`
            DELETE FROM notes WHERE id = ?
        `);
  }
  createNote(note) {
    try {
      console.log("[DatabaseService] Creating note:", { title: note.title });
      const result = this.statements.createNote.run(note.title, note.content);
      console.log("[DatabaseService] Note created successfully with ID:", result.lastInsertRowid);
      return {
        success: true,
        id: result.lastInsertRowid,
        message: "Note created successfully"
      };
    } catch (error) {
      console.error("[DatabaseService] Error creating note:", {
        title: note.title,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : void 0
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create note"
      };
    }
  }
  getNote(id) {
    return this.statements.getNote.get(id);
  }
  getAllNotes() {
    return this.statements.getAllNotes.all();
  }
  updateNote(note) {
    this.statements.updateNote.run(note.title, note.content, note.id);
  }
  deleteNote(id) {
    this.statements.deleteNote.run(id);
  }
  close() {
    this.db.close();
  }
}
const dbService = new DatabaseService();
const { app, BrowserWindow, ipcMain } = require("electron");
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
    win.webContents.on("console-message", (_event, _level, message) => {
      if (message.includes("Autofill")) {
        return;
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
ipcMain.handle("notes:getAll", async () => {
  return dbService.getAllNotes();
});
ipcMain.handle("notes:getOne", async (_event, id) => {
  return dbService.getNote(id);
});
ipcMain.handle("notes:create", async (_event, note) => {
  return dbService.createNote(note);
});
ipcMain.handle("notes:update", async (_event, note) => {
  dbService.updateNote(note);
  return dbService.getNote(note.id);
});
ipcMain.handle("notes:delete", async (_event, id) => {
  dbService.deleteNote(id);
});
