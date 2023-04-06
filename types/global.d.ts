interface WindowConfig {
  url: string
  // 静默启动
  silent?: boolean
  // 是否单例
  singleInstance?: boolean
  // 唯一可读标识，方便从窗体群中找到指定窗体
  name?: string
}

declare namespace Electron {
  interface BrowserWindow {
    name?: string
    isPreset?: boolean
  }
}
