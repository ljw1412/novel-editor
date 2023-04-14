import { only } from '../utils/object'

export interface PageObject {
  title: string
  content: string
  action: string
  children?: PageObject[]
  isCollapsed?: boolean
}

export default class Page {
  title = ''
  content = ''
  action = ''
  children: Page[]
  isCollapsed = true

  isEdit = false
  isSelected = false

  constructor(
    title = '',
    content = '',
    action = '',
    children: Page[] = [],
    isCollapsed = true
  ) {
    this.title = title
    this.content = content
    this.action = action
    this.children = children
    this.isCollapsed = isCollapsed
  }

  static create(page: PageObject): Page {
    const {
      title = '',
      content = '',
      action = '',
      children = [],
      isCollapsed = true
    } = page
    return new this(
      title,
      content,
      action,
      children.map((child) => this.create(child)),
      isCollapsed
    )
  }

  toObject() {
    const obj = only(this, 'title content action isCollapsed') as PageObject
    const children = this.children.map((child) => child.toObject())
    if (children.length) {
      obj.children = children
    }
    return obj
  }
}
