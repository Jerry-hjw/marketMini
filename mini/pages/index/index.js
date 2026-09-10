// pages/login/index.js
import { request } from '../../wxapi/index'
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getMember()
  },
  getMember() {
    wx.showLoading({
      title: '查询中...',
    })
    request('/member/get', 'post', '', true).then(res => {
      wx.hideLoading()
      if (res) {
        wx.setStorageSync('pr_customer_id', res.business_user_id)
        wx.setStorageSync('user', res)
        if (res.member_type === 'customer') {
          wx.reLaunch({
            url: '/pages/index/index',
          })
        } else if (res.member_type === 'employee') {
          wx.reLaunch({
            url: '/pages/OA/index',
          })
        }
      }
    })
  },
  // 授权手机号
  getPhoneNumber (e) {
    if (!e.detail.iv) {
      wx.showToast({
        title: '用户取消授权',
        icon: 'none'
      })
      return
    }
    wx.showLoading({
      title: '查询中...',
      mask: false
    })
    wx.checkSession({
      success: (res) => {},
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
        this.setData({
          member_type: res.member_type,
          mobile: res.mobile,
          mobileTemp: res.mobile.substring(0, 3) + '****' + res.mobile.substring(res.mobile.length - 4, res.mobile.length),
          mobileVisible: false,
          pr_customer_id: res.business_user_id
        })  
        wx.setStorage({
          key: 'user',
          data: res
        })
        wx.setStorageSync('pr_customer_id', res.business_user_id)
        wx.showToast({
          title: '手机号授权成功',
          icon: 'success'
        })
        setTimeout(() => {
          this.openPopup()
        }, 1500)
      } else {
        wx.showToast({
          title: '手机号授权失败'
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