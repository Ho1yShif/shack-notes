import Database from 'better-sqlite3';
import {app} from 'electron';
import path from 'path';

export interface Note {
    id: number;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateNoteInput {
    title: string;
    content: string;
}

export interface CreateNoteResult {
    success: boolean;
    id?: number;
    message?: string;
    error?: string;
}

export interface GetNoteResult {
    success: boolean;
    note?: Note;
    error?: string;
}

export interface GetAllNotesResult {
    success: boolean;
    notes?: Note[];
    error?: string;
}

export interface UpdateNoteResult {
    success: boolean;
    message?: string;
    error?: string;
}

export interface DeleteNoteResult {
    success: boolean;
    message?: string;
    error?: string;
}

export interface GetNotesWithPaginationResult {
    success: boolean;
    notes?: Note[];
    total?: number;
    hasMore?: boolean;
    error?: string;
}

class DatabaseService {

    private db: Database.Database;
    
    // Prepared statements (compiled once, reused many times)
    private statements = {
        createNote: null as any,
        getNote: null as any,
        getAllNotes: null as any,
        getNotesPaginated: null as any,
        getNotesCount: null as any,
        updateNote: null as any,
        deleteNote: null as any,
    };

    constructor() {
        this.db = new Database(path.join(app.getPath('userData'), 'notes.db'));
        this.db.pragma('journal_mode = WAL');
        this.initialize();
        this.prepareStatements();
    }

    private initialize() {
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

    private prepareStatements() {
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

    createNote(note: CreateNoteInput): CreateNoteResult {
        try {
            console.log('[DatabaseService] Creating note:', { title: note.title });
            const result = this.statements.createNote.run(note.title, note.content);
            console.log('[DatabaseService] Note created successfully with ID:', result.lastInsertRowid);
            return {
                success: true,
                id: result.lastInsertRowid,
                message: 'Note created successfully'
            }
        } catch (error) {
            console.error('[DatabaseService] Error creating note:', {
                title: note.title,
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create note'
            };
        }
    }
    getNote(id: number): GetNoteResult {
        try {
            console.log('[DatabaseService] Getting note with ID:', id);
            const note = this.statements.getNote.get(id);
            if (!note) {
                return {
                    success: false,
                    error: 'Note not found'
                };
            }
            console.log('[DatabaseService] Note retrieved successfully');
            return {
                success: true,
                note
            };
        } catch (error) {
            console.error('[DatabaseService] Error getting note:', {
                id,
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get note'
            };
        }
    }
    getAllNotes(): GetAllNotesResult {
        try {
            console.log('[DatabaseService] Getting all notes');
            const notes = this.statements.getAllNotes.all();
            console.log('[DatabaseService] Retrieved', notes.length, 'notes');
            return {
                success: true,
                notes
            };
        } catch (error) {
            console.error('[DatabaseService] Error getting all notes:', {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get notes'
            };
        }
    }

    getNotesPaginated(limit: number, offset: number): GetNotesWithPaginationResult {
        try {
            console.log('[DatabaseService] Getting paginated notes:', { limit, offset });
            const notes = this.statements.getNotesPaginated.all(limit, offset);
            const countResult = this.statements.getNotesCount.get() as { total: number };
            const total = countResult.total;
            const hasMore = offset + notes.length < total;
            
            console.log('[DatabaseService] Retrieved', notes.length, 'notes out of', total, 'total. HasMore:', hasMore);
            return {
                success: true,
                notes,
                total,
                hasMore
            };
        } catch (error) {
            console.error('[DatabaseService] Error getting paginated notes:', {
                limit,
                offset,
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get notes'
            };
        }
    }
    updateNote(note: Note): UpdateNoteResult {
        try {
            console.log('[DatabaseService] Updating note:', { id: note.id, title: note.title });
            this.statements.updateNote.run(note.title, note.content, note.id);
            console.log('[DatabaseService] Note updated successfully');
            return {
                success: true,
                message: 'Note updated successfully'
            };
        } catch (error) {
            console.error('[DatabaseService] Error updating note:', {
                id: note.id,
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update note'
            };
        }
    }
    deleteNote(id: number): DeleteNoteResult {
        try {
            console.log('[DatabaseService] Deleting note with ID:', id);
            this.statements.deleteNote.run(id);
            console.log('[DatabaseService] Note deleted successfully');
            return {
                success: true,
                message: 'Note deleted successfully'
            };
        } catch (error) {
            console.error('[DatabaseService] Error deleting note:', {
                id,
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete note'
            };
        }
    }

    close() {
        this.db.close();
    }

}

// Don't instantiate at module load - wait for app to be ready
let dbServiceInstance: DatabaseService | null = null;

export function initializeDatabase(): DatabaseService {
    if (!dbServiceInstance) {
        dbServiceInstance = new DatabaseService();
    }
    return dbServiceInstance;
}

export function getDatabase(): DatabaseService {
    if (!dbServiceInstance) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return dbServiceInstance;
}

// For backward compatibility, but should be avoided
export default {
    get instance() {
        return getDatabase();
    }
};