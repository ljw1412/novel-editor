declare namespace Editor {
  interface Project {
    title: string
    author: string
    desc: string
    path: string
    createTime: string | number | Date
  }

  interface RecentRecord {
    title: string
    path: string
  }
}
