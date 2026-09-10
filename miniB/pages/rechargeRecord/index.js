// pages/rechargeRecord/index.js
import { request } from '../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rechargeList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.queryRechargeList(false)
  },
  queryRechargeList(flag) {
    wx.showLoading({
      title: '查询中...',
    })
    const params = {
      iDisplayStart: flag ? this.data.rechargeList.length : 0,
      iDisplayLength: 8,
      pr_customer_id: wx.getStorageSync('pr_customer_id'),
      recharge_status: 'submitted'
    }
    request('/recharge/queryList', 'post', params).then(res => {
      wx.hideLoading()
      if (res) {
        this.setData({ rechargeList: flag ? this.data.rechargeList.concat(res) : res })
      }
    })
  },
})