import Page from '/@/classes/BasePage'
import ChapterPage from '/@/classes/Chapter'
import VolumePage from '/@/classes/Volume'
import WorldPage from '/@/classes/WorldItem'
import CharacterPage from '/@/classes/Character'

declare namespace Editor {
  namespace Activity {
    type Types = 'bookshelf' | 'character' | 'world' | 'info'

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

    type Items = Bookshelf | World | Character | Info
  }

  namespace Sidebar {
    interface PaneItem {
      key: string
      title: string
      list: WorldItem[]
      placeholder?: string
      childPlaceholder?: string
      allowAdd: boolean
      allowAddChild: boolean
    }
  }

  namespace World {
    type PaneType = 'summary' | 'timeline' | 'keywords'
  }
}

export as namespace Editor
export = Editor
