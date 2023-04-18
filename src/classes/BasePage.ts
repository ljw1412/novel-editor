import { nin } from '../utils/object'
import { ulid } from 'ulid'

export interface PageObject {
  id?: string
  title: string
  content: string
  type: string
}

export default class Page {
  id = ''
  title = ''
  content = ''
  type = ''

  isEdit = false
  isSelected = false

  constructor(
    {
      id = ulid(),
      title = '',
      content = '',
      type = ''
    }: PageObject = {} as PageObject
  ) {
    this.id = id
    this.title = title
    this.content = content
    this.type = type
  }

  toObject() {
    const obj = nin(this, 'isEdit isSelected') as PageObject
    return obj
  }
}
