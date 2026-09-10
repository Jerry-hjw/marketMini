// pages/memberBenefits/index.js
import { IMG_BASE_URL } from '../../wxapi/index'
import { defineNavTop } from '../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 0,
    IMG_BASE_URL: IMG_BASE_URL,
    member_level: null,
    member_no: '',
    memberLevel: {
      '01': '贵宾卡会员',
      '02': '金卡会员',
      '03': '钻卡会员'
    },
    levelList: [
      { id: '01', name: '贵宾卡会员' },
      { id: '02', name: '金卡会员' },
      { id: '03', name: '钻卡会员' }
    ],
    activeLevel: '01'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({ top: defineNavTop() })
    if (options.member_level) this.setData({
      member_level: options.member_level,
      activeLevel: options.member_level
    })
    if (options.member_no) this.setData({ member_no: options.member_no })
  },
  changeLevel(e) {
    this.setData({ activeLevel: e.currentTarget.dataset.id })
  }
})