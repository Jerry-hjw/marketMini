// pages/complaint/index.js
import { defineNavTop } from '../../utils/util'
import { request } from '../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 0,
    dataList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({ top: defineNavTop() })
    this.getComplaintList()
  },
  getComplaintList() {
    wx.showLoading({
      title: '查询中...',
    })
    request('/complaint/queryList', 'post', {}).then(res => {
      if (res && res.aaData) this.setData({ dataList: res.aaData })
      wx.hideLoading()
    })
  },
  toDetail(e) {
    wx.navigateTo({
      url: e.currentTarget.dataset.id ? '/pages/complaintDetail/index?id=' + e.currentTarget.dataset.id : '/pages/complaintDetail/index',
    })
  }
})