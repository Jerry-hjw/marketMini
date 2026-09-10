// pages/orderDetail/index.js
import { defineNavTop } from '../../utils/util'
import { request, IMG_BASE_URL } from '../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 0,
    order: {},
    IMG_BASE_URL: IMG_BASE_URL,
    product: {},
    orderStatus: {
      'unpay': '待支付',
      'paid': '已支付',
      'used': '已完成',
      'canceled': '已取消',
      'refunded': '已退款'
    },
    statusColor: {
      'unpay': '#ff1725',
      'paid': '#9ae533',
      'used': '#000',
      'canceled': '#666',
      'refunded': '#999'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({ top: defineNavTop() })
    if (options.id) {
      this.getOrder(options.id)
    } else {
      wx.showToast({
        title: '数据异常，请刷新后再试',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },
  getOrder(id) {
    request('/order/viewOrder', 'post', { pr_order_id: id }).then(res => {
      if (res && res.baseBean) {
        this.setData({
          order: res.baseBean
        })
      }
    })
  }
})