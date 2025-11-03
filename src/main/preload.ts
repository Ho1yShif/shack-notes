const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("myAPI", {
  desktop: true,
});
