import { only } from '../utils/object'
import { ulid } from 'ulid'

export interface PageObject {
  id?: string
  title: string
  content: string
  action: string
  children?: PageObject[]
  isCollapsed?: boolean
}

export default class Page {
  id = ''
  title = ''
  content = ''
  action = ''
  children: Page[]
  isCollapsed = true

  isEdit = false
  isSelected = false

  constructor(
    {
      id = ulid(),
      title = '',
      content = '',
      action = '',
      children = [] as PageObject[],
      isCollapsed = true
    }: PageObject = {} as PageObject
  ) {
    this.id = id
    this.title = title
    this.content = content
    this.action = action
    this.children = children.map((child) => new Page(child))
    this.isCollapsed = isCollapsed
  }

  toObject() {
    const obj = only(this, 'id title content action isCollapsed') as PageObject
    const children = this.children.map((child) => child.toObject())
    if (children.length) {
      obj.children = children
    }
    return obj
  }
}
