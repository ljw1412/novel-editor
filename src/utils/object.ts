/**
 * 根据 keys 筛选对象
 * @param obj 原对象
 * @param keys 字符串时以空格隔开，也可以直接传字符串数组
 * @returns ret 过滤后的字符串
 */
export function only(obj: Record<string, any>, keys: string | string[]) {
  obj = obj || {}
  if ('string' == typeof keys) keys = keys.split(/ +/)
  return keys.reduce(function (ret: Record<string, any>, key) {
    if (null == obj[key]) return ret
    ret[key] = obj[key]
    return ret
  }, {})
}

/**
 * 根据 keys 剔除对象对应 key
 * @param obj 原对象
 * @param keys 字符串时以空格隔开，也可以直接传字符串数组
 * @returns ret 过滤后的字符串
 */
export function nin(
  obj: Record<string, any>,
  keys: string | string[]
): Record<string, any> {
  obj = obj || {}
  if ('string' == typeof keys) keys = keys.split(/ +/)
  return Object.keys(obj).reduce(function (ret: Record<string, any>, key) {
    if (keys.includes(key)) return ret
    ret[key] = obj[key]
    return ret
  }, {})
}

export function easyCopy<T extends object>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}
