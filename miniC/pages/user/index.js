// pages/user/index.js
import { request, IMG_BASE_URL } from '../../wxapi/index'
import { defineNavTop } from '../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 0,
    member: {},
    IMG_BASE_URL: IMG_BASE_URL,
    orderStatus: [{
      name: '待付款',
      img: '/img/order_unpaid.png',
      status: 'unpay'
    },{
      name: '待核销',
      img: '/img/order_paid.png',
      status: 'paid'
    },{
      name: '已核销',
      img: '/img/order_used.png',
      status: 'used'
    },{
      name: '全部订单',
      img: '/img/order_all.png',
      status: ''
    }],
    functionList: [{
    //   name: '我的收藏',
    //   img: '/img/collect.png',
    //   url: ''
    // },{
    //   name: '车牌管理',
    //   img: '/img/plate.png',
    //   url: ''
    // },{
    //   name: '发票管理',
    //   img: '/img/invoice.png',
    //   url: ''
    // },{
      name: '投诉建议',
      img: '/img/option.png',
      url: '/pages/complaint/index'
    }],
    memberLevel: {
      '01': '贵宾卡会员',
      '02': '金卡会员',
      '03': '钻卡会员'
    },
    member_level_higher: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ top: defineNavTop() })
    // this.getMember()
    this.getIntegral()
  },
  getMember() {
    request('/member/get', 'post', {}).then(res => {
      if (res) {
        this.setData({
          member: res,
          member_level_higher: res.member_level && res.member_level !== '03' ? this.data.memberLevel['0' + (parseInt(res.member_level) + 1)] : ''
        })
      }
    })
  },
  getIntegral() {
    request('/member/getJzdIntegral', 'post', {}).then(res => {
      if (res) {
        res.consumedAmount = res.consumedAmount ? parseFloat(res.consumedAmount) : 0
        res.nextLevelConsumeAmount = res.nextLevelConsumeAmount ? parseFloat(res.nextLevelConsumeAmount) : 0
        res.nextLevelDiffAmount = res.nextLevelConsumeAmount - res.consumedAmount
        this.setData({
          member: res,
          member_level_higher: res.member_level ? this.data.memberLevel['0' + (parseInt(res.member_level) + 1)] : ''
        })
        wx.setStorageSync('user', res)
      }
    })
  },
  toPage(e) {
    if (!e.currentTarget.dataset.url) {
      wx.showToast({
        title: '暂无内容，敬请期待',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    })
  },
  toOrder(e) {
    wx.navigateTo({
      url: '/pages/order/index?status=' + e.currentTarget.dataset.status,
    })
  },
  toUserDetail() {
    wx.navigateTo({
      url: '/pages/userDetail/index',
    })
  }
})