// src/preload.ts or preload.mjs
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    openItemWindow: (urlPath) => ipcRenderer.send('open-item-window', urlPath),
});

// npx esbuild preload.ts --bundle --platform=node --outfile=build/preload.js