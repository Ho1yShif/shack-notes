"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("notesAPI", {
  getAllNotes: () => ipcRenderer.invoke("notes:getAll"),
  getNote: (id) => ipcRenderer.invoke("notes:getOne", id),
  createNote: (note) => ipcRenderer.invoke("notes:create", note),
  updateNote: (note) => ipcRenderer.invoke("notes:update", note),
  deleteNote: (id) => ipcRenderer.invoke("notes:delete", id)
});
