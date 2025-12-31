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

declare global {
  interface Window {
    notesAPI: {
      getAllNotes: () => Promise<GetAllNotesResult>;
      getNotesPaginated: (limit: number, offset: number) => Promise<GetNotesWithPaginationResult>;
      getNote: (id: number) => Promise<GetNoteResult>;
      createNote: (note: CreateNoteInput) => Promise<CreateNoteResult>;
      updateNote: (note: Note) => Promise<GetNoteResult>;
      deleteNote: (id: number) => Promise<DeleteNoteResult>;
    };
  }
}

