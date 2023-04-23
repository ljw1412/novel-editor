export function getPublicUrl(path: string) {
  if (import.meta.env.PROD && path.startsWith('/')) {
    return path.substring(1)
  }
  return path
}

export function getRandomBanner() {
  const bgCount = 23
  return getPublicUrl(
    `/images/banner-${parseInt(Math.random() * bgCount + '') + 1}.png`
  )
}
