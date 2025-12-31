import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("notesAPI", {
  getAllNotes: () => ipcRenderer.invoke('notes:getAll'),
  getNote: (id: number) => ipcRenderer.invoke('notes:getOne', id),
  createNote: (note: { title: string; content: string }) => ipcRenderer.invoke('notes:create', note),
  updateNote: (note: any) => ipcRenderer.invoke('notes:update', note),
  deleteNote: (id: number) => ipcRenderer.invoke('notes:delete', id),
});
