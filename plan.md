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

- Make app take up entire screen when open
- Nicer empty state when no notes exist
- Loading states during database operations
- Error handling with user-friendly messages
- Keyboard shortcuts (Ctrl/Cmd+N for new note)
- Make save/update look smoother

### Bonus
- Implement search with Cmd+K in UI
- Deploy app so Zack can use it and we can store personal notes on here
