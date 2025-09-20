import dayjs from 'dayjs'

export const formatMatchTime = (iso: string | Date) => {
  return dayjs(iso).format('D MMM, h:mm A')
}
