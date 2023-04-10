import { toRaw } from 'vue'
import { nin } from '../utils/object'
import Page, { PageObject } from './Page'

export interface CharacterPageObject extends PageObject {
  sex: string
  birthday: string
  info: Record<string, string>
  relations: { target: string; relation: string }[]
}

export default class CharacterPage extends Page {
  sex = ''
  birthday = ''
  age = ''
  info: Record<string, string> = {}
  relations: { target: string; relation: string }[] = []

  constructor(
    {
      title = '',
      content = '',
      action = '',
      sex = '',
      birthday = '',
      info = {},
      relations = []
    }: CharacterPageObject = {} as CharacterPageObject
  ) {
    super(title, content, action)
    this.sex = sex
    this.birthday = birthday
    this.info = info
    this.relations = relations
  }

  static create(page: CharacterPageObject): CharacterPage {
    return new this(page)
  }

  toObject() {
    const obj = nin(this, 'children') as CharacterPageObject
    obj.info = toRaw(obj.info)
    return obj
  }
}
