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

const defineNavTop = () => {
  const menu = wx.getMenuButtonBoundingClientRect()
  const systemInfo =  wx.getSystemInfoSync()
  let top = ''
  if (!systemInfo.statusBarHeight) {
    systemInfo.statusBarHeight = systemInfo.screenHeight - systemInfo.windowHeight - 20
  }
  if (menu.top) {
    top = menu.top + ((menu.top - systemInfo.statusBarHeight) * (systemInfo.platform === 'android' ? 1 : 2))
  } else {
    let gap = ''
    switch (systemInfo.platform) {
      case 'android':
        gap = 8
        break
      case 'devtools':
        gap = 6
        break
      default:
        gap = 4
        break
    }
    top = systemInfo.statusBarHeight + gap
  }
  return top
}

module.exports = {
  formatTime,
  formatDateTime,
  formatDateTime2,
  formatDateTime3,
  formatDateTime4,
  formatDateTime5,
  formatNumber,
  defineNavTop
}
