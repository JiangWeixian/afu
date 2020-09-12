import alfy from 'alfy'
import dayjs from 'dayjs'
import WeekOfYear from 'dayjs/plugin/weekOfYear'
import IsLeapYear from 'dayjs/plugin/isLeapYear'
import DayOfYear from 'dayjs/plugin/dayOfYear'
import QuarterOfYear from 'dayjs/plugin/quarterOfYear'
import Duration from 'dayjs/plugin/duration'
import RelativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(WeekOfYear)
dayjs.extend(IsLeapYear)
dayjs.extend(DayOfYear)
dayjs.extend(QuarterOfYear)
dayjs.extend(Duration)
dayjs.extend(RelativeTime)

const toItem = (
  value: number | string | boolean,
  { title, subtitle }: { title?: string | number | boolean; subtitle?: string } = {},
) => {
  return {
    title: title || value,
    subtitle: subtitle || '',
    arg: value,
    icon: {
      path: ' ', // Hide icon
    },
    text: {
      copy: value,
      largetype: value,
    },
  }
}

const getInputMode = (input: string = '') => {
  if (!input) {
    return 'default'
  }
  if (input.startsWith('d')) {
    return 'number-duration'
  }
  const durationRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/
  if (`P${input.toUpperCase()}`.match(durationRegex)) {
    return 'iso-duration'
  }
  return 'time'
}

const DEFAULT_FORMAT = 'YYYY-MM-DD HH:mm:ss'
const DETAIL_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS'
const WEEK_DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const getDefaultOutput = (value?: string) => {
  const now = dayjs(value)
  const startOfDay = now.startOf('day')
  const [startOfYear, endOfYear, endOfMonth] = [
    now.startOf('year'),
    now.endOf('year'),
    now.endOf('month'),
  ]
  const [dayOfWeek, weekOfYear, dayOfYear] = [now.day(), now.week(), now.dayOfYear()]
  const year = now.year()
  const isLeapYear = now.isLeapYear()
  const quarterOfYear = now.quarter()
  const remain =
    (now.valueOf() - startOfYear.valueOf()) / (endOfYear.valueOf() - startOfYear.valueOf())

  return [
    toItem(now.valueOf(), { title: `today is ${now.format(DEFAULT_FORMAT)}` }),
    toItem(remain, { title: `${year} has passed ${remain * 100}%` }),
    toItem(dayOfWeek, {
      title: `今天是 ${WEEK_DAYS[dayOfWeek]}${dayOfWeek === 5 ? '🎉🎉🎉' : ''}`,
    }),
    toItem(dayOfYear, { title: `today is the ${dayOfYear}th day of the year` }),
    toItem(weekOfYear, { title: `this week is ${weekOfYear}th week of the year` }),
    toItem(quarterOfYear, { title: `this year is ${quarterOfYear}th quarter of the year` }),
    toItem(startOfDay.valueOf(), {
      title: `start of this day is ${startOfDay.format(DEFAULT_FORMAT)}`,
    }),
    toItem(endOfYear.valueOf(), {
      title: `the last day of year is ${endOfYear.format(DEFAULT_FORMAT)}`,
    }),
    toItem(endOfMonth.valueOf(), {
      title: `the last day of month is ${endOfMonth.format(DEFAULT_FORMAT)}`,
    }),
    toItem(isLeapYear, { title: `${year} has ${isLeapYear ? 365 : 364} days` }),
  ]
}

const getDurationOutput = (type: 'iso' | 'number' = 'iso', value: string | number) => {
  const duration =
    type === 'iso' ? dayjs.duration(`P${alfy.input.toUpperCase()}`) : dayjs.duration(value)
  const ms = duration.asMilliseconds()
  const now = dayjs()
  const before = now.subtract(ms, 'millisecond')
  const after = now.add(ms, 'millisecond')
  const humanize = duration.humanize(false)
  return [
    toItem(ms, { title: `${ms} milliseconds` }),
    toItem(before.valueOf(), { title: `${humanize} ago is ${before.format(DETAIL_FORMAT)}` }),
    toItem(after.valueOf(), { title: `in ${humanize} is ${after.format(DETAIL_FORMAT)}` }),
    toItem(now.valueOf(), { title: `now is ${now.format(DETAIL_FORMAT)}` }),
  ]
}

const getTimeOutput = (value: string) => {
  const now = dayjs(value)
  const startOfDay = now.startOf('day')
  return [
    toItem(now.valueOf()),
    toItem(now.format(DEFAULT_FORMAT)),
    toItem(startOfDay.valueOf(), {
      title: `start of this day is ${startOfDay.format(DEFAULT_FORMAT)}`,
    }),
  ]
}

const mode = getInputMode(alfy.input)

switch (mode) {
  case 'default':
    alfy.output(getDefaultOutput())
    break
  case 'iso-duration':
    alfy.output(getDurationOutput('iso', alfy.input))
    break
  case 'number-duration':
    const ms = alfy.input.split(' ')[1]
    alfy.output(getDurationOutput('number', Number(ms)))
  case 'time':
    alfy.output(getTimeOutput(alfy.input))
  default:
    break
}
