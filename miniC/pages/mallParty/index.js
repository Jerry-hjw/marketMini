// pages/mallParty/index.js
import { defineNavTop } from '../../utils/util'
import { request, IMG_BASE_URL } from '../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 0,
    IMG_BASE_URL: IMG_BASE_URL,
    dataList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({ top: defineNavTop() })
    this.getMallPartyList()
  },
  getMallPartyList(flag) {
    wx.showLoading({  
      title: '查询中',
    })
    request('/mallParty/queryValidList', 'post', { iDisplayStart: flag ? this.data.dataList.length : 0, iDisplayLength: 5 }).then(res => {
      wx.hideLoading()
      if (res) {
        this.setData({ dataList: flag ? this.data.dataList.concat(res) : res })
      }
    })
  },
  toDetail(e) {
    if (e.currentTarget.dataset.id) {
      wx.navigateTo({
        url: '/pages/' + (e.currentTarget.dataset.type) + 'Detail/index?id=' + e.currentTarget.dataset.id,
      })
    }
  }
})