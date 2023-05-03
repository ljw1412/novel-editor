import { EventEmitter, Listener } from './events'

interface NovelEditorOptions {
  el?: HTMLElement
  style?: string
}

type BlockTypes = 'text'
type EventNames = 'change' | 'keyword-input' | 'keyword-click'

const helper = {
  createHTMLElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    options: {
      class?: string
      style?: string
      attrs?: Record<string, string>
      children?: (string | Node)[]
      [K: string]: any
    } = {}
  ) {
    const el = document.createElement(tag)
    const {
      class: className = '',
      attrs = {},
      style = '',
      children = []
    } = options
    if (className) el.className = className
    if (style) el.style.cssText = style
    for (const name in attrs) {
      el.setAttribute(name, attrs[name])
    }
    if (children.length) {
      el.replaceChildren(...children)
    }
    Object.keys(options)
      .filter((key) => !['class', 'attrs', 'style', 'children'].includes(key))
      .forEach((key) => {
        // @ts-ignore
        el[key] = options[key]
      })
    return el
  },
  insertAfter(newElement: Element, targetElement: Element) {
    var parent = targetElement.parentNode
    if (parent!.lastChild == targetElement) {
      parent!.appendChild(newElement)
    } else {
      parent!.insertBefore(newElement, targetElement.nextSibling)
    }
  },
  findParents(el: HTMLElement, selectors: string): HTMLElement | null {
    const parent = el.parentElement
    if (!parent) return null
    if (parent.matches(selectors)) return parent
    return this.findParents(parent, selectors)
  },
  getNextNodes(node: Node, list: Node[] = []): Node[] {
    if (node.nextSibling) {
      list.push(node.nextSibling)
      return this.getNextNodes(node.nextSibling, list)
    }
    return list
  }
}

const logger = function (info: string, ...message: any[]) {
  const title = `%cNovelEditor%c${info}`
  const baseStyles = 'font-size:12px;padding:1px 10px;font-weight:700;'
  const leftStyles = baseStyles + 'color:#fff;background:#86909c;'
  const rightStyles = baseStyles + 'color:#fff;background:#666;'
  const base = [title, leftStyles, rightStyles, ...message]
  console.log(...base)
}

export default class NovelEditor {
  editor: NovelEditor
  el!: HTMLElement
  root!: HTMLElement
  dropdown!: Dropdown
  isDisplayDropdown = false
  blocks: Block[] = []
  blockObserver: MutationObserver | null = null
  contentObserver: MutationObserver | null = null
  $emitter = new EventEmitter()

  constructor(options: NovelEditorOptions = {}) {
    const { el } = options
    this._createRoot(options.style)
    this.dropdown = new Dropdown(this)
    if (el) this.mount(el)
    this.editor = this
  }

  mount(el: HTMLElement) {
    this.el = el
    el.classList.add('novel-editor')

    // 将编辑器根节点置入
    this.el.replaceChildren(this.root, this.dropdown.el)
    // 默认内容处理
    const defaultContent = (el as HTMLElement).dataset.content || ''
    this.setContent(defaultContent)
    el.removeAttribute('data-content')
  }

  setContent(text: string) {
    this._clear()
    const textList = text.split('\r\n')
    const blockNodeList = textList.map((str) => {
      // 处理关键词数据
      str = str.replace(/\{keyword:(.+?)\|(.+?)\}/g, (str, $1, $2) => {
        return this._createKeyword($1, $2, false).outerHTML
      })
      const block = this._createBlock('text')
      block.setContent({ content: str })
      return block.block
    })
    this.root.replaceChildren(...blockNodeList)
    this.root.querySelectorAll('.novel-editor-keyword').forEach((el) => {
      el.addEventListener('click', () => {
        this.$emitter.emit('keyword-click', {
          key: (el as HTMLElement).dataset.key || '',
          title: (el as HTMLElement).dataset.title || ''
        })
      })
    })
  }

  getContent() {
    return this.blocks
      .map((block) => {
        return Array.from(block.content.childNodes)
          .map((node) => {
            if (node.nodeType === 3) {
              return (node as Text).data
            } else if (node.nodeType === 1) {
              if (
                (node as HTMLElement).classList.contains('novel-editor-keyword')
              ) {
                return (node as HTMLElement).dataset.content || ''
              } else {
                return (node as HTMLElement).textContent
              }
            }
            return ''
          })
          .join('')
      })
      .join('\r\n')
  }

  on(type: EventNames, listener: Listener) {
    return this.$emitter.on(type, listener)
  }

  off(type: EventNames, listener: Listener) {
    return this.$emitter.off(type, listener)
  }

  insertKeyword(item: { key: string; title: string }) {
    const el = this._createKeyword(item.key, item.title)
    const selection = getSelection()
    if (selection) {
      selection.getRangeAt(0).insertNode(el)
      setTimeout(() => {
        selection.collapseToEnd()
      }, 0)
    }
  }

  /**
   * 创建并初始化编辑器Root节点
   */
  _createRoot(style?: string) {
    const root = helper.createHTMLElement('div', {
      style,
      class: 'novel-editor-core',
      attrs: { 'data-novel-editor-root': 'true' },
      contentEditable: 'true'
    })
    root.addEventListener('keydown', this._keyListener.bind(this))
    root.addEventListener('paste', this._pasteListener.bind(this))
    this._observeBlocks(root)
    this._observeContent(root)
    this.root = root
  }

  _createKeyword(key: string, title: string, needListen = true) {
    const keyword = helper.createHTMLElement('div', {
      class: 'novel-editor-keyword',
      attrs: {
        'data-key': key,
        'data-title': title,
        'data-content': `{keyword:${key}|${title}}`
      },
      contentEditable: false,
      children: [title]
    })
    if (needListen) {
      keyword.addEventListener('click', () => {
        this.$emitter.emit('keyword-click', { key, title })
      })
    }
    return keyword
  }

  /**
   * 创建内容块
   * @param type
   * @returns
   */
  _createBlock(type: BlockTypes) {
    return new Block(type)
  }

  /**
   * 插入内容或换行
   * @param content
   * @returns
   */
  _insertContent(content?: string) {
    let insertContentList: string[] = []
    if (content) insertContentList = content.split('\r\n')
    if (insertContentList.length === 1) {
      document.execCommand('insertHTML', false, insertContentList[0])
      return
    }

    let selectionOffset = 0
    let lastBlock: Block | null = null

    // 获取光标开始结束位置
    const selection = getSelection()!
    const { anchorNode, anchorOffset, focusOffset } = selection
    const start = Math.min(anchorOffset, focusOffset)
    const end = Math.max(anchorOffset, focusOffset)
    // 如果由选中文字，则删除
    if (start !== end) {
      document.execCommand('delete')
    }
    const newNodeChild: Node[] = []
    if (anchorNode) {
      // 将原本的文字块拆成两块
      const { nodeType } = anchorNode
      if (nodeType === 1) {
        if (insertContentList.length > 0) {
          const firstValue = insertContentList.shift()
          if (
            firstValue &&
            (anchorNode as HTMLElement).hasAttribute('data-novel-editor-leaf')
          ) {
            anchorNode.appendChild(document.createTextNode(firstValue))
            selectionOffset = firstValue.length
          }
        }
      }
      if (nodeType === 3) {
        const nodeValue = anchorNode.nodeValue || ''
        let leftValue = nodeValue.substring(0, start) || ''
        let rightValue = nodeValue.substring(end) || ''

        if (rightValue) {
          // 如果有插入内容，将最后一段且非第一段内容与光标右边字符串合并
          if (insertContentList.length > 1) {
            const firstInsertText = insertContentList.pop() || ''
            rightValue = firstInsertText + rightValue
            selectionOffset = firstInsertText.length
          }
          newNodeChild.push(document.createTextNode(rightValue))
        }
        // 如果有插入内容，将第一段内容与光标左边字符串合并
        if (insertContentList.length > 0) {
          leftValue = leftValue + (insertContentList.shift() || '')
        }
        anchorNode.nodeValue = leftValue
      }
      // 遍历文字节点之后的所有其它节点
      const nextNodes = helper.getNextNodes(anchorNode)
      if (nextNodes.length) {
        newNodeChild.push(...nextNodes)
      }

      // 准备光标之后要插入的所有块
      const nextBlockList = insertContentList.map((item) => {
        const block = this.editor._createBlock('text')
        block.setContent({ content: item })
        lastBlock = block
        selectionOffset = item.length
        return block
      })

      // 创建文字块包裹原本右侧的所有内容。如果本来就未输入内容作为换行处理。
      if (newNodeChild.length || !content) {
        lastBlock = this.editor._createBlock('text')
        lastBlock.content.replaceChildren(...newNodeChild)
        nextBlockList.push(lastBlock)
      }
      // console.log('nextBlockList', nextBlockList)

      const leafParent = helper.findParents(
        anchorNode as HTMLElement,
        '[data-novel-editor-block]'
      )

      if (leafParent) {
        let before = leafParent
        for (const { block } of nextBlockList) {
          helper.insertAfter(block, before)
          before = block
        }
        if (!lastBlock) lastBlock = leafParent._editorBlock
      } else {
        nextBlockList.forEach(({ block }) => {
          this.root.appendChild(block)
        })
      }

      // console.log('lastBlock', lastBlock, 'offset', selectionOffset)

      if (lastBlock) {
        // 清除光标，并设置新光标到新的文字块开头位置
        selection.removeAllRanges()
        const range = document.createRange()
        const selectTarget = lastBlock.content.firstChild || lastBlock.content
        range.setStart(selectTarget, selectionOffset)
        range.setEnd(selectTarget, selectionOffset)
        selection.addRange(range)
        try {
          lastBlock.content.scrollIntoView()
        } catch (error) {
          console.error(error)
        }
      }
    }
  }

  _clear() {
    while (this.blocks.length) {
      const block = this.blocks.pop()
      if (block) this.root.removeChild(block.block)
    }
  }

  _keyListener(e: KeyboardEvent) {
    const { key, shiftKey } = e
    if (key === 'Enter' && !shiftKey) {
      e.preventDefault()
      if (!this.dropdown.isDisplay) {
        this._insertContent()
      }
    }

    if (key === 'Backspace') {
      const selection = getSelection()
      if (
        selection &&
        selection.anchorOffset === 0 &&
        selection.focusOffset === 0 &&
        this.blocks.length === 1
      ) {
        // 如果是第一个块则无法删除
        e.preventDefault()
      }
    }

    if (key === '/') {
      setTimeout(() => {
        this.dropdown.show()
      }, 0)
    }
  }

  _pasteListener(e: ClipboardEvent) {
    e.preventDefault()
    if (e.clipboardData) {
      const text = e.clipboardData?.getData('text')
      if (text) {
        this._insertContent(text)
      }
    }
  }

  _observeBlocks(root: HTMLElement) {
    this.blockObserver = new MutationObserver((list, observer) => {
      list.forEach((item) => {
        const { addedNodes, removedNodes } = item
        addedNodes.forEach((el) => {
          if (el.nodeName === 'BR') {
            el.parentElement?.removeChild(el)
          }
          if (el.nodeName === 'SPAN') {
            if (el.firstChild) {
              el.parentElement?.replaceChild(el.firstChild, el)
            }
          }
        })

        this.blocks = Array.from(this.root.children)
          .map((child) => (child as HTMLElement)._editorBlock)
          .filter((i) => i)

        const filterNames = ['BR', 'SPAN']
        const f_addedNodes = Array.from(addedNodes).filter(
          (item) => !filterNames.includes(item.nodeName)
        )
        const f_removedNodes = Array.from(removedNodes).filter(
          (item) => !filterNames.includes(item.nodeName)
        )

        if (f_addedNodes.length || f_removedNodes.length) {
          logger(
            '编辑器块变化',
            '\n添加节点',
            f_addedNodes,
            '\n移除节点',
            f_removedNodes,
            '\n当前块列表',
            this.blocks
          )
        }
      })
    })

    this.blockObserver.observe(root, { childList: true, subtree: true })
  }

  _observeContent(root: HTMLElement) {
    this.contentObserver = new MutationObserver((list, observer) => {
      const content = this.getContent()
      const ev = new CustomEvent('change', { detail: { content } })
      this.el.dispatchEvent(ev)
      this.$emitter.emit('change', content)
    })
    this.contentObserver.observe(root, {
      childList: true,
      subtree: true,
      characterData: true
    })
  }
}

export class Block {
  type: BlockTypes
  block: HTMLElement
  wrap: HTMLElement
  content: HTMLElement

  constructor(type: BlockTypes = 'text') {
    this.type = type
    this.block = helper.createHTMLElement('div', {
      _editorBlock: this,
      class: `novel-editor-${type}-block`,
      style: 'margin-top: 2px; margin-bottom: 1px;',
      attrs: { 'data-novel-editor-block': type }
    })
    this.wrap = helper.createHTMLElement('div', {
      style: 'color: inherit; fill: inherit;'
    })
    this.content = helper.createHTMLElement('div', {
      spellcheck: false,
      contentEditable: 'true',
      style:
        'max-width: 100%; width: 100%; white-space: pre-wrap; word-break: break-word; padding:4px 2px; min-height: 1.5em;',
      attrs: { 'data-novel-editor-leaf': 'true' }
    })

    this.wrap.appendChild(this.content)
    this.block.appendChild(this.wrap)

    if (type === 'text') {
      this.content.setAttribute(
        'placeholder',
        '在此处输入文字，输入“/”进行特殊输入…'
      )

      document.addEventListener('selectionchange', (e) => {
        const selection = getSelection()
        if (!selection || !selection.anchorNode) return
        if (this.block.contains(selection.anchorNode)) {
          this.content.setAttribute('data-focus', 'true')
        } else {
          this.content.removeAttribute('data-focus')
        }
      })
    }
  }

  setContent(data: { content: string }) {
    if (this.type === 'text') {
      this.content.innerHTML = data.content
    }
  }
}

class Dropdown {
  editor: NovelEditor
  el: HTMLElement
  menu: Record<'default' | 'keyword', HTMLElement | null> = {
    default: null,
    keyword: null
  }
  isDisplay = false
  inputTarget: Text | null = null
  inputStart = -1
  inputAfterLength = 0
  inputText = ''
  action: 'default' | 'keyword' = 'default'
  popupRect = { left: 0, right: 0, bottom: 0, top: 0 }
  selectionPos = { left: 0, bottom: 0, top: 0 }

  constructor(editor: NovelEditor) {
    this.editor = editor
    this.el = helper.createHTMLElement('div', {
      contentEditable: 'false',
      class: 'novel-editor-dropdown',
      style: 'display: none;',
      attrs: { 'data-novel-editor-dropdown': 'true' }
    })
    this.menu.default = helper.createHTMLElement('div', {
      class: 'dropdown-menu default-menu',
      children: [{ label: '插入关键词 (“/k关键词”)', key: 'keyword' }].map(
        (item) => {
          return helper.createHTMLElement('div', {
            class: 'dropdown-menu-item',
            attrs: { 'data-action': item.key },
            children: [item.label]
          })
        }
      )
    })
    this.menu.keyword = helper.createHTMLElement('div', {
      class: 'dropdown-menu keyword-menu',
      style: 'display: none;',
      attrs: {
        placeholder: '插入关键词:'
      }
    })
    this.el.replaceChildren(this.menu.default, this.menu.keyword)
    window.addEventListener('keydown', this._keyListener.bind(this))
    window.addEventListener('click', this._clickListener.bind(this))
    window.addEventListener('input', this._inputListener.bind(this))
  }

  reset() {
    this.inputTarget = null
    this.inputStart = -1
    this.inputAfterLength = 0
    this.inputText = ''
    this.switchMenu('default')
  }

  /**
   * 显示下拉菜单
   * @param left
   * @param top
   */
  show() {
    const selection = getSelection()
    if (!selection) return
    const rect = selection.getRangeAt(0).getBoundingClientRect()
    const rootRect = this.editor.root.getBoundingClientRect()
    this.selectionPos.left = rect.left - rootRect.left
    this.selectionPos.bottom = rect.bottom - rootRect.top
    this.selectionPos.top = rect.top - rootRect.top

    this.isDisplay = true
    this.el.style.top = this.selectionPos.bottom + 2 + 'px'
    this.el.style.left = this.selectionPos.left + 'px'
    this.el.style.display = 'block'

    this.popupRect = this.el.getBoundingClientRect()
    this.updatePosition()
    const { anchorNode } = selection
    if (anchorNode && anchorNode.nodeType === 3) {
      this.inputTarget = anchorNode as Text
      this.inputStart = selection.anchorOffset - 1
      this.inputAfterLength = this.inputTarget.data.substring(
        selection.anchorOffset
      ).length
    }
  }

  /**
   * 隐藏下拉菜单
   */
  hide() {
    this.isDisplay = false
    this.el.style.display = 'none'
    this.el.style.transform = 'none'
    this.reset()
  }

  /**
   * 更新下拉框位置
   */
  updatePosition() {
    this.el.style.transform = 'none'

    const { innerHeight, innerWidth } = window
    const { height, width } = this.el.getBoundingClientRect()
    let translateX = '0'
    let translateY = '0'
    if (this.popupRect.left + width > innerWidth) {
      translateX = innerWidth - (this.popupRect.left + width) - 20 + 'px'
    }
    if (this.popupRect.top + height > innerHeight) {
      translateY = '-100%'
      this.el.style.top = this.selectionPos.top - 6 + 'px'
    }
    this.el.style.transform = `translate(${translateX},${translateY})`
  }

  switchMenu(name: 'default' | 'keyword') {
    this.action = name
    Object.keys(this.menu).forEach((key) => {
      const el = this.menu[key as typeof name]
      if (el) {
        el.style.display = key === name ? 'block' : 'none'
      }
    })

    this.updatePosition()
  }

  getInputText() {
    if (!this.inputTarget) return ''
    const { data } = this.inputTarget
    if (~this.inputStart) {
      return data.substring(
        this.inputStart,
        data.length - this.inputAfterLength
      )
    }
    return ''
  }

  removeInputText() {
    if (!this.inputTarget) return
    const { data } = this.inputTarget
    if (~this.inputStart) {
      this.inputTarget.data =
        data.substring(0, this.inputStart) +
        data.substring(data.length - this.inputAfterLength)
      const selection = window.getSelection()
      if (selection) {
        const range = selection.getRangeAt(0)
        range.setStart(this.inputTarget, this.inputStart)
        range.setEnd(this.inputTarget, this.inputStart)
      }
    }
  }

  setKeyWordItem(items: { key: string; title: string }[]) {
    const keywordItems = items.slice(0, 10).map((item) => {
      const el = helper.createHTMLElement('div', {
        class: 'dropdown-menu-item',
        attrs: {
          'data-key': item.key,
          'data-title': item.title
        },
        children: [item.title]
      })
      if (this.inputText) {
        el.innerHTML = el.innerHTML.replace(
          this.inputText,
          `<b style="-webkit-text-fill-color:var(--keyword-color);">${this.inputText}</b>`
        )
      }
      el.addEventListener('mouseenter', () => {
        this._selectItem('none')
        el.classList.add('hover')
      })
      el.addEventListener('mouseleave', () => {
        el.classList.remove('hover')
      })
      return el
    })

    this.menu.keyword!.replaceChildren(...keywordItems)
  }

  _selectItem(action: 'prev' | 'next' | 'none' | 'click') {
    if (this.action === 'default') return
    const menu = this.menu[this.action]
    if (menu) {
      const children = Array.from(menu.children)
      if (!children.length) return
      if (action === 'none') {
        children.forEach((child) => child.classList.remove('hover'))
        return
      }
      const el = children.find((item) => item.classList.contains('hover'))
      if (!el) {
        if (action === 'prev') {
          children[children.length - 1].classList.add('hover')
        } else if (action === 'next') {
          children[0].classList.add('hover')
        }
        return
      }

      if (action === 'click') {
        ;(el as HTMLElement).click()
        return
      }

      if (children.length > 1) {
        if (action === 'next') {
          el.classList.remove('hover')
          if (el.nextElementSibling) {
            el.nextElementSibling.classList.add('hover')
          } else {
            children[0].classList.add('hover')
          }
        }

        if (action === 'prev') {
          el.classList.remove('hover')
          if (el.previousElementSibling) {
            el.previousElementSibling.classList.add('hover')
          } else {
            children[children.length - 1].classList.add('hover')
          }
        }
      }
    }
  }

  _inputListener(e: Event) {
    if (!this.isDisplay) return
    const text = this.getInputText()
    if (!text) return this.hide()
    // console.log('inputText',text)
    if (text.startsWith('/k')) {
      this.switchMenu('keyword')
      this.inputText = text.replace(/^\/k/, '')
      this.editor.$emitter.emit('keyword-input', this, this.inputText)
      return
    }

    this.switchMenu('default')
  }

  _keyListener(e: KeyboardEvent) {
    if (!this.isDisplay) return
    const { key } = e
    // console.log(e)
    if (key === 'Escape') {
      this.hide()
    }
    if (key === 'Enter') {
      e.preventDefault()
      this._selectItem('click')
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      e.preventDefault()
      if (['ArrowLeft', 'ArrowRight'].includes(key)) {
        this._selectItem('none')
      } else {
        this._selectItem(key === 'ArrowUp' ? 'prev' : 'next')
      }
    }
  }

  _clickListener(e: MouseEvent) {
    if (!this.isDisplay) return
    if (!e.path.includes(this.el)) {
      this.hide()
      return
    }
    if (
      (e.target as HTMLElement).classList.contains('dropdown-menu-item') &&
      this.action !== 'default'
    ) {
      const item = {
        key: (e.target as HTMLElement).dataset.key || '',
        title: (e.target as HTMLElement).dataset.title || ''
      }
      this.removeInputText()
      this.editor.insertKeyword(item)
      this.hide()
    }
  }
}
