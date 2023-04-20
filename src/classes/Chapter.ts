import { nin } from '../utils/object'
import Page, { PageObject } from './BasePage'

export interface ChapterObject extends PageObject {}

export default class Chapter extends Page {
  type = 'chapter'

  constructor(chapter: ChapterObject = {} as ChapterObject) {
    super(chapter)
  }

  toObject(): ChapterObject {
    const obj = nin(this, 'children') as ChapterObject
    return obj
  }
}
