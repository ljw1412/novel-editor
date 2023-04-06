import dayjs from 'dayjs'

export const $dayjs = dayjs

export function formatDate(
  date: string | Date | number,
  formatter = 'YYYY-MM-DD HH:mm'
) {
  return dayjs(date).format(formatter)
}
