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
  el!: HTMLElement
  blocks: Block[] = []
  blockObserver: MutationObserver | null = null

  constructor(options: NovelEditorOptions = {}) {
    const { el } = options
    if (el) {
      this.mount(el)
    }
    this.editor = this
  }

  mount(el: HTMLElement) {
    this.el = el
    el.contentEditable = 'true'
    el.classList.add('novel-editor')
    el.setAttribute('data-novel-editor-root', 'true')

    el.addEventListener('keydown', this.keyListener.bind(this))
    el.addEventListener('paste', this.pasteListener.bind(this))
    this.observeBlocks(el)

    const textBlock = this.createBlock('text')
    const defaultContent = (el as HTMLElement).dataset.content
    if (defaultContent) {
      textBlock!.content.innerHTML = defaultContent
      el.removeAttribute('data-content')
    }
    el.replaceChildren(textBlock!.block)
  }

  keyListener(e: KeyboardEvent) {
    const { key, shiftKey } = e
    if (key === 'Enter' && !shiftKey) {
      e.preventDefault()
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
          const leftValue = anchorNode.nodeValue?.substring(end)
          if (leftValue) {
            newNodeChild.push(document.createTextNode(leftValue))
          }
          anchorNode.nodeValue = anchorNode.nodeValue?.substring(0, start) || ''
        }
        const nextNodes = helper.getNextNodes(anchorNode)
        if (nextNodes.length) {
          newNodeChild.push(...nextNodes)
        }
        // 创建新的文字块,并插入到当前光标之后
        const textBlock = this.editor.createBlock('text')
        textBlock!.content.replaceChildren(...newNodeChild)

        const leafParent = helper.findParents(
          anchorNode as HTMLElement,
          '.novel-editor-block'
        )
        if (leafParent) {
          helper.insertAfter(textBlock!.block, leafParent)
        } else {
          this.el.appendChild(textBlock!.block)
        }
        // 清除光标，并设置新光标到新的文字块开头位置
        selection.removeAllRanges()
        const range = document.createRange()
        const selectTarget = textBlock!.content.firstChild || textBlock!.content
        range.setStart(selectTarget, 0)
        range.setEnd(selectTarget, 0)
        selection.addRange(range)
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
        e.preventDefault()
      }
    }
  }

  pasteListener(e: ClipboardEvent) {
    console.log('pasteListener', e)
  }

  observeBlocks(el: HTMLElement) {
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

        removedNodes.forEach((el) => {
          const index = this.blocks.findIndex((block) => block.block === el)
          if (~index) this.blocks.splice(index, 1)
        })
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

    this.blockObserver.observe(this.el, { childList: true, subtree: true })
  }

  createBlock(type: BlockTypes) {
    if (type === 'text') {
      const textBlock = new Block(this, 'text')
      this.blocks.push(textBlock)
      return textBlock
    }
  }

  clear() {
    this.el.innerHTML = ''
    while (this.blocks.length) {
      const block = this.blocks.pop()
      block!.destroyed()
    }
    this.createBlock('text')
  }

  setText(text: string, clear: boolean) {
    if (clear) this.clear()
    const lastBlock = this.blocks[this.blocks.length]
    lastBlock.content.innerHTML = text
  }
}

class Block {
  editor: NovelEditor
  type: BlockTypes
  block: HTMLElement
  wrap: HTMLElement
  content: HTMLElement
  contentObserver: MutationObserver | null = null
  textContent: string = ''

  constructor(editor: NovelEditor, type: BlockTypes = 'text') {
    this.editor = editor
    this.type = type
    this.block = document.createElement('div')
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

  destroyed() {
    this.contentObserver?.disconnect()
  }
}
