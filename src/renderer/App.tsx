import React, { useState, useEffect, useRef } from 'react';
import '@/App.css';
import { Note, CreateNoteInput } from '@/types';
import logo from '@/assets/logos/logo.png';
import Editor from '@/components/Editor'

const NOTES_PER_PAGE = 8;
const NOTE_PREVIEW_LENGTH = 200;

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showList, setShowList] = useState(true);
  
  // Animation and loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [animationPhase, setAnimationPhase] = useState<'door-open' | 'door-close' | 'none'>('none');
  const [clickedNoteId, setClickedNoteId] = useState<number | null>(null);
  
  // Pagination states
  const [hasMoreNotes, setHasMoreNotes] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async (append = false) => {
    if (!append) {
      setIsLoading(true);
    }
    
    // Simulate minimum loading time for smooth animation
    const [result] = await Promise.all([
      window.notesAPI.getNotesPaginated(NOTES_PER_PAGE, append ? notes.length : 0),
      new Promise(resolve => setTimeout(resolve, append ? 200 : 500))
    ]);
    
    if (result.success && result.notes) {
      if (append) {
        setNotes([...notes, ...result.notes]);
      } else {
        setNotes(result.notes);
      }
      setHasMoreNotes(result.hasMore || false);
    } else {
      console.error('Failed to load notes:', result.error);
      if (!append) {
        setNotes([]);
      }
    }
    
    if (!append) {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || isAnimating) return;
    setIsLoadingMore(true);
    await loadNotes(true);
    setIsLoadingMore(false);
  };

  const handleCreateNew = () => {
    if (isAnimating) return;
    
    setShowList(false);
    setIsCreating(true);
    setSelectedNote(null);
    setTitle('');
    setContent('');
    
    // Focus title input after state update
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 100);
  };

  const handleSelectNote = (note: Note) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setAnimationPhase('door-open');
    setClickedNoteId(note.id);
    
    // Door opening animation sequence
    setTimeout(() => {
      setShowList(false);
      setSelectedNote(note);
      setIsCreating(false);
      setTitle(note.title);
      setContent(note.content);
      setAnimationPhase('none');
      setIsAnimating(false);
      setClickedNoteId(null);
    }, 600);
  };


  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    setSaveStatus('saving');

    try {
      if (isCreating) {
        const result = await window.notesAPI.createNote({ title, content });
        if (!result.success) {
          setSaveStatus('error');
          alert('Failed to create note: ' + result.error);
          setTimeout(() => setSaveStatus('idle'), 2000);
          return;
        }

        setSaveStatus('saved');
        
        // Reload notes first (in background)
        await loadNotes();
        
        // Trigger door close animation and return to list
        setIsAnimating(true);
        setAnimationPhase('door-close');
        
        setTimeout(() => {
          setIsCreating(false);
          setSelectedNote(null);
          setTitle('');
          setContent('');
          setShowList(true);
          setAnimationPhase('none');
          setIsAnimating(false);
          setSaveStatus('idle');
        }, 600);
      } else if (selectedNote) {
        const result = await window.notesAPI.updateNote({
          ...selectedNote,
          title,
          content,
        });
        if (!result.success) {
          setSaveStatus('error');
          alert('Failed to update note: ' + result.error);
          setTimeout(() => setSaveStatus('idle'), 2000);
          return;
        }

        setSaveStatus('saved');
        
        // Show success indicator briefly
        setTimeout(() => {
          setSaveStatus('idle');
          handleCancel();
        }, 1000);
        
        await loadNotes();
      }
    } catch (error) {
      console.error('Error saving note:', error);
      setSaveStatus('error');
      alert('Failed to save note');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleDelete = async () => {
    if (selectedNote && confirm('Delete this note?')) {
      try {
        const result = await window.notesAPI.deleteNote(selectedNote.id);
        if (!result.success) {
          alert('Failed to delete note: ' + result.error);
          return;
        }
        setSelectedNote(null);
        setTitle('');
        setContent('');
        setShowList(true);
        await loadNotes();
      } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note');
      }
    }
  };

  const handleCancel = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setAnimationPhase('door-close');
    
    // Door closing animation sequence
    setTimeout(() => {
      setIsCreating(false);
      setSelectedNote(null);
      setTitle('');
      setContent('');
      setShowList(true);
      setAnimationPhase('none');
      setIsAnimating(false);
    }, 600);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(navigator.language, { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Render loading skeleton
  const renderSkeletonNotes = () => (
    <div className="notes-list">
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton-note">
          <div className="skeleton-title"></div>
          <div className="skeleton-content"></div>
          <div className="skeleton-content" style={{ width: '70%' }}></div>
          <div className="skeleton-date"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="app">
      {/* Initial Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-text">🏠 Building your shack...</div>
        </div>
      )}

      {/* Save Status Indicator */}
      {saveStatus === 'saved' && (
        <div className="save-indicator success">
          <span className="save-indicator-icon">✓</span>
          <span className="save-indicator-text">Saved</span>
        </div>
      )}

      {/* Header */}
      <header className="header">
        <img src={logo} alt="Shack Notes Logo" className="header-logo" />
        <h1>shack notes</h1>
        <button 
          className="new-btn" 
          onClick={handleCreateNew}
          disabled={isAnimating}
          aria-label="Create new note"
        >
          +
        </button>
      </header>

      {/* Main Content */}
      <main className="main">
        {showList ? (
          /* Notes List - The Hallway */
          <div className={`notes-list ${animationPhase === 'door-close' ? 'door-closing' : ''}`}>
            {notes.length === 0 ? (
              <div className="empty-state">
                <p>No notes yet</p>
                <button 
                  className="create-first-btn" 
                  onClick={handleCreateNew}
                  disabled={isAnimating}
                >
                  Create your first note
                </button>
              </div>
            ) : (
              <>
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className={`note-item ${animationPhase === 'door-open' && clickedNoteId === note.id ? 'door-opening' : ''}`}
                    onClick={() => handleSelectNote(note)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open note: ${note.title}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectNote(note);
                      }
                    }}
                  >
                    <h3>{note.title}</h3>
                    <p className="note-preview">
                      {note.content.substring(0, NOTE_PREVIEW_LENGTH)}
                      {note.content.length > NOTE_PREVIEW_LENGTH ? '...' : ''}
                    </p>
                    <span className="note-date">{formatDate(note.updatedAt)}</span>
                  </div>
                ))}
                
                {hasMoreNotes && (
                  <div className="load-more-container">
                    <button
                      className="load-more-btn"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore || isAnimating}
                    >
                      {isLoadingMore ? 'Loading...' : 'Load more'}
                    </button>
                  </div>
                )}
                
                <footer className="notes-footer">
                  <p>© {new Date().getFullYear()} Shifra Williams</p>
                </footer>
              </>
            )}
          </div>
        ) : (
          /* Note Editor - Inside the Room */
          <div className={`note-editor ${animationPhase === 'door-open' ? 'animating-in' : ''}`}>
            <div className="editor-title-row">
              <button 
                className="editor-back-btn" 
                onClick={handleCancel}
                disabled={isAnimating}
                aria-label="Back to notes list"
              >
                ←
              </button>
              <input
                ref={titleInputRef}
                type="text"
                className="title-input"
                placeholder="Your exciting note title here"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-label="Note title"
              />
            </div>
            <Editor 
            initialContent={content || "<p>Your fascinating note here</p>"}
            onSave={(htmlContent) => setContent(htmlContent)}
          />
            <div className="editor-actions">
              <button 
                className="save-btn" 
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                aria-label={isCreating ? 'Create note' : 'Save note'}
              >
                {saveStatus === 'saving' ? 'Saving...' : (isCreating ? 'Create' : 'Save')}
              </button>
              {selectedNote && (
                <button 
                  className="delete-btn" 
                  onClick={handleDelete}
                  aria-label="Delete note"
                >
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
