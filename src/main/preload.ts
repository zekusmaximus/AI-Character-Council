import { contextBridge, ipcRenderer } from 'electron';

// Expose safe APIs for use in the renderer process
contextBridge.exposeInMainWorld('electron', {
  ping: () => ipcRenderer.invoke('ping'),
  // Add more IPC methods as needed
});