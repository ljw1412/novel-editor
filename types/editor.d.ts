declare namespace Editor {
  interface Project {
    id: string
    title: string
    author: string
    desc: string
    path: string
    createTime: string | number | Date
  }

  interface RecentRecord {
    id: string
    title: string
    path: string
  }
}
