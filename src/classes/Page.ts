export interface PageObject {
  title: string
  content: string
  children: PageObject[]
}

export default class Page {
  title = ''
  content = ''
  children: Page[]

  isEdit = false
  isSelected = false

  constructor(title: string = '', content: string = '', children: Page[] = []) {
    this.title = title
    this.content = content
    this.children = children
  }

  static create(page: PageObject): Page {
    const { title = '', content = '', children = [] } = page
    return new this(
      title,
      content,
      children.map((child) => this.create(child))
    )
  }

  toObject(): PageObject {
    return {
      title: this.title,
      content: this.content,
      children: this.children.map((child) => child.toObject())
    }
  }
}
