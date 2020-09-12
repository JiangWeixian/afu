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
  if (input === 'd') {
    return 'number-duration'
  }
  const durationRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/
  if (`P${input.toUpperCase()}`.match(durationRegex)) {
    return 'iso-duration'
  }
  return 'default'
}

const DEFAULT_FORMAT = 'YYYY-MM-DD HH:mm:ss'
const DETAIL_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS'
const WEEK_DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const getDefaultOutput = () => {
  const now = dayjs()
  // const [startOfDay, endOfDay] = [dayjs().startOf('day'), dayjs().endOf('day')]
  const [startOfYear, endOfYear, endOfMonth] = [
    dayjs().startOf('year'),
    dayjs().endOf('year'),
    dayjs().endOf('month'),
  ]
  const [dayOfWeek, weekOfYear, dayOfYear] = [dayjs().day(), dayjs().week(), dayjs().dayOfYear()]
  const isLeapYear = dayjs().isLeapYear()
  const quarterOfYear = dayjs().quarter()
  const remain =
    (now.valueOf() - startOfYear.valueOf()) / (endOfYear.valueOf() - startOfYear.valueOf())

  return [
    toItem(now.valueOf(), { title: `今天是${now.format(DEFAULT_FORMAT)}` }),
    toItem(remain, { title: `今年已经过去了${remain * 100}%` }),
    toItem(dayOfWeek, {
      title: `今天是${WEEK_DAYS[dayOfWeek]}${dayOfWeek === 5 ? '🎉🎉🎉' : ''}`,
    }),
    toItem(dayOfYear, { title: `今天是一年中第${dayOfYear}天` }),
    toItem(weekOfYear, { title: `这周是一年中第${weekOfYear}周` }),
    toItem(quarterOfYear, { title: `本季度是一年中第${quarterOfYear}季度` }),
    toItem(endOfYear.valueOf(), { title: `今年最后一天是${endOfYear.format(DEFAULT_FORMAT)}` }),
    toItem(endOfMonth.valueOf(), { title: `这个月最后一天是${endOfMonth.format(DEFAULT_FORMAT)}` }),
    toItem(isLeapYear, { title: isLeapYear ? '今年有365天' : '今年有364天' }),
  ]
}

const getDurationOutput = (type: 'iso' | 'number' = 'iso', value: string | number) => {
  const duration =
    type === 'iso' ? dayjs.duration(`P${alfy.input.toUpperCase()}`) : dayjs.duration(value)
  const ms = duration.asMilliseconds()
  const now = dayjs()
  const before = now.subtract(ms, 'millisecond')
  const after = now.add(ms, 'millisecond')
  const beforeHumanize = duration.humanize(false)
  const afterHumanize = duration.humanize(true)
  return [
    toItem(ms, { title: `${ms} milliseconds` }),
    toItem(before.valueOf(), { title: `${beforeHumanize} is ${before.format(DETAIL_FORMAT)}` }),
    toItem(after.valueOf(), { title: `${afterHumanize} is ${after.format(DETAIL_FORMAT)}` }),
    toItem(now.valueOf(), { title: `现在是${now.format(DETAIL_FORMAT)}` }),
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
  default:
    break
}
