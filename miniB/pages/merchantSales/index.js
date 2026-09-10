// pages/merchantSales/index.js
import { request } from './../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    merchantSalesList: [],
    pr_customer_id: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const pr_customer_id = wx.getStorageSync('pr_customer_id')
    this.setData({ pr_customer_id: pr_customer_id })
    this.getMerchantSalesList(false)
  },
  getMerchantSalesList(flag) {
    wx.showLoading({
      title: '查询中...',
    })
    request('/merchantSalesDetail/queryPage', 'post', { pr_customer_id: this.data.pr_customer_id, iDisplayStart: flag ? this.data.merchantSalesList.length : 0, iDisplayLength: 6 }).then(res => {
      if (res && res.length > 0) {
        this.setData({ merchantSalesList: flag ? this.data.merchantSalesList.concat(res) : res })
      }
      wx.hideLoading()
    })
  },
  toSalesDetail(e) {
    wx.navigateTo({
      url: '/pages/merchantSalesDetail/index?id=' + e.currentTarget.dataset.id,
    })
  }
})