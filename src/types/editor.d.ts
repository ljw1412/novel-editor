import Page from '/@/classes/BasePage'
import ChapterPage from '/@/classes/Chapter'
import VolumePage from '/@/classes/Volume'
import WorldPage from '/@/classes/WorldItem'
import CharacterPage from '/@/classes/Character'

declare namespace Editor {
  namespace Activity {
    type Types = 'bookshelf' | 'character' | 'world' | 'info' | 'setting'

    interface Item<T extends Page, P = T> {
      key: Types
      label: string
      icon: string
      route: RouteLocationRaw
      data: null | { page: T; parentPage?: P }
      list: (P | T)[]
    }

    type Bookshelf = Item<ChapterPage, VolumePage>
    type World = Item<WorldPage> & {
      panes: Record<World.PaneType, Sidebar.PaneItem>
    }
    type Character = Item<CharacterPage>
    type Info = Item<Page>
    type Setting = Item
    type Items = Bookshelf | World | Character | Info
  }

  namespace Sidebar {
    interface PaneItem {
      key: string
      title: string
      list: WorldPage[]
      placeholder?: string
      childPlaceholder?: string
      allowAdd: boolean
      allowAddChild: boolean
    }
  }

  namespace World {
    type PaneType = 'summary' | 'timeline' | 'keywords'
  }

  namespace CtxMenu {
    interface Item {
      label: string
      value: string
      icon?: string
      iconColor?: string
      fn?: Function
    }

    interface Position {
      left?: number
      right?: number
      top?: number
      bottom?: number
    }
  }
}

export as namespace Editor
export = Editor
