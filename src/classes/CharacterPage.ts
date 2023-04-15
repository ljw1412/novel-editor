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
  // 绑定的时间点id
  targetId: string
  data: CharacterExtraData
}

export interface CharacterPageObject extends PageObject, CharacterExtraData {
  sex: string
  birthday: string
  timepoint: string
  timeline: CharacterTimeline[]
}

export default class CharacterPage extends Page {
  image = ''
  avatar = ''
  sex = ''
  birthday = ''
  age = ''
  timepoint = ''
  info: CharacterExtraInfo[] = []
  relations: CharacterRelation[] = []
  timeline: CharacterTimeline[] = []

  constructor(
    {
      id,
      title = '',
      content = '',
      action = '',
      image = '',
      avatar = '',
      sex = '',
      birthday = '',
      age = '',
      timepoint = '',
      info = [],
      relations = [],
      timeline = []
    }: CharacterPageObject = {} as CharacterPageObject
  ) {
    super({ id, title, content, action })
    this.image = image
    this.avatar = avatar
    this.sex = sex
    this.birthday = birthday
    this.age = age
    this.timepoint = timepoint
    this.info = info
    this.relations = relations
    this.timeline = timeline
  }

  toObject() {
    const obj = nin(this, 'children isEdit isSelected') as CharacterPageObject
    obj.info = toRaw(obj.info)
    obj.relations = toRaw(obj.relations)
    obj.timeline = toRaw(obj.timeline)
    return obj
  }
}
