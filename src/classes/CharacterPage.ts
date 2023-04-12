import { toRaw } from 'vue'
import { nin } from '../utils/object'
import Page, { PageObject } from './Page'

export interface CharacterRelation {
  target: string
  relation: string
}

export interface CharacterExtraInfo {
  key: string
  value: string
}

export interface CharacterExtraData {
  content: string
  image?: string
  avatar?: string
  age?: string
  info?: CharacterExtraInfo[]
  relations?: CharacterRelation[]
}

export interface CharacterTimeline {
  name: string
  data: CharacterExtraData
}

export interface CharacterPageObject extends PageObject, CharacterExtraData {
  sex: string
  birthday: string
  timeline: CharacterTimeline[]
}

export default class CharacterPage extends Page {
  image = ''
  avatar = ''
  sex = ''
  birthday = ''
  age = ''
  info: CharacterExtraInfo[] = []
  relations: CharacterRelation[] = []
  timeline: CharacterTimeline[] = []

  constructor(
    {
      title = '',
      content = '',
      action = '',
      image = '',
      avatar = '',
      sex = '',
      age = '',
      birthday = '',
      info = [],
      relations = [],
      timeline = []
    }: CharacterPageObject = {} as CharacterPageObject
  ) {
    super(title, content, action)
    this.image = image
    this.avatar = avatar
    this.sex = sex
    this.age = age
    this.birthday = birthday
    this.info = info
    this.relations = relations
    this.timeline = timeline
  }

  static create(page: CharacterPageObject): CharacterPage {
    return new this(page)
  }

  toObject() {
    const obj = nin(this, 'children isEdit isSelected') as CharacterPageObject
    obj.info = toRaw(obj.info)
    obj.relations = toRaw(obj.relations)
    obj.timeline = toRaw(obj.timeline)
    return obj
  }
}
