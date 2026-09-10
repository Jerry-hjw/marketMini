// pages/recharge/index.js
import { request } from '../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rechargeList: [],
    recharge: {},
    customer: {},
    dialogVisible: false,
    rechargeAmount: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.queryRechargeList()
    this.queryBalance()
    // const pr_customer_id = wx.getStorageSync('pr_customer_id')
    // if (pr_customer_id) this.getCustomer(pr_customer_id)
  },
  queryRechargeList() {
    request('/recharge/queryList', 'post', { iDisplayLength: 1,pr_customer_id: wx.getStorageSync('pr_customer_id'),recharge_status:'submitted' }).then(res => {
      if (res) {
        this.setData({ rechargeList: res })
      }
    })
  },
  queryBalance() {
    request('/recharge/queryBalance', 'post', {pr_customer_id: wx.getStorageSync('pr_customer_id')}).then(res => {
      if (res) {
        res.holley_usablemoney = '18500'
        this.setData({ recharge: res })
      }
    })
  },
  getCustomer(id) {
    request('/customer/get', 'post', { pr_customer_id: id }).then(res => {
      if (res) {
        this.setData({ customer: res })
      }
    })
  },
  toRecord() {
    wx.navigateTo({
      url: '/pages/rechargeRecord/index',
    })
  },
  call() {
    wx.makePhoneCall({
      phoneNumber: '400-930-8688',
    })
  },
  showRecharge() {
    this.setData({
      dialogVisible: true,
      rechargeAmount: ''
    })
  },
  setAmount(e) {
    this.setData({ rechargeAmount: e.detail.value })
  },
  closePopup() {
    this.setData({ dialogVisible: false })
  },
  recharge(e) {
    const amount = e.currentTarget.dataset.amount || this.data.rechargeAmount
    if (!amount || amount.split(' ').join('').length === 0) {
      wx.showToast({
        title: '请输入充值金额',
        icon: 'none'
      })
      return
    }
    if (parseFloat(amount) < 50) {
      wx.showToast({
        title: '充值金额必须大于50',
        icon: 'none'
      })
      return
    }
    wx.showModal({
      title: '充值提示',
      content: '确认充值' + amount + '元吗?',
      cancelText: '取消',
      complete: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '保存中...',
          })
          request('/recharge/save', 'post', { recharge_amount: amount, pr_customer_id: wx.getStorageSync('pr_customer_id') }).then(res => {
            wx.hideLoading()
            if (res && res.baseBean) {
              this.generateRechargeWePayInfo(res.baseBean.pr_recharge_id)
            }
          })
        }
      }
    })
  },
  generateRechargeWePayInfo(id) {
    wx.showLoading({
      title: '支付中...',
    })
    request('/recharge/generateRechargeWePayInfo', 'post', { pr_recharge_id: id }).then(res => {
      wx.hideLoading()
      if (res && res.timeStamp) this.wxPayMethod(res)
    })
  },
  //微信支付
  wxPayMethod: function (payargs) {
    wx.showLoading({
      title: '支付中...',
    })
    wx.requestPayment({
      'appId': payargs.appId,
      'timeStamp': payargs.timeStamp,
      'nonceStr': payargs.nonceStr,
      'package': payargs.package,
      'signType': payargs.signType,
      'paySign': payargs.paySign,
      'success': function (res) {
        wx.hideLoading()
        wx.showToast({
          title: '支付成功',
          icon: 'success'
        })
        setTimeout(function(){
          wx.reLaunch({
            url: '/pages/rental/index'
          })
        },1000)
      },
      'fail': function (res) {
        wx.hideLoading()
        wx.showToast({
          title: '支付失败',
          icon: 'error'
        })
        setTimeout(function(){
          wx.navigateTo({
              url: '/pages/rental/index'
          })
        },1000)
      }
    })
  }
})