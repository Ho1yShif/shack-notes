### Mobile

Download React
Make app properly mobile-first
Review all CSS manually
Smooth out door animations

### Rich Text Editor Integration

**Install dependencies:**

- `@tiptap/react` - Rich text editor framework
- `@tiptap/starter-kit` - Basic editing extensions (bold, italic, lists, etc.)
- `@tiptap/extension-placeholder` - Placeholder text

**Create editor component** in [`src/renderer/components/Editor.tsx`](src/renderer/components/Editor.tsx):

- Setup Tiptap editor with StarterKit
- Configure toolbar with formatting buttons (bold, italic, headings, lists)
- Handle content changes with debounced auto-save
- Store content as HTML string

## Polish

- Get nicer icons for arrow, save (same for create), delete, and make buttons nicer
    - Pulse on `building your shack` loading state
- Multi-select delete with a tag/circle in the top right of each note door
- Implement search with Cmd+K in UI
- Cache first 8 notes so that when you go back to the landing page, it takes no time
- Make the door opening effect 0.2 seconds
- Make app take up entire screen when open
- Loading states during database operations
- Error handling with user-friendly messages
- Keyboard shortcuts (Ctrl/Cmd+N for new note)
- Make save/update look smoother
- Deploy app a pk file so Zack can use it and we can store personal notes on here
- Nicer empty state when no notes exist