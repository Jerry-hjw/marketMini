// pages/verifyHistory/index.js
import { request } from '../../wxapi/index.js'
Page({

    /**
     * 页面的初始数据
     */
    data: {
      verifyHistory: [],
      business_type: '',
      pr_customer_id: null,
      couponType: {
        '01': '代金券',
        '02': '满减券',
        '03': '折扣券',
        '04': '体验券',
        '05': '停车券'
      }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      const pr_customer_id = wx.getStorageSync('pr_customer_id')
      this.setData({ pr_customer_id: pr_customer_id })
      this.getVerifyHistory()
    },
    getVerifyHistory(flag) {
      wx.showLoading({
        title: '查询中',
      })
      request('/couponDetail/queryByCustomer', 'post', { pr_customer_id: this.data.pr_customer_id, iDisplayStart: flag ? this.data.verifyHistory.length : 0, iDisplayLength: 10 }).then(res => {
        wx.hideLoading()
        if (res && res.length > 0) {
          this.setData({
            verifyHistory: flag ? this.data.verifyHistory.concat(res) : res
          })
        }
      })
    }
})