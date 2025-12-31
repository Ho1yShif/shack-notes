"use strict";
const electron = require("electron");
const path = require("path");
const Database = require("better-sqlite3");
class DatabaseService {
  constructor() {
    this.statements = {
      createNote: null,
      getNote: null,
      getAllNotes: null,
      getNotesPaginated: null,
      getNotesCount: null,
      updateNote: null,
      deleteNote: null
    };
    this.db = new Database(path.join(electron.app.getPath("userData"), "notes.db"));
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
            VALUES (?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))
        `);
    this.statements.getNote = this.db.prepare(`
            SELECT * FROM notes WHERE id = ?
        `);
    this.statements.getAllNotes = this.db.prepare(`
            SELECT * FROM notes ORDER BY updatedAt DESC
        `);
    this.statements.getNotesPaginated = this.db.prepare(`
            SELECT * FROM notes ORDER BY updatedAt DESC LIMIT ? OFFSET ?
        `);
    this.statements.getNotesCount = this.db.prepare(`
            SELECT COUNT(*) as total FROM notes
        `);
    this.statements.updateNote = this.db.prepare(`
            UPDATE notes SET title = ?, content = ?, updatedAt = datetime('now', 'localtime') WHERE id = ?
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
    try {
      console.log("[DatabaseService] Getting note with ID:", id);
      const note = this.statements.getNote.get(id);
      if (!note) {
        return {
          success: false,
          error: "Note not found"
        };
      }
      console.log("[DatabaseService] Note retrieved successfully");
      return {
        success: true,
        note
      };
    } catch (error) {
      console.error("[DatabaseService] Error getting note:", {
        id,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : void 0
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get note"
      };
    }
  }
  getAllNotes() {
    try {
      console.log("[DatabaseService] Getting all notes");
      const notes = this.statements.getAllNotes.all();
      console.log("[DatabaseService] Retrieved", notes.length, "notes");
      return {
        success: true,
        notes
      };
    } catch (error) {
      console.error("[DatabaseService] Error getting all notes:", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : void 0
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get notes"
      };
    }
  }
  getNotesPaginated(limit, offset) {
    try {
      console.log("[DatabaseService] Getting paginated notes:", { limit, offset });
      const notes = this.statements.getNotesPaginated.all(limit, offset);
      const countResult = this.statements.getNotesCount.get();
      const total = countResult.total;
      const hasMore = offset + notes.length < total;
      console.log("[DatabaseService] Retrieved", notes.length, "notes out of", total, "total. HasMore:", hasMore);
      return {
        success: true,
        notes,
        total,
        hasMore
      };
    } catch (error) {
      console.error("[DatabaseService] Error getting paginated notes:", {
        limit,
        offset,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : void 0
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get notes"
      };
    }
  }
  updateNote(note) {
    try {
      console.log("[DatabaseService] Updating note:", { id: note.id, title: note.title });
      this.statements.updateNote.run(note.title, note.content, note.id);
      console.log("[DatabaseService] Note updated successfully");
      return {
        success: true,
        message: "Note updated successfully"
      };
    } catch (error) {
      console.error("[DatabaseService] Error updating note:", {
        id: note.id,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : void 0
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update note"
      };
    }
  }
  deleteNote(id) {
    try {
      console.log("[DatabaseService] Deleting note with ID:", id);
      this.statements.deleteNote.run(id);
      console.log("[DatabaseService] Note deleted successfully");
      return {
        success: true,
        message: "Note deleted successfully"
      };
    } catch (error) {
      console.error("[DatabaseService] Error deleting note:", {
        id,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : void 0
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete note"
      };
    }
  }
  close() {
    this.db.close();
  }
}
let dbServiceInstance = null;
function initializeDatabase() {
  if (!dbServiceInstance) {
    dbServiceInstance = new DatabaseService();
  }
  return dbServiceInstance;
}
function getDatabase() {
  if (!dbServiceInstance) {
    throw new Error("Database not initialized. Call initializeDatabase() first.");
  }
  return dbServiceInstance;
}
electron.app.whenReady().then(() => {
  initializeDatabase();
  const win = new electron.BrowserWindow({
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
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") electron.app.quit();
});
electron.ipcMain.handle("notes:getAll", async () => {
  return getDatabase().getAllNotes();
});
electron.ipcMain.handle("notes:getPaginated", async (_event, limit, offset) => {
  return getDatabase().getNotesPaginated(limit, offset);
});
electron.ipcMain.handle("notes:getOne", async (_event, id) => {
  return getDatabase().getNote(id);
});
electron.ipcMain.handle("notes:create", async (_event, note) => {
  return getDatabase().createNote(note);
});
electron.ipcMain.handle("notes:update", async (_event, note) => {
  const updateResult = getDatabase().updateNote(note);
  if (!updateResult.success) {
    return {
      success: false,
      error: updateResult.error
    };
  }
  return getDatabase().getNote(note.id);
});
electron.ipcMain.handle("notes:delete", async (_event, id) => {
  return getDatabase().deleteNote(id);
});
