export interface PageObject {
  title: string
  content: string
  action: string
  children: PageObject[]
}

export default class Page {
  title = ''
  content = ''
  action = ''
  children: Page[]

  isEdit = false
  isSelected = false

  constructor(title = '', content = '', action = '', children: Page[] = []) {
    this.title = title
    this.content = content
    this.action = action
    this.children = children
  }

  static create(page: PageObject): Page {
    const { title = '', content = '', action = '', children = [] } = page
    return new this(
      title,
      content,
      action,
      children.map((child) => this.create(child))
    )
  }

  toObject(): PageObject {
    return {
      title: this.title,
      content: this.content,
      action: this.action,
      children: this.children.map((child) => child.toObject())
    }
  }
}
