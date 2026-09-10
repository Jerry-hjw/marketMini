// pages/result/index.js
import { request } from '../../wxapi/index.js'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        status: '',
        message: '',
        item: null
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      this.setData({
          status: options.status || 'refresh',
          message: options.message || ''
      })
      if (options.id) {
          this.getVerifyResult(options.id)
      }
    },
    getVerifyResult(tb_order_detail_id) {
      wx.showLoading({
        title: '查询中'
      })
      request('/order/verifyResult', 'post', { tb_order_detail_id: tb_order_detail_id }).then(res => {
        wx.hideLoading()
        if (res) {
            const item = JSON.parse(JSON.stringify(res))
            item.order_code = item.verification_code.substring(0, 6) + item.verification_code.substring(8, 9)
            this.setData({ item: item })
        }
      })
    }
})