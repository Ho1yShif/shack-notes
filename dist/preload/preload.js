"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("notesAPI", {
  getAllNotes: () => electron.ipcRenderer.invoke("notes:getAll"),
  getNote: (id) => electron.ipcRenderer.invoke("notes:getOne", id),
  createNote: (note) => electron.ipcRenderer.invoke("notes:create", note),
  updateNote: (note) => electron.ipcRenderer.invoke("notes:update", note),
  deleteNote: (id) => electron.ipcRenderer.invoke("notes:delete", id)
});
