import { nin } from '../utils/object'
import Chapter, { ChapterObject } from './Chapter'
import Page, { PageObject } from './BasePage'

export interface VolumeObject extends PageObject {
  cover: string
  children: ChapterObject[]
}

export default class Volume extends Page {
  cover = ''
  children: Chapter[]

  constructor(volume: VolumeObject = {} as VolumeObject) {
    const { children = [] } = volume
    super(nin(volume, 'children') as VolumeObject)
    this.children = children.map((child: ChapterObject) => new Chapter(child))
    this.cover = volume.cover || ''
  }

  toObject(): VolumeObject {
    const obj = nin(this, 'children') as VolumeObject
    const children = this.children.map((child) => child.toObject())
    obj.children = children
    return obj
  }
}