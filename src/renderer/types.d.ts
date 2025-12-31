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

declare global {
  interface Window {
    notesAPI: {
      getAllNotes: () => Promise<Note[]>;
      getNote: (id: number) => Promise<Note | undefined>;
      createNote: (note: CreateNoteInput) => Promise<Note>;
      updateNote: (note: Note) => Promise<Note>;
      deleteNote: (id: number) => Promise<void>;
    };
  }
}

