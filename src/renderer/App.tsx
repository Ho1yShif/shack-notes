import React, { useState, useEffect } from 'react';
import '@/App.css';
import { Note, CreateNoteInput } from './types';

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showList, setShowList] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const allNotes = await window.notesAPI.getAllNotes();
    setNotes(allNotes);
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setSelectedNote(null);
    setTitle('');
    setContent('');
    setShowList(false);
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setIsCreating(false);
    setTitle(note.title);
    setContent(note.content);
    setShowList(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (isCreating) {
      await window.notesAPI.createNote({ title, content });
    } else if (selectedNote) {
      await window.notesAPI.updateNote({
        ...selectedNote,
        title,
        content,
      });
    }

    setTitle('');
    setContent('');
    setIsCreating(false);
    setSelectedNote(null);
    setShowList(true);
    await loadNotes();
  };

  const handleDelete = async () => {
    if (selectedNote && confirm('Delete this note?')) {
      await window.notesAPI.deleteNote(selectedNote.id);
      setSelectedNote(null);
      setTitle('');
      setContent('');
      setShowList(true);
      await loadNotes();
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setSelectedNote(null);
    setTitle('');
    setContent('');
    setShowList(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        {!showList && (
          <button className="back-btn" onClick={handleCancel}>
            ← Back
          </button>
        )}
        <h1>Shack Notes</h1>
        {showList && (
          <button className="new-btn" onClick={handleCreateNew}>
            +
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="main">
        {showList ? (
          /* Notes List */
          <div className="notes-list">
            {notes.length === 0 ? (
              <div className="empty-state">
                <p>No notes yet</p>
                <button className="create-first-btn" onClick={handleCreateNew}>
                  Create your first note
                </button>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="note-item"
                  onClick={() => handleSelectNote(note)}
                >
                  <h3>{note.title}</h3>
                  <p className="note-preview">
                    {note.content.substring(0, 100)}
                    {note.content.length > 100 ? '...' : ''}
                  </p>
                  <span className="note-date">{formatDate(note.updatedAt)}</span>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Note Editor */
          <div className="note-editor">
            <input
              type="text"
              className="title-input"
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              className="content-input"
              placeholder="Start writing..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="editor-actions">
              <button className="save-btn" onClick={handleSave}>
                {isCreating ? 'Create' : 'Save'}
              </button>
              {selectedNote && (
                <button className="delete-btn" onClick={handleDelete}>
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
