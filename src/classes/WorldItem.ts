import Page, { PageObject } from './BasePage'
import { nin } from '../utils/object'

export interface WorldItemObject extends PageObject {
  children: WorldItemObject[]
  isCollapsed: boolean
}

export default class WorldItem extends Page {
  children: WorldItem[]
  isCollapsed = true

  constructor(worldItem: WorldItemObject = {} as WorldItemObject) {
    super(worldItem)
    const { children = [], isCollapsed = true } = worldItem

    this.children = children.map((child) => new WorldItem(child))
    this.isCollapsed = isCollapsed
  }

  toObject() {
    const obj = nin(this, 'children isEdit isSelected') as WorldItemObject
    const children = this.children.map((child) => child.toObject())
    if (children.length) obj.children = children
    return obj
  }
}
