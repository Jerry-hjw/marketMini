const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatDateTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber).join('/') 
}

const formatDateTime2 = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber).join('-')
}

const formatDateTime3 = (date, aDay) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()+aDay
  return [year, month, day].map(formatNumber).join('-')
}

const formatDateTime4 = (date, aMonth) => {
  date.setMonth(date.getMonth() +aMonth)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber).join('-')
}

const formatDateTime5 = date => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [month, day].map(formatNumber).join('-')
}


const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

module.exports = {
  formatTime,
  formatDateTime,
  formatDateTime2,
  formatDateTime3,
  formatDateTime4,
  formatDateTime5,
  formatNumber
}
