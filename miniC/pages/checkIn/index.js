// pages/checkIn/index.js
import { request } from '../../wxapi/index'
import { defineNavTop } from '../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 0,
    dayArray: ['一', '二', '三', '四', '五', '六', '日'],
    dateArray: [],
    signArray: [], // 已签到日期列表
    yearmonth: '',
    maxLengthLastIndex: 0, // 最大长度的最后者下标
    signIntegral: 0,
    visible: false,
    signTipsChecked: false,
    todaySign: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({ top: defineNavTop() })
    // 初始化日期列表
    this.getCurrentMonth()
  },
  initDate() {
    const monthArray1 = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    const monthArray2 = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const date = now.getDate()
    let maxDay = 0
    if (year % 4 === 0) {
      maxDay = monthArray2[month]
    } else {
      maxDay = monthArray1[month]
    }
    let chekcDate = year + '-' + (month + 1 < 10 ? '0' + (month + 1) : month + 1)
    const dateArray = []
    const weekDay = [1, 2, 3, 4, 5, 6, 0]
    for (let j in weekDay) {
      const weekArray = []
      for (let i = 1; i <= maxDay; i++) {
        const compareDate = chekcDate + '-' + (i < 10 ? '0' + i : i)
        const compareDay = new Date(compareDate).getDay()
        if (compareDay === parseInt(weekDay[j])) {
          weekArray.push({ date: compareDate, day: i, isSign: this.data.signArray.includes(compareDate), isToday: compareDate === chekcDate + '-' + (date < 10 ? '0' + date : date) })
        }
      }
      dateArray.push(weekArray)
      if (weekArray.length > 4) this.setData({ maxLengthLastIndex: parseInt(j) })
    }
    this.setData({
      dateArray: dateArray,
      yearmonth: year + '年' + (month + 1) + '月',
      todaySign: this.data.signArray.includes(chekcDate + '-' + (date < 10 ? '0' + date : date))
    })
  },
  getCurrentMonth() {
    request('/memberCheckinHis/currentMonth', 'post').then(res => {
      if (res) {
        this.setData({ signArray: res.length > 0 ? res.map(item => { return item.checkin_date.split(' ')[0] }) : [] })
        this.initDate()
      }
    }).catch(err => {
      this.initDate()
    })
  },
  sign() {
    request('/memberCheckinHis/checkin', 'post', {}).then(res => {
      if (res && res.status === 'SUCCESS') {
        this.setData({
          todaySign: true,
          visible: true,
          signIntegral: res.baseBean.value
        })
        this.getCurrentMonth()
        const pages = getCurrentPages()
        const prevPage = pages[pages.length - 2]
        prevPage.getMember()
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    })
  },
  showToast() {
    this.setData({ visible: true })
  },
  closePopup() {
    this.setData({
      visible: false,
      signIntegral: 0
    })
  }
})