import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

function subscribe(channel: string, cb: (data: any) => void) {
  const listener = (_e: IpcRendererEvent, data: any) => cb(data);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}

contextBridge.exposeInMainWorld('deepseek', {
  auth: {
    login: () => ipcRenderer.invoke('auth:login'),
    logout: () => ipcRenderer.invoke('auth:logout'),
    status: () => ipcRenderer.invoke('auth:status')
  },

  providers: {
    list: () => ipcRenderer.invoke('providers:list'),
    select: (id: string) => ipcRenderer.invoke('providers:select', id),
    getConfig: () => ipcRenderer.invoke('providers:getConfig'),
    configure: (req: unknown) => ipcRenderer.invoke('providers:configure', req)
  },

  harness: {
    start: (req: unknown) => ipcRenderer.invoke('harness:start', req),
    stop: () => ipcRenderer.invoke('harness:stop'),
    onStream: (cb: (event: unknown) => void) => subscribe('harness:event', cb)
  },

  browser: {
    open: (url: string) => ipcRenderer.invoke('browser:open', url),
    newTab: (url: string) => ipcRenderer.invoke('browser:new', url),
    listTabs: () => ipcRenderer.invoke('browser:list'),
    getActiveTab: () => ipcRenderer.invoke('browser:active-tab'),
    activateTab: (id: string) => ipcRenderer.invoke('browser:activate', id),
    closeTab: (id: string) => ipcRenderer.invoke('browser:close', id),
    setBounds: (bounds: unknown) => ipcRenderer.send('browser:set-bounds', bounds),
    getPageContext: (id: string) => ipcRenderer.invoke('browser:page-context', id),
    onTabUpdated: (cb: (tab: unknown) => void) =>
      subscribe('browser:tab-updated', cb),
    onTabClosed: (cb: (p: unknown) => void) =>
      subscribe('browser:tab-closed', cb),
    onContextAction: (cb: (p: unknown) => void) =>
      subscribe('browser:context-action', cb)
  },

  approvals: {
    respond: (id: string, response: unknown) =>
      ipcRenderer.invoke('approval:respond', { id, ...(response as object) })
  },

  permissions: {
    request: (permission: string) =>
      ipcRenderer.invoke('permissions:request', permission),
    listSites: () => ipcRenderer.invoke('permissions:listSites'),
    getSite: (origin: string) => ipcRenderer.invoke('permissions:getSite', origin),
    setSite: (origin: string, permissions: unknown) =>
      ipcRenderer.invoke('permissions:setSite', { origin, permissions }),
    resetSite: (origin: string) =>
      ipcRenderer.invoke('permissions:resetSite', origin)
  }
});
