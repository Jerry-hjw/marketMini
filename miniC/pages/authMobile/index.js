// pages/authMobile/index.js
import { request, API_BASE_URL } from '../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pr_member_id: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.pr_member_id) {
      this.setData({ pr_member_id: options.pr_member_id })
    }
  },
  // 授权手机号
  getPhoneNumber (e) {
    if (!e.detail.iv) {
      wx.showToast({
        title: '用户取消授权',
        icon: 'none'
      })
      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/index/index',
        })
      }, 1500)
      return
    }
    wx.showLoading({
      title: '查询中...',
      mask: false
    })
    wx.checkSession({
      fail: (res) => {
        wx.login({
          success: res => {
            const params = {
              code: res.code
            }
            wx.request({
              url: API_BASE_URL +  '/wx/login',
              method: 'post',
              data: params,
              header: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
              success: function success(res2) {
                wx.setStorageSync('token', res2.data)
              }
            })
          }
        })
      }
    })
    var params = {
      iv: e.detail.iv,
      encryptedData: e.detail.encryptedData,
      pr_member_id: this.data.pr_member_id
    }
    request('/wx/updateMobile', 'post', params).then(res => {
      wx.hideLoading()
    //   console.log('授权手机号', res, params);
      if (res.mobile) {
        wx.setStorage({
          key: 'user',
          data: res
        })
        wx.showToast({
          title: '手机号授权成功',
          icon: 'success'
        })
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/userDetail/index',
          })
        }, 1500)
      } else {
        wx.showToast({
          title: '手机号授权失败',
          icon: 'error'
        })
        wx.login({
          success: res => {
            const params = {
              code: res.code
            }
            wx.request({
              url: API_BASE_URL +  '/wx/login',
              method: 'post',
              data: params,
              header: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
              success: function success(res2) {
                wx.setStorageSync('token', res2.data)
              }
            })
          }
        })
      }
    })
  }
})