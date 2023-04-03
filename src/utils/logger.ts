const baseStyles = 'font-size:12px;padding:1px 10px;font-weight:700;'

function createStyle(p: 'left' | 'right', bgcolor = '', color = '') {
  const styleList = [
    baseStyles,
    `background-color:${bgcolor}`,
    `color:${color}`
  ]
  styleList.push(
    'border-radius:' + (p === 'left' ? '5px 0 0 5px' : '0 5px 5px 0')
  )
  return styleList.join(';')
}

export const baseLog =
  (
    type: string,
    bgcolor = '#409EFF',
    color = '#fff',
    bgcolor2 = '#666',
    color2 = '#fff'
  ) =>
  (info: string, message: any = '', ...data: any[]) => {
    const leftStyles = createStyle('left', bgcolor, color)
    const rightStyles = createStyle('right', bgcolor2, color2)
    const title = `%c${type}%c${info}`
    if (data.filter((i) => i).length < 2) {
      console.log(title, leftStyles, rightStyles, message, ...data)
      return
    }
    console.group(title, leftStyles, rightStyles, message)
    data.forEach((item) => {
      console.log(item)
    })
    console.groupEnd()
  }

export const message = baseLog('message', '#409EFF')

export const success = baseLog('success', '#67C23A')

export const error = baseLog('error', '#F56C6C')

export const warning = baseLog('warning', '#f5a623')

export const send = baseLog('IPC ↑', '#7816ff')

export const receive = baseLog('IPC ↓', '#b71de8')
