export async function handleWrap(method: Function) {
  try {
    return await method()
  } catch (error) {
    return { err: true, error }
  }
}
