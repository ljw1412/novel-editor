import { toRaw } from 'vue'
import { nin } from '../utils/object'
import Page, { PageObject } from './BasePage'

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

export interface CharacterObject extends PageObject, CharacterExtraData {
  sex: string
  birthday: string
  timepoint: string
  timeline: CharacterTimeline[]
}

export default class Character extends Page {
  type = 'character'
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
      type = '',
      image = '',
      avatar = '',
      sex = '',
      birthday = '',
      age = '',
      timepoint = '',
      info = [],
      relations = [],
      timeline = []
    }: CharacterObject = {} as CharacterObject
  ) {
    super({ id, title, content, type })
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
    const obj = nin(this, 'children isEdit isSelected') as CharacterObject
    obj.info = toRaw(obj.info)
    obj.relations = toRaw(obj.relations)
    obj.timeline = toRaw(obj.timeline)
    return obj
  }
}
