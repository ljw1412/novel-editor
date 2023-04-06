export function getPublicUrl(path: string) {
  if (import.meta.env.PROD && path.startsWith('/')) {
    return path.substring(1)
  }
  return path
}
