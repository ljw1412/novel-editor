import { EventEmitter, Listener } from './events'

interface NovelEditorOptions {
  el?: HTMLElement
}

type BlockTypes = 'text'

const helper = {
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
  root!: HTMLElement
  blocks: Block[] = []
  blockObserver: MutationObserver | null = null
  contentObserver: MutationObserver | null = null
  $emitter = new EventEmitter()

  constructor(options: NovelEditorOptions = {}) {
    const { el } = options
    if (el) {
      this.mount(el)
    }
    this.editor = this
  }

  mount(root: HTMLElement) {
    this.root = root
    root.contentEditable = 'true'
    root.classList.add('novel-editor')
    root.setAttribute('data-novel-editor-root', 'true')

    root.addEventListener('keydown', this.keyListener.bind(this))
    root.addEventListener('paste', this.pasteListener.bind(this))
    this.observeBlocks(root)
    this.observeContent(root)

    const defaultContent = (root as HTMLElement).dataset.content || ''
    this.setContent(defaultContent)
    root.removeAttribute('data-content')
  }

  keyListener(e: KeyboardEvent) {
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
  }

  pasteListener(e: ClipboardEvent) {
    e.preventDefault()
    if (e.clipboardData) {
      const text = e.clipboardData?.getData('text')

      if (text) {
        this._insertContent(text)
        // document.execCommand('insertHTML', false, text)
      }
    }
  }

  observeBlocks(root: HTMLElement) {
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

        this.blocks = Array.from(this.root.children).map(
          (child) => (child as HTMLElement)._editorBlock
        )

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

  observeContent(root: HTMLElement) {
    this.contentObserver = new MutationObserver((list, observer) => {
      const content = this.getContent()
      const ev = new CustomEvent('change', { detail: { content } })
      this.root.dispatchEvent(ev)
      this.$emitter.emit('change', content)
    })
    this.contentObserver.observe(root, {
      childList: true,
      subtree: true,
      characterData: true
    })
  }

  createBlock(type: BlockTypes) {
    return new Block(this, type)
  }

  clear() {
    this.root.innerHTML = ''
    while (this.blocks.length) {
      const block = this.blocks.pop()
    }
  }

  _insertContent(content?: string) {
    let selectionOffset = 0
    let insertContentList: string[] = []
    if (content) insertContentList = content.split('\r\n')

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
      // 创建新的文字块包裹右侧的所有内容
      const lastBlock = this.editor.createBlock('text')
      lastBlock!.content.replaceChildren(...newNodeChild)

      // 准备光标之后要插入的所有块
      const nextBlockList = insertContentList.map((item) => {
        const block = this.editor.createBlock('text')
        block.setContent({ content: item })
        return block
      })
      nextBlockList.push(lastBlock)

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
      } else {
        nextBlockList.forEach(({ block }) => {
          this.root.appendChild(block)
        })
      }
      // 清除光标，并设置新光标到新的文字块开头位置
      selection.removeAllRanges()
      const range = document.createRange()
      const selectTarget = lastBlock!.content.firstChild || lastBlock!.content
      range.setStart(selectTarget, selectionOffset)
      range.setEnd(selectTarget, selectionOffset)
      selection.addRange(range)
    }
  }

  setContent(text: string) {
    this.clear()
    const textList = text.split('\r\n')
    const blockNodeList = textList.map((str) => {
      const block = this.createBlock('text')
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
}

export class Block {
  editor: NovelEditor
  type: BlockTypes
  block: HTMLElement
  wrap: HTMLElement
  content: HTMLElement

  constructor(editor: NovelEditor, type: BlockTypes = 'text') {
    this.editor = editor
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
