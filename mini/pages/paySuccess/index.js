// pages/paySuccess/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    paid_amount: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.paid_amount) {
      this.setData({ paid_amount: options.paid_amount })
    }
  },
  reback() {
    wx.navigateBack()
  },
  toPage(e) {
    wx.reLaunch({
      url: e.currentTarget.dataset.url,
    })
  }
})