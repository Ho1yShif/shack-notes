"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("notesAPI", {
  getAllNotes: () => electron.ipcRenderer.invoke("notes:getAll"),
  getNotesPaginated: (limit, offset) => electron.ipcRenderer.invoke("notes:getPaginated", limit, offset),
  getNote: (id) => electron.ipcRenderer.invoke("notes:getOne", id),
  createNote: (note) => electron.ipcRenderer.invoke("notes:create", note),
  updateNote: (note) => electron.ipcRenderer.invoke("notes:update", note),
  deleteNote: (id) => electron.ipcRenderer.invoke("notes:delete", id)
});
