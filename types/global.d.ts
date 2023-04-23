interface WindowConfig {
  url: string
  // 静默启动
  silent?: boolean
  // 是否单例
  singleInstance?: boolean
  // 唯一可读标识，方便从窗体群中找到指定窗体
  name?: string
  // 使用系统默认浏览器
  useSystemBrowser?: boolean
}

interface ApiError extends Error {
  title: string
  data: Record<string, any>
}
