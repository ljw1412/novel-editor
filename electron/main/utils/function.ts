export async function handleWrap(method: Function) {
  try {
    return await method()
  } catch (error) {
    console.error('[handleWrap]', error)
    return { err: true, error, ...error }
  }
}
