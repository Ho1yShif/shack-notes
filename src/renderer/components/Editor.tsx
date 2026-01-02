import React, { useState, useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder';

interface EditorProps {
  initialContent: string;
  onSave: (content: string) => void;
}

const Editor = ({ initialContent, onSave }: EditorProps) => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Placeholder.configure({
            placeholder: "Your fascinating note here"
        })
      ],
      content: initialContent,
      onUpdate: ({editor}) => {
        const html = editor.getHTML();
        onSave(html);
      }
    })

    return (
        <div className="editor-wrapper">
          <EditorContent editor={editor} />
        </div>
      )
    }
    
export default Editor