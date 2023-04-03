// 驼峰转横杠分隔
const hyphenateRE = /\B([A-Z])/g
export function hyphenate(str: string, hyphenate = '-') {
  return str.replace(hyphenateRE, `${hyphenate}$1`).toLowerCase()
}

/**
 * 分隔转驼峰
 * @param str 字符串
 * @param lower 是否为小驼峰
 * @returns
 */
export function capitalized(str: string, lower = false) {
  let first = true
  return str.replace(/\b\w+\b[-_]?/g, function (word) {
    word = word.replace(/[-_]/g, '')
    let initial = word.substring(0, 1).toUpperCase()
    if (lower && first) {
      initial = initial.toLowerCase()
      first = false
    }
    return initial + word.substring(1)
  })
}

/**
 * 首字母大写
 * @param str 字符串
 * @returns 首字母大写
 */
export function toTitleCase(str: string) {
  return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase()
}

/**
 * 字符串转数组
 * @param str 字符串
 * @param sep 分隔符
 * @returns
 */
export function toList(str: string, sep = '|') {
  if (str && str.trim()) {
    return str.split(sep).filter((s) => s)
  }
  return []
}

/**
 * 复制文本
 * @param text 文本
 */
export function copyText(text: string) {
  const textarea = document.createElement('textarea')
  textarea.style.cssText = 'width: 0;height: 0;'
  textarea.innerText = text
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('Copy')
  document.body.removeChild(textarea)
}
