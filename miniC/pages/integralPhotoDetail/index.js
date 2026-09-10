// pages/integralPhotoDetail/index.js
import { request, IMG_BASE_URL } from '../../wxapi/index'
import { defineNavTop } from '../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: 0,
    pr_member_consume_id: null,
    memberConsume: {},
    approveStatus: {
      'U': '待审核',
      'Y': '已审核',
      'N': '已驳回'
    },
    IMG_BASE_URL: IMG_BASE_URL
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({ top: defineNavTop() })
    if (options.id) {
      this.setData({ pr_member_consume_id: options.id })
      this.getMemberConsume()
    }
    if (options.receipt_img_url) {
      this.setData({
        'memberConsume.receipt_img_url': options.receipt_img_url
      })
    }
  },
  getMemberConsume() {
    request('/memberConsume/get', 'post', { pr_member_consume_id: this.data.pr_member_consume_id }).then(res => {
      if (res) {
        this.setData({ memberConsume: res })
      }
    })
  },
  saveByPhoto() {
    request('/memberConsume/saveByPhoto', 'post', { receipt_img_url: this.data.memberConsume.receipt_img_url }).then(res => {
      if (res && res.status === 'SUCCESS') {
        wx.showToast({
          title: '提交成功!',
          icon: 'success',
          duration: 2000
        })
        const pages = getCurrentPages()
        const prevPage = pages[pages.length - 2]
        prevPage.getIntegralPhotoList()
        setTimeout(() => {
          wx.navigateBack()
        }, 2000)
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    })
  }
})