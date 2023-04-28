import { EventEmitter, Listener } from './events'

interface NovelEditorOptions {
  el?: HTMLElement
  style?: string
}

type BlockTypes = 'text'

const helper = {
  createHTMLElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    options: {
      class?: string
      style?: string
      attrs?: Record<string, string>
      [K: string]: any
    } = {}
  ) {
    const el = document.createElement(tag)
    const { class: className = '', attrs = {}, style = '' } = options
    if (className) el.className = className
    if (style) el.style.cssText = style
    for (const name in attrs) {
      el.setAttribute(name, attrs[name])
    }

    Object.keys(options)
      .filter((key) => !['class', 'attrs', 'style'].includes(key))
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
    this.dropdown = new Dropdown()
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
      const block = this._createBlock('text')
      block.setContent({ content: str })
      return block.block
    })
    this.root.replaceChildren(...blockNodeList)
  }

  getContent() {
    return this.blocks.map((block) => block.content.innerHTML).join('\r\n')
  }

  on(type: 'change', listener: Listener) {
    return this.$emitter.on(type, listener)
  }

  off(type: 'change', listener: Listener) {
    return this.$emitter.off(type, listener)
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

  /**
   * 创建内容块
   * @param type
   * @returns
   */
  _createBlock(type: BlockTypes) {
    return new Block(type)
  }

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
      console.log('nextBlockList', nextBlockList)

      const leafParent = helper.findParents(
        anchorNode as HTMLElement,
        '.novel-editor-block'
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

      console.log('lastBlock', lastBlock, 'offset', selectionOffset)

      if (lastBlock) {
        // 清除光标，并设置新光标到新的文字块开头位置
        selection.removeAllRanges()
        const range = document.createRange()
        const selectTarget = lastBlock!.content.firstChild || lastBlock!.content
        range.setStart(selectTarget, selectionOffset)
        range.setEnd(selectTarget, selectionOffset)
        selection.addRange(range)
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
      this._insertContent()
    }

    if (key === 'Backspace') {
      const selection = getSelection()
      if (
        selection &&
        selection.anchorOffset === 0 &&
        selection.focusOffset === 0 &&
        this.blocks.length === 1
      ) {
        e.preventDefault()
      }
    }

    if (key === '/') {
      console.log(e, '/')
      setTimeout(() => {
        const selection = getSelection()
        if (selection) {
          const rect = selection.getRangeAt(0).getBoundingClientRect()
          const rootRect = this.root.getBoundingClientRect()
          this.dropdown.show(
            rect.left - rootRect.left,
            rect.bottom - rootRect.top,
            rect.top - rootRect.top
          )
        }
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
    this.block = document.createElement('div')
    this.block._editorBlock = this
    this.block.className = `novel-editor-block novel-editor-${type}-block`
    this.block.style.cssText = 'margin-top: 2px; margin-bottom: 1px;'
    this.wrap = document.createElement('div')
    this.wrap.style.cssText = 'color: inherit; fill: inherit;'
    this.content = document.createElement('div')
    this.content.contentEditable = 'true'
    this.content.style.cssText =
      'max-width: 100%; width: 100%; white-space: pre-wrap; word-break: break-word; padding:4px 2px; min-height: 1.5em;'
    this.content.setAttribute('data-novel-editor-leaf', 'true')
    this.content.spellcheck = false
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
  el: HTMLElement
  isDisplay = false

  constructor() {
    this.el = helper.createHTMLElement('div', {
      contentEditable: 'false',
      class: 'novel-editor-dropdown',
      style: 'display: none;',
      attrs: { 'data-novel-editor-dropdown': 'true' }
    })
    const items = [{ label: '插入关键词 (/k)', key: 'keyword' }]
    items.forEach((item) => {
      const dropdownItem = document.createElement('div')
      dropdownItem.className = 'novel-editor-dropdown__item'
      dropdownItem.setAttribute('data-action', item.key)
      dropdownItem.innerText = item.label
      this.el.appendChild(dropdownItem)
    })
    window.addEventListener('keydown', this._keyListener.bind(this))
  }

  /**
   * 显示下拉菜单
   * @param left
   * @param top
   */
  show(x: number, y: number, y2?: number) {
    this.isDisplay = true
    this.el.style.top = y + 2 + 'px'
    this.el.style.left = x + 'px'
    this.el.style.transform = 'none'
    this.el.style.display = 'block'
    setTimeout(() => {
      const { innerHeight, innerWidth } = window
      const { right, bottom, height } = this.el.getBoundingClientRect()
      let translateX = 0
      let translateY = 0
      if (right > innerWidth) {
        translateX = innerWidth - right - 20
      }
      if (bottom > innerHeight) {
        translateY = -height
        if (y2) this.el.style.top = y2 - 2 + 'px'
      }
      this.el.style.transform = `translate(${translateX}px,${translateY}px)`
    }, 0)
  }

  /**
   * 隐藏下拉菜单
   */
  hide() {
    this.isDisplay = false
    this.el.style.display = 'none'
  }

  _keyListener(e: KeyboardEvent) {
    if (!this.isDisplay) return
    const { key } = e
    console.log(e)
    if (key === 'Escape') {
      this.hide()
    }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      e.preventDefault()
    }
  }
}
